import { describe, expect, it } from 'vitest';
import { createQvacProvider, runChatCheck, TAG_SCHEMA, type FrozenList, type QvacSdk } from '../src';

const frozen: FrozenList = { date: '2026-10-01', tron: [], evm: [] };
const opts = { picked: 'tron' as const, frozen, contacts: [] };
const MODELS = { ocr: { expectedSize: 100 }, tagger: { expectedSize: 900 } };

function fakeSdk(reply: string, calls: unknown[] = []): QvacSdk {
  let n = 0;
  return {
    async loadModel(o) {
      calls.push(['load', o.modelSrc]);
      o.onProgress?.({ downloaded: 50, total: 100, percentage: 50 });
      return `m${n++}`;
    },
    ocr(p) {
      calls.push(['ocr', p.modelId, p.image]);
      return { blocks: Promise.resolve([{ text: 'Tuma OTP' }, { text: 'haraka', confidence: 0.9 }]) };
    },
    completion(p) {
      calls.push(['completion', p.modelId, p.responseFormat?.type, p.history.length]);
      return { final: Promise.resolve({ contentText: reply }) };
    },
  };
}

describe('QVAC adapter (fake SDK)', () => {
  it('prepare loads OCR then tagger and reports combined bytes', async () => {
    const calls: unknown[] = [];
    const seen: number[] = [];
    const p = createQvacProvider(fakeSdk('{"tags":[]}', calls), MODELS);
    expect(p.isReady()).toBe(false);
    await p.prepare((x) => seen.push(x.downloaded / x.total));
    expect(p.isReady()).toBe(true);
    expect(calls.filter((c) => (c as string[])[0] === 'load')).toHaveLength(2);
    expect(seen[0]).toBeLessThan(seen[1]);
    await p.prepare();
    expect(calls.filter((c) => (c as string[])[0] === 'load')).toHaveLength(2);
  });
  it('tags must quote the chat; schema-forced JSON with no level', async () => {
    const reply = JSON.stringify({ tags: [{ kind: 'pressure', span: 'haraka' }, { kind: 'off_platform', span: 'invented words' }] });
    const calls: unknown[] = [];
    const p = createQvacProvider(fakeSdk(reply, calls), MODELS);
    await p.prepare();
    expect(await p.tagChat('Release haraka tafadhali')).toEqual([{ kind: 'pressure', span: 'haraka' }]);
    expect(calls).toContainEqual(['completion', 'm1', 'json_schema', 2]);
    expect(JSON.stringify(TAG_SCHEMA)).not.toMatch(/level|stop/);
  });
  it('bad JSON -> no tags, code rules still decide', async () => {
    const p = createQvacProvider(fakeSdk('not json'), MODELS);
    await p.prepare();
    expect(await p.tagChat('hi')).toEqual([]);
    const r = await runChatCheck('Send your seed phrase', opts, p);
    expect(r.verdict?.level).toBe('stop');
  });
  it('OCR joins blocks; unloaded models throw so the app shows Can\'t tell', async () => {
    const p = createQvacProvider(fakeSdk('{"tags":[]}'), MODELS);
    await expect(p.ocr({ uri: 'file:///a.png' })).rejects.toThrow();
    await p.prepare();
    expect((await p.ocr({ uri: 'file:///a.png' })).text).toBe('Tuma OTP\nharaka');
  });
});
