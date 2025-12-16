"use client";

// ============================================
// Page historique des séances
// ============================================

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Container, Header, Main } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VolumeAreaChart } from "@/components/charts/volume-area-chart";
import { useWorkoutStore } from "@/stores/workout-store";
import { useAuthStore } from "@/stores/auth-store";
import { formatDate, formatDuration } from "@/types";
import {
  getUniqueExercises,
  aggregateVolumeByDay,
  aggregateVolumeByWeek,
  aggregateVolumeByMonth,
  filterWorkoutsByExercises,
} from "@/lib/chart-utils";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Repeat,
  Star,
  Loader2,
  TrendingUp,
} from "lucide-react";
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

type Granularity = "day" | "week" | "month";

export default function HistoryPage() {
  const { workoutHistory, isLoaded, loadWorkouts } = useWorkoutStore();
  const { isInitialized, initialize, user } = useAuthStore();

  // États pour le chart
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [granularity, setGranularity] = useState<Granularity>("day");

  // États pour les filtres de la liste
  const [exerciseFilters, setExerciseFilters] = useState<string[]>([]);

  // Initialiser l'auth puis charger les workouts
  useEffect(() => {
    const init = async () => {
      if (!isInitialized) {
        await initialize();
      }
    };
    init();
  }, [isInitialized, initialize]);

  // Charger les workouts quand l'utilisateur change
  useEffect(() => {
    if (isInitialized && user) {
      loadWorkouts();
    }
  }, [isInitialized, user?.id, loadWorkouts]);

  // Extraire les exercices uniques
  const exercises = useMemo(
    () => getUniqueExercises(workoutHistory),
    [workoutHistory]
  );

  // Sélectionner le premier exercice par défaut
  useEffect(() => {
    if (exercises.length > 0 && !selectedExercise) {
      setSelectedExercise(exercises[0]);
    }
  }, [exercises, selectedExercise]);

  // Données pour le chart
  const chartData = useMemo(() => {
    if (!selectedExercise) return [];
    if (granularity === "month") {
      return aggregateVolumeByMonth(workoutHistory, selectedExercise);
    }
    if (granularity === "week") {
      return aggregateVolumeByWeek(workoutHistory, selectedExercise);
    }
    return aggregateVolumeByDay(workoutHistory, selectedExercise);
  }, [workoutHistory, selectedExercise, granularity]);

  // Toggle un filtre exercice
  const toggleExerciseFilter = (exercise: string) => {
    setExerciseFilters((prev) =>
      prev.includes(exercise)
        ? prev.filter((e) => e !== exercise)
        : [...prev, exercise]
    );
  };

  // Trier et filtrer les workouts
  const sortedHistory = useMemo(() => {
    const sorted = [...workoutHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return filterWorkoutsByExercises(sorted, exerciseFilters);
  }, [workoutHistory, exerciseFilters]);

  // Stats globales
  const totalWorkouts = workoutHistory.length;
  const totalReps = workoutHistory.reduce((sum, w) => sum + w.totalReps, 0);
  const totalDuration = workoutHistory.reduce(
    (sum, w) => sum + w.totalDuration,
    0
  );

  // Afficher un loader pendant le chargement
  if (!isInitialized) {
    return (
      <Container wide>
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

  // Afficher une invitation à créer un compte si non connecté
  if (!user) {
    return (
      <Container wide>
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
          <Card className="mx-auto max-w-md">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="mb-2 text-lg font-semibold">
                Connecte-toi pour voir ton historique
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Crée un compte gratuit pour sauvegarder tes séances et suivre ta progression au fil du temps.
              </p>
              <div className="flex flex-col gap-2 w-full">
                <Link href="/auth/login?tab=login" className="w-full">
                  <Button className="w-full">
                    Se connecter
                  </Button>
                </Link>
                <Link href="/auth/login?tab=signup" className="w-full">
                  <Button variant="outline" className="w-full">
                    Créer un compte
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </Main>
      </Container>
    );
  }

  return (
    <Container wide>
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
        {/* Section Chart */}
        {totalWorkouts > 0 && exercises.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4" />
                  Progression du volume
                </CardTitle>
                <div className="flex items-center gap-2">
                  {/* Sélecteur d'exercice */}
                  <Select
                    value={selectedExercise}
                    onValueChange={setSelectedExercise}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Exercice" />
                    </SelectTrigger>
                    <SelectContent>
                      {exercises.map((ex) => (
                        <SelectItem key={ex} value={ex}>
                          {ex}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Toggle Jour/Semaine/Mois */}
                  <div className="flex rounded-md border">
                    <Button
                      variant={granularity === "day" ? "secondary" : "ghost"}
                      size="sm"
                      className="rounded-r-none"
                      onClick={() => setGranularity("day")}
                    >
                      Jour
                    </Button>
                    <Button
                      variant={granularity === "week" ? "secondary" : "ghost"}
                      size="sm"
                      className="rounded-none border-x"
                      onClick={() => setGranularity("week")}
                    >
                      Sem.
                    </Button>
                    <Button
                      variant={granularity === "month" ? "secondary" : "ghost"}
                      size="sm"
                      className="rounded-l-none"
                      onClick={() => setGranularity("month")}
                    >
                      Mois
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <VolumeAreaChart
                data={chartData}
                exerciseName={selectedExercise}
              />
            </CardContent>
          </Card>
        )}

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

        {/* Filtres par exercice */}
        {exercises.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-sm text-muted-foreground">
              Filtrer par exercice :
            </p>
            <div className="flex flex-wrap gap-2">
              {exercises.map((ex) => (
                <Badge
                  key={ex}
                  variant={exerciseFilters.includes(ex) ? "default" : "outline"}
                  className="cursor-pointer transition-colors hover:bg-primary/80"
                  onClick={() => toggleExerciseFilter(ex)}
                >
                  {ex}
                </Badge>
              ))}
              {exerciseFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setExerciseFilters([])}
                >
                  Effacer
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Liste des séances */}
        {sortedHistory.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
        ) : exerciseFilters.length > 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              Aucune séance pour ces exercices
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setExerciseFilters([])}
            >
              Afficher toutes les séances
            </Button>
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
