import { Alert02Icon, Cancel01Icon, HelpCircleIcon, InformationCircleIcon, SquareLock02Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import * as Haptics from 'expo-haptics';
import { goHome } from '../ui/nav';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { spokenAddress, type Evidence, type ResultView, type Segment } from '../logic/present';
import { formatMs } from '../logic/steps';
import { setState, useStore } from '../state/store';
import { useTheme } from '../theme/ThemeContext';
import { STOP_RED } from '../theme/tokens';
import { Eyebrow, GhostButton, Glass, Icon, PrimaryButton, RoundButton, Screen, Txt } from '../ui/kit';

const home = goHome;
// Long addresses have no spaces; on web they must break anywhere.
const BREAK_ALL = Platform.OS === 'web' ? ({ wordBreak: 'break-all' } as object) : null;

function Quote({ e }: { e: Evidence }) {
  const { t } = useTheme();
  const tagger = useStore((s) => s.tagger);
  const modelNote = tagger === 'mock' ? ' (demo tag, web build)' : ' (model tag)';
  const ink = t.warnInk;
  return (
    <View style={{ gap: 4 }}>
      {e.span ? (
        <Txt size={15} color={t.soft} style={{ lineHeight: 22 }}>
          “
          <Txt size={15} style={{ backgroundColor: t.markBg }}>
            {e.span}
          </Txt>
          ”{' '}
          <Txt mono w={600} size={11} color={ink}>
            {e.label}
          </Txt>
        </Txt>
      ) : (
        <Txt mono w={600} size={11} color={ink}>
          {e.label}
        </Txt>
      )}
      <Txt size={13} color={t.muted}>
        {e.text}
        {e.source === 'model' ? modelNote : ''}
      </Txt>
    </View>
  );
}

function Addr({ segs, hi, hiBg, base, full }: { segs: Segment[]; hi: string; hiBg?: string; base: string; full: string }) {
  return (
    <Txt mono w={500} size={14} color={base} style={[{ lineHeight: 20, flex: 1 }, BREAK_ALL]} accessibilityLabel={spokenAddress(full)}>
      {segs.map((s, i) => (
        <Txt key={i} mono w={500} size={14} color={s.differs ? hi : base} style={s.differs && hiBg ? { backgroundColor: hiBg } : undefined}>
          {s.text}
        </Txt>
      ))}
    </Txt>
  );
}

function StopOctagon() {
  const pts = '44,0 106,0 150,44 150,106 106,150 44,150 0,106 0,44';
  return (
    <View style={{ width: 150, height: 150, alignItems: 'center', justifyContent: 'center' }} accessible accessibilityLabel="Stop">
      <Svg width={150} height={150} style={{ position: 'absolute' }}>
        <Polygon points={pts} fill="#FFFFFF" />
        <Polygon points="47,7 103,7 143,47 143,103 103,143 47,143 7,103 7,47" fill={STOP_RED} />
      </Svg>
      <Txt w={800} size={38} color="#FFFFFF" style={{ letterSpacing: -0.8 }}>
        STOP
      </Txt>
    </View>
  );
}

function StopView({ v }: { v: ResultView }) {
  const { t } = useTheme();
  const [left, setLeft] = useState(30);
  useEffect(() => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    const id = setInterval(() => setLeft((n) => (n > 0 ? n - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const c = v.compare;
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ backgroundColor: STOP_RED, paddingTop: 56, paddingHorizontal: 22, paddingBottom: 40, alignItems: 'center' }}>
          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Eyebrow color="rgba(255,255,255,0.88)" style={{ letterSpacing: 1.4, fontSize: 12 }}>
              KAGUA · HARD SIGNAL
            </Eyebrow>
            <RoundButton icon={Cancel01Icon} label="Close" onPress={home} tint="rgba(0,0,0,0.18)" />
          </View>
          <View style={{ marginTop: 22 }}>
            <StopOctagon />
          </View>
          <Txt w={700} size={40} color="#FFFFFF" accessibilityRole="header" style={{ marginTop: 24, letterSpacing: -1.8, textAlign: 'center' }}>
            {v.headline}
          </Txt>
          <Txt w={500} size={17} color="#FFFFFF" style={{ marginTop: 12, textAlign: 'center', lineHeight: 23, maxWidth: 320 }}>
            {v.sub}
          </Txt>
        </View>
        <View style={{ height: 14, flexDirection: 'row', overflow: 'hidden' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {Array.from({ length: 40 }, (_, i) => (
            <View key={i} style={{ width: 12, height: 14, backgroundColor: i % 2 ? STOP_RED : '#1A0705' }} />
          ))}
        </View>
        <View style={{ flex: 1, padding: 22, gap: 16 }}>
          {c ? (
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Txt size={12} color={t.muted} style={{ width: 56 }}>
                  Saved
                </Txt>
                <Addr segs={c.saved} hi={t.faint} base={t.soft} full={c.savedAddress} />
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Txt w={600} size={12} color={t.stopInk} style={{ width: 56 }}>
                  Pasted
                </Txt>
                <Addr segs={c.pasted} hi={t.stopInk} hiBg={t.stopBg} base={t.text} full={c.pasted.map((s) => s.text).join('')} />
              </View>
            </View>
          ) : (
            <View style={{ gap: 14 }}>
              {v.evidence.map((e, i) => (
                <View key={i} style={{ gap: 4 }}>
                  <Txt mono w={600} size={11} color={t.stopInk}>
                    {e.label}
                  </Txt>
                  {e.span ? (
                    <Txt mono={e.label === 'FROZEN' || e.label === 'INVALID' || e.label === 'WRONG NETWORK'} size={14} color={t.soft} style={[{ lineHeight: 20 }, BREAK_ALL]}>
                      “{e.span}”
                    </Txt>
                  ) : null}
                  {e.text !== v.sub ? (
                    <Txt size={13} color={t.muted}>
                      {e.text}
                    </Txt>
                  ) : null}
                </View>
              ))}
            </View>
          )}
          {v.listDate && v.evidence.some((e) => e.label === 'FROZEN') ? (
            <Txt size={12} color={t.muted}>
              Frozen list date {v.listDate}
            </Txt>
          ) : null}
          <View style={{ marginTop: 'auto', gap: 10 }}>
            {c ? (
              <PrimaryButton
                label={`Use ${c.name}'s real address`}
                onPress={() => {
                  setState({ draftAddress: c.savedAddress });
                  home();
                }}
              />
            ) : (
              <PrimaryButton label="Back to check" onPress={home} />
            )}
            <GhostButton
              dashed
              icon={left > 0 ? SquareLock02Icon : undefined}
              disabled={left > 0}
              label={left > 0 ? `Send anyway unlocks in 0:${String(left).padStart(2, '0')}` : 'Send anyway. Kagua sends nothing.'}
              onPress={home}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const CONFIRM = [
  { title: 'Open M-Pesa in your own SMS', sub: "Not the buyer's screenshot." },
  { title: 'Amount is exactly what the trade says', sub: 'Received, not “pending”.' },
  { title: 'Sender name matches the buyer', sub: 'Same name as on the trade.' },
];

function CheckMoreView({ v }: { v: ResultView }) {
  const { t } = useTheme();
  const [ticks, setTicks] = useState([false, false, false]);
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ flexGrow: 1, gap: 22 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingLeft: 10, paddingRight: 13, borderRadius: 999, backgroundColor: t.warnBg }}>
            <Icon icon={Alert02Icon} size={16} color={t.warnInk} />
            <Txt w={600} size={13} color={t.warnInk}>
              Check more
            </Txt>
          </View>
          <RoundButton icon={Cancel01Icon} label="Close" onPress={home} />
        </View>
        <Txt w={600} size={34} accessibilityRole="header" style={{ lineHeight: 36, letterSpacing: -1.4 }}>
          {v.headline}
        </Txt>
        <View style={{ borderLeftWidth: 2, borderLeftColor: t.warn, paddingLeft: 14, gap: 12 }}>
          <Eyebrow>WHY · FROM THE CHAT</Eyebrow>
          {v.evidence.map((e, i) => (
            <Quote key={i} e={e} />
          ))}
        </View>
        <View style={{ borderRadius: 24, backgroundColor: t.card, borderWidth: 1, borderColor: t.hairline }}>
          {CONFIRM.map((c, i) => (
            <View key={c.title}>
              {i > 0 ? <View style={{ height: 1, backgroundColor: t.track, marginHorizontal: 18 }} /> : null}
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: ticks[i] }}
                accessibilityLabel={`${c.title}. ${c.sub}`}
                onPress={() => setTicks((x) => x.map((v2, j) => (j === i ? !v2 : v2)))}
                style={{ flexDirection: 'row', gap: 14, padding: 18, minHeight: 44 }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    borderWidth: 1.5,
                    borderColor: ticks[i] ? t.text : t.faint,
                    backgroundColor: ticks[i] ? t.text : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 1,
                  }}
                >
                  {ticks[i] ? <Icon icon={Tick02Icon} size={14} color={t.bg} strokeWidth={2.4} /> : null}
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Txt w={500} size={16}>
                    {c.title}
                  </Txt>
                  <Txt size={13} color={t.muted}>
                    {c.sub}
                  </Txt>
                </View>
              </Pressable>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 'auto', gap: 10 }}>
          <PrimaryButton label="I've checked all three" disabled={!ticks.every(Boolean)} onPress={home} />
          <Txt size={12} color={t.muted} style={{ textAlign: 'center' }}>
            {v.sub}
          </Txt>
        </View>
      </ScrollView>
    </Screen>
  );
}

/** Neutral on purpose: no green, no tick. Finding nothing is not a verdict. */
function QuietView({ v }: { v: ResultView }) {
  const { t } = useTheme();
  const steps = useStore((s) => s.steps);
  const cant = v.screen === 'cant_tell';
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ flexGrow: 1, gap: 22 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingLeft: 10, paddingRight: 13, borderRadius: 999, backgroundColor: t.glass, borderWidth: 1, borderColor: t.hairline }}>
            <Icon icon={cant ? HelpCircleIcon : InformationCircleIcon} size={16} color={t.soft} />
            <Txt w={600} size={13} color={t.soft}>
              {cant ? "Can't tell" : 'No flags found'}
            </Txt>
          </View>
          <RoundButton icon={Cancel01Icon} label="Close" onPress={home} />
        </View>
        <Txt w={600} size={34} accessibilityRole="header" style={{ lineHeight: 36, letterSpacing: -1.4 }}>
          {v.headline}
        </Txt>
        <Txt size={17} color={t.soft} style={{ lineHeight: 24 }}>
          {v.sub}
        </Txt>
        {!cant && steps.length ? (
          <Glass radius={22} style={{ padding: 18, gap: 12 }}>
            <Eyebrow>WHAT KAGUA CHECKED ON THIS PHONE</Eyebrow>
            {steps.map((s) => (
              <View key={s.name} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Txt size={14} color={t.soft}>
                  {s.name}
                </Txt>
                <Txt mono size={13} color={t.muted}>
                  {formatMs(s.ms)}
                </Txt>
              </View>
            ))}
          </Glass>
        ) : null}
        {!cant ? (
          <Txt size={13} color={t.muted} style={{ lineHeight: 19 }}>
            Still confirm the payment in your own M-Pesa or bank app before you release.
          </Txt>
        ) : null}
        <View style={{ marginTop: 'auto' }}>
          <PrimaryButton label={cant ? 'Try again' : 'Check another'} onPress={home} />
        </View>
      </ScrollView>
    </Screen>
  );
}

export default function Result() {
  const v = useStore((s) => s.view);
  if (!v) return null;
  if (v.screen === 'stop') return <StopView v={v} />;
  if (v.screen === 'check_more') return <CheckMoreView v={v} />;
  return <QuietView v={v} />;
}
