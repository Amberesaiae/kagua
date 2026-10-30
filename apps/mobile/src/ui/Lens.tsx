import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';
import { Txt } from './kit';

const SIZE = 260;
const R = SIZE / 2 - 2;
const ARCS = 28;
const C = 2 * Math.PI * R;

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => sub.remove();
  }, []);
  return reduced;
}

/** The Kagua lens: a ring with a lime sweep. Spins only while checking runs. */
export function Lens({ done, total, running }: { done: number; total: number; running: boolean }) {
  const { t } = useTheme();
  const reduced = useReducedMotion();
  const spin = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!running || reduced) return;
    const a = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1800, easing: Easing.linear, useNativeDriver: true }));
    const b = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]),
    );
    a.start();
    b.start();
    return () => {
      a.stop();
      b.stop();
    };
  }, [running, reduced, spin, breathe]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const glowOpacity = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const glowScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] });
  // The sweep: the last 140 degrees of the ring fade in to full lime.
  const seg = (C * (140 / 360)) / ARCS;

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${done} of ${total} checks done`}
      accessibilityValue={{ min: 0, max: total, now: done }}
      style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View style={{ position: 'absolute', width: SIZE + 80, height: SIZE + 80, opacity: running ? glowOpacity : 0.35, transform: [{ scale: glowScale }] }}>
        <Svg width={SIZE + 80} height={SIZE + 80}>
          <Defs>
            <RadialGradient id="halo" cx="50%" cy="50%" r="50%">
              <Stop offset="0.7" stopColor={t.halo} stopOpacity={1} />
              <Stop offset="1" stopColor={t.halo} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={(SIZE + 80) / 2} cy={(SIZE + 80) / 2} r={(SIZE + 80) / 2} fill="url(#halo)" />
        </Svg>
      </Animated.View>
      <View style={{ position: 'absolute', top: 3, left: 3, right: 3, bottom: 3, borderRadius: 999, backgroundColor: t.bg }} />
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
        <Svg width={SIZE} height={SIZE}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={t.hairline} strokeWidth={2} fill="none" />
          {Array.from({ length: ARCS }, (_, i) => (
            <Circle
              key={i}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              stroke={t.sweep}
              strokeOpacity={(i + 1) / ARCS}
              strokeWidth={3}
              fill="none"
              strokeDasharray={`${seg + 0.5} ${C}`}
              strokeDashoffset={-(C * (220 / 360) + i * seg)}
            />
          ))}
        </Svg>
      </Animated.View>
      <View style={{ position: 'absolute', top: 34, left: 34, right: 34, bottom: 34, borderRadius: 999, backgroundColor: t.glass, borderWidth: 1, borderColor: t.hairline }} />
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Txt mono w={500} size={44} style={{ letterSpacing: -1.7 }}>
          {done}
          <Txt mono w={500} size={44} color={t.faint}>
            /{total}
          </Txt>
        </Txt>
        <Txt size={12} color={t.muted} style={{ letterSpacing: 1, textTransform: 'uppercase' }}>
          checks
        </Txt>
      </View>
    </View>
  );
}
