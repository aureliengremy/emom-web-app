"use client";

// ============================================
// Providers - Initialisation des stores
// ============================================

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useExerciseStore } from "@/stores/exercise-store";
import { useWorkoutStore } from "@/stores/workout-store";
import { useSettingsStore } from "@/stores/settings-store";
import { Toaster } from "@/components/ui/sonner";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [isReady, setIsReady] = useState(false);

  const initializeAuth = useAuthStore((s) => s.initialize);
  const initializePresets = useExerciseStore((s) => s.initializePresets);
  const loadWorkouts = useWorkoutStore((s) => s.loadWorkouts);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    async function initialize() {
      // Initialiser l'auth EN PREMIER pour que les autres stores
      // puissent savoir si l'utilisateur est connecté
      await initializeAuth();

      // Ensuite charger les données (exercices, workouts, settings)
      await Promise.all([
        initializePresets(),
        loadWorkouts(),
        loadSettings(),
      ]);
      setIsReady(true);
    }
    initialize();
  }, [initializeAuth, initializePresets, loadWorkouts, loadSettings]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <Toaster position="top-center" richColors />
    </>
  );
}
