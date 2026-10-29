import { Clipboard as ClipboardIcon, Image01Icon, Moon02Icon, QrCodeIcon, Settings02Icon, Sun03Icon } from '@hugeicons/core-free-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import type { Network } from '@kagua/core';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { frozen, frozenCount } from '../state/engine';
import { setState, useStore } from '../state/store';
import { useTheme } from '../theme/ThemeContext';
import { font, LIME } from '../theme/tokens';
import { Glass, Icon, OfflinePill, PrimaryButton, RoundButton, Screen, Txt } from '../ui/kit';

const NETS: { id: Network; label: string }[] = [
  { id: 'tron', label: 'TRC-20' },
  { id: 'evm', label: 'EVM' },
];

function Logo() {
  const { t } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }} accessibilityRole="header" accessibilityLabel="Kagua">
      <View style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 5, borderColor: LIME, borderRightColor: t.track }} />
      <Txt w={600} size={20} style={{ letterSpacing: -0.6 }}>
        kagua
      </Txt>
    </View>
  );
}

function Tile({ label, icon, onPress, note }: { label: string; icon: Parameters<typeof Icon>[0]['icon']; onPress?: () => void; note?: string }) {
  const { t } = useTheme();
  const disabled = !onPress;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={note ? `${label}, ${note}` : label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, { backgroundColor: t.glass, borderColor: t.hairline, opacity: disabled ? 0.45 : pressed ? 0.7 : 1 }]}
    >
      <Icon icon={icon} size={22} strokeWidth={1.6} />
      <View>
        <Txt w={500} size={14}>
          {label}
        </Txt>
        {note ? (
          <Txt size={11} color={t.muted}>
            {note}
          </Txt>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function Check() {
  const { t, toggle } = useTheme();
  const address = useStore((s) => s.draftAddress);
  const picked = useStore((s) => s.picked);

  const run = () => {
    setState({ job: { kind: 'address', address, picked }, view: null });
    router.push('/checking');
  };

  const paste = async () => {
    const text = (await Clipboard.getStringAsync()).trim();
    if (text) setState({ draftAddress: text });
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ flexGrow: 1, gap: 28 }} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Logo />
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <OfflinePill />
            <RoundButton icon={t.mode === 'light' ? Moon02Icon : Sun03Icon} label={t.mode === 'light' ? 'Switch to dark theme' : 'Switch to light theme'} onPress={toggle} />
            <RoundButton icon={Settings02Icon} label="Settings" onPress={() => router.push('/settings')} />
          </View>
        </View>

        <Txt w={600} size={44} accessibilityRole="header" style={{ lineHeight: 45, letterSpacing: -2, marginTop: 8 }}>
          Check it{'\n'}before you{'\n'}
          <Txt w={600} size={44} color={t.accentInk}>
            release it.
          </Txt>
        </Txt>

        <Glass radius={28} style={{ padding: 6 }}>
          <View style={{ borderRadius: 23, padding: 18, paddingBottom: 14, backgroundColor: t.inner, gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Txt size={12} color={t.muted} style={{ letterSpacing: 1, textTransform: 'uppercase' }} nativeID="addr-label">
                Send to
              </Txt>
              <View style={{ flexDirection: 'row', gap: 6 }} accessibilityRole="radiogroup" accessibilityLabel="Network">
                {NETS.map((n) => {
                  const on = n.id === picked;
                  return (
                    <Pressable
                      key={n.id}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: on }}
                      accessibilityLabel={n.label}
                      onPress={() => setState({ picked: n.id })}
                      hitSlop={10}
                      style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: on ? t.glow : 'transparent' }}
                    >
                      <Txt mono w={500} size={12} color={on ? t.accentInk : t.muted}>
                        {n.label}
                      </Txt>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <TextInput
              accessibilityLabel="Address to send to"
              value={address}
              onChangeText={(v) => setState({ draftAddress: v })}
              placeholder={picked === 'tron' ? 'T… address' : '0x… address'}
              placeholderTextColor={t.faint}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              multiline
              style={{ fontFamily: font.mono500, fontSize: 19, lineHeight: 26, color: t.text, minHeight: 52, padding: 0, textAlignVertical: 'top' }}
            />
            {!address ? (
              <Pressable accessibilityRole="button" onPress={paste} hitSlop={8} style={{ alignSelf: 'flex-start', minHeight: 32, justifyContent: 'center' }}>
                <Txt w={500} size={13} color={t.accentInk}>
                  Paste address
                </Txt>
              </Pressable>
            ) : null}
          </View>
          <View style={{ marginTop: 6 }}>
            <PrimaryButton label="Kagua" accessibilityHint="Checks the address on this phone" onPress={run} disabled={!address.trim()} />
          </View>
        </Glass>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Tile label="Paste chat" icon={ClipboardIcon} onPress={() => router.push('/chat')} />
          <Tile label="Screenshot" icon={Image01Icon} note="Needs the phone model" />
          <Tile label="Scan QR" icon={QrCodeIcon} onPress={Platform.OS === 'web' ? undefined : () => router.push('/scan')} note={Platform.OS === 'web' ? 'On the phone' : undefined} />
        </View>

        <View style={[styles.footer, { borderTopColor: t.track }]}>
          <View style={{ gap: 3 }}>
            <Txt mono w={500} size={20} style={{ letterSpacing: -0.4 }}>
              {frozen.date ?? 'none'}
            </Txt>
            <Txt size={12} color={t.muted}>
              frozen-list date
            </Txt>
          </View>
          <View style={{ gap: 3, alignItems: 'flex-end' }}>
            <Txt mono w={500} size={20} style={{ letterSpacing: -0.4 }}>
              {frozenCount.toLocaleString('en-US')}
            </Txt>
            <Txt size={12} color={t.muted}>
              frozen addresses on device
            </Txt>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tile: { flex: 1, height: 92, borderRadius: 22, borderWidth: 1, padding: 14, justifyContent: 'space-between' },
  footer: { marginTop: 'auto', flexDirection: 'row', justifyContent: 'space-between', paddingTop: 16, paddingHorizontal: 4, borderTopWidth: 1 },
});
