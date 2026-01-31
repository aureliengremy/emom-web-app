"use client";

// ============================================
// Progress Comparison - Comparaison de progression
// Affiche la progression semaine/mois + records personnels
// ============================================

import { useMemo } from "react";
import { Trophy, TrendingUp, TrendingDown, Minus, Calendar, Clock, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Workout } from "@/types";
import {
  getWeeklyComparison,
  getMonthlyComparison,
  getPersonalRecords,
  type PeriodComparison,
} from "@/lib/comparison-utils";
import { formatDate } from "@/types";

interface ProgressComparisonProps {
  exerciseName: string;
  workouts: Workout[];
}

// Composant pour afficher la variation avec fleche coloree
function VariationBadge({ comparison }: { comparison: PeriodComparison }) {
  const { variation, trend } = comparison;

  if (trend === "neutral") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Minus className="h-3 w-3" />
        <span>0%</span>
      </Badge>
    );
  }

  if (trend === "up") {
    return (
      <Badge className="gap-1 bg-green-500 hover:bg-green-600">
        <TrendingUp className="h-3 w-3" />
        <span>+{variation}%</span>
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="gap-1">
      <TrendingDown className="h-3 w-3" />
      <span>{variation}%</span>
    </Badge>
  );
}

// Composant pour une ligne de comparaison (semaine ou mois)
function ComparisonRow({
  label,
  comparison,
}: {
  label: string;
  comparison: PeriodComparison;
}) {
  const { current, previous } = comparison;

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">
          {current.totalReps} reps ({current.totalWorkouts} seances)
        </span>
      </div>
      <div className="flex flex-col items-end gap-1">
        <VariationBadge comparison={comparison} />
        <span className="text-xs text-muted-foreground">
          vs {previous.totalReps} reps
        </span>
      </div>
    </div>
  );
}

// Composant pour afficher un record personnel
function RecordItem({
  icon: Icon,
  label,
  value,
  unit,
  date,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  unit: string;
  date: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
        <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{unit}</p>
      </div>
    </div>
  );
}

export function ProgressComparison({
  exerciseName,
  workouts,
}: ProgressComparisonProps) {
  // Calcul des comparaisons avec useMemo pour eviter les recalculs
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

  // Verification si on a des donnees
  const hasData =
    weeklyComparison.current.totalWorkouts > 0 ||
    weeklyComparison.previous.totalWorkouts > 0 ||
    monthlyComparison.current.totalWorkouts > 0 ||
    monthlyComparison.previous.totalWorkouts > 0;

  const hasRecords =
    personalRecords.bestRepsPerMinute ||
    personalRecords.bestTotalReps ||
    personalRecords.longestSet;

  if (!hasData && !hasRecords) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">
            Pas encore de donnees pour {exerciseName}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Comparaisons de progression */}
      {hasData && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Progression
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ComparisonRow
              label="Cette semaine"
              comparison={weeklyComparison}
            />
            <ComparisonRow
              label="Ce mois"
              comparison={monthlyComparison}
            />
          </CardContent>
        </Card>
      )}

      {/* Records personnels */}
      {hasRecords && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Records personnels
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {personalRecords.bestTotalReps && (
              <RecordItem
                icon={Target}
                label="Meilleur total"
                value={personalRecords.bestTotalReps.value}
                unit="reps"
                date={personalRecords.bestTotalReps.date}
              />
            )}
            {personalRecords.bestRepsPerMinute && (
              <RecordItem
                icon={TrendingUp}
                label="Meilleur reps/min"
                value={personalRecords.bestRepsPerMinute.value}
                unit="reps/min"
                date={personalRecords.bestRepsPerMinute.date}
              />
            )}
            {personalRecords.longestSet && (
              <RecordItem
                icon={Clock}
                label="Plus long set"
                value={personalRecords.longestSet.value}
                unit="minutes"
                date={personalRecords.longestSet.date}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
