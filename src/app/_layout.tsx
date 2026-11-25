import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { getSettings } from '../db/repos/settings';
import { getSqlite, isWeb } from '../db/db';
import { seedDatabase } from '../db/seed';
import { t } from '../i18n';
import { initNotifications } from '../notifications';
import { useUi, type ThemeMode } from '../state/ui';
import { Banner, Screen } from '../ui/components';
import { useTheme } from '../ui/theme';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';

function themeModeFromSettings(value: string): ThemeMode {
  return value === 'light' || value === 'dark' ? value : 'system';
}

interface InitResult {
  error: string | null;
  themeMode: ThemeMode;
}

export default function RootLayout() {
  const [init] = useState<InitResult>(() => {
    // ponytail: expo-sqlite web build (worker + .wasm) doesn't bundle cleanly
    // with Metro; skip native DB on web. Add a web DB layer when persistence
    // is needed (IndexedDB or SQL.js).
    if (isWeb) {
      return { error: null, themeMode: 'system' };
    }
    try {
      getSqlite();
      seedDatabase();
      return { error: null, themeMode: themeModeFromSettings(getSettings().theme) };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
        themeMode: 'system',
      };
    }
  });
  const setThemeMode = useUi((state) => state.setThemeMode);
  const theme = useTheme();
  const [fontsLoaded] = useFonts({
    Inter: Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    setThemeMode(init.themeMode);
    // Initialize notification handler (no-op on web)
    initNotifications();
  }, [init.themeMode, setThemeMode]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      {init.error ? (
        <Screen>
          <Banner tone="danger" title={t.errors.db}>
            {init.error}
          </Banner>
        </Screen>
      ) : (
        <>
          <StatusBar style={theme.dark ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.colors.bg },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
          </Stack>
        </>
      )}
    </SafeAreaProvider>
  );
}
