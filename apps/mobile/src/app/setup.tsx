import { ArrowLeft01Icon, Download04Icon } from '@hugeicons/core-free-icons';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { modelProvider, MODEL_SIZES } from '../model/provider';
import { markModelsReady } from '../state/actions';
import { useStore } from '../state/store';
import { useTheme } from '../theme/ThemeContext';
import { Eyebrow, GhostButton, Glass, Icon, PrimaryButton, RoundButton, Screen, Txt } from '../ui/kit';
import { goBack } from '../ui/nav';

const mb = (bytes: number) => `${(bytes / 1e6).toFixed(1)} MB`;

type Phase = 'idle' | 'loading' | 'done' | 'failed';

export default function Setup() {
  const { t } = useTheme();
  const ready = useStore((s) => s.modelsReady);
  const [phase, setPhase] = useState<Phase>(ready ? 'done' : 'idle');
  const [progress, setProgress] = useState({ downloaded: 0, total: MODEL_SIZES.ocr + MODEL_SIZES.tagger });
  const [error, setError] = useState('');

  const start = async () => {
    if (!modelProvider) return;
    setPhase('loading');
    setError('');
    try {
      await modelProvider.prepare((p) => setProgress({ downloaded: p.downloaded, total: p.total }));
      markModelsReady(true);
      setPhase('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase('failed');
    }
  };

  const pct = progress.total > 0 ? Math.min(1, progress.downloaded / progress.total) : 0;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ flexGrow: 1, gap: 22 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <RoundButton icon={ArrowLeft01Icon} label="Back" onPress={goBack} />
          <Txt w={600} size={22} accessibilityRole="header" style={{ letterSpacing: -0.6 }}>
            On-phone models
          </Txt>
        </View>

        <Txt w={600} size={34} style={{ lineHeight: 36, letterSpacing: -1.4 }}>
          One download.{'\n'}Then no internet.
        </Txt>
        <Txt size={16} color={t.soft} style={{ lineHeight: 23 }}>
          This is the only time Kagua uses the internet: it downloads two models from the QVAC model registry. After that, every check runs on this phone. Address checks and chat rules already work without them.
        </Txt>

        <Glass radius={22} style={{ padding: 18, gap: 12 }}>
          <Eyebrow>WHAT DOWNLOADS</Eyebrow>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt size={14} color={t.soft}>
              Screenshot reader (QVAC OCR, Latin)
            </Txt>
            <Txt mono size={13} color={t.muted}>
              {mb(MODEL_SIZES.ocr)}
            </Txt>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt size={14} color={t.soft}>
              Chat tagger (Qwen3 0.6B, Q4)
            </Txt>
            <Txt mono size={13} color={t.muted}>
              {mb(MODEL_SIZES.tagger)}
            </Txt>
          </View>
          <Txt size={12} color={t.muted} style={{ lineHeight: 18 }}>
            Sizes are the registry's file sizes; the OCR text detector adds a small extra file. Use Wi-Fi if you can.
          </Txt>
        </Glass>

        {phase === 'loading' || phase === 'done' ? (
          <View style={{ gap: 8 }} accessible accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: t.track, overflow: 'hidden' }}>
              <View style={{ height: 6, width: `${phase === 'done' ? 100 : pct * 100}%`, backgroundColor: t.sweep }} />
            </View>
            <Txt mono size={12} color={t.muted} accessibilityLiveRegion="polite">
              {phase === 'done' ? 'Models are on this phone. You can turn on airplane mode.' : `${mb(progress.downloaded)} of ${mb(progress.total)}`}
            </Txt>
          </View>
        ) : null}
        {phase === 'failed' ? (
          <Txt size={14} color={t.stopInk} accessibilityLiveRegion="polite">
            The download stopped: {error}. Checks still work without the models.
          </Txt>
        ) : null}

        <View style={{ marginTop: 'auto', gap: 10 }}>
          {!modelProvider ? (
            <Txt size={14} color={t.muted}>
              Models run in the phone app only. This web build uses a demo tagger.
            </Txt>
          ) : phase === 'done' ? (
            <PrimaryButton label="Done" onPress={goBack} />
          ) : (
            <>
              <PrimaryButton label={phase === 'failed' ? 'Try again' : 'Download models'} onPress={start} disabled={phase === 'loading'} />
              <GhostButton label="Not now" onPress={goBack} />
            </>
          )}
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
            <Icon icon={Download04Icon} size={14} color={t.muted} />
            <Txt size={12} color={t.muted}>
              No account. No analytics. Nothing about your trades is sent.
            </Txt>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
