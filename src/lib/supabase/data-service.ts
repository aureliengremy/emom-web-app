// ============================================
// Supabase Data Service
// Service pour les opérations CRUD sur Supabase
// ============================================

import { createClient } from "./client";
import type { Exercise, Workout, UserSettings } from "@/types";

// ============================================
// Exercises
// ============================================

export async function getSupabaseExercises(userId: string): Promise<Exercise[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching exercises:", error);
    return [];
  }

  return (data || []).map(mapDbExerciseToExercise);
}

export async function saveSupabaseExercise(
  userId: string,
  exercise: Exercise
): Promise<void> {
  const supabase = createClient();

  const dbExercise = {
    id: exercise.id,
    user_id: userId,
    name: exercise.name,
    type: exercise.type,
    category: exercise.category,
    current_max: exercise.currentMax,
    current_emom: exercise.currentEMOM,
    last_tested: exercise.lastTested,
    created_at: exercise.createdAt,
  };

  const { error } = await supabase
    .from("exercises")
    .upsert(dbExercise, { onConflict: "id" });

  if (error) {
    console.error("Error saving exercise:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(error.message || "Erreur Supabase");
  }
}

export async function deleteSupabaseExercise(exerciseId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("exercises")
    .delete()
    .eq("id", exerciseId);

  if (error) {
    console.error("Error deleting exercise:", error);
    throw error;
  }
}

// ============================================
// Workouts
// ============================================

export async function getSupabaseWorkouts(userId: string): Promise<Workout[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching workouts:", error);
    return [];
  }

  return (data || []).map(mapDbWorkoutToWorkout);
}

export async function saveSupabaseWorkout(
  userId: string,
  workout: Workout
): Promise<void> {
  const supabase = createClient();

  const dbWorkout = {
    id: workout.id,
    user_id: userId,
    date: workout.date,
    sets: workout.sets,
    total_duration: workout.totalDuration,
    total_reps: workout.totalReps,
    rating: workout.rating,
    notes: workout.notes,
    completed: workout.completed,
  };

  const { error } = await supabase
    .from("workouts")
    .upsert(dbWorkout, { onConflict: "id" });

  if (error) {
    console.error("Error saving workout:", error);
    throw error;
  }
}

// ============================================
// User Settings
// ============================================

export async function getSupabaseSettings(
  userId: string
): Promise<UserSettings | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching settings:", error);
    return null;
  }

  return data ? mapDbSettingsToSettings(data) : null;
}

export async function saveSupabaseSettings(
  userId: string,
  settings: UserSettings
): Promise<void> {
  const supabase = createClient();

  const dbSettings = {
    id: userId,
    sound_enabled: settings.soundEnabled,
    vibration_enabled: settings.vibrationEnabled,
    default_pause_duration: settings.defaultPauseDuration,
    default_emom_duration: settings.defaultEMOMDuration,
    has_completed_setup: settings.hasCompletedSetup,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("user_settings")
    .upsert(dbSettings, { onConflict: "id" });

  if (error) {
    console.error("Error saving settings:", error);
    throw error;
  }
}

// ============================================
// Mappers DB → App Types
// ============================================

interface DbExercise {
  id: string;
  user_id: string;
  name: string;
  type: string;
  category: string;
  current_max: number;
  current_emom: Exercise["currentEMOM"];
  last_tested: string;
  created_at: string;
}

function mapDbExerciseToExercise(db: DbExercise): Exercise {
  return {
    id: db.id,
    name: db.name,
    type: db.type as Exercise["type"],
    category: db.category as Exercise["category"],
    currentMax: db.current_max,
    currentEMOM: db.current_emom,
    lastTested: db.last_tested,
    createdAt: db.created_at,
  };
}

interface DbWorkout {
  id: string;
  user_id: string;
  date: string;
  sets: Workout["sets"];
  total_duration: number;
  total_reps: number;
  rating: string | null;
  notes: string | null;
  completed: boolean;
}

function mapDbWorkoutToWorkout(db: DbWorkout): Workout {
  return {
    id: db.id,
    date: db.date,
    sets: db.sets,
    totalDuration: db.total_duration,
    totalReps: db.total_reps,
    rating: db.rating as Workout["rating"],
    notes: db.notes ?? undefined,
    completed: db.completed,
  };
}

interface DbSettings {
  id: string;
  sound_enabled: boolean;
  vibration_enabled: boolean;
  default_pause_duration: number;
  default_emom_duration: number;
  has_completed_setup: boolean;
}

function mapDbSettingsToSettings(db: DbSettings): UserSettings {
  return {
    soundEnabled: db.sound_enabled,
    vibrationEnabled: db.vibration_enabled,
    defaultPauseDuration: db.default_pause_duration,
    defaultEMOMDuration: db.default_emom_duration,
    hasCompletedSetup: db.has_completed_setup,
  };
}
