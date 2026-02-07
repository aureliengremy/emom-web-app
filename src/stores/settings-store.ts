"use client";

// ============================================
// Store des paramètres utilisateur
// ============================================

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { UserSettings } from "@/types";
import {
  getSettings as getLocalSettings,
  saveSettings as saveLocalSettings,
  resetAllData,
} from "@/lib/db";
import {
  getSupabaseSettings,
  saveSupabaseSettings,
} from "@/lib/supabase/data-service";
import { useAuthStore } from "./auth-store";

interface SettingsState {
  settings: UserSettings;
  isLoaded: boolean;

  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  completeSetup: () => Promise<void>;
  resetAll: () => Promise<void>;
}

const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  defaultPauseDuration: 120,
  defaultEMOMDuration: 10,
  hasCompletedSetup: false,
  language: "fr",
  countdownSoundPack: "minimal",
  countdownSoundsEnabled: true,
};

// Helper pour vérifier si l'utilisateur est connecté
function getAuthUser() {
  return useAuthStore.getState().user;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    (set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,

  loadSettings: async () => {
    const user = getAuthUser();

    if (user) {
      const settings = await getSupabaseSettings(user.id);
      set({ settings: settings ?? DEFAULT_SETTINGS, isLoaded: true });
    } else {
      const settings = await getLocalSettings();
      set({ settings, isLoaded: true });
    }
  },

  updateSettings: async (updates) => {
    const user = getAuthUser();
    const newSettings = { ...get().settings, ...updates };

    if (user) {
      await saveSupabaseSettings(user.id, newSettings);
    } else {
      await saveLocalSettings(newSettings);
    }

    set({ settings: newSettings });
  },

  completeSetup: async () => {
    await get().updateSettings({ hasCompletedSetup: true });
  },

  resetAll: async () => {
    await resetAllData();
    set({ settings: DEFAULT_SETTINGS });
  },
    }),
    { name: "SettingsStore", enabled: process.env.NODE_ENV === "development" }
  )
);
