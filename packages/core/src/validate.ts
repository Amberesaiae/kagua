import { keccak_256 } from '@noble/hashes/sha3';
import { base58CheckDecode } from './base58';
import type { Network } from './types';

const TRON_SHAPE = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
const EVM_SHAPE = /^0x[0-9a-fA-F]{40}$/;

export function isValidTron(addr: string): boolean {
  if (!TRON_SHAPE.test(addr)) return false;
  const payload = base58CheckDecode(addr);
  return !!payload && payload.length === 21 && payload[0] === 0x41;
}

export function toEip55(addr: string): string {
  const lower = addr.slice(2).toLowerCase();
  const hash = keccak_256(new TextEncoder().encode(lower));
  let out = '0x';
  for (let i = 0; i < lower.length; i++) {
    const nibble = (hash[i >> 1] >> (i % 2 === 0 ? 4 : 0)) & 0xf;
    out += nibble >= 8 ? lower[i].toUpperCase() : lower[i];
  }
  return out;
}

export function isValidEvm(addr: string): boolean {
  if (!EVM_SHAPE.test(addr)) return false;
  const body = addr.slice(2);
  const mixed = body !== body.toLowerCase() && body !== body.toUpperCase();
  return mixed ? toEip55(addr) === addr : true;
}

/** Which network an address is shaped for, ignoring checksums. */
export function detectNetwork(addr: string): Network | null {
  if (TRON_SHAPE.test(addr)) return 'tron';
  if (EVM_SHAPE.test(addr)) return 'evm';
  return null;
}

export function isValid(addr: string, net: Network): boolean {
  return net === 'tron' ? isValidTron(addr) : isValidEvm(addr);
}

export function normalize(addr: string, net: Network): string {
  return net === 'evm' ? addr.toLowerCase() : addr;
}

/** Drop whitespace and invisible paste characters. Addresses never contain them. */
export function cleanAddress(raw: string): string {
  return raw.replace(/[\s\u200b\u200c\u200d\ufeff\u2060\u00a0]/g, '');
}
