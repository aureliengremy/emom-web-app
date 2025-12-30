// ============================================
// EMOM Web App - Types
// Adaptés depuis l'app native Expo
// ============================================

// === Constantes ===

export const EMOM_DURATIONS = [2, 3, 4, 5, 6, 8, 10, 12, 14, 15, 16, 18, 20] as const;
export type EMOMDuration = (typeof EMOM_DURATIONS)[number];

export const PAUSE_DURATIONS = [60, 90, 120, 180, 300] as const; // secondes
export type PauseDuration = (typeof PAUSE_DURATIONS)[number];

// === Exercices ===

export type ExerciseCategory = "push" | "pull" | "legs" | "core";

export interface EMOMConfig {
  reps: number;
  duration: number; // minutes
  weighted?: boolean;
  weight?: number; // kg
}

export interface Exercise {
  id: string;
  name: string;
  type: "preset" | "custom";
  category: ExerciseCategory;
  currentMax: number;
  currentEMOM: EMOMConfig;
  lastTested: string; // ISO date
  createdAt: string; // ISO date
}

// === Workout ===

export type MinuteStatus = "pending" | "completed" | "failed" | "adjusted";

export interface WorkoutMinute {
  minuteNumber: number;
  targetReps: number;
  completedReps: number;
  status: MinuteStatus;
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  exerciseName: string;
  order: number;
  emomConfig: EMOMConfig;
  minutes: WorkoutMinute[];
  completed: boolean;
  totalReps: number;
  actualDuration: number; // secondes
}

export type WorkoutRating = "easy" | "medium" | "hard";

export interface Workout {
  id: string;
  date: string; // ISO date
  sets: WorkoutSet[];
  totalDuration: number; // secondes
  totalReps: number;
  rating?: WorkoutRating;
  notes?: string;
  completed: boolean;
}

// === Session Builder ===

export interface PlannedSet {
  id: string;
  exerciseId: string;
  exerciseName: string;
  reps: number;
  duration: number; // minutes
  weighted?: boolean;
  weight?: number;
}

export interface SessionPlan {
  sets: PlannedSet[];
  pauseDuration: number; // secondes
}

// === Saved Sessions ===

export interface SavedSession {
  id: string;
  userId: string;
  name: string;
  description?: string;
  sets: PlannedSet[];
  pauseDuration: number; // secondes
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

// === Timer ===

export type TimerStatus = "idle" | "countdown" | "running" | "paused" | "finished";

export interface TimerState {
  status: TimerStatus;
  secondsRemaining: number; // 0-60
  currentMinute: number; // 1-based
  totalMinutes: number;
  currentSetIndex: number; // 0-based
  totalSets: number;
  isPausingBetweenSets: boolean;
  pauseSecondsRemaining: number;
  countdownSeconds: number; // countdown avant le début
}

// === User Settings ===

export interface UserSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  defaultPauseDuration: number; // secondes
  defaultEMOMDuration: number; // minutes
  hasCompletedSetup: boolean;
}

// === EMOM Tables ===

export interface EMOMRange {
  minMax: number;
  maxMax: number;
  recommended: EMOMConfig;
}

export interface EMOMTable {
  exerciseId: string;
  ranges: EMOMRange[];
}

// === Utilitaires ===

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
