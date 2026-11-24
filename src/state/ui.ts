import { create } from 'zustand';

export type ThemeMode = 'system' | 'light' | 'dark';

interface UiState {
  version: number;
  themeMode: ThemeMode;
  bump: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useUi = create<UiState>((set) => ({
  version: 0,
  themeMode: 'system',
  bump: () => set((state) => ({ version: state.version + 1 })),
  setThemeMode: (mode) => set({ themeMode: mode }),
}));
