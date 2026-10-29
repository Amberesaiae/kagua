import { describe, expect, it } from 'vitest';
import { checkChat, decide, type FrozenList } from '../src';

const frozen: FrozenList = { date: '2026-10-01', tron: ['TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7'], evm: [] };
const opts = { picked: 'tron' as const, frozen, contacts: [] };

describe('checkChat', () => {
  it('seed phrase request -> stop with the sentence quoted', () => {
    const v = checkChat('Hi. Send me your seed phrase to confirm. Thanks', opts);
    expect(v.level).toBe('stop');
    expect(v.reasons[0].span).toContain('seed phrase');
  });
  it('Swahili PIN request -> stop', () => {
    expect(checkChat('Nipe namba ya siri ya M-Pesa', opts).level).toBe('stop');
  });
  it('frozen address in chat -> stop', () => {
    expect(checkChat('send to TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7 now', opts).level).toBe('stop');
  });
  it('nothing found -> none', () => {
    expect(checkChat('Hello, ready to trade', opts).level).toBe('none');
  });
});

describe('model can add, never remove', () => {
  it('empty model output keeps a code Stop', () => {
    const v = checkChat('give me your OTP', opts, []);
    expect(v.level).toBe('stop');
  });
  it('model tags alone raise to check_more, never stop, any count', () => {
    const tags = (['pressure', 'off_platform', 'fake_support', 'impersonation'] as const).map((kind) => ({ kind, span: 'x' }));
    expect(decide([], tags).level).toBe('check_more');
  });
  it('tags cannot lower a code stop', () => {
    const v = checkChat('your pin please', opts, [{ kind: 'pressure', span: 'please' }]);
    expect(v.level).toBe('stop');
  });
});
