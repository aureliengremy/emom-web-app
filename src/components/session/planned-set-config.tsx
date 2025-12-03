"use client";

// ============================================
// Configuration d'un set planifié
// ============================================

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import type { PlannedSet } from "@/types";
import { EMOM_DURATIONS } from "@/types";
import { useSessionStore } from "@/stores/session-store";
import { cn } from "@/lib/utils";
import { Minus, Plus, Trash2 } from "lucide-react";

interface PlannedSetConfigProps {
  set: PlannedSet | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlannedSetConfig({
  set,
  open,
  onOpenChange,
}: PlannedSetConfigProps) {
  const { updateSetConfig, removeSet } = useSessionStore();

  if (!set) return null;

  const handleDurationChange = (duration: number) => {
    updateSetConfig(set.id, { duration });
  };

  const handleRepsChange = (delta: number) => {
    const newReps = Math.max(1, set.reps + delta);
    updateSetConfig(set.id, { reps: newReps });
  };

  const handleRemove = () => {
    removeSet(set.id);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{set.exerciseName}</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-6 p-4 pb-8">
          {/* Durée du set */}
          <div>
            <label className="mb-3 block text-sm font-medium text-muted-foreground">
              Durée du set
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOM_DURATIONS.map((duration) => (
                <Button
                  key={duration}
                  variant={set.duration === duration ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDurationChange(duration)}
                  className={cn(
                    "min-w-[60px]",
                    set.duration === duration && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  {duration} min
                </Button>
              ))}
            </div>
          </div>

          {/* Nombre de reps */}
          <div>
            <label className="mb-3 block text-sm font-medium text-muted-foreground">
              Reps par minute
            </label>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12"
                onClick={() => handleRepsChange(-1)}
              >
                <Minus className="h-5 w-5" />
              </Button>
              <span className="min-w-[80px] text-center text-3xl font-bold">
                {set.reps}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12"
                onClick={() => handleRepsChange(1)}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Récap */}
          <div className="rounded-lg bg-card p-4 text-center">
            <p className="text-sm text-muted-foreground">Total estimé</p>
            <p className="text-2xl font-bold">
              {set.reps * set.duration} reps
            </p>
            <p className="text-sm text-muted-foreground">
              en {set.duration} minutes
            </p>
          </div>

          {/* Supprimer */}
          <Button
            variant="destructive"
            className="gap-2"
            onClick={handleRemove}
          >
            <Trash2 className="h-4 w-4" />
            Retirer de la séance
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
