"use client";

// ============================================
// Store de construction de séance
// ============================================

import { create } from "zustand";
import type { PlannedSet, SessionPlan, Exercise } from "@/types";
import { generateId } from "@/types";

interface SessionState {
  plannedSets: PlannedSet[];
  pauseDuration: number; // secondes

  // Actions
  addSet: (exercise: Exercise) => void;
  removeSet: (setId: string) => void;
  updateSetConfig: (
    setId: string,
    config: { reps?: number; duration?: number }
  ) => void;
  reorderSets: (fromIndex: number, toIndex: number) => void;
  setPauseDuration: (duration: number) => void;
  clearSession: () => void;

  // Getters
  getSessionPlan: () => SessionPlan;
  getTotalDuration: () => number; // secondes
  getTotalReps: () => number;
  hasPlannedSets: () => boolean;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  plannedSets: [],
  pauseDuration: 120, // 2 minutes par défaut

  addSet: (exercise) => {
    const newSet: PlannedSet = {
      id: generateId(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      reps: exercise.currentEMOM.reps,
      duration: exercise.currentEMOM.duration,
      weighted: exercise.currentEMOM.weighted,
      weight: exercise.currentEMOM.weight,
    };

    set((state) => ({
      plannedSets: [...state.plannedSets, newSet],
    }));
  },

  removeSet: (setId) => {
    set((state) => ({
      plannedSets: state.plannedSets.filter((s) => s.id !== setId),
    }));
  },

  updateSetConfig: (setId, config) => {
    set((state) => ({
      plannedSets: state.plannedSets.map((s) =>
        s.id === setId ? { ...s, ...config } : s
      ),
    }));
  },

  reorderSets: (fromIndex, toIndex) => {
    set((state) => {
      const newSets = [...state.plannedSets];
      const [removed] = newSets.splice(fromIndex, 1);
      newSets.splice(toIndex, 0, removed);
      return { plannedSets: newSets };
    });
  },

  setPauseDuration: (duration) => {
    set({ pauseDuration: duration });
  },

  clearSession: () => {
    set({ plannedSets: [], pauseDuration: 120 });
  },

  getSessionPlan: () => ({
    sets: get().plannedSets,
    pauseDuration: get().pauseDuration,
  }),

  getTotalDuration: () => {
    const { plannedSets, pauseDuration } = get();
    if (plannedSets.length === 0) return 0;

    // Durée des sets (en secondes)
    const setsDuration = plannedSets.reduce(
      (sum, s) => sum + s.duration * 60,
      0
    );
    // Pauses entre sets
    const pausesDuration = (plannedSets.length - 1) * pauseDuration;

    return setsDuration + pausesDuration;
  },

  getTotalReps: () => {
    return get().plannedSets.reduce(
      (sum, s) => sum + s.reps * s.duration,
      0
    );
  },

  hasPlannedSets: () => {
    return get().plannedSets.length > 0;
  },
}));
