// ============================================
// Utilitaires pour les charts de progression
// ============================================

import { startOfWeek, startOfMonth, format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { Workout } from "@/types";

export interface ChartDataPoint {
  date: string;
  label: string;
  volume: number;
}

/**
 * Extrait les noms d'exercices uniques de tous les workouts
 */
export function getUniqueExercises(workouts: Workout[]): string[] {
  const exerciseSet = new Set<string>();

  workouts.forEach((workout) => {
    workout.sets.forEach((set) => {
      exerciseSet.add(set.exerciseName);
    });
  });

  return Array.from(exerciseSet).sort();
}

/**
 * Calcule le volume total pour un exercice dans un workout
 */
function getExerciseVolumeInWorkout(
  workout: Workout,
  exerciseName: string
): number {
  return workout.sets
    .filter((set) => set.exerciseName === exerciseName)
    .reduce((sum, set) => sum + set.totalReps, 0);
}

/**
 * Agrège le volume par jour pour un exercice donné
 */
export function aggregateVolumeByDay(
  workouts: Workout[],
  exerciseName: string
): ChartDataPoint[] {
  const volumeByDay = new Map<string, number>();

  workouts.forEach((workout) => {
    const volume = getExerciseVolumeInWorkout(workout, exerciseName);
    if (volume > 0) {
      const dateKey = format(parseISO(workout.date), "yyyy-MM-dd");
      const existing = volumeByDay.get(dateKey) || 0;
      volumeByDay.set(dateKey, existing + volume);
    }
  });

  return Array.from(volumeByDay.entries())
    .map(([date, volume]) => ({
      date,
      label: format(parseISO(date), "d MMM", { locale: fr }),
      volume,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Agrège le volume par semaine pour un exercice donné
 */
export function aggregateVolumeByWeek(
  workouts: Workout[],
  exerciseName: string
): ChartDataPoint[] {
  const volumeByWeek = new Map<string, number>();

  workouts.forEach((workout) => {
    const volume = getExerciseVolumeInWorkout(workout, exerciseName);
    if (volume > 0) {
      const weekStart = startOfWeek(parseISO(workout.date), {
        weekStartsOn: 1,
        locale: fr,
      });
      const weekKey = format(weekStart, "yyyy-MM-dd");
      const existing = volumeByWeek.get(weekKey) || 0;
      volumeByWeek.set(weekKey, existing + volume);
    }
  });

  return Array.from(volumeByWeek.entries())
    .map(([date, volume]) => ({
      date,
      label: `Sem. ${format(parseISO(date), "d MMM", { locale: fr })}`,
      volume,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Agrège le volume par mois pour un exercice donné
 */
export function aggregateVolumeByMonth(
  workouts: Workout[],
  exerciseName: string
): ChartDataPoint[] {
  const volumeByMonth = new Map<string, number>();

  workouts.forEach((workout) => {
    const volume = getExerciseVolumeInWorkout(workout, exerciseName);
    if (volume > 0) {
      const monthStart = startOfMonth(parseISO(workout.date));
      const monthKey = format(monthStart, "yyyy-MM");
      const existing = volumeByMonth.get(monthKey) || 0;
      volumeByMonth.set(monthKey, existing + volume);
    }
  });

  return Array.from(volumeByMonth.entries())
    .map(([date, volume]) => ({
      date,
      label: format(parseISO(`${date}-01`), "MMM yyyy", { locale: fr }),
      volume,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Filtre les workouts qui contiennent au moins un des exercices sélectionnés
 */
export function filterWorkoutsByExercises(
  workouts: Workout[],
  exerciseNames: string[]
): Workout[] {
  if (exerciseNames.length === 0) {
    return workouts;
  }

  return workouts.filter((workout) =>
    workout.sets.some((set) => exerciseNames.includes(set.exerciseName))
  );
}
