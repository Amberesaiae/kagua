import type { Contact } from '@kagua/core';
import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';
import type { ThemePref } from '../theme/ThemeContext';
import { EMPTY, RECENT_LIMIT, type RecentCheck, type Repo } from './repo';

const SCHEMA = `
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS contacts (address TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, added_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS recent (id TEXT PRIMARY KEY NOT NULL, at TEXT NOT NULL, kind TEXT NOT NULL, label TEXT NOT NULL, level TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
`;

let db: SQLiteDatabase | null = null;

async function open(): Promise<SQLiteDatabase> {
  if (!db) {
    db = openDatabaseSync('kagua.db');
    await db.execAsync(SCHEMA);
  }
  return db;
}

export const repo: Repo = {
  async load() {
    const d = await open();
    const contacts = await d.getAllAsync<Contact>('SELECT name, address FROM contacts ORDER BY added_at');
    const recent = await d.getAllAsync<RecentCheck>('SELECT id, at, kind, label, level FROM recent ORDER BY at DESC LIMIT ?', [RECENT_LIMIT]);
    const theme = await d.getFirstAsync<{ value: string }>("SELECT value FROM settings WHERE key = 'theme'");
    const models = await d.getFirstAsync<{ value: string }>("SELECT value FROM settings WHERE key = 'models_ready'");
    return { ...EMPTY, contacts, recent, theme: (theme?.value as ThemePref) ?? 'system', modelsReady: models?.value === '1' };
  },
  async addContact(c) {
    const d = await open();
    await d.runAsync('INSERT OR REPLACE INTO contacts (address, name, added_at) VALUES (?, ?, ?)', [c.address, c.name, new Date().toISOString()]);
  },
  async removeContact(address) {
    const d = await open();
    await d.runAsync('DELETE FROM contacts WHERE address = ?', [address]);
  },
  async addRecent(r) {
    const d = await open();
    await d.runAsync('INSERT OR REPLACE INTO recent (id, at, kind, label, level) VALUES (?, ?, ?, ?, ?)', [r.id, r.at, r.kind, r.label, r.level]);
    await d.runAsync('DELETE FROM recent WHERE id NOT IN (SELECT id FROM recent ORDER BY at DESC LIMIT ?)', [RECENT_LIMIT]);
  },
  async setTheme(t) {
    const d = await open();
    await d.runAsync("INSERT OR REPLACE INTO settings (key, value) VALUES ('theme', ?)", [t]);
  },
  async setModelsReady(v) {
    const d = await open();
    await d.runAsync("INSERT OR REPLACE INTO settings (key, value) VALUES ('models_ready', ?)", [v ? '1' : '0']);
  },
  async wipe() {
    const d = await open();
    // Downloaded models stay so checks keep working; everything the user stored goes.
    await d.execAsync("DELETE FROM contacts; DELETE FROM recent; DELETE FROM settings WHERE key <> 'models_ready';");
  },
};
