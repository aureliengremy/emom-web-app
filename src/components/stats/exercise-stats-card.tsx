"use client";

// ============================================
// Carte de statistiques par exercice
// Combine comparaison hebdo/mensuelle, records et tendance
// ============================================

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getWeeklyComparison,
  getMonthlyComparison,
  getPersonalRecords,
  getProgressionRate,
} from "@/lib/comparison-utils";
import type { Workout } from "@/types";
import {
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
  Calendar,
  Target,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Lazy load du mini graphique (optionnel)
const MiniTrendChart = dynamic(
  () => import("./mini-trend-chart").then((mod) => mod.MiniTrendChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-16 w-full" />,
  }
);

interface ExerciseStatsCardProps {
  exerciseName: string;
  workouts: Workout[];
  expanded?: boolean;
}

export function ExerciseStatsCard({
  exerciseName,
  workouts,
  expanded = false,
}: ExerciseStatsCardProps) {
  const [isOpen, setIsOpen] = useState(expanded);

  // Calcul des statistiques
  const weeklyComparison = useMemo(
    () => getWeeklyComparison(workouts, exerciseName),
    [workouts, exerciseName]
  );

  const monthlyComparison = useMemo(
    () => getMonthlyComparison(workouts, exerciseName),
    [workouts, exerciseName]
  );

  const personalRecords = useMemo(
    () => getPersonalRecords(workouts, exerciseName),
    [workouts, exerciseName]
  );

  const progressionRate = useMemo(
    () => getProgressionRate(workouts, exerciseName),
    [workouts, exerciseName]
  );

  // Pas de données pour cet exercice
  if (personalRecords.totalWorkouts === 0) {
    return (
      <Card className="opacity-60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{exerciseName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aucune donnee pour cet exercice
          </p>
        </CardContent>
      </Card>
    );
  }

  // Formatage du pourcentage avec signe
  const formatPercentage = (value: number | null): string => {
    if (value === null) return "-";
    const sign = value > 0 ? "+" : "";
    return `${sign}${Math.round(value)}%`;
  };

  // Couleur selon la tendance
  const getTrendColor = (value: number | null): string => {
    if (value === null) return "text-muted-foreground";
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  // Icone selon la tendance
  const TrendIcon = ({ value }: { value: number | null }) => {
    if (value === null || Math.abs(value) < 5) {
      return <Minus className="h-4 w-4" />;
    }
    if (value > 0) {
      return <TrendingUp className="h-4 w-4" />;
    }
    return <TrendingDown className="h-4 w-4" />;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="transition-all hover:shadow-md">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{exerciseName}</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {personalRecords.totalWorkouts} seance
                  {personalRecords.totalWorkouts > 1 ? "s" : ""}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {/* Indicateur de tendance global */}
                <span
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    getTrendColor(progressionRate.percentageChange)
                  )}
                >
                  <TrendIcon value={progressionRate.percentageChange} />
                  {formatPercentage(progressionRate.percentageChange)}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Section: Comparaison hebdo/mensuelle */}
            <div className="grid grid-cols-2 gap-3">
              {/* Semaine */}
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Cette semaine</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-semibold">
                    {weeklyComparison.current.totalReps}
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-xs font-medium",
                      getTrendColor(weeklyComparison.variation)
                    )}
                  >
                    <TrendIcon value={weeklyComparison.variation} />
                    {formatPercentage(weeklyComparison.variation)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  vs {weeklyComparison.previous.totalReps} sem. precedente
                </p>
              </div>

              {/* Mois */}
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Ce mois</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-semibold">
                    {monthlyComparison.current.totalReps}
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-xs font-medium",
                      getTrendColor(monthlyComparison.variation)
                    )}
                  >
                    <TrendIcon value={monthlyComparison.variation} />
                    {formatPercentage(monthlyComparison.variation)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  vs {monthlyComparison.previous.totalReps} mois precedent
                </p>
              </div>
            </div>

            {/* Section: Records personnels */}
            <div className="space-y-2">
              <h4 className="flex items-center gap-1 text-sm font-medium">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Records personnels
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-lg bg-muted/30 p-2">
                  <Target className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Max reps/min
                    </p>
                    <p className="font-semibold">
                      {personalRecords.maxRepsPerMinute}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted/30 p-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Max total reps
                    </p>
                    <p className="font-semibold">
                      {personalRecords.maxTotalReps}
                    </p>
                  </div>
                </div>
              </div>
              {personalRecords.bestWorkoutDate && (
                <p className="text-xs text-muted-foreground">
                  Meilleure seance :{" "}
                  {format(new Date(personalRecords.bestWorkoutDate), "d MMMM yyyy", {
                    locale: fr,
                  })}
                </p>
              )}
            </div>

            {/* Section: Mini graphique de tendance (optionnel) */}
            {personalRecords.totalWorkouts >= 3 && (
              <div className="space-y-2">
                <h4 className="flex items-center gap-1 text-sm font-medium">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Tendance
                </h4>
                <MiniTrendChart
                  workouts={workouts}
                  exerciseName={exerciseName}
                />
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
