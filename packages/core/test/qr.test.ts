import { describe, expect, it } from 'vitest';
import { parseQr } from '../src';

const TRON = 'TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7';
const EVM = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';
const TOKEN = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

describe('parseQr', () => {
  it('bare addresses', () => {
    expect(parseQr(` ${TRON}\n`)).toEqual({ address: TRON, network: 'tron' });
    expect(parseQr(EVM)).toEqual({ address: EVM, network: 'evm' });
  });
  it('tron: URI with amount', () => {
    expect(parseQr(`tron:${TRON}?amount=10`)).toEqual({ address: TRON, network: 'tron' });
  });
  it('ethereum: plain and with chain id', () => {
    expect(parseQr(`ethereum:${EVM}`)).toEqual({ address: EVM, network: 'evm' });
    expect(parseQr(`ethereum:${EVM}@56?value=1e18`)).toEqual({ address: EVM, network: 'evm' });
  });
  it('EIP-681 token transfer: the recipient is the address param, not the contract', () => {
    expect(parseQr(`ethereum:${TOKEN}@1/transfer?address=${EVM}&uint256=1e6`)).toEqual({ address: EVM, network: 'evm', token: TOKEN });
  });
  it('no single address -> null', () => {
    expect(parseQr('')).toBeNull();
    expect(parseQr('https://example.com/pay')).toBeNull();
    expect(parseQr(`ethereum:${TOKEN}/transfer?uint256=5`)).toBeNull();
    expect(parseQr(`ethereum:${TOKEN}/approve?address=${EVM}`)).toBeNull();
    expect(parseQr(`tron:${EVM}`)).toBeNull();
    expect(parseQr(`bitcoin:${TRON}`)).toBeNull();
  });
});
