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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useExerciseStore } from "@/stores/exercise-store";
import { useSettingsStore } from "@/stores/settings-store";
import { getFamilyLabel, getExerciseDisplayName } from "@/data/emom-tables";
import type { ExerciseCategory, ExerciseFamily, ExerciseDifficulty, Exercise } from "@/types";
import { ArrowLeft, Plus, Filter, X, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Options de filtres catégorie
const CATEGORY_OPTIONS: { value: ExerciseCategory | "all"; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "push", label: "Push" },
  { value: "pull", label: "Pull" },
  { value: "legs", label: "Legs" },
  { value: "core", label: "Core" },
];

// Options de filtres difficulté
const DIFFICULTY_OPTIONS: { value: ExerciseDifficulty | "all"; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "novice", label: "Novice" },
  { value: "classique", label: "Classique" },
  { value: "intermediaire", label: "Intermédiaire" },
  { value: "avance", label: "Avancé" },
  { value: "expert", label: "Expert" },
];

export default function ExercisesPage() {
  const exercises = useExerciseStore((s) => s.exercises);
  const isLoaded = useExerciseStore((s) => s.isLoaded);
  const language = useSettingsStore((s) => s.settings.language);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ExerciseCategory | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<ExerciseDifficulty | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [openFamilies, setOpenFamilies] = useState<Set<string>>(new Set());

  // Toggle une famille ouverte/fermée
  const toggleFamily = (family: string) => {
    setOpenFamilies((prev) => {
      const next = new Set(prev);
      if (next.has(family)) {
        next.delete(family);
      } else {
        next.add(family);
      }
      return next;
    });
  };

  // Ouvrir/fermer toutes les familles
  const toggleAllFamilies = (open: boolean) => {
    if (open) {
      setOpenFamilies(new Set(familyOrder));
    } else {
      setOpenFamilies(new Set());
    }
  };

  // Filtrer les exercices
  const filteredExercises = useMemo(() => {
    return exercises.filter((e) => {
      // Filtre catégorie
      if (categoryFilter !== "all" && e.category !== categoryFilter) return false;
      // Filtre difficulté
      if (difficultyFilter !== "all" && e.difficulty !== difficultyFilter) return false;
      // Filtre recherche
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const displayName = getExerciseDisplayName(e, language).toLowerCase();
        if (!displayName.includes(query)) return false;
      }
      return true;
    });
  }, [exercises, categoryFilter, difficultyFilter, searchQuery, language]);

  // Grouper par famille
  const exercisesByFamily = useMemo(() => {
    const groups: Record<string, Exercise[]> = {};

    filteredExercises.forEach((exercise) => {
      const family = exercise.family || "custom";
      if (!groups[family]) {
        groups[family] = [];
      }
      groups[family].push(exercise);
    });

    // Trier chaque groupe par difficulté
    const difficultyOrder = ["novice", "classique", "intermediaire", "avance", "expert"];
    Object.keys(groups).forEach((family) => {
      groups[family].sort((a, b) => {
        const aIdx = difficultyOrder.indexOf(a.difficulty || "classique");
        const bIdx = difficultyOrder.indexOf(b.difficulty || "classique");
        return aIdx - bIdx;
      });
    });

    return groups;
  }, [filteredExercises]);

  // Ordre des familles pour l'affichage
  const familyOrder: ExerciseFamily[] = [
    "pushup", "pike", "hspu", "dip",
    "pullup", "chinup", "muscleup",
    "squat", "hinge",
    "core",
    "custom",
  ];

  const sortedFamilies = Object.keys(exercisesByFamily).sort((a, b) => {
    const aIdx = familyOrder.indexOf(a as ExerciseFamily);
    const bIdx = familyOrder.indexOf(b as ExerciseFamily);
    return aIdx - bIdx;
  });

  const hasActiveFilters = categoryFilter !== "all" || difficultyFilter !== "all" || searchQuery.trim() !== "";

  const resetFilters = () => {
    setCategoryFilter("all");
    setDifficultyFilter("all");
    setSearchQuery("");
  };

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
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="h-5 w-5" />
            {hasActiveFilters && (
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowAddModal(true)}>
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </Header>

      <Main>
        {/* Skeleton pendant le chargement */}
        {!isLoaded && (
          <div className="space-y-4">
            {/* Skeleton barre de recherche */}
            <Skeleton className="h-10 w-full" />

            {/* Skeleton compteur */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>

            {/* Skeleton des familles */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <div className="space-y-2 pl-2">
                  {[1, 2].map((j) => (
                    <Skeleton key={j} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contenu réel */}
        {isLoaded && (
          <>
        {/* Barre de recherche */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un exercice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filtres */}
        {showFilters && (
          <div className="mb-6 space-y-4 rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Filtres</span>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-auto px-2 py-1 text-xs"
                >
                  <X className="mr-1 h-3 w-3" />
                  Réinitialiser
                </Button>
              )}
            </div>

            {/* Filtre catégorie */}
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">Catégorie</span>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((option) => (
                  <Badge
                    key={option.value}
                    variant={categoryFilter === option.value ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-colors",
                      categoryFilter === option.value && "bg-primary"
                    )}
                    onClick={() => setCategoryFilter(option.value)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Filtre difficulté */}
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">Difficulté</span>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTY_OPTIONS.map((option) => (
                  <Badge
                    key={option.value}
                    variant={difficultyFilter === option.value ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-colors",
                      difficultyFilter === option.value && "bg-primary"
                    )}
                    onClick={() => setDifficultyFilter(option.value)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Compteur + actions */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredExercises.length} exercice{filteredExercises.length > 1 ? "s" : ""}
          </p>
          {sortedFamilies.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={() => toggleAllFamilies(true)}
              >
                Tout ouvrir
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={() => toggleAllFamilies(false)}
              >
                Tout fermer
              </Button>
            </div>
          )}
        </div>

        {/* Exercices groupés par famille (collapsible) */}
        <div className="space-y-3">
          {sortedFamilies.map((family) => {
            const isOpen = openFamilies.has(family);
            const exerciseCount = exercisesByFamily[family].length;

            return (
              <Collapsible
                key={family}
                open={isOpen}
                onOpenChange={() => toggleFamily(family)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex w-full items-center justify-between rounded-lg border bg-card px-4 py-3 hover:bg-accent"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {getFamilyLabel(family as ExerciseFamily, language)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {exerciseCount}
                      </Badge>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2 pl-2">
                  {exercisesByFamily[family].map((exercise) => (
                    <Link key={exercise.id} href={`/exercises/${exercise.id}`}>
                      <ExerciseCard exercise={exercise} />
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>

        {/* Aucun exercice */}
        {filteredExercises.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="mb-4 text-muted-foreground">
              {hasActiveFilters
                ? "Aucun exercice ne correspond aux filtres"
                : "Aucun exercice configuré"}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            ) : (
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un exercice
              </Button>
            )}
          </div>
        )}

        {/* Bouton ajouter (si exercices existent) */}
        {filteredExercises.length > 0 && (
          <Button
            variant="outline"
            className="mt-6 w-full"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un exercice personnalisé
          </Button>
        )}
          </>
        )}
      </Main>

      <AddExerciseModal open={showAddModal} onOpenChange={setShowAddModal} />
    </Container>
  );
}
