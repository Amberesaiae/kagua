import { Geist_400Regular, Geist_500Medium, Geist_600SemiBold, Geist_700Bold, Geist_800ExtraBold } from '@expo-google-fonts/geist';
import { GeistMono_400Regular, GeistMono_500Medium, GeistMono_600SemiBold } from '@expo-google-fonts/geist-mono';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { bindRepo, hydrate, saveTheme } from '../state/actions';
import { repo } from '../state/db';
import { ThemeProvider, useTheme, type ThemePref } from '../theme/ThemeContext';

bindRepo(repo);

function Shell() {
  const { t } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar style={t.mode === 'light' ? 'dark' : 'light'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg }, animation: 'fade' }} />
    </View>
  );
}

export default function RootLayout() {
  // Fonts ship inside the app bundle; nothing is fetched.
  const [loaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    Geist_800ExtraBold,
    GeistMono_400Regular,
    GeistMono_500Medium,
    GeistMono_600SemiBold,
  });
  const [theme, setTheme] = useState<ThemePref | null>(null);
  useEffect(() => {
    hydrate().then(setTheme);
  }, []);
  if (!loaded || !theme) return <View style={{ flex: 1, backgroundColor: '#050605' }} />;
  return (
    <SafeAreaProvider>
      <ThemeProvider initial={theme} onChange={saveTheme}>
        <Shell />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
