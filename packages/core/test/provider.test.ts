import { describe, expect, it } from 'vitest';
import { createMockProvider, runChatCheck, runScreenshotCheck, sanitizeTags, type FrozenList, type ModelProvider } from '../src';

const frozen: FrozenList = { date: '2026-10-01', tron: [], evm: [] };
const opts = { picked: 'tron' as const, frozen, contacts: [] };

describe('sanitizeTags', () => {
  const text = 'Pay now, move to WhatsApp please';
  it('keeps tags whose span is quoted verbatim', () => {
    expect(sanitizeTags(text, [{ kind: 'off_platform', span: 'WhatsApp' }])).toEqual([{ kind: 'off_platform', span: 'WhatsApp' }]);
  });
  it('drops invented spans, unknown kinds, levels and junk', () => {
    const raw = [
      { kind: 'pressure', span: 'send in 5 minutes' },
      { kind: 'stop', span: 'Pay now' },
      { kind: 'pressure', span: 'Pay now', level: 'stop' },
      null,
      'pressure',
      { kind: 'pressure' },
    ];
    const out = sanitizeTags(text, raw);
    expect(out).toEqual([{ kind: 'pressure', span: 'Pay now' }]);
    expect(Object.keys(out[0])).toEqual(['kind', 'span']);
  });
  it('non-array output -> no tags', () => {
    expect(sanitizeTags(text, { kind: 'pressure' })).toEqual([]);
  });
});

describe('runChatCheck', () => {
  it('empty text -> cant tell', async () => {
    expect((await runChatCheck('   ', opts, createMockProvider())).cantTell).toBe(true);
  });
  it('mock tags raise to check_more with model source', async () => {
    const r = await runChatCheck('Release urgently, chat on Telegram', opts, createMockProvider());
    expect(r.verdict?.level).toBe('check_more');
    expect(r.verdict?.reasons.every((x) => x.source === 'model')).toBe(true);
    expect(r.modelUsed).toBe(true);
  });
  it('model failure keeps the code stop', async () => {
    const broken: ModelProvider = { id: 'broken', ocr: async () => ({ text: '' }), tagChat: async () => { throw new Error('x'); } };
    const r = await runChatCheck('send me your seed phrase', opts, broken);
    expect(r.verdict?.level).toBe('stop');
    expect(r.modelUsed).toBe(false);
  });
  it('a model claiming stop still yields check_more at most', async () => {
    const liar: ModelProvider = { id: 'liar', ocr: async () => ({ text: '' }), tagChat: async () => [{ kind: 'pressure', span: 'ready', level: 'stop' }] as never };
    const r = await runChatCheck('ready to trade', opts, liar);
    expect(r.verdict?.level).toBe('check_more');
  });
});

describe('runScreenshotCheck', () => {
  it('unreadable image -> cant tell', async () => {
    const r = await runScreenshotCheck({ uri: 'blank.png' }, opts, createMockProvider());
    expect(r.cantTell).toBe(true);
  });
  it('OCR text runs through the chat rules', async () => {
    const p = createMockProvider({ ocrText: { 'a.png': 'Tuma OTP yako haraka' } });
    const r = await runScreenshotCheck({ uri: 'a.png' }, opts, p);
    expect(r.text).toContain('OTP');
    expect(r.verdict?.level).toBe('stop');
  });
});
