import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getSettings } from '../db/repos/settings';
import { getSqlite, isWeb } from '../db/db';
import { seedDatabase } from '../db/seed';
import { t } from '../i18n';
import { useUi, type ThemeMode } from '../state/ui';
import { Banner, Screen } from '../ui/components';
import { useTheme } from '../ui/theme';

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

  useEffect(() => {
    setThemeMode(init.themeMode);
  }, [init.themeMode, setThemeMode]);

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
