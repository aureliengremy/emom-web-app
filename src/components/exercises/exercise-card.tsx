"use client";

// ============================================
// Carte d'exercice
// ============================================

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Exercise } from "@/types";
import { getExerciseLevel, getLevelColor } from "@/data/emom-tables";
import { cn } from "@/lib/utils";

interface ExerciseCardProps {
  exercise: Exercise;
  onClick?: () => void;
  selected?: boolean;
}

export function ExerciseCard({
  exercise,
  onClick,
  selected = false,
}: ExerciseCardProps) {
  const level = getExerciseLevel(exercise.id, exercise.currentMax);
  const levelColor = getLevelColor(level);

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
            <span className="font-semibold">{exercise.name}</span>
            {exercise.type === "custom" && (
              <Badge variant="outline" className="text-xs">
                Custom
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Max: {exercise.currentMax}</span>
            <span>•</span>
            <span>
              {exercise.currentEMOM.reps} reps / EMOM {exercise.currentEMOM.duration}&apos;
              {exercise.currentEMOM.weighted && (
                <span className="ml-1">@ {exercise.currentEMOM.weight}kg</span>
              )}
            </span>
          </div>
        </div>
        <Badge className={cn("shrink-0", levelColor)}>
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </Badge>
      </CardContent>
    </Card>
  );
}
