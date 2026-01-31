// ============================================
// Utilitaires de comparaison de progression
// ============================================

import type { Workout, WorkoutSet } from "@/types";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
  isWithinInterval,
  parseISO,
} from "date-fns";

// === Types ===

export interface PeriodStats {
  totalReps: number;
  totalWorkouts: number;
  averageRepsPerWorkout: number;
  totalDuration: number; // en minutes
}

export interface PeriodComparison {
  current: PeriodStats;
  previous: PeriodStats;
  variation: number; // pourcentage de variation (+/-)
  trend: "up" | "down" | "neutral";
}

export interface PersonalRecord {
  value: number;
  date: string; // ISO date
  workoutId: string;
}

export interface PersonalRecords {
  bestRepsPerMinute: PersonalRecord | null;
  bestTotalReps: PersonalRecord | null;
  longestSet: PersonalRecord | null; // plus long set en minutes
  maxRepsPerMinute: number;
  maxTotalReps: number;
  bestWorkoutDate: string | null;
  totalWorkouts: number;
}

export interface ProgressionRateResult {
  firstVolume: number;
  lastVolume: number;
  percentageChange: number | null;
  trend: "up" | "down" | "neutral";
}

// === Helpers ===

/**
 * Filtre les workouts pour un exercice donne
 */
function filterWorkoutsForExercise(
  workouts: Workout[],
  exerciseName: string
): Workout[] {
  return workouts.filter((w) =>
    w.sets.some((s) => s.exerciseName.toLowerCase() === exerciseName.toLowerCase())
  );
}

/**
 * Extrait les sets pour un exercice donne depuis les workouts
 */
function getExerciseSets(workouts: Workout[], exerciseName: string): WorkoutSet[] {
  return workouts.flatMap((w) =>
    w.sets.filter((s) => s.exerciseName.toLowerCase() === exerciseName.toLowerCase())
  );
}

/**
 * Filtre les workouts dans une periode donnee
 */
function filterWorkoutsInPeriod(
  workouts: Workout[],
  start: Date,
  end: Date
): Workout[] {
  return workouts.filter((w) => {
    const date = parseISO(w.date);
    return isWithinInterval(date, { start, end });
  });
}

/**
 * Calcule les stats pour une periode donnee
 */
function calculatePeriodStats(
  workouts: Workout[],
  exerciseName: string
): PeriodStats {
  const relevantWorkouts = filterWorkoutsForExercise(workouts, exerciseName);
  const sets = getExerciseSets(relevantWorkouts, exerciseName);

  const totalReps = sets.reduce((sum, s) => sum + s.totalReps, 0);
  const totalDuration = sets.reduce(
    (sum, s) => sum + s.emomConfig.duration,
    0
  );

  return {
    totalReps,
    totalWorkouts: relevantWorkouts.length,
    averageRepsPerWorkout:
      relevantWorkouts.length > 0
        ? Math.round(totalReps / relevantWorkouts.length)
        : 0,
    totalDuration,
  };
}

/**
 * Calcule la variation en pourcentage entre deux valeurs
 */
function calculateVariation(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Determine la tendance basee sur la variation
 */
export function getTrend(diff: number): "up" | "down" | "neutral" {
  if (diff > 0) return "up";
  if (diff < 0) return "down";
  return "neutral";
}

/**
 * Formate un pourcentage avec signe
 */
export function formatPercentChange(percent: number): string {
  if (percent === 0) return "0%";
  const sign = percent > 0 ? "+" : "";
  return `${sign}${Math.round(percent)}%`;
}

// === Fonctions exportees ===

/**
 * Compare la progression de la semaine actuelle vs precedente
 */
export function getWeeklyComparison(
  workouts: Workout[],
  exerciseName: string
): PeriodComparison {
  const now = new Date();

  // Semaine actuelle
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const currentWeekWorkouts = filterWorkoutsInPeriod(
    workouts,
    currentWeekStart,
    currentWeekEnd
  );

  // Semaine precedente
  const previousWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const previousWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const previousWeekWorkouts = filterWorkoutsInPeriod(
    workouts,
    previousWeekStart,
    previousWeekEnd
  );

  const current = calculatePeriodStats(currentWeekWorkouts, exerciseName);
  const previous = calculatePeriodStats(previousWeekWorkouts, exerciseName);

  const variation = calculateVariation(current.totalReps, previous.totalReps);

  return {
    current,
    previous,
    variation,
    trend: getTrend(variation),
  };
}

/**
 * Compare la progression du mois actuel vs precedent
 */
export function getMonthlyComparison(
  workouts: Workout[],
  exerciseName: string
): PeriodComparison {
  const now = new Date();

  // Mois actuel
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const currentMonthWorkouts = filterWorkoutsInPeriod(
    workouts,
    currentMonthStart,
    currentMonthEnd
  );

  // Mois precedent
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const previousMonthEnd = endOfMonth(subMonths(now, 1));
  const previousMonthWorkouts = filterWorkoutsInPeriod(
    workouts,
    previousMonthStart,
    previousMonthEnd
  );

  const current = calculatePeriodStats(currentMonthWorkouts, exerciseName);
  const previous = calculatePeriodStats(previousMonthWorkouts, exerciseName);

  const variation = calculateVariation(current.totalReps, previous.totalReps);

  return {
    current,
    previous,
    variation,
    trend: getTrend(variation),
  };
}

/**
 * Recupere les records personnels pour un exercice
 */
export function getPersonalRecords(
  workouts: Workout[],
  exerciseName: string
): PersonalRecords {
  const relevantWorkouts = filterWorkoutsForExercise(workouts, exerciseName);

  let bestRepsPerMinute: PersonalRecord | null = null;
  let bestTotalReps: PersonalRecord | null = null;
  let longestSet: PersonalRecord | null = null;

  for (const workout of relevantWorkouts) {
    const sets = workout.sets.filter(
      (s) => s.exerciseName.toLowerCase() === exerciseName.toLowerCase()
    );

    // Total reps dans ce workout pour cet exercice
    const workoutTotalReps = sets.reduce((sum, s) => sum + s.totalReps, 0);
    if (!bestTotalReps || workoutTotalReps > bestTotalReps.value) {
      bestTotalReps = {
        value: workoutTotalReps,
        date: workout.date,
        workoutId: workout.id,
      };
    }

    for (const set of sets) {
      // Reps par minute = totalReps / duration
      const repsPerMinute = set.totalReps / set.emomConfig.duration;
      if (!bestRepsPerMinute || repsPerMinute > bestRepsPerMinute.value) {
        bestRepsPerMinute = {
          value: Math.round(repsPerMinute * 10) / 10, // 1 decimale
          date: workout.date,
          workoutId: workout.id,
        };
      }

      // Plus long set en minutes
      if (!longestSet || set.emomConfig.duration > longestSet.value) {
        longestSet = {
          value: set.emomConfig.duration,
          date: workout.date,
          workoutId: workout.id,
        };
      }
    }
  }

  const relevantWorkoutsCount = filterWorkoutsForExercise(workouts, exerciseName).length;

  return {
    bestRepsPerMinute,
    bestTotalReps,
    longestSet,
    maxRepsPerMinute: bestRepsPerMinute?.value ?? 0,
    maxTotalReps: bestTotalReps?.value ?? 0,
    bestWorkoutDate: bestTotalReps?.date ?? null,
    totalWorkouts: relevantWorkoutsCount,
  };
}

/**
 * Calcule le taux de progression global (premiere vs derniere seance)
 */
export function getProgressionRate(
  workouts: Workout[],
  exerciseName: string
): ProgressionRateResult {
  const relevantWorkouts = filterWorkoutsForExercise(workouts, exerciseName);

  if (relevantWorkouts.length < 2) {
    return {
      firstVolume: 0,
      lastVolume: 0,
      percentageChange: null,
      trend: "neutral",
    };
  }

  // Trier par date
  const sorted = [...relevantWorkouts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const firstWorkout = sorted[0];
  const lastWorkout = sorted[sorted.length - 1];

  const firstSets = firstWorkout.sets.filter(
    (s) => s.exerciseName.toLowerCase() === exerciseName.toLowerCase()
  );
  const lastSets = lastWorkout.sets.filter(
    (s) => s.exerciseName.toLowerCase() === exerciseName.toLowerCase()
  );

  const firstVolume = firstSets.reduce((sum, s) => sum + s.totalReps, 0);
  const lastVolume = lastSets.reduce((sum, s) => sum + s.totalReps, 0);

  const percentageChange = calculateVariation(lastVolume, firstVolume);

  return {
    firstVolume,
    lastVolume,
    percentageChange,
    trend: getTrend(percentageChange),
  };
}

// === Comparaison globale hebdomadaire ===

export interface GlobalWeeklyStats {
  workouts: number;
  totalReps: number;
  totalDuration: number; // en secondes
}

export interface GlobalWeeklyComparison {
  currentWeek: GlobalWeeklyStats;
  previousWeek: GlobalWeeklyStats;
  workoutsDiff: number;
  repsDiff: number;
  durationDiff: number;
  workoutsPercent: number;
  repsPercent: number;
  durationPercent: number;
}

/**
 * Compare la semaine actuelle vs la semaine precedente (tous exercices confondus)
 */
export function getGlobalWeeklyComparison(
  workouts: Workout[]
): GlobalWeeklyComparison {
  const now = new Date();

  // Semaine actuelle
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const currentWeekWorkouts = filterWorkoutsInPeriod(
    workouts,
    currentWeekStart,
    currentWeekEnd
  );

  // Semaine precedente
  const previousWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const previousWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const previousWeekWorkouts = filterWorkoutsInPeriod(
    workouts,
    previousWeekStart,
    previousWeekEnd
  );

  const currentStats: GlobalWeeklyStats = {
    workouts: currentWeekWorkouts.length,
    totalReps: currentWeekWorkouts.reduce((sum, w) => sum + w.totalReps, 0),
    totalDuration: currentWeekWorkouts.reduce(
      (sum, w) => sum + w.totalDuration,
      0
    ),
  };

  const previousStats: GlobalWeeklyStats = {
    workouts: previousWeekWorkouts.length,
    totalReps: previousWeekWorkouts.reduce((sum, w) => sum + w.totalReps, 0),
    totalDuration: previousWeekWorkouts.reduce(
      (sum, w) => sum + w.totalDuration,
      0
    ),
  };

  return {
    currentWeek: currentStats,
    previousWeek: previousStats,
    workoutsDiff: currentStats.workouts - previousStats.workouts,
    repsDiff: currentStats.totalReps - previousStats.totalReps,
    durationDiff: currentStats.totalDuration - previousStats.totalDuration,
    workoutsPercent: calculateVariation(
      currentStats.workouts,
      previousStats.workouts
    ),
    repsPercent: calculateVariation(
      currentStats.totalReps,
      previousStats.totalReps
    ),
    durationPercent: calculateVariation(
      currentStats.totalDuration,
      previousStats.totalDuration
    ),
  };
}
