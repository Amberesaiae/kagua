import { checkAddress, checkChat, detectNetwork, findAddresses, HARD_RULES, isLookAlike, isValid, normalize, sanitizeTags, type AddressResult, type CheckOptions, type ModelProvider, type ModelTag, type Verdict } from '@kagua/core';

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
export async function timedChatCheck(text: string, opts: CheckOptions, provider: ModelProvider | null): Promise<TimedChatCheck> {
  if (!text.trim()) return { verdict: null, modelUsed: false, steps: [] };
  const [, rulesMs] = time(() => HARD_RULES.map((r) => r.re.test(text)));
  const [, addrMs] = time(() => findAddresses(text).map((a) => checkAddress(a, { ...opts, picked: a.startsWith('0x') ? 'evm' : 'tron' })));
  let tags: ModelTag[] = [];
  let modelUsed = false;
  const t0 = now();
  if (provider) {
    try {
      tags = sanitizeTags(text, await provider.tagChat(text));
      modelUsed = true;
    } catch {
      // Code rules still decide.
    }
  }
  const modelMs = now() - t0;
  const [verdict, decideMs] = time(() => checkChat(text, opts, tags));
  return {
    verdict,
    modelUsed,
    steps: [
      { name: 'Rules', ms: rulesMs },
      { name: 'Addresses', ms: addrMs },
      { name: 'Model tags', ms: modelMs },
      { name: 'Decide', ms: decideMs },
    ],
  };
}
