import { checkAddress, type CheckOptions } from './address';
import type { AddressResult, Level, Reason } from './types';

export type ModelTagKind = 'pressure' | 'impersonation' | 'off_platform' | 'fake_support';

/** What a model may return: tags tied to the exact text. Never a level. */
export interface ModelTag {
  kind: ModelTagKind;
  span: string;
}

interface Rule {
  kind: string;
  re: RegExp;
  text: string;
}

// Hard signals only. English and Swahili. Tune on the dev split.
export const HARD_RULES: Rule[] = [
  { kind: 'asks_seed_phrase', re: /\b(seed|recovery|secret)\s+(phrase|words?)\b|maneno\s+ya\s+siri/i, text: 'Asks for a seed or recovery phrase. No real buyer or support agent needs it.' },
  { kind: 'asks_pin', re: /\b(your\s+)?(pin|password)\b|nambari\s+ya\s+siri|namba\s+ya\s+siri|neno\s+la\s+siri/i, text: 'Asks for a PIN or password.' },
  { kind: 'asks_otp', re: /\b(otp|one[-\s]?time\s+(code|password))\b|msimbo\s+wa\s+(uthibitisho|siri)/i, text: 'Asks for a one-time code.' },
];

const TRON_RE = /\bT[1-9A-HJ-NP-Za-km-z]{33}\b/g;
const EVM_RE = /\b0x[0-9a-fA-F]{40}\b/g;

export function findAddresses(text: string): string[] {
  return [...(text.match(TRON_RE) ?? []), ...(text.match(EVM_RE) ?? [])];
}

const RANK: Record<Level, number> = { none: 0, check_more: 1, stop: 2 };
const maxLevel = (a: Level, b: Level): Level => (RANK[a] >= RANK[b] ? a : b);

export interface Verdict {
  level: Level;
  reasons: Reason[];
  addresses: AddressResult[];
}

/**
 * Code decides. Model tags can only add reasons and raise none -> check_more.
 * They can never lower a level and never produce stop.
 */
export function decide(codeReasons: Reason[], tags: ModelTag[], addresses: AddressResult[] = []): Verdict {
  let level: Level = 'none';
  const reasons: Reason[] = [...codeReasons];
  for (const r of codeReasons) level = maxLevel(level, r.level);
  for (const t of tags) {
    reasons.push({ kind: t.kind, level: 'check_more', text: TAG_TEXT[t.kind], span: t.span, source: 'model' });
    level = maxLevel(level, 'check_more');
  }
  return { level, reasons, addresses };
}

const TAG_TEXT: Record<ModelTagKind, string> = {
  pressure: 'Rushing you to act.',
  impersonation: 'May be posing as someone else.',
  off_platform: "Moving you off the platform, where escrow can't protect you.",
  fake_support: 'May be fake support.',
};

export function checkChat(text: string, opts: CheckOptions, tags: ModelTag[] = []): Verdict {
  const codeReasons: Reason[] = [];
  for (const rule of HARD_RULES) {
    const m = rule.re.exec(text);
    if (m) codeReasons.push({ kind: rule.kind, level: 'stop', text: rule.text, span: sentenceAround(text, m.index), source: 'code' });
  }
  const addresses = findAddresses(text).map((a) => checkAddress(a, { ...opts, picked: a.startsWith('0x') ? 'evm' : 'tron' }));
  for (const a of addresses) codeReasons.push(...a.reasons);
  return decide(codeReasons, tags, addresses);
}

function sentenceAround(text: string, idx: number): string {
  const start = Math.max(text.lastIndexOf('.', idx), text.lastIndexOf('\n', idx)) + 1;
  const ends = [text.indexOf('.', idx), text.indexOf('\n', idx)].filter((n) => n >= 0);
  const end = ends.length ? Math.min(...ends) + 1 : text.length;
  return text.slice(start, end).trim();
}
