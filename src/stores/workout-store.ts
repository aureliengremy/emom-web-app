"use client";

// ============================================
// Store du Workout (Timer + Historique)
// ============================================

import { create } from "zustand";
import type {
  Workout,
  WorkoutSet,
  WorkoutMinute,
  SessionPlan,
  PlannedSet,
  TimerState,
  WorkoutRating,
} from "@/types";
import { generateId } from "@/types";
import {
  getWorkouts as getLocalWorkouts,
  saveWorkout as saveLocalWorkout,
  deleteWorkout as deleteLocalWorkout,
} from "@/lib/db";
import {
  getSupabaseWorkouts,
  saveSupabaseWorkout,
} from "@/lib/supabase/data-service";
import { useAuthStore } from "./auth-store";

// Helper pour vérifier si l'utilisateur est connecté
function getAuthUser() {
  return useAuthStore.getState().user;
}

interface TickResult {
  minuteComplete: boolean;
  setComplete: boolean;
  workoutComplete: boolean;
}

interface WorkoutState {
  // Historique
  workoutHistory: Workout[];
  isLoaded: boolean;

  // Session en cours
  currentWorkout: Workout | null;
  sessionPlan: SessionPlan | null;

  // Timer
  timer: TimerState;

  // Actions - Historique
  loadWorkouts: () => Promise<void>;
  deleteWorkoutFromHistory: (id: string) => Promise<void>;

  // Actions - Session
  startWorkout: (plan: SessionPlan) => void;
  cancelWorkout: () => void;
  finishWorkout: (rating?: WorkoutRating, notes?: string) => Promise<void>;

  // Actions - Timer
  tick: () => TickResult;
  pauseTimer: () => void;
  resumeTimer: () => void;
  completeMinute: (reps?: number) => void;
  startNextSet: () => void;
  adjustReps: (newReps: number) => void;

  // Getters
  getCurrentSet: () => WorkoutSet | null;
  getCurrentPlannedSet: () => PlannedSet | null;
  getWorkoutById: (id: string) => Workout | undefined;
}

const INITIAL_TIMER: TimerState = {
  status: "idle",
  secondsRemaining: 60,
  currentMinute: 1,
  totalMinutes: 10,
  currentSetIndex: 0,
  totalSets: 1,
  isPausingBetweenSets: false,
  pauseSecondsRemaining: 0,
};

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  workoutHistory: [],
  isLoaded: false,
  currentWorkout: null,
  sessionPlan: null,
  timer: INITIAL_TIMER,

  // === Historique ===

  loadWorkouts: async () => {
    const user = getAuthUser();

    if (user) {
      const workouts = await getSupabaseWorkouts(user.id);
      set({ workoutHistory: workouts, isLoaded: true });
    } else {
      const workouts = await getLocalWorkouts();
      set({ workoutHistory: workouts, isLoaded: true });
    }
  },

  deleteWorkoutFromHistory: async (id) => {
    // Note: Supabase delete not implemented - only local for now
    await deleteLocalWorkout(id);
    set((state) => ({
      workoutHistory: state.workoutHistory.filter((w) => w.id !== id),
    }));
  },

  // === Session ===

  startWorkout: (plan) => {
    const now = new Date().toISOString();
    const workoutId = generateId();

    // Créer les sets du workout
    const sets: WorkoutSet[] = plan.sets.map((plannedSet, index) => {
      const minutes: WorkoutMinute[] = Array.from(
        { length: plannedSet.duration },
        (_, i) => ({
          minuteNumber: i + 1,
          targetReps: plannedSet.reps,
          completedReps: 0,
          status: "pending" as const,
        })
      );

      return {
        id: plannedSet.id,
        exerciseId: plannedSet.exerciseId,
        exerciseName: plannedSet.exerciseName,
        order: index,
        emomConfig: {
          reps: plannedSet.reps,
          duration: plannedSet.duration,
          weighted: plannedSet.weighted,
          weight: plannedSet.weight,
        },
        minutes,
        completed: false,
        totalReps: 0,
        actualDuration: 0,
      };
    });

    const workout: Workout = {
      id: workoutId,
      date: now,
      sets,
      totalDuration: 0,
      totalReps: 0,
      completed: false,
    };

    const firstSet = plan.sets[0];

    set({
      currentWorkout: workout,
      sessionPlan: plan,
      timer: {
        status: "running",
        secondsRemaining: 60,
        currentMinute: 1,
        totalMinutes: firstSet.duration,
        currentSetIndex: 0,
        totalSets: plan.sets.length,
        isPausingBetweenSets: false,
        pauseSecondsRemaining: 0,
      },
    });
  },

  cancelWorkout: () => {
    set({
      currentWorkout: null,
      sessionPlan: null,
      timer: INITIAL_TIMER,
    });
  },

  finishWorkout: async (rating, notes) => {
    const user = getAuthUser();
    const { currentWorkout } = get();
    if (!currentWorkout) return;

    // Calculer les totaux
    const totalReps = currentWorkout.sets.reduce(
      (sum, s) => sum + s.totalReps,
      0
    );
    const totalDuration = currentWorkout.sets.reduce(
      (sum, s) => sum + s.actualDuration,
      0
    );

    const finishedWorkout: Workout = {
      ...currentWorkout,
      totalReps,
      totalDuration,
      rating,
      notes,
      completed: true,
    };

    if (user) {
      await saveSupabaseWorkout(user.id, finishedWorkout);
    } else {
      await saveLocalWorkout(finishedWorkout);
    }

    set((state) => ({
      workoutHistory: [finishedWorkout, ...state.workoutHistory],
      currentWorkout: null,
      sessionPlan: null,
      timer: INITIAL_TIMER,
    }));
  },

  // === Timer ===

  tick: () => {
    const { timer, currentWorkout, sessionPlan } = get();
    const result: TickResult = {
      minuteComplete: false,
      setComplete: false,
      workoutComplete: false,
    };

    if (timer.status !== "running" || !currentWorkout || !sessionPlan) {
      return result;
    }

    // Gestion de la pause entre sets
    if (timer.isPausingBetweenSets) {
      if (timer.pauseSecondsRemaining > 1) {
        set((state) => ({
          timer: {
            ...state.timer,
            pauseSecondsRemaining: state.timer.pauseSecondsRemaining - 1,
          },
        }));
      }
      return result;
    }

    // Timer normal
    if (timer.secondsRemaining > 1) {
      set((state) => ({
        timer: {
          ...state.timer,
          secondsRemaining: state.timer.secondsRemaining - 1,
        },
        currentWorkout: state.currentWorkout
          ? {
              ...state.currentWorkout,
              sets: state.currentWorkout.sets.map((s, i) =>
                i === state.timer.currentSetIndex
                  ? { ...s, actualDuration: s.actualDuration + 1 }
                  : s
              ),
            }
          : null,
      }));
      return result;
    }

    // Fin de minute
    result.minuteComplete = true;

    // Auto-compléter la minute si pas encore fait
    const currentSet = currentWorkout.sets[timer.currentSetIndex];
    const currentMinuteData = currentSet.minutes[timer.currentMinute - 1];
    if (currentMinuteData.status === "pending") {
      get().completeMinute();
    }

    // Vérifier si fin de set
    if (timer.currentMinute >= timer.totalMinutes) {
      result.setComplete = true;

      // Marquer le set comme terminé
      set((state) => ({
        currentWorkout: state.currentWorkout
          ? {
              ...state.currentWorkout,
              sets: state.currentWorkout.sets.map((s, i) =>
                i === state.timer.currentSetIndex
                  ? { ...s, completed: true }
                  : s
              ),
            }
          : null,
      }));

      // Vérifier si fin de workout
      if (timer.currentSetIndex >= timer.totalSets - 1) {
        result.workoutComplete = true;
        set((state) => ({
          timer: { ...state.timer, status: "finished" },
        }));
      } else {
        // Passer en pause entre sets
        set((state) => ({
          timer: {
            ...state.timer,
            isPausingBetweenSets: true,
            pauseSecondsRemaining: sessionPlan.pauseDuration,
            status: "paused",
          },
        }));
      }
    } else {
      // Passer à la minute suivante
      set((state) => ({
        timer: {
          ...state.timer,
          secondsRemaining: 60,
          currentMinute: state.timer.currentMinute + 1,
        },
      }));
    }

    return result;
  },

  pauseTimer: () => {
    set((state) => ({
      timer: { ...state.timer, status: "paused" },
    }));
  },

  resumeTimer: () => {
    set((state) => ({
      timer: { ...state.timer, status: "running" },
    }));
  },

  completeMinute: (reps) => {
    const { timer, currentWorkout } = get();
    if (!currentWorkout) return;

    const currentSet = currentWorkout.sets[timer.currentSetIndex];
    const targetReps = currentSet.emomConfig.reps;
    const completedReps = reps ?? targetReps;

    set((state) => ({
      currentWorkout: state.currentWorkout
        ? {
            ...state.currentWorkout,
            sets: state.currentWorkout.sets.map((s, i) =>
              i === state.timer.currentSetIndex
                ? {
                    ...s,
                    totalReps: s.totalReps + completedReps,
                    minutes: s.minutes.map((m, j) =>
                      j === state.timer.currentMinute - 1
                        ? {
                            ...m,
                            completedReps,
                            status:
                              completedReps >= targetReps
                                ? ("completed" as const)
                                : ("adjusted" as const),
                          }
                        : m
                    ),
                  }
                : s
            ),
          }
        : null,
    }));
  },

  startNextSet: () => {
    const { timer, sessionPlan } = get();
    if (!sessionPlan) return;

    const nextSetIndex = timer.currentSetIndex + 1;
    const nextSet = sessionPlan.sets[nextSetIndex];

    set((state) => ({
      timer: {
        ...state.timer,
        status: "running",
        secondsRemaining: 60,
        currentMinute: 1,
        totalMinutes: nextSet.duration,
        currentSetIndex: nextSetIndex,
        isPausingBetweenSets: false,
        pauseSecondsRemaining: 0,
      },
    }));
  },

  adjustReps: (newReps) => {
    const { timer, currentWorkout, sessionPlan } = get();
    if (!currentWorkout || !sessionPlan) return;

    // Mettre à jour les reps pour les minutes restantes du set actuel
    set((state) => {
      if (!state.sessionPlan) return state;

      const updatedSets = [...state.sessionPlan.sets];
      updatedSets[timer.currentSetIndex] = {
        ...updatedSets[timer.currentSetIndex],
        reps: newReps,
      };

      return {
        sessionPlan: { ...state.sessionPlan, sets: updatedSets },
      };
    });
  },

  // === Getters ===

  getCurrentSet: () => {
    const { currentWorkout, timer } = get();
    if (!currentWorkout) return null;
    return currentWorkout.sets[timer.currentSetIndex] ?? null;
  },

  getCurrentPlannedSet: () => {
    const { sessionPlan, timer } = get();
    if (!sessionPlan) return null;
    return sessionPlan.sets[timer.currentSetIndex] ?? null;
  },

  getWorkoutById: (id) => {
    return get().workoutHistory.find((w) => w.id === id);
  },
}));
