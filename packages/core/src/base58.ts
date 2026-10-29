import { sha256 } from '@noble/hashes/sha256';

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function base58Decode(s: string): Uint8Array | null {
  let n = 0n;
  for (const ch of s) {
    const i = ALPHABET.indexOf(ch);
    if (i < 0) return null;
    n = n * 58n + BigInt(i);
  }
  const bytes: number[] = [];
  while (n > 0n) {
    bytes.unshift(Number(n & 0xffn));
    n >>= 8n;
  }
  for (const ch of s) {
    if (ch !== '1') break;
    bytes.unshift(0);
  }
  return Uint8Array.from(bytes);
}

/** Returns the payload when the 4-byte double-SHA256 checksum matches. */
export function base58CheckDecode(s: string): Uint8Array | null {
  const raw = base58Decode(s);
  if (!raw || raw.length < 5) return null;
  const payload = raw.slice(0, -4);
  const check = raw.slice(-4);
  const hash = sha256(sha256(payload));
  for (let i = 0; i < 4; i++) if (hash[i] !== check[i]) return null;
  return payload;
}

export function base58CheckEncode(payload: Uint8Array): string {
  const check = sha256(sha256(payload)).slice(0, 4);
  const data = new Uint8Array(payload.length + 4);
  data.set(payload);
  data.set(check, payload.length);
  let n = 0n;
  for (const b of data) n = (n << 8n) | BigInt(b);
  let out = '';
  while (n > 0n) {
    out = ALPHABET[Number(n % 58n)] + out;
    n /= 58n;
  }
  for (const b of data) {
    if (b !== 0) break;
    out = '1' + out;
  }
  return out;
}

/** 20-byte hex (with or without 0x / 41 prefix) to a Tron T-address. */
export function tronFromHex(hex: string): string {
  let h = hex.toLowerCase().replace(/^0x/, '');
  if (h.length === 42 && h.startsWith('41')) h = h.slice(2);
  if (h.length !== 40) throw new Error(`bad address hex: ${hex}`);
  const bytes = new Uint8Array(21);
  bytes[0] = 0x41;
  for (let i = 0; i < 20; i++) bytes[i + 1] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  return base58CheckEncode(bytes);
}
