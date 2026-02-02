// src/features/settings/store/useSettingsStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create()(
  persist(
    (set) => ({
      theme: 'system', // 'light' | 'dark' | 'system'
      fontSize: 14,
      showAvatars: true,
      
      setTheme: (theme) => set({ theme }),
      setFontSize: (size) => set({ fontSize: size }),
    }),
    { name: 'ui-settings' }
  )
);


//==================================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

//"Pin Limit"

//To finalize your Client State, we’ll implement a Zustand Settings Store that handles 
// UI preferences like Pin Limits, Haptic Toggles, and Theme Switching. This replaces the legacy settingsSlice.js and ensures your app's "look and feel" is persisted in localStorage.

export const useSettingsStore = create()(
  persist(
    (set) => ({
      // UI State
      theme: 'system', // 'light' | 'dark' | 'oled'
      hapticsEnabled: true,
      pinLimit: 5,
      
      // Actions
      setTheme: (theme) => set({ theme }),
      toggleHaptics: () => set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),
      setPinLimit: (limit) => set({ pinLimit: limit }),
    }),
    { name: 'kollective-settings' }
  )
);

//==================================================================================
// /"Automatic OLED Mode"
//To implement Automatic OLED Mode in 2026, you integrate the Battery Status API with 
// your Zustand Settings Store. This automatically switches the UI to a pure-black theme 
// when the battery drops below a certain threshold (e.g., 20%), extending battery life on OLED mobile screens.
// src/features/settings/store/useSettingsStore.js
export const useSettingsStore = create()(
  persist(
    (set) => ({
      theme: 'system', // 'light' | 'dark' | 'oled'
      autoOled: true,  // New: Toggle for battery-saving mode
      
      setTheme: (theme) => set({ theme }),
      setAutoOled: (enabled) => set({ autoOled: enabled }),
    }),
    { name: 'kollective-settings' }
  )
);
