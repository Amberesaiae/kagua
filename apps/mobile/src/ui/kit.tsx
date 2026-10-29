import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { font, LIME } from '../theme/tokens';

type Weight = 400 | 500 | 600 | 700 | 800;

export function Txt({ w = 400, mono = false, color, size, style, ...rest }: TextProps & { w?: Weight; mono?: boolean; color?: string; size?: number }) {
  const { t } = useTheme();
  const family = mono ? (w >= 600 ? font.mono600 : w >= 500 ? font.mono500 : font.mono400) : font[w];
  return <Text {...rest} style={[{ fontFamily: family, color: color ?? t.text, fontSize: size ?? 15 }, style]} />;
}

export function Screen({ children, style, edges }: { children: ReactNode; style?: StyleProp<ViewStyle>; edges?: ('top' | 'bottom')[] }) {
  const { t } = useTheme();
  return (
    <SafeAreaView edges={edges ?? ['top', 'bottom']} style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={[{ flex: 1, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 18 }, style]}>{children}</View>
    </SafeAreaView>
  );
}

export function Icon({ icon, size = 20, color, strokeWidth = 1.7 }: { icon: IconSvgElement; size?: number; color?: string; strokeWidth?: number }) {
  const { t } = useTheme();
  return <HugeiconsIcon icon={icon} size={size} color={color ?? t.text} strokeWidth={strokeWidth} />;
}

export function Glass({ children, style, radius = 22 }: { children: ReactNode; style?: StyleProp<ViewStyle>; radius?: number }) {
  const { t } = useTheme();
  return <View style={[{ borderRadius: radius, backgroundColor: t.glass, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: t.hairline }, style]}>{children}</View>;
}

export function PrimaryButton({ label, onPress, disabled, accessibilityHint }: { label: string; onPress: () => void; disabled?: boolean; accessibilityHint?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.primary, { opacity: disabled ? 0.4 : pressed ? 0.85 : 1 }]}
    >
      <Text style={{ fontFamily: font[600], fontSize: 17, color: '#050605' }}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({ label, onPress, disabled, icon, dashed }: { label: string; onPress: () => void; disabled?: boolean; icon?: IconSvgElement; dashed?: boolean }) {
  const { t } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.ghost,
        { borderColor: dashed ? t.faint : t.hairline, borderStyle: dashed ? 'dashed' : 'solid', opacity: pressed ? 0.7 : 1 },
      ]}
    >
      {icon ? <Icon icon={icon} size={16} color={t.muted} /> : null}
      <Txt w={500} size={14} color={disabled ? t.muted : t.text}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function RoundButton({ icon, label, onPress, tint }: { icon: IconSvgElement; label: string; onPress: () => void; tint?: string }) {
  const { t } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.round, { backgroundColor: tint ?? t.glass, borderColor: t.hairline, opacity: pressed ? 0.7 : 1 }]}
    >
      <Icon icon={icon} size={18} />
    </Pressable>
  );
}

export function OfflinePill({ label = 'Offline' }: { label?: string }) {
  const { t } = useTheme();
  return (
    <View accessible accessibilityLabel={label} style={[styles.pill, { backgroundColor: t.glass, borderColor: t.hairline }]}>
      <View style={styles.dot} />
      <Txt size={12} color={t.soft}>
        {label}
      </Txt>
    </View>
  );
}

export function Eyebrow({ children, color, style }: { children: ReactNode; color?: string; style?: StyleProp<TextStyle> }) {
  const { t } = useTheme();
  return (
    <Txt mono w={600} size={11} color={color ?? t.muted} style={[{ letterSpacing: 1.1 }, style]}>
      {children}
    </Txt>
  );
}

const styles = StyleSheet.create({
  primary: {
    height: 58,
    borderRadius: 22,
    backgroundColor: LIME,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8CBE00',
    shadowOpacity: 0.28,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  ghost: { minHeight: 52, borderRadius: 22, borderWidth: 1, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  round: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 8, paddingHorizontal: 13, borderRadius: 999, borderWidth: 1 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#8BC000', shadowColor: LIME, shadowOpacity: 1, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
});
