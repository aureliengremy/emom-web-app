"use client";

// ============================================
// Page fin de workout
// ============================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkoutStore } from "@/stores/workout-store";
import { useSessionStore } from "@/stores/session-store";
import { formatDuration, type WorkoutRating } from "@/types";
import { Trophy, Clock, Repeat, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const RATING_OPTIONS: { value: WorkoutRating; emoji: string; label: string }[] = [
  { value: "easy", emoji: "😊", label: "Facile" },
  { value: "medium", emoji: "😐", label: "Moyen" },
  { value: "hard", emoji: "🥵", label: "Dur" },
];

export default function WorkoutCompletePage() {
  const router = useRouter();
  const { currentWorkout, finishWorkout } = useWorkoutStore();
  const { clearSession } = useSessionStore();
  const [selectedRating, setSelectedRating] = useState<WorkoutRating | null>(null);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!currentWorkout) {
    router.push("/");
    return null;
  }

  // Calculer les stats
  const totalReps = currentWorkout.sets.reduce((sum, s) => sum + s.totalReps, 0);
  const totalDuration = currentWorkout.sets.reduce(
    (sum, s) => sum + s.actualDuration,
    0
  );
  const setsCompleted = currentWorkout.sets.filter((s) => s.completed).length;

  const handleFinish = async () => {
    setIsSaving(true);
    await finishWorkout(selectedRating ?? undefined, notes || undefined);
    clearSession();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background p-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <Trophy className="mx-auto mb-4 h-16 w-16 text-primary" />
        <h1 className="mb-2 text-2xl font-bold">Séance terminée !</h1>
        <p className="text-muted-foreground">Excellent travail</p>
      </div>

      {/* Stats */}
      <div className="mx-auto mb-8 grid w-full max-w-lg grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex flex-col items-center p-4">
            <Repeat className="mb-2 h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">{totalReps}</span>
            <span className="text-xs text-muted-foreground">Reps</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-4">
            <Clock className="mb-2 h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">{formatDuration(totalDuration)}</span>
            <span className="text-xs text-muted-foreground">Durée</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-4">
            <Trophy className="mb-2 h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">{setsCompleted}</span>
            <span className="text-xs text-muted-foreground">Sets</span>
          </CardContent>
        </Card>
      </div>

      {/* Détail des sets */}
      <div className="mx-auto mb-8 w-full max-w-lg">
        <h2 className="mb-3 text-lg font-semibold">Détail</h2>
        <div className="flex flex-col gap-2">
          {currentWorkout.sets.map((set, index) => (
            <Card key={set.id}>
              <CardContent className="flex items-center justify-between p-3">
                <span className="font-medium">
                  {index + 1}. {set.exerciseName}
                </span>
                <span className="text-muted-foreground">
                  {set.totalReps} reps en {formatDuration(set.actualDuration)}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="mx-auto mb-6 w-full max-w-lg">
        <h2 className="mb-3 text-lg font-semibold">Comment c&apos;était ?</h2>
        <div className="flex justify-center gap-4">
          {RATING_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedRating(option.value)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl p-4 transition-all",
                selectedRating === option.value
                  ? "bg-primary/20 ring-2 ring-primary"
                  : "bg-card hover:bg-card/80"
              )}
            >
              <span className="text-3xl">{option.emoji}</span>
              <span className="text-xs">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mx-auto mb-8 w-full max-w-lg">
        <h2 className="mb-3 text-lg font-semibold">Notes (optionnel)</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ressenti, forme du jour..."
          className="w-full rounded-xl bg-card p-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          rows={3}
        />
      </div>

      {/* Bouton terminer */}
      <div className="mx-auto w-full max-w-lg">
        <Button
          size="lg"
          className="w-full gap-2"
          onClick={handleFinish}
          disabled={isSaving}
        >
          <Home className="h-5 w-5" />
          {isSaving ? "Sauvegarde..." : "Terminer"}
        </Button>
      </div>
    </div>
  );
}
