"use client";

// ============================================
// Page détail d'un exercice
// ============================================

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Container, Header, Main } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useExerciseStore } from "@/stores/exercise-store";
import { useWorkoutStore } from "@/stores/workout-store";
import { useAuthStore } from "@/stores/auth-store";
import { getExerciseLevel, getLevelColor } from "@/data/emom-tables";
import { ExerciseStatsCard } from "@/components/exercises/exercise-stats-card";
import { formatDate } from "@/types";
import {
  ArrowLeft,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Trash2,
  Save,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LazyRepsBarChart } from "@/components/charts/lazy-charts";

export default function ExerciseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const exercise = useExerciseStore((s) => s.getExerciseById(id));
  const updateMax = useExerciseStore((s) => s.updateMax);
  const deleteExercise = useExerciseStore((s) => s.deleteExercise);
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const user = useAuthStore((s) => s.user);

  const [newMax, setNewMax] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!exercise) {
    return (
      <Container>
        <Header>
          <div className="flex items-center gap-2">
            <Link href="/exercises">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Exercice</h1>
          </div>
        </Header>
        <Main>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">Exercice non trouvé</p>
            <Link href="/exercises" className="mt-4">
              <Button variant="outline">Retour aux exercices</Button>
            </Link>
          </div>
        </Main>
      </Container>
    );
  }

  const level = getExerciseLevel(exercise.id, exercise.currentMax);
  const levelColor = getLevelColor(level);

  // Historique de cet exercice
  const exerciseHistory = workoutHistory
    .filter((w) => w.sets.some((s) => s.exerciseId === id))
    .slice(0, 5);

  // Données pour le graphique
  const chartData = workoutHistory
    .filter((w) => w.sets.some((s) => s.exerciseId === id))
    .map((w) => {
      const set = w.sets.find((s) => s.exerciseId === id);
      return {
        date: w.date,
        reps: set?.totalReps ?? 0,
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleUpdateMax = async () => {
    const value = parseInt(newMax);
    if (isNaN(value) || value < 1) {
      toast.error("Veuillez entrer un nombre valide");
      return;
    }

    setIsUpdating(true);
    try {
      await updateMax(id, value);
      toast.success(`Max mis à jour : ${value} reps`);
      setNewMax("");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (exercise.type === "preset") {
      toast.error("Impossible de supprimer un exercice prédéfini");
      return;
    }

    if (!confirm(`Supprimer ${exercise.name} ?`)) return;

    try {
      await deleteExercise(id);
      toast.success("Exercice supprimé");
      router.push("/exercises");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <Container>
      <Header>
        <div className="flex items-center gap-2">
          <Link href="/exercises">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">{exercise.name}</h1>
        </div>
        <Badge className={cn(levelColor)}>
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </Badge>
      </Header>

      <Main>
        {/* Stats principales */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <Trophy className="mb-2 h-6 w-6 text-yellow-500" />
              <span className="text-2xl font-bold">{exercise.currentMax}</span>
              <span className="text-sm text-muted-foreground">Max actuel</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <Target className="mb-2 h-6 w-6 text-primary" />
              <span className="text-2xl font-bold">
                {exercise.currentEMOM.reps}
              </span>
              <span className="text-sm text-muted-foreground">
                Reps EMOM
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Config EMOM */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Configuration EMOM recommandée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  {exercise.currentEMOM.reps} reps × {exercise.currentEMOM.duration} min
                </p>
                <p className="text-sm text-muted-foreground">
                  = {exercise.currentEMOM.reps * exercise.currentEMOM.duration} reps total
                </p>
              </div>
              {exercise.currentEMOM.weighted && (
                <Badge variant="outline">
                  {exercise.currentEMOM.weight} kg
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Graphique de progression */}
        {chartData.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4" />
                Volume hebdomadaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LazyRepsBarChart data={chartData} weeks={8} />
            </CardContent>
          </Card>
        )}

        {/* Section Progression - uniquement si connecte et donnees disponibles */}
        {user && workoutHistory.length > 0 && (
          <ExerciseStatsCard workouts={workoutHistory} exerciseId={id} />
        )}

        {/* Test du max */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Mettre à jour le max
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Dernier test : {formatDate(exercise.lastTested)}
            </p>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Nouveau max"
                value={newMax}
                onChange={(e) => setNewMax(e.target.value)}
                min="1"
              />
              <Button onClick={handleUpdateMax} disabled={isUpdating}>
                <Save className="mr-2 h-4 w-4" />
                {isUpdating ? "..." : "Enregistrer"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Historique récent */}
        {exerciseHistory.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Séances récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exerciseHistory.map((workout) => {
                  const set = workout.sets.find((s) => s.exerciseId === id);
                  if (!set) return null;
                  return (
                    <div
                      key={workout.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {formatDate(workout.date)}
                      </span>
                      <span className="font-medium">
                        {set.totalReps} reps
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Supprimer (custom uniquement) */}
        {exercise.type === "custom" && (
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer cet exercice
          </Button>
        )}
      </Main>
    </Container>
  );
}
