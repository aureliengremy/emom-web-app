// ============================================
// Tables EMOM - Recommandations automatiques
// Basées sur la documentation EMOM
// ============================================

import type { EMOMConfig, EMOMRange } from "@/types";

// === Tractions (Pull-ups) ===
export const PULLUPS_RANGES: EMOMRange[] = [
  { minMax: 0, maxMax: 5, recommended: { reps: 2, duration: 10 } },
  { minMax: 5, maxMax: 10, recommended: { reps: 3, duration: 10 } },
  { minMax: 10, maxMax: 15, recommended: { reps: 4, duration: 10 } },
  { minMax: 15, maxMax: 20, recommended: { reps: 5, duration: 10 } },
  { minMax: 20, maxMax: 25, recommended: { reps: 6, duration: 10 } },
  { minMax: 25, maxMax: 30, recommended: { reps: 8, duration: 10 } },
  { minMax: 30, maxMax: 35, recommended: { reps: 10, duration: 10 } },
  {
    minMax: 35,
    maxMax: 40,
    recommended: { reps: 10, duration: 10, weighted: true, weight: 5 },
  },
  {
    minMax: 40,
    maxMax: 45,
    recommended: { reps: 10, duration: 10, weighted: true, weight: 10 },
  },
  {
    minMax: 45,
    maxMax: 100,
    recommended: { reps: 10, duration: 10, weighted: true, weight: 15 },
  },
];

// === Dips ===
export const DIPS_RANGES: EMOMRange[] = [
  { minMax: 0, maxMax: 10, recommended: { reps: 4, duration: 10 } },
  { minMax: 10, maxMax: 20, recommended: { reps: 6, duration: 10 } },
  { minMax: 20, maxMax: 30, recommended: { reps: 8, duration: 10 } },
  { minMax: 30, maxMax: 40, recommended: { reps: 10, duration: 10 } },
  { minMax: 40, maxMax: 50, recommended: { reps: 12, duration: 10 } },
  { minMax: 50, maxMax: 60, recommended: { reps: 14, duration: 10 } },
  { minMax: 60, maxMax: 70, recommended: { reps: 16, duration: 10 } },
  {
    minMax: 70,
    maxMax: 100,
    recommended: { reps: 10, duration: 10, weighted: true, weight: 10 },
  },
];

// === Pompes (Push-ups) ===
export const PUSHUPS_RANGES: EMOMRange[] = [
  { minMax: 0, maxMax: 20, recommended: { reps: 5, duration: 10 } },
  { minMax: 20, maxMax: 40, recommended: { reps: 8, duration: 10 } },
  { minMax: 40, maxMax: 60, recommended: { reps: 12, duration: 10 } },
  { minMax: 60, maxMax: 100, recommended: { reps: 15, duration: 10 } },
];

// === Muscle-ups ===
export const MUSCLEUPS_RANGES: EMOMRange[] = [
  { minMax: 0, maxMax: 3, recommended: { reps: 1, duration: 10 } },
  { minMax: 3, maxMax: 6, recommended: { reps: 2, duration: 10 } },
  { minMax: 6, maxMax: 8, recommended: { reps: 3, duration: 10 } },
  { minMax: 8, maxMax: 10, recommended: { reps: 4, duration: 10 } },
  { minMax: 10, maxMax: 100, recommended: { reps: 5, duration: 10 } },
];

// === Mapping exercice -> table ===
const EXERCISE_TABLES: Record<string, EMOMRange[]> = {
  pullups: PULLUPS_RANGES,
  dips: DIPS_RANGES,
  pushups: PUSHUPS_RANGES,
  muscleups: MUSCLEUPS_RANGES,
};

/**
 * Calcule l'EMOM recommandé en fonction du max actuel
 */
export function calculateRecommendedEMOM(
  exerciseId: string,
  currentMax: number
): EMOMConfig {
  const ranges = EXERCISE_TABLES[exerciseId];

  // Si pas de table spécifique, utiliser une formule générique
  if (!ranges) {
    return calculateGenericEMOM(currentMax);
  }

  // Trouver la plage correspondante
  for (const range of ranges) {
    if (currentMax >= range.minMax && currentMax < range.maxMax) {
      return { ...range.recommended };
    }
  }

  // Si au-delà de toutes les plages, retourner la dernière
  const lastRange = ranges[ranges.length - 1];
  return { ...lastRange.recommended };
}

/**
 * Calcul générique pour les exercices personnalisés
 * Ratio approximatif : 30-40% du max pour EMOM 10'
 */
export function calculateGenericEMOM(currentMax: number): EMOMConfig {
  const reps = Math.max(1, Math.round(currentMax * 0.35));
  return {
    reps,
    duration: 10,
  };
}

// === Exercices présets ===
export const PRESET_EXERCISES = [
  {
    id: "pullups",
    name: "Tractions",
    category: "pull" as const,
    defaultMax: 5,
  },
  {
    id: "dips",
    name: "Dips",
    category: "push" as const,
    defaultMax: 10,
  },
  {
    id: "pushups",
    name: "Pompes",
    category: "push" as const,
    defaultMax: 20,
  },
  {
    id: "muscleups",
    name: "Muscle-ups",
    category: "pull" as const,
    defaultMax: 0,
  },
];

/**
 * Détermine le niveau de l'utilisateur pour un exercice
 */
export function getExerciseLevel(
  exerciseId: string,
  currentMax: number
): "beginner" | "intermediate" | "advanced" | "expert" | "master" {
  const ranges = EXERCISE_TABLES[exerciseId];
  if (!ranges) {
    if (currentMax < 10) return "beginner";
    if (currentMax < 25) return "intermediate";
    if (currentMax < 40) return "advanced";
    if (currentMax < 60) return "expert";
    return "master";
  }

  const rangeIndex = ranges.findIndex(
    (r) => currentMax >= r.minMax && currentMax < r.maxMax
  );
  const progress = rangeIndex / ranges.length;

  if (progress < 0.2) return "beginner";
  if (progress < 0.4) return "intermediate";
  if (progress < 0.6) return "advanced";
  if (progress < 0.8) return "expert";
  return "master";
}

/**
 * Couleur du badge selon le niveau
 */
export function getLevelColor(
  level: "beginner" | "intermediate" | "advanced" | "expert" | "master"
): string {
  const colors = {
    beginner: "bg-green-500",
    intermediate: "bg-blue-500",
    advanced: "bg-purple-500",
    expert: "bg-orange-500",
    master: "bg-red-500",
  };
  return colors[level];
}
