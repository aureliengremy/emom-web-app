"use client";

// ============================================
// Page de création/édition de session - Layout avec Tabs
// ============================================

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Container, Header, Main } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSessionStore } from "@/stores/session-store";
import { useExerciseStore } from "@/stores/exercise-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Search,
  Edit2,
  Check,
  Loader2,
  Info,
  Dumbbell,
} from "lucide-react";
import type { Exercise, PlannedSet } from "@/types";
import { generateId } from "@/types";
import { sessionSchema, type SessionFormData } from "@/lib/validations";

export default function CreateSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingSessionId = searchParams.get("edit");

  const { user } = useAuthStore();
  const { saveCurrentSession, savedSessions } = useSessionStore();
  const exercises = useExerciseStore((s) => s.exercises);

  const [searchQuery, setSearchQuery] = useState("");
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("info");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      name: "",
      description: "",
      sets: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "sets",
  });

  const watchedSets = watch("sets");

  // Charger la session en mode édition
  useEffect(() => {
    if (editingSessionId) {
      const session = savedSessions.find((s) => s.id === editingSessionId);
      if (session) {
        setValue("name", session.name);
        setValue("description", session.description || "");
        setValue("sets", session.sets);
      }
    }
  }, [editingSessionId, savedSessions, setValue]);

  // Filtrer les exercices selon la recherche
  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddExercise = (exercise: Exercise) => {
    const newSet: PlannedSet = {
      id: generateId(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      reps: exercise.currentEMOM.reps,
      duration: exercise.currentEMOM.duration,
      weighted: exercise.currentEMOM.weighted,
      weight: exercise.currentEMOM.weight,
    };
    append(newSet);
    // Basculer vers l'onglet info pour voir l'exercice ajouté
    setActiveTab("info");
  };

  const handleUpdateSet = (index: number, updates: Partial<PlannedSet>) => {
    const currentSet = watchedSets[index];
    if (currentSet) {
      update(index, { ...currentSet, ...updates });
    }
  };

  const onSubmit = async (data: SessionFormData) => {
    if (!user) {
      return;
    }

    try {
      await saveCurrentSession(
        user.id,
        data.name,
        data.description || undefined,
        data.sets
      );
      router.push("/sessions");
    } catch (err) {
      console.error("Error saving session:", err);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Erreur globale pour les sets (si 0 exercices)
  const setsError = errors.sets?.message || errors.sets?.root?.message;

  // Erreur si non connecté
  const notLoggedIn = !user;

  return (
    <Container>
      <Header>
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">
          {editingSessionId ? "Modifier la session" : "Créer une session"}
        </h1>
        <div className="w-10" />
      </Header>

      <Main>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info" className="gap-2">
                <Info className="h-4 w-4" />
                Informations
                {fields.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {fields.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="exercises" className="gap-2">
                <Dumbbell className="h-4 w-4" />
                Exercices
              </TabsTrigger>
            </TabsList>

            {/* Onglet Informations */}
            <TabsContent value="info" className="space-y-4">
              {/* Métadonnées */}
              <div className="space-y-4 rounded-lg border bg-card p-4">
                <div className="space-y-2">
                  <Label htmlFor="session-name">
                    Nom de la session <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="session-name"
                    placeholder="Ex: Full Body EMOM"
                    disabled={isSubmitting}
                    autoFocus
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-description">
                    Description (optionnel)
                  </Label>
                  <Textarea
                    id="session-description"
                    placeholder="Ex: Séance complète pour tout le corps"
                    disabled={isSubmitting}
                    rows={3}
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Exercices dans la session */}
              <div className="space-y-3 rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">
                    Exercices ({fields.length})
                  </h2>
                  {fields.length === 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("exercises")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter
                    </Button>
                  )}
                </div>

                {setsError && (
                  <p className="text-xs text-destructive">{setsError}</p>
                )}

                {fields.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="mb-3 text-sm text-muted-foreground">
                      Aucun exercice ajouté.
                    </p>
                    <Button
                      type="button"
                      variant="default"
                      onClick={() => setActiveTab("exercises")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter des exercices
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {fields.map((field, index) => {
                      const set = watchedSets[index];
                      const isEditing = editingSetIndex === index;

                      return (
                        <div
                          key={field.id}
                          className="rounded-md border bg-background p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                {index + 1}
                              </span>
                              <span className="font-medium">{set?.exerciseName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  setEditingSetIndex(isEditing ? null : index)
                                }
                                disabled={isSubmitting}
                              >
                                {isEditing ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Edit2 className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => remove(index)}
                                disabled={isSubmitting}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {isEditing && set ? (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Reps</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={set.reps}
                                  onChange={(e) =>
                                    handleUpdateSet(index, {
                                      reps: parseInt(e.target.value) || 1,
                                    })
                                  }
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Durée (min)</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={set.duration}
                                  onChange={(e) =>
                                    handleUpdateSet(index, {
                                      duration: parseInt(e.target.value) || 1,
                                    })
                                  }
                                  className="h-8 text-sm"
                                />
                              </div>
                              {set.weighted && (
                                <div className="col-span-2">
                                  <Label className="text-xs">Poids (kg)</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={set.weight || 0}
                                    onChange={(e) =>
                                      handleUpdateSet(index, {
                                        weight: parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    className="h-8 text-sm"
                                  />
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {set?.reps} reps × {set?.duration} min
                              {set?.weighted && set?.weight ? ` • ${set.weight}kg` : ""}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Onglet Exercices */}
            <TabsContent value="exercises" className="space-y-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="mb-4">
                  <Label htmlFor="exercise-search">Rechercher</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="exercise-search"
                      placeholder="Rechercher un exercice..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={isSubmitting}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {filteredExercises.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      {searchQuery
                        ? "Aucun exercice trouvé"
                        : "Aucun exercice disponible"}
                    </p>
                  ) : (
                    filteredExercises.map((exercise) => {
                      const isAdded = watchedSets.some(
                        (s) => s?.exerciseId === exercise.id
                      );
                      return (
                        <button
                          type="button"
                          key={exercise.id}
                          onClick={() => !isAdded && handleAddExercise(exercise)}
                          disabled={isAdded || isSubmitting}
                          className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                            isAdded
                              ? "cursor-not-allowed bg-muted/50 opacity-50"
                              : "hover:bg-accent"
                          }`}
                        >
                          <div>
                            <p className="font-medium">{exercise.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {exercise.currentEMOM.reps} reps ×{" "}
                              {exercise.currentEMOM.duration} min
                            </p>
                          </div>
                          {isAdded ? (
                            <Check className="h-5 w-5 text-primary" />
                          ) : (
                            <Plus className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {notLoggedIn && (
            <div className="mt-4 rounded-lg border border-destructive bg-destructive/10 p-3">
              <p className="text-sm text-destructive">
                Tu dois être connecté pour sauvegarder une session
              </p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="sticky bottom-4 mt-6 flex gap-2 rounded-lg border bg-card p-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || notLoggedIn || fields.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </form>
      </Main>
    </Container>
  );
}
