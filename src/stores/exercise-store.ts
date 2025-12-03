"use client";

// ============================================
// Store des exercices (Zustand + IndexedDB/Supabase)
// ============================================

import { create } from "zustand";
import type { Exercise } from "@/types";
import { generateId } from "@/types";
import {
  getExercises as getLocalExercises,
  saveExercise as saveLocalExercise,
  deleteExercise as deleteLocalExercise,
} from "@/lib/db";
import {
  getSupabaseExercises,
  saveSupabaseExercise,
  deleteSupabaseExercise,
} from "@/lib/supabase/data-service";
import {
  PRESET_EXERCISES,
  calculateRecommendedEMOM,
} from "@/data/emom-tables";
import { useAuthStore } from "./auth-store";

interface ExerciseState {
  exercises: Exercise[];
  isLoaded: boolean;

  // Actions
  loadExercises: () => Promise<void>;
  initializePresets: () => Promise<void>;
  addExercise: (data: {
    name: string;
    category: Exercise["category"];
    currentMax: number;
  }) => Promise<Exercise>;
  updateExercise: (id: string, updates: Partial<Exercise>) => Promise<void>;
  updateMax: (id: string, newMax: number) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  syncToCloud: () => Promise<void>;

  // Getters
  getExerciseById: (id: string) => Exercise | undefined;
  getPresetExercises: () => Exercise[];
  getCustomExercises: () => Exercise[];
}

// Helper pour vérifier si l'utilisateur est connecté
function getAuthUser() {
  return useAuthStore.getState().user;
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  exercises: [],
  isLoaded: false,

  loadExercises: async () => {
    const user = getAuthUser();

    if (user) {
      // Mode connecté : charger depuis Supabase
      const exercises = await getSupabaseExercises(user.id);
      set({ exercises, isLoaded: true });
    } else {
      // Mode local : charger depuis IndexedDB
      const exercises = await getLocalExercises();
      set({ exercises, isLoaded: true });
    }
  },

  initializePresets: async () => {
    const user = getAuthUser();

    let existing: Exercise[];
    if (user) {
      existing = await getSupabaseExercises(user.id);
    } else {
      existing = await getLocalExercises();
    }

    // Vérifier si les présets existent déjà
    const existingIds = new Set(existing.map((e) => e.id));
    const presetsToCreate = PRESET_EXERCISES.filter(
      (p) => !existingIds.has(p.id)
    );

    if (presetsToCreate.length === 0) {
      set({ exercises: existing, isLoaded: true });
      return;
    }

    const now = new Date().toISOString();
    const newExercises: Exercise[] = presetsToCreate.map((preset) => ({
      id: preset.id,
      name: preset.name,
      type: "preset" as const,
      category: preset.category,
      currentMax: preset.defaultMax,
      currentEMOM: calculateRecommendedEMOM(preset.id, preset.defaultMax),
      lastTested: now,
      createdAt: now,
    }));

    // Sauvegarder en base
    for (const exercise of newExercises) {
      if (user) {
        await saveSupabaseExercise(user.id, exercise);
      } else {
        await saveLocalExercise(exercise);
      }
    }

    const allExercises = [...existing, ...newExercises];
    set({ exercises: allExercises, isLoaded: true });
  },

  addExercise: async (data) => {
    const user = getAuthUser();
    const now = new Date().toISOString();
    const id = generateId();
    const emom = calculateRecommendedEMOM(id, data.currentMax);

    const exercise: Exercise = {
      id,
      name: data.name,
      type: "custom",
      category: data.category,
      currentMax: data.currentMax,
      currentEMOM: emom,
      lastTested: now,
      createdAt: now,
    };

    if (user) {
      await saveSupabaseExercise(user.id, exercise);
    } else {
      await saveLocalExercise(exercise);
    }

    set((state) => ({ exercises: [...state.exercises, exercise] }));
    return exercise;
  },

  updateExercise: async (id, updates) => {
    const user = getAuthUser();
    const exercise = get().getExerciseById(id);
    if (!exercise) return;

    const updated = { ...exercise, ...updates };

    if (user) {
      await saveSupabaseExercise(user.id, updated);
    } else {
      await saveLocalExercise(updated);
    }

    set((state) => ({
      exercises: state.exercises.map((e) => (e.id === id ? updated : e)),
    }));
  },

  updateMax: async (id, newMax) => {
    const user = getAuthUser();
    const exercise = get().getExerciseById(id);
    if (!exercise) return;

    const newEMOM = calculateRecommendedEMOM(id, newMax);
    const updated: Exercise = {
      ...exercise,
      currentMax: newMax,
      currentEMOM: newEMOM,
      lastTested: new Date().toISOString(),
    };

    if (user) {
      await saveSupabaseExercise(user.id, updated);
    } else {
      await saveLocalExercise(updated);
    }

    set((state) => ({
      exercises: state.exercises.map((e) => (e.id === id ? updated : e)),
    }));
  },

  deleteExercise: async (id) => {
    const user = getAuthUser();
    const exercise = get().getExerciseById(id);
    if (!exercise || exercise.type === "preset") return;

    if (user) {
      await deleteSupabaseExercise(id);
    } else {
      await deleteLocalExercise(id);
    }

    set((state) => ({
      exercises: state.exercises.filter((e) => e.id !== id),
    }));
  },

  // Synchroniser les données locales vers le cloud
  syncToCloud: async () => {
    const user = getAuthUser();
    if (!user) return;

    const localExercises = await getLocalExercises();

    for (const exercise of localExercises) {
      await saveSupabaseExercise(user.id, exercise);
    }

    // Recharger depuis Supabase
    await get().loadExercises();
  },

  getExerciseById: (id) => {
    return get().exercises.find((e) => e.id === id);
  },

  getPresetExercises: () => {
    return get().exercises.filter((e) => e.type === "preset");
  },

  getCustomExercises: () => {
    return get().exercises.filter((e) => e.type === "custom");
  },
}));
