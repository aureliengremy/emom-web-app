"use client";

// ============================================
// Graphique en barres des reps
// ============================================

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, subWeeks } from "date-fns";
import { fr } from "date-fns/locale";

interface WorkoutData {
  date: string;
  reps: number;
}

interface RepsBarChartProps {
  data: WorkoutData[];
  weeks?: number;
}

export function RepsBarChart({ data, weeks = 8 }: RepsBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
        Pas assez de données
      </div>
    );
  }

  // Créer les semaines
  const now = new Date();
  const startDate = subWeeks(now, weeks - 1);
  const weekIntervals = eachWeekOfInterval(
    { start: startDate, end: now },
    { weekStartsOn: 1 }
  );

  // Agréger les reps par semaine
  const weeklyData = weekIntervals.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekReps = data
      .filter((d) => {
        const date = new Date(d.date);
        return date >= weekStart && date <= weekEnd;
      })
      .reduce((sum, d) => sum + d.reps, 0);

    return {
      week: format(weekStart, "d MMM", { locale: fr }),
      reps: weekReps,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={weeklyData}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          vertical={false}
        />
        <XAxis
          dataKey="week"
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
          formatter={(value: number) => [`${value} reps`, "Volume"]}
        />
        <Bar
          dataKey="reps"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
