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

// === Types pour les exercices présets ===
import type { ExerciseCategory, ExerciseFamily, ExerciseDifficulty, AppLanguage } from "@/types";

export interface PresetExercise {
  id: string;
  nameFr: string;  // Nom en français
  nameEn: string;  // Nom en anglais
  category: ExerciseCategory;
  family: ExerciseFamily;
  difficulty: ExerciseDifficulty;
  defaultMax: number;
}

/**
 * Récupère le nom d'un exercice préset selon la langue
 */
export function getPresetName(preset: PresetExercise, language: AppLanguage): string {
  return language === "fr" ? preset.nameFr : preset.nameEn;
}

/**
 * Récupère le nom d'un exercice selon la langue
 * Utilise directement les champs nameFr/nameEn stockés en DB
 */
export function getExerciseDisplayName(
  exercise: { name: string; nameFr?: string; nameEn?: string },
  language: AppLanguage
): string {
  // Utiliser les champs bilingues si disponibles
  if (language === "fr" && exercise.nameFr) {
    return exercise.nameFr;
  }
  if (language === "en" && exercise.nameEn) {
    return exercise.nameEn;
  }

  // Fallback : retourner le nom par défaut
  return exercise.name;
}

// === Exercices présets (basés sur exercices.md) ===
// Noms au singulier (désigne le type d'exercice, pas le nombre de répétitions)
export const PRESET_EXERCISES: PresetExercise[] = [
  // === PUSH - Pompe / Push-up ===
  { id: "pushup-incline", nameFr: "Pompe inclinée", nameEn: "Incline Push-up", category: "push", family: "pushup", difficulty: "novice", defaultMax: 30 },
  { id: "pushup", nameFr: "Pompe", nameEn: "Push-up", category: "push", family: "pushup", difficulty: "classique", defaultMax: 20 },
  { id: "pushup-decline", nameFr: "Pompe déclinée", nameEn: "Decline Push-up", category: "push", family: "pushup", difficulty: "intermediaire", defaultMax: 15 },
  { id: "pushup-archer", nameFr: "Pompe archer", nameEn: "Archer Push-up", category: "push", family: "pushup", difficulty: "avance", defaultMax: 8 },
  { id: "pushup-onearm", nameFr: "Pompe à un bras", nameEn: "One-arm Push-up", category: "push", family: "pushup", difficulty: "expert", defaultMax: 3 },

  // === PUSH - Pompe pike / Pike Push-up ===
  { id: "pike-incline", nameFr: "Pompe pike inclinée", nameEn: "Incline Pike Push-up", category: "push", family: "pike", difficulty: "novice", defaultMax: 20 },
  { id: "pike", nameFr: "Pompe pike", nameEn: "Pike Push-up", category: "push", family: "pike", difficulty: "classique", defaultMax: 15 },
  { id: "pike-elevated", nameFr: "Pompe pike surélevée", nameEn: "Elevated Pike Push-up", category: "push", family: "pike", difficulty: "intermediaire", defaultMax: 10 },
  { id: "pike-deficit", nameFr: "Pompe pike déficit", nameEn: "Deficit Pike Push-up", category: "push", family: "pike", difficulty: "avance", defaultMax: 8 },
  { id: "pike-handstand", nameFr: "Pike vers équilibre", nameEn: "Pike to Handstand", category: "push", family: "pike", difficulty: "expert", defaultMax: 5 },

  // === PUSH - HSPU (Handstand Push-Up) ===
  { id: "hspu-wall", nameFr: "HSPU au mur", nameEn: "Wall HSPU", category: "push", family: "hspu", difficulty: "intermediaire", defaultMax: 8 },
  { id: "hspu-free", nameFr: "HSPU libre", nameEn: "Freestanding HSPU", category: "push", family: "hspu", difficulty: "avance", defaultMax: 5 },
  { id: "hspu-deficit", nameFr: "HSPU déficit", nameEn: "Deficit HSPU", category: "push", family: "hspu", difficulty: "expert", defaultMax: 3 },

  // === PUSH - Dip ===
  { id: "dip", nameFr: "Dip", nameEn: "Dip", category: "push", family: "dip", difficulty: "classique", defaultMax: 10 },

  // === PULL - Traction / Pull-up ===
  { id: "row-australian", nameFr: "Tirage australien", nameEn: "Australian Row", category: "pull", family: "pullup", difficulty: "novice", defaultMax: 15 },
  { id: "pullup", nameFr: "Traction", nameEn: "Pull-up", category: "pull", family: "pullup", difficulty: "classique", defaultMax: 5 },
  { id: "pullup-chest", nameFr: "Traction poitrine", nameEn: "Chest-to-bar Pull-up", category: "pull", family: "pullup", difficulty: "intermediaire", defaultMax: 4 },
  { id: "pullup-archer", nameFr: "Traction archer", nameEn: "Archer Pull-up", category: "pull", family: "pullup", difficulty: "avance", defaultMax: 3 },
  { id: "pullup-onearm", nameFr: "Traction à un bras", nameEn: "One-arm Pull-up", category: "pull", family: "pullup", difficulty: "expert", defaultMax: 1 },

  // === PULL - Chin-up (traction supination) ===
  { id: "chinup-assisted", nameFr: "Chin-up assisté", nameEn: "Assisted Chin-up", category: "pull", family: "chinup", difficulty: "novice", defaultMax: 8 },
  { id: "chinup", nameFr: "Chin-up", nameEn: "Chin-up", category: "pull", family: "chinup", difficulty: "classique", defaultMax: 6 },
  { id: "chinup-chest", nameFr: "Chin-up poitrine", nameEn: "Chest-to-bar Chin-up", category: "pull", family: "chinup", difficulty: "intermediaire", defaultMax: 4 },
  { id: "chinup-onearm", nameFr: "Chin-up à un bras", nameEn: "One-arm Chin-up", category: "pull", family: "chinup", difficulty: "avance", defaultMax: 1 },

  // === PULL - Muscle-up ===
  { id: "pullup-explosive", nameFr: "Traction explosive", nameEn: "Explosive Pull-up", category: "pull", family: "muscleup", difficulty: "classique", defaultMax: 5 },
  { id: "pullup-high", nameFr: "Traction haute", nameEn: "High Pull-up", category: "pull", family: "muscleup", difficulty: "intermediaire", defaultMax: 4 },
  { id: "muscleup", nameFr: "Muscle-up", nameEn: "Muscle-up", category: "pull", family: "muscleup", difficulty: "avance", defaultMax: 2 },
  { id: "muscleup-strict", nameFr: "Muscle-up strict", nameEn: "Strict Muscle-up", category: "pull", family: "muscleup", difficulty: "expert", defaultMax: 1 },

  // === LEGS - Squat ===
  { id: "squat", nameFr: "Squat", nameEn: "Squat", category: "legs", family: "squat", difficulty: "novice", defaultMax: 30 },
  { id: "squat-bulgarian", nameFr: "Squat bulgare", nameEn: "Bulgarian Split Squat", category: "legs", family: "squat", difficulty: "classique", defaultMax: 12 },
  { id: "pistol-assisted", nameFr: "Pistol assisté", nameEn: "Assisted Pistol Squat", category: "legs", family: "squat", difficulty: "intermediaire", defaultMax: 6 },
  { id: "pistol", nameFr: "Pistol squat", nameEn: "Pistol Squat", category: "legs", family: "squat", difficulty: "avance", defaultMax: 3 },
  { id: "shrimp", nameFr: "Shrimp squat", nameEn: "Shrimp Squat", category: "legs", family: "squat", difficulty: "expert", defaultMax: 2 },

  // === LEGS - Hip hinge ===
  { id: "glute-bridge", nameFr: "Pont fessier", nameEn: "Glute Bridge", category: "legs", family: "hinge", difficulty: "novice", defaultMax: 20 },
  { id: "glute-bridge-single", nameFr: "Pont fessier une jambe", nameEn: "Single-leg Glute Bridge", category: "legs", family: "hinge", difficulty: "classique", defaultMax: 12 },
  { id: "nordic-assisted", nameFr: "Nordic curl assisté", nameEn: "Assisted Nordic Curl", category: "legs", family: "hinge", difficulty: "intermediaire", defaultMax: 5 },
  { id: "nordic", nameFr: "Nordic curl", nameEn: "Nordic Curl", category: "legs", family: "hinge", difficulty: "avance", defaultMax: 3 },
  { id: "nordic-slow", nameFr: "Nordic curl lent", nameEn: "Slow Nordic Curl", category: "legs", family: "hinge", difficulty: "expert", defaultMax: 2 },

  // === CORE (gainage/abdos) ===
  { id: "knee-raise", nameFr: "Relevé de genoux suspendu", nameEn: "Hanging Knee Raise", category: "core", family: "core", difficulty: "classique", defaultMax: 12 },
  { id: "leg-raise", nameFr: "Relevé de jambes suspendu", nameEn: "Hanging Leg Raise", category: "core", family: "core", difficulty: "intermediaire", defaultMax: 8 },
  { id: "toes-to-bar", nameFr: "Toes-to-bar", nameEn: "Toes-to-bar", category: "core", family: "core", difficulty: "avance", defaultMax: 6 },
  { id: "dragon-flag", nameFr: "Dragon flag", nameEn: "Dragon Flag", category: "core", family: "core", difficulty: "expert", defaultMax: 3 },
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
 * Couleur du badge selon le niveau (ancien système basé sur le max)
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

/**
 * Couleur du badge selon la difficulté de l'exercice
 */
export function getDifficultyColor(difficulty: ExerciseDifficulty): string {
  const colors: Record<ExerciseDifficulty, string> = {
    novice: "bg-green-500",
    classique: "bg-blue-500",
    intermediaire: "bg-purple-500",
    avance: "bg-orange-500",
    expert: "bg-red-500",
  };
  return colors[difficulty];
}

/**
 * Label français pour la difficulté
 */
export function getDifficultyLabel(difficulty: ExerciseDifficulty): string {
  const labels: Record<ExerciseDifficulty, string> = {
    novice: "Novice",
    classique: "Classique",
    intermediaire: "Intermédiaire",
    avance: "Avancé",
    expert: "Expert",
  };
  return labels[difficulty];
}

/**
 * Label pour la famille d'exercice selon la langue
 */
export function getFamilyLabel(family: ExerciseFamily, language: AppLanguage = "fr"): string {
  const labelsFr: Record<ExerciseFamily, string> = {
    pushup: "Pompe",
    pike: "Pompe pike",
    hspu: "HSPU",
    pullup: "Traction",
    chinup: "Chin-up",
    muscleup: "Muscle-up",
    dip: "Dip",
    squat: "Squat",
    hinge: "Hip hinge",
    core: "Core",
    custom: "Personnalisé",
  };
  const labelsEn: Record<ExerciseFamily, string> = {
    pushup: "Push-up",
    pike: "Pike Push-up",
    hspu: "HSPU",
    pullup: "Pull-up",
    chinup: "Chin-up",
    muscleup: "Muscle-up",
    dip: "Dip",
    squat: "Squat",
    hinge: "Hip Hinge",
    core: "Core",
    custom: "Custom",
  };
  return language === "fr" ? labelsFr[family] : labelsEn[family];
}

/**
 * Récupère les variantes d'une famille d'exercices
 */
export function getExercisesByFamily(family: ExerciseFamily): typeof PRESET_EXERCISES {
  return PRESET_EXERCISES.filter((e) => e.family === family);
}
