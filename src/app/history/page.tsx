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
import { formatDate, formatDuration, type WorkoutRating, type Workout } from "@/types";
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
  TrendingUp,
  Pencil,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
  const { workoutHistory, isLoaded, loadWorkouts, updateWorkoutFeedback } = useWorkoutStore();
  const { isInitialized, initialize, user } = useAuthStore();

  // États pour le chart
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [granularity, setGranularity] = useState<Granularity>("day");

  // États pour les filtres de la liste
  const [exerciseFilters, setExerciseFilters] = useState<string[]>([]);

  // États pour la modale d'édition
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [editRating, setEditRating] = useState<WorkoutRating | undefined>(undefined);
  const [editNotes, setEditNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const MAX_NOTES_LENGTH = 1000;

  const RATING_OPTIONS: { value: WorkoutRating; emoji: string; label: string }[] = [
    { value: "easy", emoji: "😊", label: "Facile" },
    { value: "medium", emoji: "😐", label: "Moyen" },
    { value: "hard", emoji: "🥵", label: "Dur" },
  ];

  const openEditModal = (workout: Workout) => {
    setEditingWorkout(workout);
    setEditRating(workout.rating);
    setEditNotes(workout.notes || "");
  };

  const closeEditModal = () => {
    setEditingWorkout(null);
    setEditRating(undefined);
    setEditNotes("");
  };

  const handleSaveEdit = async () => {
    if (!editingWorkout) return;

    setIsSaving(true);
    try {
      await updateWorkoutFeedback(editingWorkout.id, editRating, editNotes.trim() || undefined);
      closeEditModal();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    } finally {
      setIsSaving(false);
    }
  };

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

  // Afficher un skeleton pendant le chargement
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
          {/* Skeleton du chart */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-40" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-32" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>

          {/* Skeleton des stats */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="flex flex-col items-center p-3">
                  <Skeleton className="mb-1 h-6 w-12" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Skeleton des filtres */}
          <div className="mb-4">
            <Skeleton className="mb-2 h-4 w-32" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-6 w-20 rounded-full" />
              ))}
            </div>
          </div>

          {/* Skeleton des workout cards */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <div className="mb-3 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
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

                  {/* Bouton modifier */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 w-full gap-2"
                    onClick={() => openEditModal(workout)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Modifier le ressenti
                  </Button>
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

        {/* Modale d'édition du feedback */}
        {editingWorkout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Modifier le ressenti</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeEditModal}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(editingWorkout.date)}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rating */}
                <div>
                  <p className="mb-2 text-sm font-medium">Ressenti</p>
                  <div className="flex justify-center gap-4">
                    {RATING_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setEditRating(option.value)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-xl p-3 transition-all",
                          editRating === option.value
                            ? "bg-primary/20 ring-2 ring-primary"
                            : "bg-muted hover:bg-muted/80"
                        )}
                      >
                        <span className="text-2xl">{option.emoji}</span>
                        <span className="text-xs">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium">Notes (optionnel)</p>
                    <span className="text-xs text-muted-foreground">
                      {editNotes.length}/{MAX_NOTES_LENGTH}
                    </span>
                  </div>
                  <textarea
                    value={editNotes}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_NOTES_LENGTH) {
                        setEditNotes(e.target.value);
                      }
                    }}
                    placeholder="Ressenti général, forme du jour..."
                    className="w-full rounded-lg bg-muted p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={closeEditModal}
                    disabled={isSaving}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                  >
                    {isSaving ? "Sauvegarde..." : "Enregistrer"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Main>
    </Container>
  );
}
