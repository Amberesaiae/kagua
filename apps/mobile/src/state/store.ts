import { useSyncExternalStore } from 'react';
import type { Contact, Network } from '@kagua/core';
import type { ResultView } from '../logic/present';
import type { StepTiming } from '../logic/steps';
import type { RecentCheck } from './repo';

export type Job = { kind: 'address'; address: string; picked: Network } | { kind: 'chat'; text: string };

export interface State {
  draftAddress: string;
  picked: Network;
  job: Job | null;
  view: ResultView | null;
  steps: StepTiming[];
  modelUsed: boolean;
  contacts: Contact[];
  recent: RecentCheck[];
}

const initial: State = { draftAddress: '', picked: 'tron', job: null, view: null, steps: [], modelUsed: false, contacts: [], recent: [] };

let state: State = initial;
const listeners = new Set<() => void>();

export function getState(): State {
  return state;
}

export function setState(patch: Partial<State>): void {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function resetState(keep: Partial<State> = {}): void {
  state = { ...initial, ...keep };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStore<T>(pick: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => pick(state), () => pick(state));
}
