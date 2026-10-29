import { checkAddress, checkChat, detectNetwork, findAddresses, HARD_RULES, isLookAlike, isValid, MODEL_TAG_TIMEOUT_MS, normalize, readModelTags, SOFT_RULES, withTimeout, type AddressResult, type CheckOptions, type ModelProvider, type Verdict } from '@kagua/core';

export interface StepTiming {
  name: string;
  ms: number;
}

export interface TimedAddressCheck {
  result: AddressResult;
  steps: StepTiming[];
}

const now = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now());

function time<T>(fn: () => T): [T, number] {
  const t = now();
  const v = fn();
  return [v, now() - t];
}

/**
 * Measure each address step for the Checking screen. The level always comes from
 * `checkAddress`; the step runs here only time the same work, they decide nothing.
 */
export function timedAddressCheck(raw: string, opts: CheckOptions): TimedAddressCheck {
  const address = raw.trim();
  const [, checksumMs] = time(() => isValid(address, opts.picked));
  const [, networkMs] = time(() => detectNetwork(address));
  const [, frozenMs] = time(() => {
    const norm = normalize(address, opts.picked);
    return (opts.picked === 'tron' ? opts.frozen.tron : opts.frozen.evm).some((a) => normalize(a, opts.picked) === norm);
  });
  const [, lookMs] = time(() => opts.contacts.some((c) => isLookAlike(address, c.address, opts.picked)));
  const [result, totalMs] = time(() => checkAddress(address, opts));
  return {
    result,
    steps: [
      { name: 'Checksum', ms: checksumMs },
      { name: 'Network', ms: networkMs },
      { name: 'Frozen list', ms: frozenMs },
      { name: 'Look-alike', ms: lookMs },
      { name: 'Decide', ms: totalMs },
    ],
  };
}

export function formatMs(ms: number): string {
  if (ms < 1) return '<1 ms';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export interface TimedChatCheck {
  verdict: Verdict | null;
  modelUsed: boolean;
  steps: StepTiming[];
}

/**
 * Same split for a chat: the verdict comes from `checkChat` with sanitised model tags.
 * A model error leaves the code result standing.
 */
export async function timedChatCheck(text: string, opts: CheckOptions, provider: ModelProvider | null, timeoutMs = MODEL_TAG_TIMEOUT_MS): Promise<TimedChatCheck> {
  if (!text.trim()) return { verdict: null, modelUsed: false, steps: [] };
  const [, rulesMs] = time(() => {
    for (const r of [...HARD_RULES, ...SOFT_RULES]) r.re.test(text);
  });
  const [, addrMs] = time(() => findAddresses(text).map((a) => checkAddress(a, { ...opts, picked: a.startsWith('0x') || a.startsWith('0X') ? 'evm' : 'tron' })));
  // A code Stop is already decided. Do not wait on a model that may never answer.
  const code = checkChat(text, opts, []);
  let modelUsed = false;
  let modelMs = 0;
  let tags: { kind: 'pressure' | 'impersonation' | 'off_platform' | 'fake_support'; span: string }[] = [];
  if (provider && code.level !== 'stop') {
    const t0 = now();
    const read = await readModelTags(text, provider, timeoutMs);
    tags = read.tags;
    modelUsed = read.modelUsed;
    modelMs = now() - t0;
  }
  const [verdict, decideMs] = time(() => (code.level === 'stop' ? code : checkChat(text, opts, tags)));
  const steps: StepTiming[] = [
    { name: 'Rules', ms: rulesMs },
    { name: 'Addresses', ms: addrMs },
  ];
  if (modelUsed) steps.push({ name: 'Model tags', ms: modelMs });
  steps.push({ name: 'Decide', ms: decideMs });
  return { verdict, modelUsed, steps };
}

/** Screenshot: OCR first (timed), then the same chat check on the text read. */
export async function timedScreenshotCheck(uri: string, opts: CheckOptions, ocrProvider: ModelProvider, tagProvider: ModelProvider | null, timeoutMs = MODEL_TAG_TIMEOUT_MS): Promise<TimedChatCheck & { text: string }> {
  const t0 = now();
  let text = '';
  try {
    text = (await withTimeout(ocrProvider.ocr({ uri }), timeoutMs)).text ?? '';
  } catch {
    // Unreadable or stuck: the app says Can't tell.
  }
  const read: StepTiming = { name: 'Read image', ms: now() - t0 };
  if (!text.trim()) return { verdict: null, modelUsed: false, text: '', steps: [read] };
  const chat = await timedChatCheck(text, opts, tagProvider, timeoutMs);
  return { ...chat, text, steps: [read, ...chat.steps] };
}
