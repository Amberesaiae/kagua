import { EMPTY, pushRecent, type Repo, type Snapshot } from './repo';

// Web build (desktop fallback): the same data in this browser's localStorage.
const KEY = 'kagua.v1';

function read(): Snapshot {
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Snapshot>) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function write(s: Snapshot): void {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(s));
  } catch {
    // Storage blocked: the session still works, it just won't be remembered.
  }
}

export const repo: Repo = {
  async load() {
    return read();
  },
  async addContact(c) {
    const s = read();
    write({ ...s, contacts: [...s.contacts.filter((x) => x.address !== c.address), c] });
  },
  async removeContact(address) {
    const s = read();
    write({ ...s, contacts: s.contacts.filter((x) => x.address !== address) });
  },
  async addRecent(r) {
    const s = read();
    write({ ...s, recent: pushRecent(s.recent, r) });
  },
  async setTheme(t) {
    write({ ...read(), theme: t });
  },
  async wipe() {
    try {
      globalThis.localStorage?.removeItem(KEY);
    } catch {
      // nothing stored
    }
  },
};
