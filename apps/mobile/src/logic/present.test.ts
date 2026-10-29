import { describe, expect, it } from 'vitest';
import { checkAddress, checkChat, type FrozenList } from '@kagua/core';
import { diffMiddle, presentAddress, presentCantTell, presentChat, spokenAddress } from './present';
import { formatMs, timedAddressCheck } from './steps';

const EVM = '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed';
const TWIN = '0x5aaeb6aaaaaaaaaaaaaaaaaaaaaaaaaaaa1beaed';
const TRON = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const FROZEN_TRON = 'TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7';
const frozen: FrozenList = { date: '2026-10-29', tron: [FROZEN_TRON], evm: [] };
const contacts = [{ name: 'Wanjiru', address: EVM }];

describe('presentAddress', () => {
  it('look-alike -> stop with compare naming the contact', () => {
    const v = presentAddress(checkAddress(TWIN, { picked: 'evm', frozen, contacts }));
    expect(v.screen).toBe('stop');
    expect(v.sub).toContain("Wanjiru's address");
    expect(v.compare?.pasted.find((s) => s.differs)?.text).toBe('aaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    expect(v.compare?.savedAddress).toBe(EVM);
  });
  it('frozen -> stop with the frozen reason', () => {
    const v = presentAddress(checkAddress(FROZEN_TRON, { picked: 'tron', frozen, contacts: [] }));
    expect(v.screen).toBe('stop');
    expect(v.evidence[0].label).toBe('FROZEN');
  });
  it('not on list -> no_flags that says it proves nothing', () => {
    const v = presentAddress(checkAddress(TRON, { picked: 'tron', frozen, contacts: [] }));
    expect(v.screen).toBe('no_flags');
    expect(v.sub).toContain('2026-10-29');
    expect(v.sub).toContain('proves nothing');
  });
});

describe('presentChat', () => {
  it('model tags -> check_more with labels', () => {
    const v = presentChat(checkChat('hi', { picked: 'tron', frozen, contacts: [] }, [{ kind: 'off_platform', span: 'hi' }]));
    expect(v.screen).toBe('check_more');
    expect(v.evidence[0].label).toBe('OFF-APP');
    expect(v.evidence[0].source).toBe('model');
  });
  it('seed phrase -> stop', () => {
    expect(presentChat(checkChat('send your seed phrase', { picked: 'tron', frozen, contacts: [] })).screen).toBe('stop');
  });
});

describe('helpers', () => {
  it('diffMiddle splits shared ends', () => {
    const d = diffMiddle('ABCxyzDEF', 'ABCqqqDEF');
    expect(d.b).toEqual([
      { text: 'ABC', differs: false },
      { text: 'qqq', differs: true },
      { text: 'DEF', differs: false },
    ]);
  });
  it('cant tell view', () => expect(presentCantTell('x').screen).toBe('cant_tell'));
  it('spoken address groups of four', () => expect(spokenAddress('TR7NHqje')).toBe('TR7N Hqje'));
  it('timed check returns the same result as checkAddress', () => {
    const opts = { picked: 'tron' as const, frozen, contacts: [] };
    const t = timedAddressCheck(FROZEN_TRON, opts);
    expect(t.result).toEqual(checkAddress(FROZEN_TRON, opts));
    expect(t.steps.map((s) => s.name)).toEqual(['Checksum', 'Network', 'Frozen list', 'Look-alike', 'Decide']);
  });
  it('formatMs', () => {
    expect(formatMs(0.2)).toBe('<1 ms');
    expect(formatMs(12.4)).toBe('12 ms');
    expect(formatMs(1500)).toBe('1.5 s');
  });
});
