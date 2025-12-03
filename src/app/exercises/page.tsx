"use client";

// ============================================
// Page liste des exercices
// ============================================

import { useState, useMemo } from "react";
import Link from "next/link";
import { Container, Header, Main } from "@/components/layout/container";
import { ExerciseCard } from "@/components/exercises/exercise-card";
import { AddExerciseModal } from "@/components/exercises/add-exercise-modal";
import { Button } from "@/components/ui/button";
import { useExerciseStore } from "@/stores/exercise-store";
import { ArrowLeft, Plus } from "lucide-react";

export default function ExercisesPage() {
  const exercises = useExerciseStore((s) => s.exercises);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filtrer avec useMemo pour éviter les re-renders infinis
  const presets = useMemo(
    () => exercises.filter((e) => e.type === "preset"),
    [exercises]
  );
  const customs = useMemo(
    () => exercises.filter((e) => e.type === "custom"),
    [exercises]
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
          <h1 className="text-xl font-bold">Mes exercices</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setShowAddModal(true)}>
          <Plus className="h-5 w-5" />
        </Button>
      </Header>

      <Main>
        {/* Exercices prédéfinis */}
        {presets.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-muted-foreground">
              Exercices prédéfinis
            </h2>
            <div className="space-y-3">
              {presets.map((exercise) => (
                <Link key={exercise.id} href={`/exercises/${exercise.id}`}>
                  <ExerciseCard exercise={exercise} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Exercices personnalisés */}
        {customs.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-muted-foreground">
              Mes exercices
            </h2>
            <div className="space-y-3">
              {customs.map((exercise) => (
                <Link key={exercise.id} href={`/exercises/${exercise.id}`}>
                  <ExerciseCard exercise={exercise} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Aucun exercice */}
        {exercises.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="mb-4 text-muted-foreground">
              Aucun exercice configuré
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un exercice
            </Button>
          </div>
        )}

        {/* Bouton ajouter (si exercices existent) */}
        {exercises.length > 0 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un exercice personnalisé
          </Button>
        )}
      </Main>

      <AddExerciseModal open={showAddModal} onOpenChange={setShowAddModal} />
    </Container>
  );
}
