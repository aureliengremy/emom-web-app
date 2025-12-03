"use client";

// ============================================
// Page Workout - Timer EMOM
// ============================================

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { TimerCircle } from "@/components/timer/timer-circle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkoutStore } from "@/stores/workout-store";
import { useSessionStore } from "@/stores/session-store";
import { useSound } from "@/hooks/use-sound";
import { Pause, Play, X, Check } from "lucide-react";

export default function WorkoutPage() {
  const router = useRouter();
  const {
    timer,
    currentWorkout,
    startWorkout,
    cancelWorkout,
    tick,
    pauseTimer,
    resumeTimer,
    getCurrentPlannedSet,
  } = useWorkoutStore();
  const { getSessionPlan, clearSession, hasPlannedSets } = useSessionStore();
  const { playBeep, playStart, playComplete, playWarning } = useSound();
  const lastSecondsRef = useRef(60);

  // Démarrer le workout si pas encore commencé
  useEffect(() => {
    if (timer.status === "idle" && hasPlannedSets()) {
      const plan = getSessionPlan();
      startWorkout(plan);
    } else if (timer.status === "idle" && !hasPlannedSets()) {
      // Pas de sets planifiés, retour à l'accueil
      router.push("/");
    }
  }, [timer.status, hasPlannedSets, getSessionPlan, startWorkout, router]);

  // Timer tick
  useEffect(() => {
    if (timer.status !== "running") return;

    const interval = setInterval(() => {
      const result = tick();

      // Son de décompte aux dernières secondes
      const seconds = useWorkoutStore.getState().timer.secondsRemaining;
      if (seconds <= 3 && seconds > 0 && lastSecondsRef.current > 3) {
        playWarning();
      }
      lastSecondsRef.current = seconds;

      if (result.workoutComplete) {
        playComplete();
        router.push("/workout/complete");
      } else if (result.setComplete) {
        playComplete();
      } else if (result.minuteComplete) {
        playBeep();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer.status, tick, router, playBeep, playComplete, playWarning]);

  // Garder l'écran allumé
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    async function requestWakeLock() {
      if ("wakeLock" in navigator) {
        try {
          wakeLock = await navigator.wakeLock.request("screen");
        } catch (err) {
          console.log("Wake Lock error:", err);
        }
      }
    }

    if (timer.status === "running") {
      requestWakeLock();
    }

    return () => {
      wakeLock?.release();
    };
  }, [timer.status]);

  const handlePauseResume = useCallback(() => {
    if (timer.status === "running") {
      pauseTimer();
    } else if (timer.status === "paused" && !timer.isPausingBetweenSets) {
      resumeTimer();
    }
  }, [timer.status, timer.isPausingBetweenSets, pauseTimer, resumeTimer]);

  const handleCancel = useCallback(() => {
    cancelWorkout();
    clearSession();
    router.push("/");
  }, [cancelWorkout, clearSession, router]);

  const currentSet = getCurrentPlannedSet();

  if (!currentSet || timer.status === "idle") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Écran de pause entre sets
  if (timer.isPausingBetweenSets) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="mb-8 text-center">
          <Check className="mx-auto mb-4 h-16 w-16 text-primary" />
          <h1 className="mb-2 text-2xl font-bold">
            Set {timer.currentSetIndex + 1}/{timer.totalSets} terminé
          </h1>
          <p className="text-muted-foreground">
            Repos avant le prochain set
          </p>
        </div>

        <div className="mb-8">
          <span className="timer-seconds text-primary">
            {timer.pauseSecondsRemaining}
          </span>
        </div>

        <Button
          size="lg"
          onClick={() => useWorkoutStore.getState().startNextSet()}
          className="gap-2"
        >
          <Play className="h-5 w-5" />
          Lancer le set suivant
        </Button>
      </div>
    );
  }

  return (
    <div className="no-select flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <X className="h-6 w-6" />
        </Button>
        <div className="text-center">
          <Badge variant="secondary" className="mb-1">
            Set {timer.currentSetIndex + 1}/{timer.totalSets}
          </Badge>
          <p className="text-sm font-medium">{currentSet.exerciseName}</p>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* Timer principal */}
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4">
        <TimerCircle
          seconds={timer.secondsRemaining}
          isPaused={timer.status === "paused"}
        />

        {/* Infos sous le timer */}
        <div className="flex flex-col items-center gap-4">
          {/* Reps à faire */}
          <div className="rounded-2xl bg-card px-8 py-4 text-center">
            <p className="mb-1 text-sm text-muted-foreground">Reps à faire</p>
            <p className="timer-reps text-primary">
              {currentSet.reps}
              {currentSet.weighted && (
                <span className="ml-2 text-2xl text-muted-foreground">
                  @ {currentSet.weight}kg
                </span>
              )}
            </p>
          </div>

          {/* Minute actuelle */}
          <p className="text-lg text-muted-foreground">
            Minute{" "}
            <span className="font-semibold text-foreground">
              {timer.currentMinute}
            </span>
            /{timer.totalMinutes}
          </p>
        </div>
      </main>

      {/* Contrôles */}
      <footer className="p-6">
        <div className="mx-auto flex max-w-lg justify-center gap-4">
          <Button
            size="lg"
            variant={timer.status === "running" ? "secondary" : "default"}
            onClick={handlePauseResume}
            className="h-16 w-16 rounded-full"
          >
            {timer.status === "running" ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8" />
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
