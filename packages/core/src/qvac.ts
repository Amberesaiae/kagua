import type { ModelTagKind } from './chat';
import { sanitizeTags, type ImageInput, type ModelProvider } from './provider';

/**
 * The slice of @qvac/sdk that Kagua uses, typed from the SDK 0.22.0 declarations
 * and its shipped examples (ocr-fasttext, llamacpp-structured-output). The app passes
 * the real SDK in; tests pass a fake. Core never imports the SDK itself.
 */
export interface QvacProgress {
  downloaded: number;
  total: number;
  percentage: number;
}

export interface QvacSdk {
  loadModel(options: { modelSrc: unknown; modelConfig?: Record<string, unknown>; onProgress?: (p: QvacProgress) => void }): Promise<string>;
  ocr(params: { modelId: string; image: string; options?: { paragraph?: boolean } }): { blocks: Promise<{ text: string; confidence?: number }[]> };
  completion(params: {
    modelId: string;
    history: { role: 'system' | 'user' | 'assistant'; content: string }[];
    stream: boolean;
    /** Fixed sampling so the same chat does not change level between runs. `temp` is the SDK field. */
    generationParams?: { temp?: number; top_k?: number; seed?: number };
    responseFormat?: { type: 'json_schema'; json_schema: { name: string; schema: Record<string, unknown> } };
  }): { final: Promise<{ contentText: string }> };
  /** Local cache probe. It must not download. */
  getModelInfo?(params: { name: string }): Promise<{ isCached: boolean }>;
}

/** Registry descriptors, e.g. OCR_LATIN and QWEN3_600M_INST_Q4 from @qvac/sdk. */
export interface QvacModels {
  ocr: { expectedSize?: number; name?: string };
  tagger: { expectedSize?: number; name?: string };
}

export interface PrepareProgress {
  step: 'ocr' | 'tagger';
  /** Bytes for the whole download across both models, as far as known. */
  downloaded: number;
  total: number;
}

export interface PreparableProvider extends ModelProvider {
  /** Download if needed, then load. Setup screen only. */
  prepare(onProgress?: (p: PrepareProgress) => void): Promise<void>;
  /** Load models that are already on disk. Never downloads. */
  loadCached(): Promise<boolean>;
  isReady(): boolean;
}

const KINDS: ModelTagKind[] = ['pressure', 'impersonation', 'off_platform', 'fake_support'];

export const TAG_SCHEMA = {
  type: 'object',
  properties: {
    tags: {
      type: 'array',
      maxItems: 8,
      items: {
        type: 'object',
        properties: { kind: { type: 'string', enum: KINDS }, span: { type: 'string' } },
        required: ['kind', 'span'],
        additionalProperties: false,
      },
    },
  },
  required: ['tags'],
  additionalProperties: false,
} as const;

// The model only tags. It never sees or returns a level.
/** Fixed seed so a repeated chat does not wander. */
export const TAGGER_SEED = 1;

export const TAGGER_PROMPT = [
  'You label warning signs in a chat from a peer-to-peer USDT trade. The chat may be English or Swahili.',
  'Kinds: pressure (rushing the trader), impersonation (posing as an exchange, bank or someone else), off_platform (moving the talk or payment off the trading app), fake_support (posing as customer support).',
  'Do not tag ordinary payment notes (M-Pesa, MTN MoMo, a reference number), thanks, greetings, or "pin this chat".',
  'For each sign, copy only the risky words into span, exactly as written. Never copy the whole message. If there are none, return {"tags": []}.',
  '/no_think',
].join('\n');

/** Pull a JSON object out of a model reply. Undefined means the reply could not be read. */
export function parseModelReply(raw: string): unknown | undefined {
  let s = raw.trim().replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  const fence = /```(?:json)?\s*([\s\S]*?)```/i.exec(s);
  if (fence) s = fence[1].trim();
  const tryParse = (x: string): unknown | undefined => {
    try {
      return JSON.parse(x);
    } catch {
      return undefined;
    }
  };
  const direct = tryParse(s);
  if (direct !== undefined) return direct;
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start >= 0 && end > start) return tryParse(s.slice(start, end + 1));
  return undefined;
}

export const MAX_CHAT_CHARS = 4000;

export function createQvacProvider(sdk: QvacSdk, models: QvacModels): PreparableProvider {
  let ocrId: string | null = null;
  let taggerId: string | null = null;

  async function prepare(onProgress?: (p: PrepareProgress) => void): Promise<void> {
    const ocrSize = models.ocr.expectedSize ?? 0;
    const tagSize = models.tagger.expectedSize ?? 0;
    if (!ocrId) {
      ocrId = await sdk.loadModel({
        modelSrc: models.ocr,
        modelConfig: { langList: ['en'] },
        onProgress: (p) => onProgress?.({ step: 'ocr', downloaded: p.downloaded, total: Math.max(p.total, ocrSize) + tagSize }),
      });
    }
    if (!taggerId) {
      taggerId = await sdk.loadModel({
        modelSrc: models.tagger,
        onProgress: (p) => onProgress?.({ step: 'tagger', downloaded: ocrSize + p.downloaded, total: ocrSize + Math.max(p.total, tagSize) }),
      });
    }
  }

  async function loadCached(): Promise<boolean> {
    if (ocrId && taggerId) return true;
    const probe = sdk.getModelInfo;
    const ocrName = models.ocr.name;
    const tagName = models.tagger.name;
    if (!probe || !ocrName || !tagName) return false;
    try {
      const [ocrInfo, tagInfo] = await Promise.all([probe({ name: ocrName }), probe({ name: tagName })]);
      if (!ocrInfo.isCached || !tagInfo.isCached) return false;
    } catch {
      return false;
    }
    await prepare();
    return !!ocrId && !!taggerId;
  }

  return {
    id: 'qvac',
    prepare,
    loadCached,
    isReady: () => !!ocrId && !!taggerId,
    async ocr(image: ImageInput) {
      if (!ocrId) throw new Error('OCR model not loaded');
      // The SDK reads a file path on the phone.
      if (!image.uri) return { text: '' };
      const path = image.uri.replace(/^file:\/\//, '');
      const blocks = await sdk.ocr({ modelId: ocrId, image: path, options: { paragraph: false } }).blocks;
      return { text: blocks.map((b) => b.text).join('\n') };
    },
    async tagChat(text: string) {
      if (!taggerId) throw new Error('Tagger model not loaded');
      const chat = text.slice(0, MAX_CHAT_CHARS);
      const run = sdk.completion({
        modelId: taggerId,
        history: [
          { role: 'system', content: TAGGER_PROMPT },
          { role: 'user', content: chat },
        ],
        stream: false,
        generationParams: { temp: 0, top_k: 1, seed: TAGGER_SEED },
        responseFormat: { type: 'json_schema', json_schema: { name: 'kagua_tags', schema: TAG_SCHEMA as unknown as Record<string, unknown> } },
      });
      const out = (await run.final).contentText.trim();
      const parsed = parseModelReply(out);
      if (parsed === undefined) throw new Error('unreadable model reply');
      const tags = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === 'object' && 'tags' in parsed
          ? (parsed as { tags: unknown }).tags
          : [];
      // Spans must be quoted from the chat the model saw.
      return sanitizeTags(chat, tags);
    },
  };
}
