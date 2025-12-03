"use client";

// ============================================
// Providers - Initialisation des stores
// ============================================

import { useEffect, useState } from "react";
import { useExerciseStore } from "@/stores/exercise-store";
import { useWorkoutStore } from "@/stores/workout-store";
import { useSettingsStore } from "@/stores/settings-store";
import { Toaster } from "@/components/ui/sonner";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [isReady, setIsReady] = useState(false);

  const initializePresets = useExerciseStore((s) => s.initializePresets);
  const loadWorkouts = useWorkoutStore((s) => s.loadWorkouts);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    async function initialize() {
      await Promise.all([
        initializePresets(),
        loadWorkouts(),
        loadSettings(),
      ]);
      setIsReady(true);
    }
    initialize();
  }, [initializePresets, loadWorkouts, loadSettings]);

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
