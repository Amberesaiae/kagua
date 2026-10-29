import type { Contact } from '@kagua/core';
import type { ResultView } from '../logic/present';
import type { ThemePref } from '../theme/ThemeContext';
import { memoryRepo, pushRecent, type RecentCheck, type Repo } from './repo';
import { getState, resetState, setState } from './store';

// The app binds the phone's repo at start; tests keep the in-memory one.
let repo: Repo = memoryRepo();

export function bindRepo(r: Repo): void {
  repo = r;
}

const quiet = (p: Promise<unknown>) => p.catch(() => {});

export async function hydrate(): Promise<ThemePref> {
  try {
    const s = await repo.load();
    setState({ contacts: s.contacts, recent: s.recent });
    return s.theme;
  } catch {
    return 'system';
  }
}

export function addContact(c: Contact): void {
  setState({ contacts: [...getState().contacts.filter((x) => x.address !== c.address), c] });
  quiet(repo.addContact(c));
}

export function removeContact(address: string): void {
  setState({ contacts: getState().contacts.filter((x) => x.address !== address) });
  quiet(repo.removeContact(address));
}

export function saveTheme(t: ThemePref): void {
  quiet(repo.setTheme(t));
}

const short = (a: string) => (a.length > 16 ? `${a.slice(0, 6)}…${a.slice(-6)}` : a);

/** Remember a finished check. For chats only the level is kept, never the text. */
export function recordCheck(job: { kind: 'address'; address: string } | { kind: 'chat' }, view: ResultView, at = new Date()): RecentCheck {
  const level = view.screen === 'no_flags' ? 'none' : view.screen;
  const r: RecentCheck = {
    id: `${at.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    at: at.toISOString(),
    kind: job.kind,
    label: job.kind === 'address' ? short(job.address.trim()) : 'Chat',
    level,
  };
  setState({ recent: pushRecent(getState().recent, r) });
  quiet(repo.addRecent(r));
  return r;
}

export async function wipeAll(): Promise<void> {
  resetState();
  await quiet(repo.wipe());
}
