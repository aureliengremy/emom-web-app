"use client";

// ============================================
// Mini graphique de tendance pour un exercice
// Version compacte du ProgressChart
// ============================================

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { Workout } from "@/types";

interface MiniTrendChartProps {
  workouts: Workout[];
  exerciseName: string;
}

interface DataPoint {
  date: string;
  formattedDate: string;
  volume: number;
}

export function MiniTrendChart({ workouts, exerciseName }: MiniTrendChartProps) {
  // Prepare data points from workouts
  const data: DataPoint[] = useMemo(() => {
    // Filter workouts that contain this exercise
    const relevantWorkouts = workouts.filter((workout) =>
      workout.sets.some((set) => set.exerciseName === exerciseName)
    );

    // Sort by date ascending
    const sortedWorkouts = [...relevantWorkouts].sort(
      (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
    );

    // Keep only last 10 workouts for readability
    const recentWorkouts = sortedWorkouts.slice(-10);

    // Map to data points
    return recentWorkouts.map((workout) => {
      const volume = workout.sets
        .filter((set) => set.exerciseName === exerciseName)
        .reduce((sum, set) => sum + set.totalReps, 0);

      return {
        date: workout.date,
        formattedDate: format(parseISO(workout.date), "d MMM", { locale: fr }),
        volume,
      };
    });
  }, [workouts, exerciseName]);

  if (data.length < 2) {
    return (
      <div className="flex h-16 items-center justify-center text-xs text-muted-foreground">
        Pas assez de donnees pour afficher la tendance
      </div>
    );
  }

  return (
    <div className="h-16 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="formattedDate"
            hide
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
              fontSize: "12px",
              padding: "4px 8px",
            }}
            labelStyle={{
              color: "hsl(var(--foreground))",
              fontWeight: "600",
              marginBottom: "2px",
            }}
            formatter={(value: number) => [`${value} reps`, "Volume"]}
            labelFormatter={(label) => label}
          />
          <Area
            type="monotone"
            dataKey="volume"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#colorVolume)"
            dot={false}
            activeDot={{
              r: 4,
              fill: "hsl(var(--primary))",
              strokeWidth: 0,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
