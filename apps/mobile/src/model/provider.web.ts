import type { PreparableProvider } from '@kagua/core';

// Web build (desktop fallback): no on-device models. The app uses the mock tagger.
export const MODEL_SIZES = { ocr: 0, tagger: 0 };
export const modelProvider: PreparableProvider | null = null;
