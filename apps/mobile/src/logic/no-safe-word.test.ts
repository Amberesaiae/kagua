import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Principle 2: no result, string or screen uses the word "safe".
const ROOTS = [join(__dirname, '..'), join(__dirname, '../../../../packages/core/src')];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return files(p);
    return /\.(tsx?|json)$/.test(f) && !f.endsWith('no-safe-word.test.ts') ? [p] : [];
  });
}

describe('wording', () => {
  it('never uses the word safe in app or core source', () => {
    // The safe-area library's module name is the only allowed match; it never reaches the screen.
    const hits = ROOTS.flatMap(files).filter((p) => /\bsafe\b/i.test(readFileSync(p, 'utf8').replace(/react-native-safe-area-context/g, '')));
    expect(hits).toEqual([]);
  });
});
