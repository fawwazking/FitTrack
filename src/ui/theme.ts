import { useColorScheme } from 'react-native';
import { useUi } from '../state/ui';

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryText: string;
  primarySoft: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
  success: string;
  protein: string;
  carbs: string;
  fat: string;
  track: string;
  overlay: string;
}

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number };
  radius: { sm: number; md: number; lg: number; pill: number };
  font: { h1: number; h2: number; h3: number; body: number; small: number; label: number };
}

const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
const radius = { sm: 8, md: 12, lg: 18, pill: 999 };
const font = { h1: 28, h2: 20, h3: 17, body: 15, small: 13, label: 12 };

const lightColors: ThemeColors = {
  bg: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceAlt: '#EDF1F7',
  text: '#0B1220',
  textMuted: '#57616F',
  border: '#DDE3EC',
  primary: '#15803D',
  primaryText: '#FFFFFF',
  primarySoft: '#DCFCE7',
  danger: '#B91C1C',
  dangerSoft: '#FEE2E2',
  warning: '#B45309',
  warningSoft: '#FEF3C7',
  success: '#15803D',
  protein: '#1D4ED8',
  carbs: '#B45309',
  fat: '#B91C1C',
  track: '#DDE3EC',
  overlay: 'rgba(10, 16, 28, 0.45)',
};

const darkColors: ThemeColors = {
  bg: '#0B1220',
  surface: '#141E2E',
  surfaceAlt: '#1C293B',
  text: '#F8FAFC',
  textMuted: '#A7B4C6',
  border: '#2A3A51',
  primary: '#4ADE80',
  primaryText: '#052013',
  primarySoft: '#123524',
  danger: '#FCA5A5',
  dangerSoft: '#3B1717',
  warning: '#FCD34D',
  warningSoft: '#3A2A10',
  success: '#4ADE80',
  protein: '#93C5FD',
  carbs: '#FCD34D',
  fat: '#FCA5A5',
  track: '#2A3A51',
  overlay: 'rgba(0, 0, 0, 0.65)',
};

export const lightTheme: Theme = { dark: false, colors: lightColors, spacing, radius, font };
export const darkTheme: Theme = { dark: true, colors: darkColors, spacing, radius, font };

export function useTheme(): Theme {
  const mode = useUi((state) => state.themeMode);
  const scheme = useColorScheme();
  if (mode === 'light') return lightTheme;
  if (mode === 'dark') return darkTheme;
  return scheme === 'light' ? lightTheme : darkTheme;
}
