"use client";

// ============================================
// Composant Records Personnels
// Affiche les records pour un exercice donne
// ============================================

import { useMemo } from "react";
import { Trophy, Star, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPersonalRecords, type PersonalRecord } from "@/lib/comparison-utils";
import { formatDate } from "@/types";
import type { Workout } from "@/types";

interface PersonalRecordsProps {
  exerciseName: string;
  workouts: Workout[];
}

interface RecordItemProps {
  icon: React.ReactNode;
  label: string;
  record: PersonalRecord;
  unit: string;
}

// Composant pour afficher un record individuel
function RecordItem({ icon, label, record, unit }: RecordItemProps) {
  const hasRecord = record.value > 0 && record.date;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200/50 dark:border-amber-800/50">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white shadow-md">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {hasRecord ? (
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-foreground">
              {record.value}
            </span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground italic">
            Pas encore de record
          </span>
        )}
      </div>
      {hasRecord && record.date && (
        <Badge
          variant="outline"
          className="flex-shrink-0 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700"
        >
          {formatDate(record.date)}
        </Badge>
      )}
    </div>
  );
}

export function PersonalRecords({ exerciseName, workouts }: PersonalRecordsProps) {
  // Calcule les records pour cet exercice
  const records = useMemo(
    () => getPersonalRecords(workouts, exerciseName),
    [workouts, exerciseName]
  );

  // Verifie s'il y a au moins un record
  const hasAnyRecord =
    (records.bestRepsPerMinute?.value ?? 0) > 0 ||
    (records.bestTotalReps?.value ?? 0) > 0 ||
    (records.longestSet?.value ?? 0) > 0;

  if (!hasAnyRecord) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-5 w-5 text-amber-500" />
            Records personnels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun record pour {exerciseName}.
            <br />
            Completez des seances pour etablir vos records !
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-5 w-5 text-amber-500" />
          Records personnels - {exerciseName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {records.bestRepsPerMinute && (
          <RecordItem
            icon={<Star className="h-5 w-5" />}
            label="Meilleur reps/minute"
            record={records.bestRepsPerMinute}
            unit="reps"
          />
        )}
        {records.bestTotalReps && (
          <RecordItem
            icon={<Trophy className="h-5 w-5" />}
            label="Meilleur total en une seance"
            record={records.bestTotalReps}
            unit="reps"
          />
        )}
        {records.longestSet && (
          <RecordItem
            icon={<Award className="h-5 w-5" />}
            label="Plus long set"
            record={records.longestSet}
            unit="min"
          />
        )}

        {records.totalWorkouts > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Basé sur {records.totalWorkouts} séance{records.totalWorkouts > 1 ? "s" : ""} avec {exerciseName}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
