import { createQvacProvider, type PreparableProvider, type QvacSdk } from '@kagua/core';
import { completion, getModelInfo, loadModel, OCR_LATIN, ocr, QWEN3_600M_INST_Q4 } from '@qvac/sdk';

// Phone: QVAC on device. OCR_LATIN reads screenshots; Qwen3 0.6B (Q4) only tags chats.
const sdk: QvacSdk = {
  loadModel: ({ modelSrc, modelConfig, onProgress }) =>
    modelSrc === OCR_LATIN
      ? loadModel({ modelSrc: OCR_LATIN, modelConfig: modelConfig as never, onProgress })
      : loadModel({ modelSrc: QWEN3_600M_INST_Q4, onProgress }),
  ocr: (p) => ocr(p),
  completion: (p) => completion(p),
  getModelInfo: (p) => getModelInfo(p),
};

export const MODEL_SIZES = { ocr: OCR_LATIN.expectedSize, tagger: QWEN3_600M_INST_Q4.expectedSize };
export const modelProvider: PreparableProvider | null = createQvacProvider(sdk, { ocr: OCR_LATIN, tagger: QWEN3_600M_INST_Q4 });
