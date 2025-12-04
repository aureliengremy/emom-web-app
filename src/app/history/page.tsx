"use client";

// ============================================
// Page historique des séances
// ============================================

import { useEffect } from "react";
import Link from "next/link";
import { Container, Header, Main } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWorkoutStore } from "@/stores/workout-store";
import { formatDate, formatDuration } from "@/types";
import { ArrowLeft, Calendar, Clock, Repeat, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const RATING_COLORS = {
  easy: "bg-green-500/20 text-green-500",
  medium: "bg-yellow-500/20 text-yellow-500",
  hard: "bg-red-500/20 text-red-500",
};

const RATING_LABELS = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
};

export default function HistoryPage() {
  const { workoutHistory, isLoaded, loadWorkouts } = useWorkoutStore();

  // Charger les workouts au montage
  useEffect(() => {
    if (!isLoaded) {
      loadWorkouts();
    }
  }, [isLoaded, loadWorkouts]);

  // Afficher un loader pendant le chargement
  if (!isLoaded) {
    return (
      <Container>
        <Header>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Historique</h1>
          </div>
        </Header>
        <Main>
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Main>
      </Container>
    );
  }

  // Trier par date décroissante
  const sortedHistory = [...workoutHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Stats globales
  const totalWorkouts = workoutHistory.length;
  const totalReps = workoutHistory.reduce((sum, w) => sum + w.totalReps, 0);
  const totalDuration = workoutHistory.reduce(
    (sum, w) => sum + w.totalDuration,
    0
  );

  return (
    <Container>
      <Header>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Historique</h1>
        </div>
      </Header>

      <Main>
        {/* Stats globales */}
        {totalWorkouts > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="flex flex-col items-center p-3">
                <span className="text-xl font-bold">{totalWorkouts}</span>
                <span className="text-xs text-muted-foreground">Séances</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-3">
                <span className="text-xl font-bold">{totalReps}</span>
                <span className="text-xs text-muted-foreground">Reps total</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-3">
                <span className="text-xl font-bold">
                  {Math.round(totalDuration / 60)}
                </span>
                <span className="text-xs text-muted-foreground">Minutes</span>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Liste des séances */}
        {sortedHistory.length > 0 ? (
          <div className="space-y-3">
            {sortedHistory.map((workout) => (
              <Card key={workout.id}>
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatDate(workout.date)}
                      </span>
                    </div>
                    {workout.rating && (
                      <Badge className={cn(RATING_COLORS[workout.rating])}>
                        {RATING_LABELS[workout.rating]}
                      </Badge>
                    )}
                  </div>

                  {/* Sets */}
                  <div className="mb-3 space-y-1">
                    {workout.sets.map((set, index) => (
                      <div
                        key={set.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {index + 1}. {set.exerciseName}
                        </span>
                        <span>{set.totalReps} reps</span>
                      </div>
                    ))}
                  </div>

                  {/* Totaux */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDuration(workout.totalDuration)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Repeat className="h-3.5 w-3.5" />
                      {workout.totalReps} reps
                    </div>
                    {workout.completed && (
                      <div className="flex items-center gap-1 text-green-500">
                        <Star className="h-3.5 w-3.5" />
                        Terminé
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {workout.notes && (
                    <p className="mt-2 text-sm italic text-muted-foreground">
                      &ldquo;{workout.notes}&rdquo;
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Aucune séance enregistrée</p>
            <p className="text-sm text-muted-foreground">
              Commence un entraînement pour voir ton historique
            </p>
            <Link href="/" className="mt-4">
              <Button>Démarrer une séance</Button>
            </Link>
          </div>
        )}
      </Main>
    </Container>
  );
}
