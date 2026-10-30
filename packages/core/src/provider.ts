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
 * Words a tag must point at. A quote of the whole ordinary message, or a tiny
 * span such as "ok", is not evidence. This never lowers a code warning.
 */
const RISK_CUE = /urgent|hurry|quickly|immediately|\basap\b|haraka|sasa\s+hivi|right\s+now|send\s+now|pay\s+now|or\s+i\s+cancel|last\s+chance|last\s+warning|whatsapp|telegram|nje\s+ya|outside\s+the\s+(?:app|platform)|customer\s+(?:care|support)|support\s+(?:team|agent)|huduma\s+kwa\s+wateja|official\s+(?:agent|admin)|admin\s+wa|from\s+(?:binance|bybit|okx|tether)|seed\s+phrase|recovery\s+(?:phrase|words?)|private\s+key|secret\s+key|mnemonic|\b(?:12|24)\s+words\b|twelve\s+words|twenty[- ]?four\s+words|your\s+pin|your\s+password|your\s+otp|one[- ]?time\s+(?:code|password)|namba\s+ya\s+siri|nambari\s+ya\s+siri|neno\s+la\s+siri|msimbo/i;

const MIN_SPAN = 4;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** A warning ("never share your password") is not a request. */
function inNegatedSentence(text: string, span: string): boolean {
  const idx = text.indexOf(span);
  if (idx < 0) return false;
  const start = Math.max(text.lastIndexOf('.', idx), text.lastIndexOf('\n', idx)) + 1;
  const ends = [text.indexOf('.', idx), text.indexOf('\n', idx)].filter((n) => n >= 0);
  const end = ends.length ? Math.min(...ends) + 1 : text.length;
  return /\b(never|don'?t|do not|usi\w*)\b/i.test(text.slice(start, end));
}

/** A quote of the whole chat does not point at the risky words. */
function coversMessage(text: string, span: string): boolean {
  const norm = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase().replace(/[.!?]+$/g, '');
  const t = norm(text);
  const s = norm(span);
  if (!t || !s) return true;
  return s === t || (t.includes(s) && s.length >= Math.floor(t.length * 0.85));
}

/** Find the model's quote in the chat. Case and spacing differences still count. */
function locateSpan(text: string, span: string): string | null {
  const s = span.trim();
  if (s.length < MIN_SPAN) return null;
  const exact = text.indexOf(s);
  if (exact >= 0) return s;
  const parts = s.split(/\s+/).filter(Boolean).map(escapeRegExp);
  if (!parts.length) return null;
  const m = new RegExp(parts.join('\\s+'), 'i').exec(text);
  return m ? m[0] : null;
}

/**
 * Keep only well-formed tags whose span is quoted from the chat and points at
 * risky words. A tag that can't point at that text is dropped, so a model
 * can't invent evidence or raise an ordinary chat.
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
    const located = locateSpan(text, span);
    if (!located || coversMessage(text, located) || inNegatedSentence(text, located) || !RISK_CUE.test(located)) continue;
    const key = `${kind}\u0000${located}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ kind: kind as ModelTagKind, span: located });
  }
  return out;
}

export interface ChatRun {
  verdict: Verdict | null;
  /** True when there was nothing to read: the app shows "Can't tell". */
  cantTell: boolean;
  /** False when the model failed, timed out, or wasn't asked; code rules still ran. */
  modelUsed: boolean;
}

/** How long a chat tag may take before code shows its own result. */
export const MODEL_TAG_TIMEOUT_MS = 20_000;

export function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('model timeout')), ms);
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

/** Ask the model for tags. A throw, a timeout, or no provider means the model did not run. */
export async function readModelTags(text: string, provider: ModelProvider | null, timeoutMs = MODEL_TAG_TIMEOUT_MS): Promise<{ tags: ModelTag[]; modelUsed: boolean }> {
  if (!provider) return { tags: [], modelUsed: false };
  try {
    const raw = await withTimeout(provider.tagChat(text), timeoutMs);
    return { tags: sanitizeTags(text, raw), modelUsed: true };
  } catch {
    return { tags: [], modelUsed: false };
  }
}

/** Run a chat check: code rules always, model tags if the model answers. A code Stop is not delayed. */
export async function runChatCheck(text: string, opts: CheckOptions, provider: ModelProvider | null, timeoutMs = MODEL_TAG_TIMEOUT_MS): Promise<ChatRun> {
  if (!text.trim()) return { verdict: null, cantTell: true, modelUsed: false };
  const code = checkChat(text, opts, []);
  if (code.level === 'stop') return { verdict: code, cantTell: false, modelUsed: false };
  const { tags, modelUsed } = await readModelTags(text, provider, timeoutMs);
  return { verdict: checkChat(text, opts, tags), cantTell: false, modelUsed };
}

/** OCR a screenshot, then run the chat check on what was read. A stuck read is "Can't tell". */
export async function runScreenshotCheck(image: ImageInput, opts: CheckOptions, provider: ModelProvider, timeoutMs = MODEL_TAG_TIMEOUT_MS): Promise<ChatRun & { text: string }> {
  let text = '';
  try {
    text = (await withTimeout(provider.ocr(image), timeoutMs)).text ?? '';
  } catch {
    return { verdict: null, cantTell: true, modelUsed: false, text: '' };
  }
  return { ...(await runChatCheck(text, opts, provider, timeoutMs)), text };
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
