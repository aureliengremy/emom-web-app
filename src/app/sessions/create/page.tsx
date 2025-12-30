"use client";

// ============================================
// Page de création/édition de session - Layout avec Tabs
// ============================================

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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

export default function CreateSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingSessionId = searchParams.get("edit");

  const { user } = useAuthStore();
  const { saveCurrentSession, savedSessions } = useSessionStore();
  const exercises = useExerciseStore((s) => s.exercises);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sessionSets, setSessionSets] = useState<PlannedSet[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("info");

  // Charger la session en mode édition
  useEffect(() => {
    if (editingSessionId) {
      const session = savedSessions.find((s) => s.id === editingSessionId);
      if (session) {
        setName(session.name);
        setDescription(session.description || "");
        setSessionSets(session.sets);
      }
    }
  }, [editingSessionId, savedSessions]);

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
    setSessionSets([...sessionSets, newSet]);
    // Basculer vers l'onglet info pour voir l'exercice ajouté
    setActiveTab("info");
  };

  const handleRemoveSet = (setId: string) => {
    setSessionSets(sessionSets.filter((s) => s.id !== setId));
  };

  const handleUpdateSet = (setId: string, updates: Partial<PlannedSet>) => {
    setSessionSets(
      sessionSets.map((set) =>
        set.id === setId ? { ...set, ...updates } : set
      )
    );
  };

  const handleSave = async () => {
    if (!user) {
      setError("Tu dois être connecté pour sauvegarder une session");
      return;
    }

    if (!name.trim()) {
      setError("Le nom de la session est requis");
      setActiveTab("info");
      return;
    }

    if (sessionSets.length === 0) {
      setError("Ajoute au moins un exercice à la session");
      setActiveTab("exercises");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await saveCurrentSession(
        user.id,
        name.trim(),
        description.trim() || undefined,
        sessionSets
      );

      // Rediriger vers la page des sessions
      router.push("/sessions");
    } catch (err) {
      console.error("Error saving session:", err);
      setError("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info" className="gap-2">
              <Info className="h-4 w-4" />
              Informations
              {sessionSets.length > 0 && (
                <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {sessionSets.length}
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSaving}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-description">
                  Description (optionnel)
                </Label>
                <Textarea
                  id="session-description"
                  placeholder="Ex: Séance complète pour tout le corps"
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setDescription(e.target.value)
                  }
                  disabled={isSaving}
                  rows={3}
                />
              </div>
            </div>

            {/* Exercices dans la session */}
            <div className="space-y-3 rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">
                  Exercices ({sessionSets.length})
                </h2>
                {sessionSets.length === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("exercises")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter
                  </Button>
                )}
              </div>

              {sessionSets.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="mb-3 text-sm text-muted-foreground">
                    Aucun exercice ajouté.
                  </p>
                  <Button
                    variant="default"
                    onClick={() => setActiveTab("exercises")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter des exercices
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessionSets.map((set, index) => (
                    <div
                      key={set.id}
                      className="rounded-md border bg-background p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {index + 1}
                          </span>
                          <span className="font-medium">{set.exerciseName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              setEditingSetId(
                                editingSetId === set.id ? null : set.id
                              )
                            }
                            disabled={isSaving}
                          >
                            {editingSetId === set.id ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Edit2 className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRemoveSet(set.id)}
                            disabled={isSaving}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {editingSetId === set.id ? (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Reps</Label>
                            <Input
                              type="number"
                              min="1"
                              value={set.reps}
                              onChange={(e) =>
                                handleUpdateSet(set.id, {
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
                                handleUpdateSet(set.id, {
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
                                  handleUpdateSet(set.id, {
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
                          {set.reps} reps × {set.duration} min
                          {set.weighted && set.weight ? ` • ${set.weight}kg` : ""}
                        </p>
                      )}
                    </div>
                  ))}
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
                    disabled={isSaving}
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
                    const isAdded = sessionSets.some(
                      (s) => s.exerciseId === exercise.id
                    );
                    return (
                      <button
                        key={exercise.id}
                        onClick={() => !isAdded && handleAddExercise(exercise)}
                        disabled={isAdded || isSaving}
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

        {error && (
          <div className="mt-4 rounded-lg border border-destructive bg-destructive/10 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="sticky bottom-4 mt-6 flex gap-2 rounded-lg border bg-card p-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Annuler
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={isSaving || !name.trim() || sessionSets.length === 0}
          >
            {isSaving ? (
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
      </Main>
    </Container>
  );
}
