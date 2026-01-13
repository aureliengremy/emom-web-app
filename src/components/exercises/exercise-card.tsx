"use client";

// ============================================
// Carte d'exercice
// ============================================

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Exercise } from "@/types";
import {
  getDifficultyColor,
  getDifficultyLabel,
  getFamilyLabel,
  getExerciseDisplayName,
} from "@/data/emom-tables";
import { useSettingsStore } from "@/stores/settings-store";
import { cn } from "@/lib/utils";

interface ExerciseCardProps {
  exercise: Exercise;
  onClick?: () => void;
  selected?: boolean;
}

export const ExerciseCard = memo(function ExerciseCard({
  exercise,
  onClick,
  selected = false,
}: ExerciseCardProps) {
  const language = useSettingsStore((s) => s.settings.language);

  // Nom de l'exercice selon la langue
  const displayName = getExerciseDisplayName(exercise, language);

  // Utiliser la difficulté de l'exercice si disponible
  const difficultyColor = exercise.difficulty
    ? getDifficultyColor(exercise.difficulty)
    : "bg-gray-500";
  const difficultyLabel = exercise.difficulty
    ? getDifficultyLabel(exercise.difficulty)
    : "N/A";

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all active:scale-[0.98]",
        selected && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{displayName}</span>
            {exercise.type === "custom" && (
              <Badge variant="outline" className="text-xs">
                Custom
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {exercise.family && (
              <>
                <span>{getFamilyLabel(exercise.family, language)}</span>
                <span>•</span>
              </>
            )}
            <span>Max: {exercise.currentMax}</span>
            <span>•</span>
            <span>
              {exercise.currentEMOM.reps} reps / {exercise.currentEMOM.duration}&apos;
            </span>
          </div>
        </div>
        <Badge className={cn("shrink-0", difficultyColor)}>
          {difficultyLabel}
        </Badge>
      </CardContent>
    </Card>
  );
});
