import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { goBack } from '../ui/nav';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';
import { setState } from '../state/store';
import { useTheme } from '../theme/ThemeContext';
import { font } from '../theme/tokens';
import { Glass, PrimaryButton, RoundButton, Screen, Txt } from '../ui/kit';

export default function Chat() {
  const { t } = useTheme();
  const [text, setText] = useState('');

  const run = () => {
    setState({ job: { kind: 'chat', text }, view: null });
    router.push('/checking');
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, gap: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <RoundButton icon={ArrowLeft01Icon} label="Back" onPress={goBack} />
          <Txt w={600} size={22} accessibilityRole="header" style={{ letterSpacing: -0.6 }}>
            Paste the chat
          </Txt>
        </View>
        <Txt size={15} color={t.soft} style={{ lineHeight: 22 }}>
          Kagua reads it on this phone for PIN, seed phrase and code requests, frozen or look-alike addresses, and pressure. English and Swahili.
        </Txt>
        <Glass radius={24} style={{ flex: 1, padding: 16 }}>
          <TextInput
            accessibilityLabel="Chat text"
            value={text}
            onChangeText={setText}
            placeholder="Paste the buyer's messages here"
            placeholderTextColor={t.faint}
            multiline
            autoCorrect={false}
            style={{ flex: 1, fontFamily: font[400], fontSize: 16, lineHeight: 23, color: t.text, textAlignVertical: 'top', padding: 0 }}
          />
        </Glass>
        {!text ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            style={{ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' }}
            onPress={async () => setText(await Clipboard.getStringAsync())}
          >
            <Txt w={500} size={14} color={t.accentInk}>
              Paste from clipboard
            </Txt>
          </Pressable>
        ) : null}
        <PrimaryButton label="Check chat" onPress={run} disabled={!text.trim()} />
      </KeyboardAvoidingView>
    </Screen>
  );
}
