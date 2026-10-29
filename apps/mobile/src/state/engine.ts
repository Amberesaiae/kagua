import { createMockProvider, type FrozenList, type ModelProvider } from '@kagua/core';
import frozenJson from '@kagua/core/data/frozen.json';
import { presentAddress, presentCantTell, presentChat } from '../logic/present';
import { timedAddressCheck, timedChatCheck, timedScreenshotCheck } from '../logic/steps';
import { modelProvider } from '../model/provider';
import { recordCheck } from './actions';
import { getState, setState, type Job, type Tagger } from './store';

export const frozen = frozenJson as FrozenList;
export const frozenCount = frozen.tron.length + frozen.evm.length;

// Web build only: a keyword mock stands in for the phone model. Its tags are labelled as demo tags.
const mock = createMockProvider({ delayMs: 350 });

/** The phone model once downloaded and loaded; the mock on web; otherwise nothing (code rules only). */
async function chatTagger(): Promise<{ provider: ModelProvider | null; tagger: Tagger }> {
  if (!modelProvider) return { provider: mock, tagger: 'mock' };
  if (!getState().modelsReady) return { provider: null, tagger: 'none' };
  if (!modelProvider.isReady()) {
    try {
      await modelProvider.prepare();
    } catch {
      return { provider: null, tagger: 'none' };
    }
  }
  return { provider: modelProvider, tagger: 'qvac' };
}

/** Run the queued job. Code decides; the view is built from the core result only. */
export async function runJob(job: Job): Promise<void> {
  const contacts = getState().contacts;
  const opts = { picked: 'tron' as const, frozen, contacts };
  if (job.kind === 'address') {
    if (!job.address.trim()) {
      setState({ view: presentCantTell('There was no address to check. Paste or type one.'), steps: [], tagger: 'none' });
      return;
    }
    const { result, steps } = timedAddressCheck(job.address, { ...opts, picked: job.picked });
    const view = presentAddress(result);
    setState({ view, steps, tagger: 'none' });
    recordCheck(job, view);
    return;
  }
  const { provider, tagger } = await chatTagger();
  if (job.kind === 'screenshot') {
    if (!provider || tagger !== 'qvac') {
      const view = presentCantTell("Kagua can't read screenshots until the phone model is downloaded. Paste the chat text instead.");
      setState({ view, steps: [], tagger: 'none' });
      recordCheck(job, view);
      return;
    }
    const run = await timedScreenshotCheck(job.uri, opts, provider, provider);
    const view = run.verdict ? presentChat(run.verdict) : presentCantTell("Kagua couldn't read text in this image. Paste the chat text instead.");
    setState({ view, steps: run.steps, tagger: run.modelUsed ? tagger : 'none' });
    recordCheck(job, view);
    return;
  }
  const run = await timedChatCheck(job.text, opts, provider);
  const view = run.verdict ? presentChat(run.verdict) : presentCantTell('There was no text to read. Paste the chat, or type what it says.');
  setState({ view, steps: run.steps, tagger: run.modelUsed ? tagger : 'none' });
  recordCheck(job, view);
}
