"use client";

// ============================================
// Page d'accueil - Simplifiée
// ============================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container, Header, Main } from "@/components/layout/container";
import { PlannedSetConfig } from "@/components/session/planned-set-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useExerciseStore } from "@/stores/exercise-store";
import { useSessionStore } from "@/stores/session-store";
import {
  Play,
  Dumbbell,
  ListChecks,
  History,
  Settings,
  ChevronRight,
  Settings2,
  X,
  User,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const exercises = useExerciseStore((s) => s.exercises);
  const { plannedSets, addSet, clearSession } = useSessionStore();
  const [configSetId, setConfigSetId] = useState<string | null>(null);

  const configSet = configSetId
    ? plannedSets.find((s) => s.id === configSetId) ?? null
    : null;

  const handleQuickStart = (exerciseId: string) => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (exercise) {
      addSet(exercise);
    }
  };

  const handleStartWorkout = () => {
    if (plannedSets.length === 0 && exercises.length > 0) {
      addSet(exercises[0]);
    }
    router.push("/workout");
  };

  return (
    <Container>
      <Header>
        <div className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">EMOM</h1>
        </div>
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </Link>
      </Header>

      <Main>
        {/* Section Lancement Rapide */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Lancement rapide</h2>

          {exercises.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {exercises.slice(0, 4).map((exercise) => {
                const isSelected = plannedSets.some(
                  (s) => s.exerciseId === exercise.id
                );
                return (
                  <button
                    key={exercise.id}
                    onClick={() => handleQuickStart(exercise.id)}
                    className={`flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <span className="mb-1 font-semibold">{exercise.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {exercise.currentEMOM.reps} reps × {exercise.currentEMOM.duration}′
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center py-8 text-center">
                <Dumbbell className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Aucun exercice configuré
                </p>
                <Link href="/exercises" className="mt-3">
                  <Button variant="outline" size="sm">
                    Ajouter un exercice
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Séance en cours */}
        {plannedSets.length > 0 && (
          <section className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Séance prévue</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearSession()}
                className="text-muted-foreground"
              >
                <X className="mr-1 h-4 w-4" />
                Effacer
              </Button>
            </div>

            <div className="space-y-2">
              {plannedSets.map((set, index) => (
                <button
                  key={set.id}
                  onClick={() => setConfigSetId(set.id)}
                  className="flex w-full items-center justify-between rounded-lg bg-card px-4 py-3 text-left transition-colors hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    <div>
                      <span className="font-medium">{set.exerciseName}</span>
                      <p className="text-sm text-muted-foreground">
                        {set.reps} reps × {set.duration} min
                      </p>
                    </div>
                  </div>
                  <Settings2 className="h-5 w-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Actions */}
        <section className="mb-32">
          <h2 className="mb-4 text-lg font-semibold">Menu</h2>

          <div className="space-y-2">
            <Link href="/exercises">
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <ListChecks className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Mes exercices</p>
                      <p className="text-sm text-muted-foreground">
                        Gérer et configurer
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/history">
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                      <History className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium">Historique</p>
                      <p className="text-sm text-muted-foreground">
                        Voir mes séances
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/settings">
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-500/10">
                      <Settings className="h-5 w-5 text-zinc-500" />
                    </div>
                    <div>
                      <p className="font-medium">Paramètres</p>
                      <p className="text-sm text-muted-foreground">
                        Compte et préférences
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </Main>

      {/* Bouton flottant */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pb-6 pt-8">
        <div className="mx-auto max-w-lg px-4">
          <Button
            size="lg"
            className="w-full gap-2 text-lg"
            onClick={handleStartWorkout}
            disabled={exercises.length === 0}
          >
            <Play className="h-5 w-5" />
            {plannedSets.length > 0
              ? `Démarrer (${plannedSets.length} set${plannedSets.length > 1 ? "s" : ""})`
              : "Session rapide"}
          </Button>
        </div>
      </div>

      {/* Drawer configuration set */}
      <PlannedSetConfig
        set={configSet}
        open={configSet !== null}
        onOpenChange={(open) => !open && setConfigSetId(null)}
      />
    </Container>
  );
}
