"use client";

// ============================================
// Carte de statistiques de progression d'un exercice
// ============================================

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Activity, Flame, Target } from "lucide-react";
import type { Workout } from "@/types";

interface ExerciseStatsCardProps {
  workouts: Workout[];
  exerciseId: string;
}

interface ExerciseStats {
  totalWorkouts: number;
  totalReps: number;
  avgReps: number;
  progression: number | null; // % d'amelioration ou null si pas assez de donnees
}

function calculateStats(workouts: Workout[], exerciseId: string): ExerciseStats {
  // Filtrer les workouts qui contiennent cet exercice
  const relevantWorkouts = workouts.filter((w) =>
    w.sets.some((s) => s.exerciseId === exerciseId)
  );

  if (relevantWorkouts.length === 0) {
    return {
      totalWorkouts: 0,
      totalReps: 0,
      avgReps: 0,
      progression: null,
    };
  }

  // Calculer les reps pour cet exercice dans chaque workout
  const repsPerWorkout = relevantWorkouts.map((w) => {
    const set = w.sets.find((s) => s.exerciseId === exerciseId);
    return set?.totalReps ?? 0;
  });

  const totalReps = repsPerWorkout.reduce((sum, r) => sum + r, 0);
  const avgReps = Math.round(totalReps / repsPerWorkout.length);

  // Calculer la progression (5 dernieres vs 5 premieres seances)
  let progression: number | null = null;

  if (relevantWorkouts.length >= 4) {
    // Trier par date (du plus ancien au plus recent)
    const sortedByDate = [...relevantWorkouts].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const oldWorkouts = sortedByDate.slice(0, Math.min(3, Math.floor(sortedByDate.length / 2)));
    const recentWorkouts = sortedByDate.slice(-Math.min(3, Math.ceil(sortedByDate.length / 2)));

    const oldAvg =
      oldWorkouts.reduce((sum, w) => {
        const set = w.sets.find((s) => s.exerciseId === exerciseId);
        return sum + (set?.totalReps ?? 0);
      }, 0) / oldWorkouts.length;

    const recentAvg =
      recentWorkouts.reduce((sum, w) => {
        const set = w.sets.find((s) => s.exerciseId === exerciseId);
        return sum + (set?.totalReps ?? 0);
      }, 0) / recentWorkouts.length;

    if (oldAvg > 0) {
      progression = Math.round(((recentAvg - oldAvg) / oldAvg) * 100);
    }
  }

  return {
    totalWorkouts: relevantWorkouts.length,
    totalReps,
    avgReps,
    progression,
  };
}

export function ExerciseStatsCard({ workouts, exerciseId }: ExerciseStatsCardProps) {
  const stats = useMemo(
    () => calculateStats(workouts, exerciseId),
    [workouts, exerciseId]
  );

  // Ne rien afficher si pas assez de donnees
  if (stats.totalWorkouts < 2) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" />
          Progression
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Total seances */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold">{stats.totalWorkouts}</p>
              <p className="text-xs text-muted-foreground">Seances</p>
            </div>
          </div>

          {/* Total reps */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
              <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-lg font-bold">{stats.totalReps}</p>
              <p className="text-xs text-muted-foreground">Reps total</p>
            </div>
          </div>

          {/* Moyenne par seance */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-lg font-bold">{stats.avgReps}</p>
              <p className="text-xs text-muted-foreground">Moy. / seance</p>
            </div>
          </div>

          {/* Progression */}
          {stats.progression !== null && (
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  stats.progression >= 0
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-red-100 dark:bg-red-900"
                }`}
              >
                <TrendingUp
                  className={`h-5 w-5 ${
                    stats.progression >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400 rotate-180"
                  }`}
                />
              </div>
              <div>
                <p className="text-lg font-bold">
                  {stats.progression >= 0 ? "+" : ""}
                  {stats.progression}%
                </p>
                <p className="text-xs text-muted-foreground">Progression</p>
              </div>
            </div>
          )}
        </div>

        {/* Message si pas assez de donnees pour la progression */}
        {stats.progression === null && stats.totalWorkouts >= 2 && (
          <p className="mt-4 text-sm text-muted-foreground">
            Encore {4 - stats.totalWorkouts} seance{4 - stats.totalWorkouts > 1 ? "s" : ""} pour voir votre progression
          </p>
        )}
      </CardContent>
    </Card>
  );
}
