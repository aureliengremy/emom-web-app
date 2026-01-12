// ============================================
// Base de données IndexedDB avec Dexie
// ============================================

import Dexie, { type Table } from "dexie";
import type { Exercise, Workout, UserSettings } from "@/types";

class EMOMDatabase extends Dexie {
  exercises!: Table<Exercise, string>;
  workouts!: Table<Workout, string>;
  settings!: Table<UserSettings & { id: string }, string>;

  constructor() {
    super("emom-db");

    this.version(1).stores({
      exercises: "id, name, type, category, createdAt",
      workouts: "id, date, completed",
      settings: "id",
    });
  }
}

export const db = new EMOMDatabase();

// === Helpers pour les exercices ===

export async function getExercises(): Promise<Exercise[]> {
  return db.exercises.toArray();
}

export async function getExercise(id: string): Promise<Exercise | undefined> {
  return db.exercises.get(id);
}

export async function saveExercise(exercise: Exercise): Promise<void> {
  await db.exercises.put(exercise);
}

export async function deleteExercise(id: string): Promise<void> {
  await db.exercises.delete(id);
}

// === Helpers pour les workouts ===

export async function getWorkouts(): Promise<Workout[]> {
  return db.workouts.orderBy("date").reverse().toArray();
}

export async function getWorkout(id: string): Promise<Workout | undefined> {
  return db.workouts.get(id);
}

export async function saveWorkout(workout: Workout): Promise<void> {
  await db.workouts.put(workout);
}

export async function deleteWorkout(id: string): Promise<void> {
  await db.workouts.delete(id);
}

// === Helpers pour les settings ===

const SETTINGS_ID = "user-settings";

const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  defaultPauseDuration: 120,
  defaultEMOMDuration: 10,
  hasCompletedSetup: false,
  language: "fr",
};

export async function getSettings(): Promise<UserSettings> {
  const settings = await db.settings.get(SETTINGS_ID);
  if (!settings) {
    return DEFAULT_SETTINGS;
  }
  const { id: _, ...rest } = settings;
  return rest as UserSettings;
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await db.settings.put({ ...settings, id: SETTINGS_ID });
}

// === Reset tout ===

export async function resetAllData(): Promise<void> {
  await db.exercises.clear();
  await db.workouts.clear();
  await db.settings.clear();
}
