import type { Contact, Level } from '@kagua/core';
import type { ThemePref } from '../theme/ThemeContext';

/** One past check. Chat text is not kept: only that a chat was checked and the level. */
export interface RecentCheck {
  id: string;
  at: string;
  kind: 'address' | 'chat' | 'screenshot';
  label: string;
  level: Level | 'cant_tell';
}

export interface Snapshot {
  contacts: Contact[];
  recent: RecentCheck[];
  theme: ThemePref;
  /** The one-time model download finished on this phone. */
  modelsReady: boolean;
}

/** Local storage on this phone. SQLite on native, localStorage on the web build. */
export interface Repo {
  load(): Promise<Snapshot>;
  addContact(c: Contact): Promise<void>;
  removeContact(address: string): Promise<void>;
  addRecent(r: RecentCheck): Promise<void>;
  setTheme(t: ThemePref): Promise<void>;
  setModelsReady(v: boolean): Promise<void>;
  wipe(): Promise<void>;
}

export const RECENT_LIMIT = 20;
export const EMPTY: Snapshot = { contacts: [], recent: [], theme: 'system', modelsReady: false };

/** Newest first, capped. Shared by every Repo so they behave the same. */
export function pushRecent(list: RecentCheck[], r: RecentCheck): RecentCheck[] {
  return [r, ...list.filter((x) => x.id !== r.id)].slice(0, RECENT_LIMIT);
}

export function memoryRepo(seed: Snapshot = EMPTY): Repo {
  let snap: Snapshot = { ...seed, contacts: [...seed.contacts], recent: [...seed.recent] };
  return {
    async load() {
      return { ...snap, contacts: [...snap.contacts], recent: [...snap.recent] };
    },
    async addContact(c) {
      snap.contacts = [...snap.contacts.filter((x) => x.address !== c.address), c];
    },
    async removeContact(address) {
      snap.contacts = snap.contacts.filter((x) => x.address !== address);
    },
    async addRecent(r) {
      snap.recent = pushRecent(snap.recent, r);
    },
    async setTheme(t) {
      snap.theme = t;
    },
    async setModelsReady(v) {
      snap.modelsReady = v;
    },
    async wipe() {
      // Wipe clears what the user stored; downloaded models stay so checks keep working.
      snap = { ...EMPTY, modelsReady: snap.modelsReady };
    },
  };
}
