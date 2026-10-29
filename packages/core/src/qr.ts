import type { Network } from './types';
import { detectNetwork } from './validate';

export interface QrTarget {
  address: string;
  network: Network;
  /** The token contract when the QR is an EIP-681 token transfer. */
  token?: string;
}

/**
 * Read the recipient from a wallet QR. Accepts a bare address, `tron:<addr>`,
 * and EIP-681 `ethereum:<addr>[@chain][/transfer?address=<to>]`. For an EIP-681
 * token transfer the recipient is the `address` parameter, not the contract.
 * Returns null when there is no single address to read: Kagua doesn't guess.
 */
export function parseQr(raw: string): QrTarget | null {
  const text = raw.trim();
  if (!text) return null;
  const bare = detectNetwork(text);
  if (bare) return { address: text, network: bare };

  const m = /^([a-z]+):(?:\/\/)?([^?@/]+)(?:@[0-9a-zA-Z]+)?(\/[a-zA-Z]+)?(?:\?(.*))?$/i.exec(text);
  if (!m) return null;
  const scheme = m[1].toLowerCase();
  const target = m[2];
  const fn = m[3]?.slice(1).toLowerCase();
  const params = new URLSearchParams(m[4] ?? '');

  if (scheme === 'tron') {
    return detectNetwork(target) === 'tron' ? { address: target, network: 'tron' } : null;
  }
  if (scheme === 'ethereum') {
    if (detectNetwork(target) !== 'evm') return null;
    if (fn === 'transfer') {
      const to = params.get('address') ?? '';
      return detectNetwork(to) === 'evm' ? { address: to, network: 'evm', token: target } : null;
    }
    if (fn) return null;
    return { address: target, network: 'evm' };
  }
  return null;
}
