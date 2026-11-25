import { useColorScheme, AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';
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
  reducedMotion: boolean;
  colors: ThemeColors;
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number };
  radius: { sm: number; md: number; lg: number; pill: number };
  font: { h1: number; h2: number; h3: number; body: number; small: number; label: number };
}

/**
 * Soft-minimalism design system (reference: user's UI/UX image, 2026-11-26).
 * - Canvas: very light cool-grey / off-white (light) ; deep desaturated indigo (dark)
 * - Card: pure white (light) / soft indigo-tinted (dark) with soft shadow
 * - Primary: violet #5C5CE7
 * - Secondary / goal: orange #F5A623
 * - Success: green #10B981
 * - Radius: large (rounded everywhere, pill for buttons/tabs)
 */
const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
const radius = { sm: 10, md: 16, lg: 20, pill: 999 };
const font = { h1: 30, h2: 20, h3: 17, body: 15, small: 13, label: 12 };

/** Font family names — loaded in _layout.tsx via expo-font. */
export const FONT_FAMILY = {
  regular: 'Inter',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
} as const;

const lightColors: ThemeColors = {
  bg: '#F4F4F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F1F4',
  text: '#1A1A1A',
  textMuted: '#57575E',
  border: '#E4E4E7',
  primary: '#5C5CE7',
  primaryText: '#FFFFFF',
  primarySoft: '#EDEDFE',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  warning: '#C77B0A',
  warningSoft: '#FEF3C7',
  success: '#0E8A5E',
  protein: '#5C5CE7',
  carbs: '#F5A623',
  fat: '#0E8A5E',
  track: '#E2E8F0',
  overlay: 'rgba(20, 20, 40, 0.45)',
};

const darkColors: ThemeColors = {
  bg: '#0F1016',
  surface: '#171824',
  surfaceAlt: '#1E2030',
  text: '#F4F4F5',
  textMuted: '#A1A1AA',
  border: '#2A2C3C',
  primary: '#7C7CF5',
  primaryText: '#FFFFFF',
  primarySoft: '#23244A',
  danger: '#F87171',
  dangerSoft: '#3B1717',
  warning: '#FBBF24',
  warningSoft: '#3A2A10',
  success: '#34D399',
  protein: '#A5A5F7',
  carbs: '#FBBF24',
  fat: '#34D399',
  track: '#2A2C3C',
  overlay: 'rgba(0, 0, 0, 0.65)',
};

export const lightTheme: Theme = { dark: false, reducedMotion: false, colors: lightColors, spacing, radius, font };
export const darkTheme: Theme = { dark: true, reducedMotion: false, colors: darkColors, spacing, radius, font };

/**
 * pro-rule #7 (ui-ux-pro-max skill): respect the OS reduce-motion setting.
 * Returns true when the user has "Reduce Motion" on (iOS: Motion → Reduce Motion,
 * Android: Accessibility → Remove animations). Components should skip or simplify
 * non-essential animations when this is true.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let sub: { remove: () => void } | null = null;
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => sub?.remove();
  }, []);
  return reduced;
}

export function useTheme(): Theme {
  const mode = useUi((state) => state.themeMode);
  const scheme = useColorScheme();
  const reducedMotion = useReducedMotion();
  const base = mode === 'light' ? lightTheme : mode === 'dark' ? darkTheme : scheme === 'light' ? lightTheme : darkTheme;
  return { ...base, reducedMotion };
}
