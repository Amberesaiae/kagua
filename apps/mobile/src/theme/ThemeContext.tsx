import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { dark, light, type Tokens } from './tokens';

export type ThemePref = 'system' | 'dark' | 'light';

interface ThemeValue {
  t: Tokens;
  pref: ThemePref;
  setPref: (p: ThemePref) => void;
  toggle: () => void;
}

const Ctx = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children, initial = 'system', onChange }: { children: ReactNode; initial?: ThemePref; onChange?: (p: ThemePref) => void }) {
  const system = useColorScheme();
  const [pref, setPrefState] = useState<ThemePref>(initial);
  const value = useMemo<ThemeValue>(() => {
    const mode = pref === 'system' ? (system === 'light' ? 'light' : 'dark') : pref;
    const setPref = (p: ThemePref) => {
      setPrefState(p);
      onChange?.(p);
    };
    return { t: mode === 'light' ? light : dark, pref, setPref, toggle: () => setPref(mode === 'light' ? 'dark' : 'light') };
  }, [pref, system, onChange]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTheme outside ThemeProvider');
  return v;
}
