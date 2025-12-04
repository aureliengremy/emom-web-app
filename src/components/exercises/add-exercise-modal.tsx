"use client";

// ============================================
// Modal d'ajout d'exercice personnalisé
// ============================================

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExerciseStore } from "@/stores/exercise-store";
import type { ExerciseCategory } from "@/types";
import { toast } from "sonner";

interface AddExerciseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES: { value: ExerciseCategory; label: string }[] = [
  { value: "push", label: "Push" },
  { value: "pull", label: "Pull" },
  { value: "legs", label: "Legs" },
  { value: "core", label: "Core" },
];

export function AddExerciseModal({ open, onOpenChange }: AddExerciseModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ExerciseCategory>("push");
  const [max, setMax] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addExercise = useExerciseStore((s) => s.addExercise);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Le nom est requis");
      return;
    }

    const maxValue = parseInt(max) || 0;

    setIsLoading(true);
    try {
      await addExercise({
        name: name.trim(),
        category,
        currentMax: maxValue,
      });
      toast.success(`${name} ajouté !`);
      onOpenChange(false);
      // Reset form
      setName("");
      setCategory("push");
      setMax("");
    } catch (error) {
      console.error("Erreur ajout exercice:", error);
      const message = error instanceof Error ? error.message : "Erreur lors de l'ajout";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvel exercice</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nom */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Nom de l&apos;exercice
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Archer Push-ups"
              autoFocus
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Catégorie
            </label>
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.value}
                  type="button"
                  variant={category === cat.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategory(cat.value)}
                  className="flex-1"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Max */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Max actuel (optionnel)
            </label>
            <Input
              type="number"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              placeholder="0"
              min="0"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              L&apos;EMOM sera calculé automatiquement
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
