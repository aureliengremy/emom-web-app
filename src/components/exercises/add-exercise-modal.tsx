"use client";

// ============================================
// Modal d'ajout d'exercice personnalisé
// ============================================

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { exerciseSchema, type ExerciseFormData } from "@/lib/validations";

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
  const addExercise = useExerciseStore((s) => s.addExercise);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: "",
      category: "push",
      currentMax: 0,
    },
  });

  // Reset le form quand on ferme le modal
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: ExerciseFormData) => {
    try {
      await addExercise({
        name: data.name,
        category: data.category,
        currentMax: data.currentMax,
      });
      toast.success(`${data.name} ajouté !`);
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur ajout exercice:", error);
      const message = error instanceof Error ? error.message : "Erreur lors de l'ajout";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvel exercice</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Nom */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Nom de l&apos;exercice
            </label>
            <Input
              placeholder="Ex: Archer Push-ups"
              autoFocus
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Catégorie */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Catégorie
            </label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <div className="flex gap-2">
                  {CATEGORIES.map((cat) => (
                    <Button
                      key={cat.value}
                      type="button"
                      variant={field.value === cat.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => field.onChange(cat.value)}
                      className="flex-1"
                    >
                      {cat.label}
                    </Button>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Max */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Max actuel (optionnel)
            </label>
            <Input
              type="number"
              placeholder="0"
              min="0"
              {...register("currentMax", { valueAsNumber: true })}
            />
            {errors.currentMax && (
              <p className="mt-1 text-xs text-destructive">
                {errors.currentMax.message}
              </p>
            )}
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
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
