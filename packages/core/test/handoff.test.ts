import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  checkAddress,
  checkChat,
  createMockProvider,
  createQvacProvider,
  isLookAlike,
  runChatCheck,
  sanitizeTags,
  type FrozenList,
  type ModelProvider,
  type QvacSdk,
} from '../src';

const FROZEN_TRON = 'TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7';
const EVM = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';
const frozen: FrozenList = { date: '2026-10-29', tron: [FROZEN_TRON], evm: [] };
const opts = { picked: 'tron' as const, frozen, contacts: [] };

/**
 * Every quoted scam and ordinary chat from the QA handoff, plus the other
 * wordings the handoff says must not come back as "No flags found" / must not
 * false-alarm. Levels are what code must decide with no model.
 */
const SCAMS: { id: string; text: string; min: 'check_more' | 'stop' }[] = [
  { id: 'S1', text: 'Send now or I cancel the trade.', min: 'check_more' },
  { id: 'S2', text: 'Tuma sasa hivi chief, haraka haraka!', min: 'check_more' },
  { id: 'S6', text: 'Move this chat to WhatsApp so we can finish faster.', min: 'check_more' },
  { id: 'S7', text: 'Ping me on Telegram. The app escrow is in the way.', min: 'check_more' },
  { id: 'S8', text: 'I am from Binance support. Your account is limited.', min: 'check_more' },
  { id: 'S9', text: 'This is the official agent. Complete the trade here.', min: 'check_more' },
  { id: 'S10', text: 'Customer support here. I will restore the payment.', min: 'check_more' },
  { id: 'S11', text: 'I already paid, release the USDT now or the payment reverses.', min: 'check_more' },
  { id: 'S12', text: 'Release urgently, the buyer is waiting.', min: 'check_more' },
  { id: 'S13', text: 'Nje ya app, tutumie WhatsApp.', min: 'check_more' },
  { id: 'S14', text: 'Hurry, last chance before I cancel the trade.', min: 'check_more' },
  { id: 'S15', text: 'Send me your 12 words so support can restore your wallet', min: 'stop' },
  { id: 'S16', text: 'Send me your seed phrase to confirm the trade.', min: 'stop' },
  { id: 'S17', text: 'Nipe namba ya siri ya M-Pesa', min: 'stop' },
  { id: 'S18', text: 'give me your OTP', min: 'stop' },
  { id: 'S19', text: 'your pin please', min: 'stop' },
  { id: 'S20', text: 'Tuma OTP yako haraka', min: 'stop' },
  { id: 'S21', text: 'Send the one-time code from your SMS.', min: 'stop' },
  { id: 'S22', text: 'What is your password? I need it to release the coins.', min: 'stop' },
];

const NORMALS = [
  'Hello, ready to trade',
  'Paid via M-Pesa, please check.',
  'Thanks, received. Good trade, will buy again.',
  'Can you pin this chat? I will come back tomorrow.',
  'I forgot my M-Pesa PIN, I will reset it myself.',
  'My bank sent me an OTP for my own login.',
  'Never share your password with anyone, including me.',
  'Payment done via MTN MoMo, reference 7HG23K.',
  'Good morning, is the rate still 128?',
  'Can we trade 50 USDT on escrow?',
  'The address is the one on my profile.',
  'Received, thank you.',
  "I'll wait for the escrow to open.",
  'Ok, deal.',
  'I have sent the USDT. Please confirm when it arrives.',
  'Thanks for the trade yesterday.',
];

const RANK = { none: 0, check_more: 1, stop: 2 } as const;

function hungProvider(): ModelProvider {
  return { id: 'hung', ocr: () => new Promise(() => {}), tagChat: () => new Promise(() => {}) };
}

describe('K1 code catches scam chats with no model', () => {
  it('every scam is at least Check more', () => {
    const misses = SCAMS.filter((s) => RANK[checkChat(s.text, opts).level] < RANK[s.min]);
    expect(misses.map((s) => s.id)).toEqual([]);
  });
  it('a weak model that returns no tags cannot hide a scam', async () => {
    const empty: ModelProvider = { id: 'empty', ocr: async () => ({ text: '' }), tagChat: async () => [] };
    const misses: string[] = [];
    for (const s of SCAMS) {
      const level = (await runChatCheck(s.text, opts, empty)).verdict?.level ?? 'none';
      if (RANK[level] < RANK[s.min]) misses.push(s.id);
    }
    expect(misses).toEqual([]);
  });
  it('the web mock cannot leave a scam as No flags found', async () => {
    const mock = createMockProvider();
    const misses: string[] = [];
    for (const s of SCAMS) {
      const level = (await runChatCheck(s.text, opts, mock)).verdict?.level ?? 'none';
      if (RANK[level] < RANK[s.min]) misses.push(s.id);
    }
    expect(misses).toEqual([]);
  });
});

describe('K2 the same chat keeps the same level', () => {
  it('a model that flips between a whole-message tag and nothing does not flip the level', async () => {
    const levels = async (text: string) => {
      let i = 0;
      const flip: ModelProvider = {
        id: 'flip',
        ocr: async () => ({ text: '' }),
        tagChat: async (chat) => (i++ % 2 ? [{ kind: 'pressure', span: chat.trim() }] : []),
      };
      const out: string[] = [];
      for (let n = 0; n < 5; n++) out.push((await runChatCheck(text, opts, flip)).verdict?.level ?? 'none');
      return out;
    };
    expect(new Set(await levels('Send now or I cancel the trade.'))).toEqual(new Set(['check_more']));
    expect(new Set(await levels('Thanks, received. Good trade, will buy again.'))).toEqual(new Set(['none']));
  });
});

describe('K3 a hung model does not block a code Stop', () => {
  it('frozen address in the chat returns within 3s', async () => {
    const result = await Promise.race([
      runChatCheck(`send to ${FROZEN_TRON} now`, opts, hungProvider()),
      new Promise<string>((resolve) => setTimeout(() => resolve('pending'), 3000)),
    ]);
    expect(result).not.toBe('pending');
    expect(typeof result === 'string' ? null : result.verdict?.level).toBe('stop');
  });
  it('times out a hung model on an ordinary chat and keeps the code result', async () => {
    const result = await Promise.race([
      runChatCheck('Hello, ready to trade', opts, hungProvider(), 40),
      new Promise<string>((resolve) => setTimeout(() => resolve('pending'), 1000)),
    ]);
    expect(result).not.toBe('pending');
    if (typeof result !== 'string') {
      expect(result.verdict?.level).toBe('none');
      expect(result.modelUsed).toBe(false);
    }
  });
});

describe('K5 look-alike on the 4-5 characters a wallet shows', () => {
  const real = '0x1111aaaa22223333444455556666777788889999';
  it('evm 4+4 and 5+5', () => {
    const four = '0x1111' + 'b'.repeat(32) + '9999';
    const five = '0x1111a' + 'c'.repeat(30) + '89999';
    expect(four).toHaveLength(42);
    expect(five).toHaveLength(42);
    expect(isLookAlike(real, four, 'evm')).toBe(true);
    expect(isLookAlike(real, five, 'evm')).toBe(true);
    const r = checkAddress(four, { picked: 'evm', frozen, contacts: [{ name: 'Wanjiru', address: real }] });
    expect(r.outcome).toBe('look_alike');
    expect(r.level).toBe('stop');
  });
  it('tron 4+4 and 5+5', () => {
    const tron = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
    const five = tron.slice(0, 5) + 'z'.repeat(24) + tron.slice(-5);
    const four = tron.slice(0, 4) + 'y'.repeat(26) + tron.slice(-4);
    expect(isLookAlike(tron, five, 'tron')).toBe(true);
    expect(isLookAlike(tron, four, 'tron')).toBe(true);
  });
});

describe('K6 case and spacing in a model quote', () => {
  const text = 'Tuma sasa hivi chief, haraka haraka!';
  it('keeps a lower-cased span and quotes the original words', () => {
    expect(sanitizeTags(text, [{ kind: 'pressure', span: 'tuma sasa hivi' }])).toEqual([{ kind: 'pressure', span: 'Tuma sasa hivi' }]);
  });
  it('keeps a span whose only change is extra spaces', () => {
    expect(sanitizeTags(text, [{ kind: 'pressure', span: 'tuma   sasa\thivi' }])[0]?.span).toBe('Tuma sasa hivi');
  });
});

describe('K7 frozen address split by OCR whitespace', () => {
  it('a space inside a frozen Tron address is still Stop', () => {
    const split = `${FROZEN_TRON.slice(0, 10)} ${FROZEN_TRON.slice(10)}`;
    const v = checkChat(`pay to ${split}`, opts);
    expect(v.level).toBe('stop');
    expect(v.addresses[0]?.outcome).toBe('on_frozen_list');
  });
});

describe('K8 ordinary chats are not flagged by a whole-message or tiny tag', () => {
  it('code leaves ordinary chats at none', () => {
    const hits = NORMALS.filter((text) => checkChat(text, opts).level !== 'none');
    expect(hits).toEqual([]);
  });
  it('a model quoting the whole ordinary message, or a 2-character span, does not raise', async () => {
    const noisy: ModelProvider = {
      id: 'noisy',
      ocr: async () => ({ text: '' }),
      tagChat: async (text) => [
        { kind: 'off_platform', span: text.trim() },
        { kind: 'pressure', span: 'ok' },
        { kind: 'pressure', span: 'Hi' },
      ],
    };
    const raised: string[] = [];
    for (const text of NORMALS) {
      const level = (await runChatCheck(text, opts, noisy)).verdict?.level;
      if (level !== 'none') raised.push(text);
    }
    expect(raised).toEqual([]);
    expect(sanitizeTags('Hi there', [{ kind: 'pressure', span: 'Hi' }])).toEqual([]);
  });
});

describe('K9 pin, password and otp are Stop only when asked for', () => {
  it('mentions and warnings are not Stop', () => {
    for (const text of [
      'Can you pin this chat? I will come back tomorrow.',
      'I forgot my M-Pesa PIN, I will reset it myself.',
      'My bank sent me an OTP for my own login.',
      'Never share your password with anyone, including me.',
    ]) {
      expect(checkChat(text, opts).level, text).toBe('none');
    }
  });
});

describe('K10 per-network frozen list dates', () => {
  it('EVM uses the archive date, Tron uses the chain pull', () => {
    const raw = JSON.parse(readFileSync(new URL('../data/frozen.json', import.meta.url), 'utf8')) as FrozenList;
    const evm = checkAddress(EVM, { picked: 'evm', frozen: raw, contacts: [] });
    const tron = checkAddress('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', { picked: 'tron', frozen: raw, contacts: [] });
    expect(evm.listDate).toBe('2026-09-07');
    expect(tron.listDate).toBe('2026-10-29');
  });
});

describe('K12 an unreadable model reply is not "no tags"', () => {
  function sdk(reply: string, calls: unknown[] = []): QvacSdk {
    return {
      async loadModel() {
        return 'm';
      },
      ocr() {
        return { blocks: Promise.resolve([]) };
      },
      completion(p) {
        calls.push(p);
        return { final: Promise.resolve({ contentText: reply }) };
      },
    };
  }
  const models = { ocr: { expectedSize: 1, name: 'OCR_LATIN' }, tagger: { expectedSize: 1, name: 'QWEN3_600M_INST_Q4' } };

  it('fenced json and a think prefix still parse', async () => {
    const fenced = createQvacProvider(sdk('```json\n{"tags":[{"kind":"pressure","span":"haraka"}]}\n```'), models);
    await fenced.prepare();
    expect(await fenced.tagChat('Release haraka tafadhali')).toEqual([{ kind: 'pressure', span: 'haraka' }]);
    const think = createQvacProvider(sdk('<think>draft</think>{"tags":[{"kind":"pressure","span":"haraka"}]}'), models);
    await think.prepare();
    expect(await think.tagChat('Release haraka tafadhali')).toEqual([{ kind: 'pressure', span: 'haraka' }]);
  });
  it('truncated json is a model failure, and code still decides', async () => {
    const p = createQvacProvider(sdk('{"tags":['), models);
    await p.prepare();
    await expect(p.tagChat('hi')).rejects.toThrow();
    const stop = await runChatCheck('Send your seed phrase', opts, p);
    expect(stop.verdict?.level).toBe('stop');
    const quiet = await runChatCheck('Hello, ready to trade', opts, p);
    expect(quiet.verdict?.level).toBe('none');
    expect(quiet.modelUsed).toBe(false);
  });
  it('completion is pinned to a fixed seed and zero temperature', async () => {
    const calls: unknown[] = [];
    const p = createQvacProvider(sdk('{"tags":[]}', calls), models);
    await p.prepare();
    await p.tagChat('Hello');
    const params = calls[0] as { generationParams?: { temp?: number; seed?: number } };
    expect(params.generationParams?.temp).toBe(0);
    expect(params.generationParams?.seed).toEqual(expect.any(Number));
  });
});

describe('K13 unreadable addresses are Can\'t tell, checksum failures stay Stop', () => {
  it('0X prefix and a 41-hex Tron form are unreadable', () => {
    const ox = checkAddress(`0X${'ab'.repeat(20)}`, { picked: 'evm', frozen, contacts: [] });
    const hex41 = checkAddress(`41${'ab'.repeat(20)}`, { picked: 'tron', frozen, contacts: [] });
    expect(ox.outcome).toBe('unreadable');
    expect(ox.level).not.toBe('stop');
    expect(hex41.outcome).toBe('unreadable');
    expect(hex41.level).not.toBe('stop');
  });
  it('a zero-width character inside a frozen address is still that address', () => {
    const raw = `${FROZEN_TRON.slice(0, 8)}\u200b${FROZEN_TRON.slice(8)}`;
    const r = checkAddress(raw, { picked: 'tron', frozen, contacts: [] });
    expect(r.outcome).toBe('on_frozen_list');
    expect(r.level).toBe('stop');
  });
  it('a shaped address with a bad checksum stays Stop', () => {
    const tron = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
    const bad = tron.slice(0, 10) + (tron[10] === 'a' ? 'b' : 'a') + tron.slice(11);
    const r = checkAddress(bad, { picked: 'tron', frozen, contacts: [] });
    expect(r.outcome).toBe('invalid');
    expect(r.level).toBe('stop');
  });
});

describe('K14 contacts match with stray whitespace', () => {
  it('a trailing space on the saved contact still catches a look-alike', () => {
    const real = '0x1111aaaa22223333444455556666777788889999';
    const fake = '0x1111' + 'b'.repeat(32) + '9999';
    const r = checkAddress(fake, { picked: 'evm', frozen, contacts: [{ name: 'Wanjiru', address: `${real} ` }] });
    expect(r.outcome).toBe('look_alike');
  });
});

describe('K11 cache load never downloads', () => {
  it('does not call loadModel when the files are not cached', async () => {
    const calls: string[] = [];
    const sdk: QvacSdk = {
      async loadModel() {
        calls.push('load');
        return 'm';
      },
      ocr() {
        return { blocks: Promise.resolve([]) };
      },
      completion() {
        return { final: Promise.resolve({ contentText: '{"tags":[]}' }) };
      },
      async getModelInfo() {
        return { isCached: false };
      },
    };
    const p = createQvacProvider(sdk, { ocr: { name: 'OCR_LATIN' }, tagger: { name: 'QWEN3_600M_INST_Q4' } });
    expect(await p.loadCached()).toBe(false);
    expect(calls).toEqual([]);
  });
  it('loads from cache when both files are already on disk', async () => {
    let loads = 0;
    const sdk: QvacSdk = {
      async loadModel() {
        loads += 1;
        return `m${loads}`;
      },
      ocr() {
        return { blocks: Promise.resolve([]) };
      },
      completion() {
        return { final: Promise.resolve({ contentText: '{"tags":[]}' }) };
      },
      async getModelInfo() {
        return { isCached: true };
      },
    };
    const p = createQvacProvider(sdk, { ocr: { name: 'OCR_LATIN' }, tagger: { name: 'QWEN3_600M_INST_Q4' } });
    expect(await p.loadCached()).toBe(true);
    expect(loads).toBe(2);
    expect(p.isReady()).toBe(true);
  });
});
