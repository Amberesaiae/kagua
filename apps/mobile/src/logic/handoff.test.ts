import { checkAddress, checkChat, type FrozenList, type ModelProvider, type PreparableProvider } from '@kagua/core';
import { describe, expect, it } from 'vitest';
import { presentAddress, presentChat } from './present';
import { timedChatCheck } from './steps';
import { resolveChatTagger } from './tagger';

const FROZEN_TRON = 'TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7';
const frozen: FrozenList = { date: '2026-10-29', tron: [FROZEN_TRON], evm: [] };
const opts = { picked: 'tron' as const, frozen, contacts: [] };

function hung(): ModelProvider {
  return { id: 'hung', ocr: () => new Promise(() => {}), tagChat: () => new Promise(() => {}) };
}

describe('K3 checking path', () => {
  it('a hung model does not block a frozen-address Stop', async () => {
    const result = await Promise.race([
      timedChatCheck(`send to ${FROZEN_TRON}`, opts, hung()),
      new Promise<string>((resolve) => setTimeout(() => resolve('pending'), 3000)),
    ]);
    expect(result).not.toBe('pending');
    if (typeof result !== 'string') {
      expect(result.verdict?.level).toBe('stop');
      expect(result.modelUsed).toBe(false);
      expect(result.steps.map((s) => s.name)).not.toContain('Model tags');
    }
  });
});

describe('K4 no-flags copy and steps', () => {
  it('does not claim the model checked pressure when it did not run', () => {
    const v = presentChat(checkChat('Hello, ready to trade', opts));
    expect(v.screen).toBe('no_flags');
    expect(v.sub.toLowerCase()).toContain('did not run');
    expect(v.sub).not.toContain('or pressure in this chat');
  });
  it('says pressure was checked only when the model ran', () => {
    const v = presentChat(checkChat('Hello, ready to trade', opts), { modelUsed: true });
    expect(v.sub).toContain('or pressure in this chat');
    expect(v.sub.toLowerCase()).not.toContain('did not run');
  });
  it('omits the Model tags step when the model did not run', async () => {
    const none = await timedChatCheck('Hello, ready to trade', opts, null);
    expect(none.steps.map((s) => s.name)).not.toContain('Model tags');
    const broken: ModelProvider = {
      id: 'broken',
      ocr: async () => ({ text: '' }),
      tagChat: async () => {
        throw new Error('x');
      },
    };
    const failed = await timedChatCheck('Hello, ready to trade', opts, broken);
    expect(failed.modelUsed).toBe(false);
    expect(failed.steps.map((s) => s.name)).not.toContain('Model tags');
  });
});

describe('K13 address screen', () => {
  it("an unreadable address is Can't tell, not Stop", () => {
    const v = presentAddress(checkAddress(`0X${'ab'.repeat(20)}`, { picked: 'evm', frozen, contacts: [] }));
    expect(v.screen).toBe('cant_tell');
    expect(v.headline).toBe("Can't tell.");
  });
});

describe('K11 checking does not download', () => {
  it('does not call prepare when the cache load declines', async () => {
    let prepared = false;
    const model = {
      id: 'qvac',
      isReady: () => false,
      async prepare() {
        prepared = true;
      },
      async loadCached() {
        return false;
      },
      async ocr() {
        return { text: '' };
      },
      async tagChat() {
        return [];
      },
    } as PreparableProvider;
    const mock: ModelProvider = { id: 'mock', ocr: async () => ({ text: '' }), tagChat: async () => [] };
    const r = await resolveChatTagger(model, true, mock);
    expect(r.provider).toBeNull();
    expect(r.tagger).toBe('none');
    expect(prepared).toBe(false);
  });
  it('uses a model that is already loaded', async () => {
    const model = {
      id: 'qvac',
      isReady: () => true,
      async prepare() {
        throw new Error('download');
      },
      async loadCached() {
        throw new Error('download');
      },
      async ocr() {
        return { text: '' };
      },
      async tagChat() {
        return [];
      },
    } as PreparableProvider;
    const mock: ModelProvider = { id: 'mock', ocr: async () => ({ text: '' }), tagChat: async () => [] };
    const r = await resolveChatTagger(model, true, mock);
    expect(r.tagger).toBe('qvac');
    expect(r.provider).toBe(model);
  });
});
