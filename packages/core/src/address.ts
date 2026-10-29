import type { AddressResult, Contact, FrozenList, Network, Reason } from './types';
import { detectNetwork, isValid, normalize } from './validate';

const PREFIX = 6;
const SUFFIX = 6;

export const WORDING = {
  invalid: "This isn't a valid address. Check for a typo or a bad OCR read.",
  wrong_network: 'This address is for a different network than the one you picked.',
  on_frozen_list: "Tether has frozen this address. That isn't proof of a scam, but funds sent there may be stuck.",
  look_alike: "This looks like an address you've used, but it isn't the same one.",
  not_on_list: 'Not on the frozen list as of the list date. This proves nothing about the address.',
} as const;

function body(addr: string, net: Network): string {
  return net === 'evm' ? addr.slice(2).toLowerCase() : addr;
}

/** Same ends, different middle: the address-poisoning pattern. */
export function isLookAlike(a: string, b: string, net: Network): boolean {
  const x = body(a, net);
  const y = body(b, net);
  if (x === y || x.length !== y.length) return false;
  return x.slice(0, PREFIX) === y.slice(0, PREFIX) && x.slice(-SUFFIX) === y.slice(-SUFFIX);
}

export interface CheckOptions {
  picked: Network;
  frozen: FrozenList;
  contacts: Contact[];
}

export function checkAddress(raw: string, opts: CheckOptions): AddressResult {
  const address = raw.trim();
  const { picked, frozen, contacts } = opts;
  const detected = detectNetwork(address);
  const base = { address, picked, detected, listDate: frozen.date };
  const stop = (outcome: AddressResult['outcome'], extra: Partial<AddressResult> = {}): AddressResult => {
    const reasons: Reason[] = [{ kind: outcome, level: 'stop', text: WORDING[outcome as keyof typeof WORDING], span: address, source: 'code' }];
    return { ...base, outcome, level: 'stop', reasons, ...extra };
  };

  if (!detected) return stop('invalid');
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
