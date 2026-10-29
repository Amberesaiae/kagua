import { checkChat, type ModelTag, type ModelTagKind, type Verdict } from './chat';
import type { CheckOptions } from './address';

/** Raw image the app hands to OCR. `uri` on the phone; `bytes` in tests. */
export interface ImageInput {
  uri?: string;
  bytes?: Uint8Array;
}

export interface OcrResult {
  text: string;
}

/**
 * Everything Kagua asks a model for. The real one wraps @qvac/sdk on the phone;
 * the mock runs anywhere. A provider returns tags tied to quoted text, never a level.
 */
export interface ModelProvider {
  readonly id: string;
  ocr(image: ImageInput): Promise<OcrResult>;
  tagChat(text: string): Promise<ModelTag[]>;
}

const KINDS: readonly ModelTagKind[] = ['pressure', 'impersonation', 'off_platform', 'fake_support'];

/**
 * Keep only well-formed tags whose span is quoted verbatim from the chat.
 * A tag that can't point at the exact text is dropped, so a model can't invent evidence.
 */
export function sanitizeTags(text: string, raw: unknown): ModelTag[] {
  if (!Array.isArray(raw)) return [];
  const out: ModelTag[] = [];
  const seen = new Set<string>();
  for (const t of raw) {
    if (!t || typeof t !== 'object') continue;
    const { kind, span } = t as Record<string, unknown>;
    if (typeof kind !== 'string' || !KINDS.includes(kind as ModelTagKind)) continue;
    if (typeof span !== 'string') continue;
    const s = span.trim();
    if (s.length < 2 || !text.includes(s)) continue;
    const key = `${kind}\u0000${s}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ kind: kind as ModelTagKind, span: s });
  }
  return out;
}

export interface ChatRun {
  verdict: Verdict | null;
  /** True when there was nothing to read: the app shows "Can't tell". */
  cantTell: boolean;
  /** False when the model failed or wasn't asked; code rules still ran. */
  modelUsed: boolean;
}

/** Run a chat check: code rules always, model tags if the model answers. */
export async function runChatCheck(text: string, opts: CheckOptions, provider: ModelProvider | null): Promise<ChatRun> {
  if (!text.trim()) return { verdict: null, cantTell: true, modelUsed: false };
  let tags: ModelTag[] = [];
  let modelUsed = false;
  if (provider) {
    try {
      tags = sanitizeTags(text, await provider.tagChat(text));
      modelUsed = true;
    } catch {
      // A model failure never lowers anything: code rules still decide.
    }
  }
  return { verdict: checkChat(text, opts, tags), cantTell: false, modelUsed };
}

/** OCR a screenshot, then run the chat check on what was read. */
export async function runScreenshotCheck(image: ImageInput, opts: CheckOptions, provider: ModelProvider): Promise<ChatRun & { text: string }> {
  let text = '';
  try {
    text = (await provider.ocr(image)).text ?? '';
  } catch {
    return { verdict: null, cantTell: true, modelUsed: false, text: '' };
  }
  return { ...(await runChatCheck(text, opts, provider)), text };
}

// Mock patterns. These only stand in for the model in tests and the web build;
// they are not the shipped rules and their output is labelled as model output.
const MOCK_PATTERNS: [ModelTagKind, RegExp][] = [
  ['pressure', /\b(urgent(ly)?|right now|hurry|quickly|immediately|haraka|sasa hivi)\b/i],
  ['off_platform', /\b(whatsapp|telegram|outside (the )?(app|platform)|nje ya (app|programu))\b/i],
  ['fake_support', /\b(customer (care|support)|support (team|agent)|huduma kwa wateja)\b/i],
  ['impersonation', /\b(i am from (binance|bybit|okx|tether)|official (agent|admin)|admin wa)\b/i],
];

export interface MockOptions {
  /** OCR text keyed by image uri. */
  ocrText?: Record<string, string>;
  /** Simulated latency in ms. */
  delayMs?: number;
}

export function createMockProvider(o: MockOptions = {}): ModelProvider {
  const wait = () => new Promise((r) => setTimeout(r, o.delayMs ?? 0));
  return {
    id: 'mock',
    async ocr(image) {
      await wait();
      return { text: (image.uri && o.ocrText?.[image.uri]) || '' };
    },
    async tagChat(text) {
      await wait();
      const tags: ModelTag[] = [];
      for (const [kind, re] of MOCK_PATTERNS) {
        const m = re.exec(text);
        if (m) tags.push({ kind, span: m[0] });
      }
      return tags;
    },
  };
}
