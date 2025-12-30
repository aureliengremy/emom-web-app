"use client";

// ============================================
// Store de construction de séance
// ============================================

import { create } from "zustand";
import type { PlannedSet, SessionPlan, Exercise, SavedSession } from "@/types";
import { generateId } from "@/types";
import {
  getSavedSessions,
  saveSavedSession,
  deleteSavedSession,
} from "@/lib/supabase/data-service";

interface SessionState {
  plannedSets: PlannedSet[];
  pauseDuration: number; // secondes
  savedSessions: SavedSession[];
  isLoadingSavedSessions: boolean;

  // Actions - Session Builder
  addSet: (exercise: Exercise) => void;
  removeSet: (setId: string) => void;
  updateSetConfig: (
    setId: string,
    config: { reps?: number; duration?: number }
  ) => void;
  reorderSets: (fromIndex: number, toIndex: number) => void;
  setPauseDuration: (duration: number) => void;
  clearSession: () => void;

  // Actions - Saved Sessions
  loadSavedSessions: (userId: string) => Promise<void>;
  saveCurrentSession: (userId: string, name: string, description?: string, sets?: PlannedSet[]) => Promise<void>;
  loadSessionPlan: (session: SavedSession) => void;
  deleteSavedSessionById: (sessionId: string) => Promise<void>;

  // Getters
  getSessionPlan: () => SessionPlan;
  getTotalDuration: () => number; // secondes
  getTotalReps: () => number;
  hasPlannedSets: () => boolean;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  plannedSets: [],
  pauseDuration: 120, // 2 minutes par défaut
  savedSessions: [],
  isLoadingSavedSessions: false,

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

  // Saved Sessions Actions
  loadSavedSessions: async (userId) => {
    set({ isLoadingSavedSessions: true });
    try {
      const sessions = await getSavedSessions(userId);
      set({ savedSessions: sessions });
    } catch (error) {
      console.error("Error loading saved sessions:", error);
    } finally {
      set({ isLoadingSavedSessions: false });
    }
  },

  saveCurrentSession: async (userId, name, description, sets) => {
    const setsToSave = sets || get().plannedSets;
    
    if (setsToSave.length === 0) {
      throw new Error("Aucun exercice dans la session");
    }

    // Chercher si une session avec le même nom existe déjà
    const existingSession = get().savedSessions.find(s => s.name === name && s.userId === userId);
    
    const session: SavedSession = existingSession ? {
      ...existingSession,
      name,
      description,
      sets: setsToSave,
      pauseDuration: get().pauseDuration,
      updatedAt: new Date().toISOString(),
    } : {
      id: generateId(),
      userId,
      name,
      description,
      sets: setsToSave,
      pauseDuration: get().pauseDuration,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveSavedSession(userId, session);
      
      if (existingSession) {
        // Mettre à jour la session existante dans le state
        set((state) => ({
          savedSessions: state.savedSessions.map(s => 
            s.id === session.id ? session : s
          ),
        }));
      } else {
        // Ajouter la nouvelle session
        set((state) => ({
          savedSessions: [session, ...state.savedSessions],
        }));
      }
    } catch (error) {
      console.error("Error saving session:", error);
      throw error;
    }
  },

  loadSessionPlan: (session) => {
    set({
      plannedSets: session.sets,
      pauseDuration: session.pauseDuration,
    });
  },

  deleteSavedSessionById: async (sessionId) => {
    try {
      await deleteSavedSession(sessionId);
      set((state) => ({
        savedSessions: state.savedSessions.filter((s) => s.id !== sessionId),
      }));
    } catch (error) {
      console.error("Error deleting session:", error);
      throw error;
    }
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
