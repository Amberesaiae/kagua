import { withTimeout, type ModelProvider, type PreparableProvider } from '@kagua/core';
import type { Tagger } from '../state/store';

/** A cached model can take a while to load into memory. Past this, the check runs on code rules. */
const LOAD_TIMEOUT_MS = 60_000;

/**
 * Who tags this check. The web build uses the mock. A phone check uses the
 * on-device model only when it is already loaded or already on disk.
 * It never downloads: that happens on the setup screen.
 */
export async function resolveChatTagger(
  model: PreparableProvider | null,
  modelsReady: boolean,
  mock: ModelProvider,
): Promise<{ provider: ModelProvider | null; tagger: Tagger }> {
  if (!model) return { provider: mock, tagger: 'mock' };
  if (!modelsReady) return { provider: null, tagger: 'none' };
  if (!model.isReady()) {
    try {
      const loaded = await withTimeout(model.loadCached(), LOAD_TIMEOUT_MS);
      if (!loaded) return { provider: null, tagger: 'none' };
    } catch {
      return { provider: null, tagger: 'none' };
    }
  }
  return model.isReady() ? { provider: model, tagger: 'qvac' } : { provider: null, tagger: 'none' };
}
