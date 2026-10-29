import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { formatMs } from '../logic/steps';
import { runJob } from '../state/engine';
import { getState, useStore } from '../state/store';
import { useTheme } from '../theme/ThemeContext';
import { Lens } from '../ui/Lens';
import { OfflinePill, Screen, Txt } from '../ui/kit';

const ADDRESS_STEPS = ['Checksum', 'Network', 'Frozen list', 'Look-alike'];
const CHAT_STEPS = ['Rules', 'Addresses', 'Model tags', 'Decide'];
// The checks take milliseconds; each step stays on screen this long so it can be read.
const STEP_MS = 280;

const short = (a: string) => (a.length > 16 ? `${a.slice(0, 6)}…${a.slice(-8)}` : a);

export default function Checking() {
  const { t } = useTheme();
  const job = useStore((s) => s.job);
  const measured = useStore((s) => s.steps);
  const [shown, setShown] = useState(0);
  const [finished, setFinished] = useState(false);
  const names = job?.kind === 'chat' ? CHAT_STEPS : ADDRESS_STEPS;

  useEffect(() => {
    if (!job) {
      router.replace('/');
      return;
    }
    let alive = true;
    const work = runJob(job);
    let i = 0;
    const tick = setInterval(() => {
      i += 1;
      if (alive) setShown(Math.min(i, names.length));
      if (i >= names.length) {
        clearInterval(tick);
        work.then(() => alive && setFinished(true));
      }
    }, STEP_MS);
    return () => {
      alive = false;
      clearInterval(tick);
    };
  }, [job]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (finished && getState().view) {
      const id = setTimeout(() => router.replace('/result'), 200);
      return () => clearTimeout(id);
    }
  }, [finished]);

  const current = names[Math.min(shown, names.length - 1)];
  const timing = (name: string) => measured.find((m) => m.name === name);

  return (
    <Screen style={{ alignItems: 'center', paddingTop: 28 }}>
      <OfflinePill label="No internet used" />
      <View style={{ marginTop: 70 }}>
        <Lens done={shown} total={names.length} running={!finished} />
      </View>
      <Txt w={600} size={30} accessibilityLiveRegion="polite" style={{ marginTop: 56, letterSpacing: -1 }}>
        {finished ? 'Done' : `Checking ${current.toLowerCase()}`}
      </Txt>
      {job?.kind === 'address' ? (
        <Txt mono w={500} size={14} color={t.muted} style={{ marginTop: 10 }}>
          {short(job.address.trim())}
        </Txt>
      ) : null}
      <View style={{ marginTop: 'auto', width: '100%', flexDirection: 'row', gap: 6 }}>
        {names.map((n, i) => {
          const done = i < shown;
          const m = timing(n);
          return (
            <View key={n} style={{ flex: 1, gap: 8 }}>
              <View style={{ height: 3, borderRadius: 3, backgroundColor: done ? t.sweep : t.track }} />
              <Txt size={11} color={done ? t.soft : t.muted}>
                {n}
              </Txt>
              {done && m ? (
                <Txt mono size={10} color={t.faint}>
                  {formatMs(m.ms)}
                </Txt>
              ) : null}
            </View>
          );
        })}
      </View>
    </Screen>
  );
}
