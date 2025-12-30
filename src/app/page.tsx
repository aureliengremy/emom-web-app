"use client";

// ============================================
// Page d'accueil - Simplifiée
// ============================================

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container, Header, Main } from "@/components/layout/container";
import { PlannedSetConfig } from "@/components/session/planned-set-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useExerciseStore } from "@/stores/exercise-store";
import { useSessionStore } from "@/stores/session-store";
import { useAuthStore } from "@/stores/auth-store";
import type { SavedSession } from "@/types";
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
  Loader2,
  Lock,
  Bookmark,
  Save,
  Zap,
  Clock,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user, isInitialized, initialize } = useAuthStore();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Initialiser l'auth et vérifier si l'utilisateur doit se connecter
  useEffect(() => {
    const checkAuth = async () => {
      await initialize();
      setHasCheckedAuth(true);
    };
    checkAuth();
  }, [initialize]);

  // Rediriger vers login si pas encore vu la page de login
  useEffect(() => {
    if (hasCheckedAuth && isInitialized && !user) {
      // Vérifier si l'utilisateur a déjà choisi de continuer sans compte
      const guestMode = sessionStorage.getItem("emom-guest-mode");
      if (!guestMode) {
        router.push("/auth/login");
      }
    }
  }, [hasCheckedAuth, isInitialized, user, router]);

  const exercises = useExerciseStore((s) => s.exercises);
  const { plannedSets, addSet, clearSession, savedSessions, loadSessionPlan, loadSavedSessions } = useSessionStore();
  const [configSetId, setConfigSetId] = useState<string | null>(null);
  const hasLoadedSessionsRef = useRef(false);

  // Charger les sessions sauvegardées
  useEffect(() => {
    if (isInitialized && user && !hasLoadedSessionsRef.current) {
      hasLoadedSessionsRef.current = true;
      loadSavedSessions(user.id);
    }
  }, [isInitialized, user, loadSavedSessions]);

  const isGuest = !user;

  // Afficher un loader pendant l'initialisation
  if (!hasCheckedAuth || !isInitialized) {
    return (
      <Container>
        <Main>
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Main>
      </Container>
    );
  }

  const configSet = configSetId
    ? plannedSets.find((s) => s.id === configSetId) ?? null
    : null;

  const handleStartWorkout = () => {
    router.push("/workout");
  };

  const handleLoadSession = (session: SavedSession) => {
    loadSessionPlan(session);
  };

  const formatDuration = (pauseDuration: number, sets: number) => {
    if (sets === 0) return "0 min";
    const totalMinutes = sets * 10 + Math.floor((pauseDuration * (sets - 1)) / 60);
    return `${totalMinutes} min`;
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
        {/* Bandeau mode invité */}
        {isGuest && (
          <div className="mb-6 rounded-lg bg-amber-500/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-amber-600">Mode invité</p>
                <p className="text-sm text-muted-foreground">
                  Tes séances ne seront pas sauvegardées
                </p>
              </div>
              <Link href="/auth/login">
                <Button size="sm" variant="outline">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Section Accès rapide - 4 dernières sessions */}
        {!isGuest && savedSessions.length > 0 && (
          <section className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Zap className="h-5 w-5" />
                Accès rapide
              </h2>
              <Link href="/sessions">
                <Button variant="ghost" size="sm">
                  Voir tout
                </Button>
              </Link>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {savedSessions.slice(0, 4).map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleLoadSession(session)}
                  className="flex items-center justify-between rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent"
                >
                  <div className="flex-1">
                    <p className="font-medium">{session.name}</p>
                    <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Dumbbell className="h-3 w-3" />
                        {session.sets.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(
                          session.pauseDuration,
                          session.sets.length
                        )}
                      </span>
                    </div>
                  </div>
                  <Play className="h-4 w-4 text-muted-foreground" />
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

            <Link href="/sessions">
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <Bookmark className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Mes sessions</p>
                      <p className="text-sm text-muted-foreground">
                        {savedSessions.length} session{savedSessions.length > 1 ? "s" : ""} sauvegardée{savedSessions.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            {isGuest ? (
              <Card className="opacity-60">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                      <History className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium">Historique</p>
                      <p className="text-sm text-muted-foreground">
                        Connecte-toi pour sauvegarder
                      </p>
                    </div>
                  </div>
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ) : (
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
            )}

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

      {/* Boutons flottants */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pb-6 pt-8">
        <div className="mx-auto max-w-lg space-y-3 px-4">
          {plannedSets.length > 0 ? (
            <>
              <Button
                size="lg"
                className="w-full gap-2 text-lg"
                onClick={handleStartWorkout}
              >
                <Play className="h-5 w-5" />
                Démarrer ({plannedSets.length} set{plannedSets.length > 1 ? "s" : ""})
              </Button>
              
              {/* Résumé de la session */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Session chargée</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSession}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {plannedSets.map((set) => (
                        <div
                          key={set.id}
                          className="flex items-center justify-between rounded-md bg-muted/50 p-2 text-sm"
                        >
                          <span className="font-medium">{set.exerciseName}</span>
                          <span className="text-muted-foreground">
                            {set.reps} reps × {set.duration} min
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Link href="/sessions/create" className="block">
              <Button
                variant="outline"
                size="lg"
                className="w-full gap-2"
                disabled={!user}
              >
                <Save className="h-5 w-5" />
                Créer sessions
              </Button>
            </Link>
          )}
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
