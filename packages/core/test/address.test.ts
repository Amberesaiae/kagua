import { describe, expect, it } from 'vitest';
import { checkAddress, isLookAlike, isValidEvm, isValidTron, toEip55, type FrozenList } from '../src';

const TRON = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const TRON2 = 'TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7';
const EVM = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';
const frozen: FrozenList = { date: '2026-10-01', tron: [TRON2], evm: ['0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB'] };
const base = { frozen, contacts: [] as { name: string; address: string }[] };

describe('validators', () => {
  it('accepts valid Tron and rejects one changed character', () => {
    expect(isValidTron(TRON)).toBe(true);
    const bad = TRON.slice(0, 10) + (TRON[10] === 'a' ? 'b' : 'a') + TRON.slice(11);
    expect(isValidTron(bad)).toBe(false);
  });
  it('EVM: lowercase passes, bad EIP-55 mixed case fails, good one passes', () => {
    expect(isValidEvm(EVM.toLowerCase())).toBe(true);
    expect(isValidEvm(EVM)).toBe(true);
    expect(toEip55(EVM.toLowerCase())).toBe(EVM);
    const bad = EVM.replace('Aeb', 'aeb');
    expect(isValidEvm(bad)).toBe(false);
  });
});

describe('checkAddress', () => {
  it('invalid -> stop', () => {
    const r = checkAddress(TRON.slice(0, 10) + (TRON[10] === 'a' ? 'b' : 'a') + TRON.slice(11), { ...base, picked: 'tron' });
    expect(r.outcome).toBe('invalid');
    expect(r.level).toBe('stop');
  });
  it('wrong network both ways', () => {
    expect(checkAddress(TRON, { ...base, picked: 'evm' }).outcome).toBe('wrong_network');
    expect(checkAddress(EVM, { ...base, picked: 'tron' }).outcome).toBe('wrong_network');
  });
  it('frozen -> stop (tron and evm, case-insensitive for evm)', () => {
    expect(checkAddress(TRON2, { ...base, picked: 'tron' }).outcome).toBe('on_frozen_list');
    const r = checkAddress('0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB'.toLowerCase(), { ...base, picked: 'evm' });
    expect(r.outcome).toBe('on_frozen_list');
    expect(r.level).toBe('stop');
  });
  it('exact contact shows name, level none', () => {
    const r = checkAddress(TRON, { ...base, picked: 'tron', contacts: [{ name: 'Wanjiru', address: TRON }] });
    expect(r.contact).toBe('Wanjiru');
    expect(r.level).toBe('none');
  });
  it('look-alike: same ends, different middle (EVM)', () => {
    const real = '0x1111aaaa22223333444455556666777788889999';
    const fake = '0x1111aa' + 'b'.repeat(28) + '889999';
    expect(fake.length).toBe(real.length);
    const r = checkAddress(fake, { ...base, picked: 'evm', contacts: [{ name: 'Wanjiru', address: real }] });
    expect(r.outcome).toBe('look_alike');
    expect(r.lookAlikeOf?.name).toBe('Wanjiru');
  });
  it('look-alike detector works on Tron-shaped strings', () => {
    const a = TRON;
    const b = TRON.slice(0, 6) + 'z'.repeat(22) + TRON.slice(-6);
    expect(isLookAlike(a, b, 'tron')).toBe(true);
    expect(isLookAlike(a, a, 'tron')).toBe(false);
  });
  it('not on list never says safe', () => {
    const r = checkAddress(TRON, { ...base, picked: 'tron' });
    expect(r.outcome).toBe('not_on_list');
    expect(r.level).toBe('none');
    expect(JSON.stringify(r)).not.toMatch(/\bsafe\b/i);
  });
});
