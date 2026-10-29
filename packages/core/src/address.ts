import type { AddressResult, Contact, FrozenList, Network, Reason } from './types';
import { cleanAddress, detectNetwork, isValid, normalize } from './validate';

// Wallets show about 4 or 5 characters at each end. Matching 4 also catches 5 and 6.
const PREFIX = 4;
const SUFFIX = 4;

export const WORDING = {
  invalid: "This isn't a valid address. Check for a typo or a bad OCR read.",
  wrong_network: 'This address is for a different network than the one you picked.',
  on_frozen_list: "Tether has frozen this address. That isn't proof of a scam, but funds sent there may be stuck.",
  look_alike: "This looks like an address you've used, but it isn't the same one.",
  not_on_list: 'Not on the frozen list as of the list date. This proves nothing about the address.',
} as const;

/** The date the list for this network was actually current. */
export function networkListDate(frozen: FrozenList, net: Network): string | null {
  return frozen.dates?.[net] || frozen.date;
}

function body(addr: string, net: Network): string {
  return net === 'evm' ? addr.slice(2).toLowerCase() : addr;
}

/** Same ends, different middle: the address-poisoning pattern. */
export function isLookAlike(a: string, b: string, net: Network): boolean {
  const x = body(cleanAddress(a), net);
  const y = body(cleanAddress(b), net);
  if (!x || !y || x === y || x.length !== y.length) return false;
  return x.slice(0, PREFIX) === y.slice(0, PREFIX) && x.slice(-SUFFIX) === y.slice(-SUFFIX);
}

export interface CheckOptions {
  picked: Network;
  frozen: FrozenList;
  contacts: Contact[];
}

export function checkAddress(raw: string, opts: CheckOptions): AddressResult {
  const address = cleanAddress(raw);
  const { picked, frozen } = opts;
  const contacts = opts.contacts
    .map((c) => ({ name: c.name, address: cleanAddress(c.address) }))
    .filter((c) => detectNetwork(c.address));
  const detected = detectNetwork(address);
  const listDate = networkListDate(frozen, picked);
  const base = { address, picked, detected, listDate };
  const stop = (outcome: AddressResult['outcome'], extra: Partial<AddressResult> = {}): AddressResult => {
    const reasons: Reason[] = [{ kind: outcome, level: 'stop', text: WORDING[outcome as keyof typeof WORDING], span: address, source: 'code' }];
    return { ...base, outcome, level: 'stop', reasons, ...extra };
  };

  // A string we cannot read is not a red flag. A checksum failure on a real shape is.
  if (!address || !detected) {
    return { ...base, detected: null, outcome: 'unreadable', level: 'none', reasons: [] };
  }
  if (detected !== picked) return stop('wrong_network');
  if (!isValid(address, picked)) return stop('invalid');

  const norm = normalize(address, picked);
  const list = picked === 'tron' ? frozen.tron : frozen.evm.map((a) => a.toLowerCase());
  if (list.includes(norm)) return stop('on_frozen_list');

  const sameNet = contacts.filter((c) => detectNetwork(c.address) === picked);
  const exact = sameNet.find((c) => normalize(c.address, picked) === norm);
  if (exact) {
    return { ...base, outcome: 'saved_contact', level: 'none', contact: exact.name, reasons: [] };
  }
  const twin = sameNet.find((c) => isLookAlike(address, c.address, picked));
  if (twin) return stop('look_alike', { lookAlikeOf: twin });

  return { ...base, outcome: 'not_on_list', level: 'none', reasons: [] };
}
