import { ArrowLeft01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { detectNetwork, isValid } from '@kagua/core';
import { goBack, goHome } from '../ui/nav';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { frozen, frozenCount, provider } from '../state/engine';
import { resetState, setState, useStore } from '../state/store';
import { useTheme, type ThemePref } from '../theme/ThemeContext';
import { font } from '../theme/tokens';
import { Eyebrow, GhostButton, Glass, Icon, RoundButton, Screen, Txt } from '../ui/kit';

const PREFS: { id: ThemePref; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
];

function Row({ k, v }: { k: string; v: string }) {
  const { t } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Txt size={14} color={t.soft}>
        {k}
      </Txt>
      <Txt mono size={13} color={t.muted} style={{ flexShrink: 1, textAlign: 'right' }}>
        {v}
      </Txt>
    </View>
  );
}

export default function Settings() {
  const { t, pref, setPref } = useTheme();
  const contacts = useStore((s) => s.contacts);
  const [name, setName] = useState('');
  const [addr, setAddr] = useState('');
  const [err, setErr] = useState('');

  const add = () => {
    const a = addr.trim();
    const net = detectNetwork(a);
    if (!name.trim()) return setErr('Add a name.');
    if (!net || !isValid(a, net)) return setErr("That isn't a valid TRC-20 or EVM address.");
    setState({ contacts: [...contacts, { name: name.trim(), address: a }] });
    setName('');
    setAddr('');
    setErr('');
  };

  const input = { fontFamily: font[400], fontSize: 15, color: t.text, minHeight: 44, paddingHorizontal: 14, borderRadius: 14, backgroundColor: t.inner, borderWidth: 1, borderColor: t.hairline } as const;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 22, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <RoundButton icon={ArrowLeft01Icon} label="Back" onPress={goBack} />
          <Txt w={600} size={22} accessibilityRole="header" style={{ letterSpacing: -0.6 }}>
            Settings
          </Txt>
        </View>

        <View style={{ gap: 10 }}>
          <Eyebrow>THEME</Eyebrow>
          <View style={{ flexDirection: 'row', gap: 8 }} accessibilityRole="radiogroup">
            {PREFS.map((p) => (
              <Pressable
                key={p.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: pref === p.id }}
                onPress={() => setPref(p.id)}
                style={{ flex: 1, minHeight: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: pref === p.id ? t.glow : t.glass, borderWidth: 1, borderColor: t.hairline }}
              >
                <Txt w={500} size={14} color={pref === p.id ? t.accentInk : t.soft}>
                  {p.label}
                </Txt>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <Eyebrow>SAVED CONTACTS</Eyebrow>
          <Txt size={13} color={t.muted} style={{ lineHeight: 19 }}>
            Kagua compares new addresses with these to catch look-alikes. Kept only in this session for now.
          </Txt>
          {contacts.map((c, i) => (
            <Glass key={`${c.address}-${i}`} radius={16} style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1, gap: 3 }}>
                <Txt w={500} size={15}>
                  {c.name}
                </Txt>
                <Txt mono size={12} color={t.muted}>
                  {c.address}
                </Txt>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${c.name}`}
                hitSlop={8}
                onPress={() => setState({ contacts: contacts.filter((_, j) => j !== i) })}
                style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
              >
                <Icon icon={Delete02Icon} size={18} color={t.muted} />
              </Pressable>
            </Glass>
          ))}
          <TextInput accessibilityLabel="Contact name" placeholder="Name" placeholderTextColor={t.faint} value={name} onChangeText={setName} style={input} />
          <TextInput
            accessibilityLabel="Contact address"
            placeholder="Address"
            placeholderTextColor={t.faint}
            value={addr}
            onChangeText={setAddr}
            autoCapitalize="none"
            autoCorrect={false}
            style={[input, { fontFamily: font.mono400, fontSize: 13 }]}
          />
          {err ? (
            <Txt size={13} color={t.stopInk} accessibilityLiveRegion="polite">
              {err}
            </Txt>
          ) : null}
          <GhostButton label="Save contact" onPress={add} />
        </View>

        <View style={{ gap: 10 }}>
          <Eyebrow>ON THIS PHONE</Eyebrow>
          <Glass radius={18} style={{ padding: 16, gap: 10 }}>
            <Row k="Frozen addresses" v={frozenCount.toLocaleString('en-US')} />
            <Row k="List date" v={frozen.date ?? 'none'} />
            <Row k="Chat tagger" v={provider.id === 'mock' ? 'Mock (no phone model yet)' : provider.id} />
          </Glass>
          <Txt size={12} color={t.muted} style={{ lineHeight: 18 }}>
            Frozen list from the USDT Blacklist Archive (KYT Group / cryptoalert.report, CC-BY-4.0) and Tron USDT contract events. Being absent from it proves nothing.
          </Txt>
        </View>

        <GhostButton
          label="Wipe data on this phone"
          onPress={() => {
            resetState();
            goHome();
          }}
        />
      </ScrollView>
    </Screen>
  );
}
