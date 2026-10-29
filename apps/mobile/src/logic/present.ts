import type { AddressResult, Level, Reason, Verdict } from '@kagua/core';

export type Screen = 'stop' | 'check_more' | 'no_flags' | 'cant_tell';

export interface Segment {
  text: string;
  differs: boolean;
}

export interface Compare {
  name: string;
  saved: Segment[];
  pasted: Segment[];
  savedAddress: string;
}

export interface Evidence {
  label: string;
  text: string;
  span?: string;
  source: Reason['source'];
}

export interface ResultView {
  screen: Screen;
  headline: string;
  sub: string;
  evidence: Evidence[];
  compare?: Compare;
  listDate: string | null;
}

const LABEL: Record<string, string> = {
  pressure: 'PRESSURE',
  off_platform: 'OFF-APP',
  impersonation: 'IMPERSONATION',
  fake_support: 'FAKE SUPPORT',
  asks_seed_phrase: 'SEED PHRASE',
  asks_pin: 'PIN',
  asks_otp: 'ONE-TIME CODE',
  on_frozen_list: 'FROZEN',
  look_alike: 'LOOK-ALIKE',
  invalid: 'INVALID',
  wrong_network: 'WRONG NETWORK',
};

export const labelFor = (kind: string): string => LABEL[kind] ?? kind.toUpperCase().replace(/_/g, ' ');

const LEVEL_SCREEN: Record<Level, Screen> = { stop: 'stop', check_more: 'check_more', none: 'no_flags' };

/** Split two same-length addresses into shared ends and a differing middle. */
export function diffMiddle(a: string, b: string): { a: Segment[]; b: Segment[] } {
  let start = 0;
  while (start < a.length && start < b.length && a[start].toLowerCase() === b[start].toLowerCase()) start++;
  let end = 0;
  while (end < a.length - start && end < b.length - start && a[a.length - 1 - end].toLowerCase() === b[b.length - 1 - end].toLowerCase()) end++;
  const split = (s: string): Segment[] =>
    [
      { text: s.slice(0, start), differs: false },
      { text: s.slice(start, s.length - end), differs: true },
      { text: s.slice(s.length - end), differs: false },
    ].filter((x) => x.text.length > 0);
  return { a: split(a), b: split(b) };
}

const toEvidence = (r: Reason): Evidence => ({ label: labelFor(r.kind), text: r.text, span: r.span, source: r.source });

function stopSub(reasons: Reason[], lookAlike?: AddressResult): string {
  if (lookAlike?.lookAlikeOf) return `This copies ${lookAlike.lookAlikeOf.name}'s address. It isn't the same one.`;
  return reasons.find((r) => r.level === 'stop')?.text ?? '';
}

export function presentAddress(r: AddressResult): ResultView {
  const screen = LEVEL_SCREEN[r.level];
  const view: ResultView = { screen, headline: '', sub: '', evidence: r.reasons.map(toEvidence), listDate: r.listDate };
  if (screen === 'stop') {
    view.headline = "Don't send.";
    view.sub = stopSub(r.reasons, r);
    if (r.lookAlikeOf) {
      const d = diffMiddle(r.lookAlikeOf.address, r.address);
      view.compare = { name: r.lookAlikeOf.name, saved: d.a, pasted: d.b, savedAddress: r.lookAlikeOf.address };
    }
  } else {
    view.headline = 'No flags found.';
    view.sub =
      r.outcome === 'saved_contact'
        ? `Matches your saved contact ${r.contact}. Kagua found nothing else, which proves nothing about the trade.`
        : `Not on the frozen list${r.listDate ? ` as of ${r.listDate}` : ''}. This proves nothing about the address.`;
  }
  return view;
}

export function presentChat(v: Verdict): ResultView {
  const screen = LEVEL_SCREEN[v.level];
  const lookAlike = v.addresses.find((a) => a.outcome === 'look_alike');
  const view: ResultView = {
    screen,
    headline: '',
    sub: '',
    evidence: v.reasons.map(toEvidence),
    listDate: v.addresses[0]?.listDate ?? null,
  };
  if (screen === 'stop') {
    view.headline = "Don't send.";
    view.sub = stopSub(v.reasons, lookAlike);
    if (lookAlike?.lookAlikeOf) {
      const d = diffMiddle(lookAlike.lookAlikeOf.address, lookAlike.address);
      view.compare = { name: lookAlike.lookAlikeOf.name, saved: d.a, pasted: d.b, savedAddress: lookAlike.lookAlikeOf.address };
    }
  } else if (screen === 'check_more') {
    view.headline = 'Confirm 3 things before you release.';
    view.sub = 'No PIN, seed phrase or frozen address found.';
  } else {
    view.headline = 'No flags found.';
    view.sub = 'Kagua found no PIN, seed phrase, frozen address or pressure in this chat. This proves nothing about the trade.';
  }
  return view;
}

export function presentCantTell(why: string): ResultView {
  return { screen: 'cant_tell', headline: "Can't tell.", sub: why, evidence: [], listDate: null };
}

/** Screen-reader text: addresses read in groups of four. */
export function spokenAddress(addr: string): string {
  return (addr.match(/.{1,4}/g) ?? []).join(' ');
}
