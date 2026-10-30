import { checkAddress, type CheckOptions } from './address';
import { isValidEvm, isValidTron } from './validate';
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
  /** When set, a regex hit counts only if the sentence passes this check. */
  accept?: (sentence: string) => boolean;
}

const SEED_RE = /\b(seed|recovery|secret)\s+(phrase|words?)\b|\bmaneno\s+ya\s+siri\b|\b(private|secret)\s+key\b|\bmnemonic\b|\b(12|24|twelve|twenty[- ]?four)\s+words\b/i;
const PIN_RE = /\b(pin|password|passcode)\b|nambari\s+ya\s+siri|namba\s+ya\s+siri|neno\s+la\s+siri/i;
const OTP_RE = /\b(otp|one[-\s]?time\s+(code|password))\b|msimbo\s+wa\s+(uthibitisho|siri)/i;

function isNegated(sentence: string): boolean {
  return /\b(never|don'?t|do not|usi\w*)\b/i.test(sentence);
}

/** Stop only when the sentence asks the trader for a secret, not when it mentions one. */
function isSecretRequest(sentence: string): boolean {
  if (isNegated(sentence)) return false;
  if (/\byour\s+(pin|password|passcode|otp|one[-\s]?time\s+(code|password))\b/i.test(sentence)) return true;
  if (/\b(pin|password|passcode|otp)\s+yako\b/i.test(sentence)) return true;
  if (/\b(pin|password|passcode|otp|one[-\s]?time\s+(code|password))\s+(please|pls)\b/i.test(sentence)) return true;
  if (/\bwhat(?:'s| is)\s+(your|the)\s+(pin|password|passcode|otp|one[-\s]?time\s+(code|password))\b/i.test(sentence)) return true;
  if (/\b(nambari\s+ya\s+siri|namba\s+ya\s+siri|neno\s+la\s+siri|msimbo\s+wa\s+(uthibitisho|siri))\b/i.test(sentence)) return true;
  if (/\b(send|give|share|tell|enter|provide|type|confirm|nipe|tuma|nitumie|peleka|andika|weka)\b/i.test(sentence)) {
    if (/\b(i|i've|i'll)\s+(forgot|forget|enter|reset|have|had|know|use|used|sent)\b/i.test(sentence)) return false;
    return true;
  }
  return false;
}

// Hard signals: Stop. English and Swahili. A mention or a warning is not a request.
export const HARD_RULES: Rule[] = [
  { kind: 'asks_seed_phrase', re: SEED_RE, text: 'Asks for a seed or recovery phrase. No real buyer or support agent needs it.', accept: (s) => !isNegated(s) },
  { kind: 'asks_pin', re: PIN_RE, text: 'Asks for a PIN or password.', accept: isSecretRequest },
  { kind: 'asks_otp', re: OTP_RE, text: 'Asks for a one-time code.', accept: isSecretRequest },
];

// Softer signals: Check more, from code, so a missing or weak model cannot hide them.
export const SOFT_RULES: Rule[] = [
  { kind: 'pressure', re: /\b(?:send now|right now|pay now|sasa hivi|or i cancel|last chance|last warning)\b|\b(?:urgent(?:ly)?|hurry|asap|immediately|quickly|haraka)\b/i, text: 'Rushing you to act.' },
  { kind: 'off_platform', re: /\b(?:whatsapp|telegram)\b|\bnje ya\b|\boutside the (?:app|platform)\b|\bon signal\b/i, text: "Moving you off the platform, where escrow can't protect you." },
  { kind: 'impersonation', re: /\bi am from (?:binance|bybit|okx|tether)\b|\bofficial (?:agent|admin)\b|\badmin wa\b/i, text: 'May be posing as someone else.' },
  { kind: 'fake_support', re: /\bcustomer (?:care|support)\b|\bsupport (?:team|agent)\b|\bhuduma kwa wateja\b/i, text: 'May be fake support.' },
  { kind: 'fake_payment', re: /\b(?:already paid|i(?:'ve| have) paid)\b.{0,80}\brelease\b|\bpayment (?:will |may )?(?:be )?revers/i, text: 'Claims a payment that may not be real. Check it in your own app before you release.' },
];

const TRON_RE = /\bT[1-9A-HJ-NP-Za-km-z]{33}\b/g;
const EVM_RE = /\b0x[0-9a-fA-F]{40}\b/g;
// OCR often puts a space or a line break inside an address. Keep the candidate only when the checksum holds.
const TRON_LOOSE = /T(?:[1-9A-HJ-NP-Za-km-z][ \t\n\u00a0]{0,3}){33}(?![1-9A-HJ-NP-Za-km-z])/g;
const EVM_LOOSE = /0x(?:[0-9a-fA-F][ \t\n\u00a0]{0,3}){40}(?![0-9a-fA-F])/g;

export function findAddresses(text: string): string[] {
  const found = new Set<string>();
  TRON_RE.lastIndex = 0;
  EVM_RE.lastIndex = 0;
  for (const m of text.match(TRON_RE) ?? []) found.add(m);
  for (const m of text.match(EVM_RE) ?? []) found.add(m);
  const loose = (re: RegExp, valid: (s: string) => boolean) => {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      const collapsed = m[0].replace(/[ \t\n\u00a0]/g, '');
      if (valid(collapsed)) found.add(collapsed);
      if (m.index === re.lastIndex) re.lastIndex += 1;
    }
  };
  loose(TRON_LOOSE, isValidTron);
  loose(EVM_LOOSE, isValidEvm);
  return [...found];
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
  for (const rule of HARD_RULES) pushRule(text, rule, 'stop', codeReasons);
  for (const rule of SOFT_RULES) pushRule(text, rule, 'check_more', codeReasons);
  const addresses = findAddresses(text).map((a) => checkAddress(a, { ...opts, picked: a.startsWith('0x') || a.startsWith('0X') ? 'evm' : 'tron' }));
  for (const a of addresses) codeReasons.push(...a.reasons);
  return decide(codeReasons, tags, addresses);
}

function pushRule(text: string, rule: Rule, level: Level, out: Reason[]): void {
  const hit = rule.accept ? firstAccepted(text, rule.re, rule.accept) : firstMatch(text, rule.re);
  if (!hit) return;
  out.push({ kind: rule.kind, level, text: rule.text, span: hit.sentence, source: 'code' });
}

function firstMatch(text: string, re: RegExp): { index: number; sentence: string } | null {
  const m = new RegExp(re.source, re.flags).exec(text);
  if (!m) return null;
  return { index: m.index, sentence: sentenceAround(text, m.index) };
}

function firstAccepted(text: string, re: RegExp, accept: (sentence: string) => boolean): { index: number; sentence: string } | null {
  const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`;
  const global = new RegExp(re.source, flags);
  let m: RegExpExecArray | null;
  while ((m = global.exec(text))) {
    const sentence = sentenceAround(text, m.index);
    if (accept(sentence)) return { index: m.index, sentence };
    if (m[0].length === 0) global.lastIndex += 1;
  }
  return null;
}

function sentenceAround(text: string, idx: number): string {
  const start = Math.max(text.lastIndexOf('.', idx), text.lastIndexOf('\n', idx)) + 1;
  const ends = [text.indexOf('.', idx), text.indexOf('\n', idx)].filter((n) => n >= 0);
  const end = ends.length ? Math.min(...ends) + 1 : text.length;
  return text.slice(start, end).trim();
}
