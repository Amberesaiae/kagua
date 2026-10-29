import { createMockProvider, type FrozenList, type ModelProvider } from '@kagua/core';
import frozenJson from '@kagua/core/data/frozen.json';
import { presentAddress, presentCantTell, presentChat } from '../logic/present';
import { timedAddressCheck, timedChatCheck } from '../logic/steps';
import { getState, setState, type Job } from './store';

export const frozen = frozenJson as FrozenList;
export const frozenCount = frozen.tron.length + frozen.evm.length;

// Mock until the QVAC adapter is tested on a phone. Its tags are marked as model output.
export const provider: ModelProvider = createMockProvider({ delayMs: 350 });

/** Run the queued job. Code decides; the view is built from the core result only. */
export async function runJob(job: Job): Promise<void> {
  const contacts = getState().contacts;
  if (job.kind === 'address') {
    if (!job.address.trim()) {
      setState({ view: presentCantTell('There was no address to check. Paste or type one.'), steps: [], modelUsed: false });
      return;
    }
    const { result, steps } = timedAddressCheck(job.address, { picked: job.picked, frozen, contacts });
    setState({ view: presentAddress(result), steps, modelUsed: false });
    return;
  }
  const run = await timedChatCheck(job.text, { picked: 'tron', frozen, contacts }, provider);
  if (!run.verdict) {
    setState({ view: presentCantTell('There was no text to read. Paste the chat, or type what it says.'), steps: run.steps, modelUsed: false });
    return;
  }
  setState({ view: presentChat(run.verdict), steps: run.steps, modelUsed: run.modelUsed });
}
