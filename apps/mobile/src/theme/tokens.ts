// Values from docs/cloud-run/DESIGN-SYSTEM.md and docs/design/canvases.
export const LIME = '#C6F432';
export const STOP_RED = '#C42F1F';

export interface Tokens {
  mode: 'dark' | 'light';
  bg: string;
  text: string;
  soft: string;
  muted: string;
  faint: string;
  track: string;
  glass: string;
  inner: string;
  hairline: string;
  accentInk: string;
  sweep: string;
  halo: string;
  stopInk: string;
  stopBg: string;
  warn: string;
  warnInk: string;
  warnBg: string;
  markBg: string;
  card: string;
  glow: string;
}

export const dark: Tokens = {
  mode: 'dark',
  bg: '#050605',
  text: '#F4F7F1',
  soft: '#C9D0C6',
  muted: '#8F988C',
  faint: '#6F786C',
  track: 'rgba(255,255,255,0.1)',
  glass: 'rgba(255,255,255,0.04)',
  inner: 'rgba(5,6,5,0.6)',
  hairline: 'rgba(255,255,255,0.08)',
  accentInk: LIME,
  sweep: LIME,
  halo: 'rgba(198,244,50,0.22)',
  stopInk: '#FF8A78',
  stopBg: 'rgba(255,94,72,0.18)',
  warn: '#FFB020',
  warnInk: '#FFC251',
  warnBg: 'rgba(255,176,32,0.14)',
  markBg: 'rgba(255,176,32,0.24)',
  card: 'rgba(255,255,255,0.04)',
  glow: 'rgba(198,244,50,0.16)',
};

export const light: Tokens = {
  mode: 'light',
  bg: '#F3F4EE',
  text: '#0B0D0C',
  soft: '#3A4137',
  muted: '#5B6358',
  faint: '#9AA196',
  track: 'rgba(11,13,12,0.1)',
  glass: 'rgba(255,255,255,0.8)',
  inner: '#FFFFFF',
  hairline: 'rgba(11,13,12,0.08)',
  accentInk: '#4A6A00',
  sweep: '#8BC000',
  halo: 'rgba(170,220,10,0.35)',
  stopInk: '#B42A1B',
  stopBg: 'rgba(196,47,31,0.12)',
  warn: '#E0960A',
  warnInk: '#8A5700',
  warnBg: 'rgba(224,150,10,0.16)',
  markBg: 'rgba(255,190,60,0.38)',
  card: '#FFFFFF',
  glow: 'rgba(176,224,20,0.30)',
};

export const font = {
  400: 'Geist_400Regular',
  500: 'Geist_500Medium',
  600: 'Geist_600SemiBold',
  700: 'Geist_700Bold',
  800: 'Geist_800ExtraBold',
  mono400: 'GeistMono_400Regular',
  mono500: 'GeistMono_500Medium',
  mono600: 'GeistMono_600SemiBold',
} as const;
