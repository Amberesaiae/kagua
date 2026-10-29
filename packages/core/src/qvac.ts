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
    responseFormat?: { type: 'json_schema'; json_schema: { name: string; schema: Record<string, unknown> } };
  }): { final: Promise<{ contentText: string }> };
}

/** Registry descriptors, e.g. OCR_LATIN and QWEN3_600M_INST_Q4 from @qvac/sdk. */
export interface QvacModels {
  ocr: { expectedSize?: number };
  tagger: { expectedSize?: number };
}

export interface PrepareProgress {
  step: 'ocr' | 'tagger';
  /** Bytes for the whole download across both models, as far as known. */
  downloaded: number;
  total: number;
}

export interface PreparableProvider extends ModelProvider {
  prepare(onProgress?: (p: PrepareProgress) => void): Promise<void>;
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
export const TAGGER_PROMPT = [
  'You label warning signs in a chat from a peer-to-peer USDT trade. The chat may be English or Swahili.',
  'Kinds: pressure (rushing the trader), impersonation (posing as an exchange, bank or someone else), off_platform (moving the talk or payment off the trading app), fake_support (posing as customer support).',
  'For each sign, copy the exact words from the chat into span. Do not rephrase. If there are none, return {"tags": []}.',
  '/no_think',
].join('\n');

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

  return {
    id: 'qvac',
    prepare,
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
        responseFormat: { type: 'json_schema', json_schema: { name: 'kagua_tags', schema: TAG_SCHEMA as unknown as Record<string, unknown> } },
      });
      const out = (await run.final).contentText.trim();
      let parsed: unknown;
      try {
        parsed = JSON.parse(out);
      } catch {
        return [];
      }
      const tags = (parsed as { tags?: unknown })?.tags;
      // Spans must be verbatim from the chat the model saw.
      return sanitizeTags(chat, tags);
    },
  };
}
