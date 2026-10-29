export type Network = 'tron' | 'evm';
export type Level = 'none' | 'check_more' | 'stop';

export interface Reason {
  kind: string;
  level: Level;
  text: string;
  span?: string;
  source: 'code' | 'model';
}

export interface Contact {
  name: string;
  address: string;
}

export interface FrozenList {
  date: string | null;
  tron: string[];
  evm: string[];
}

export type AddressOutcome =
  | 'invalid'
  | 'wrong_network'
  | 'on_frozen_list'
  | 'look_alike'
  | 'saved_contact'
  | 'not_on_list';

export interface AddressResult {
  address: string;
  picked: Network;
  detected: Network | null;
  outcome: AddressOutcome;
  level: Level;
  contact?: string;
  lookAlikeOf?: Contact;
  listDate: string | null;
  reasons: Reason[];
}
