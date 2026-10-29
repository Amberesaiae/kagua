import { beforeEach, describe, expect, it } from 'vitest';
import { presentCantTell } from '../logic/present';
import { addContact, bindRepo, hydrate, recordCheck, removeContact, wipeAll } from './actions';
import { memoryRepo, RECENT_LIMIT, type Repo } from './repo';
import { getState, resetState } from './store';

const W = { name: 'Wanjiru', address: '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed' };
let repo: Repo;

beforeEach(() => {
  repo = memoryRepo();
  bindRepo(repo);
  resetState();
});

describe('actions', () => {
  it('contacts persist and a re-save replaces by address', async () => {
    addContact(W);
    addContact({ ...W, name: 'Wanjiru M' });
    expect(getState().contacts).toEqual([{ ...W, name: 'Wanjiru M' }]);
    resetState();
    await hydrate();
    expect(getState().contacts).toHaveLength(1);
    removeContact(W.address);
    expect((await repo.load()).contacts).toEqual([]);
  });
  it('recent keeps no chat text and caps the list', async () => {
    const r = recordCheck({ kind: 'chat' }, presentCantTell('x'));
    expect(r.label).toBe('Chat');
    expect(r.level).toBe('cant_tell');
    for (let i = 0; i < RECENT_LIMIT + 5; i++) recordCheck({ kind: 'address', address: 'TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7' }, presentCantTell('x'));
    expect(getState().recent).toHaveLength(RECENT_LIMIT);
    expect((await repo.load()).recent).toHaveLength(RECENT_LIMIT);
    expect(getState().recent[0].label).toBe('TLa2f6…5wYjU7');
  });
  it('wipe clears memory and storage', async () => {
    addContact(W);
    await repo.setTheme('light');
    await wipeAll();
    expect(getState().contacts).toEqual([]);
    expect(await repo.load()).toEqual({ contacts: [], recent: [], theme: 'system', modelsReady: false });
  });
});

describe('models flag', () => {
  it('survives a wipe so checks keep working', async () => {
    const { markModelsReady } = await import('./actions');
    markModelsReady(true);
    addContact(W);
    await wipeAll();
    expect(getState().modelsReady).toBe(true);
    expect((await repo.load()).modelsReady).toBe(true);
    expect((await repo.load()).contacts).toEqual([]);
  });
});
