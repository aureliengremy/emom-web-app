"use client";

// ============================================
// Page Mes Sessions
// ============================================

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container, Header, Main } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSessionStore } from "@/stores/session-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  ArrowLeft,
  Bookmark,
  Loader2,
  Play,
  Trash2,
  Clock,
  Dumbbell,
  Edit,
  Plus,
  Zap,
} from "lucide-react";
import type { SavedSession } from "@/types";

export default function SessionsPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const {
    savedSessions,
    isLoadingSavedSessions,
    loadSavedSessions,
    loadSessionPlan,
    deleteSavedSessionById,
  } = useSessionStore();

  const [sessionToDelete, setSessionToDelete] = useState<SavedSession | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (isInitialized && user && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadSavedSessions(user.id);
    }
  }, [isInitialized, user, loadSavedSessions]);

  const handleLoadSession = (session: SavedSession) => {
    loadSessionPlan(session);
    router.push("/");
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;

    setIsDeleting(true);
    try {
      await deleteSavedSessionById(sessionToDelete.id);
      setSessionToDelete(null);
    } catch (error) {
      console.error("Error deleting session:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDuration = (pauseDuration: number, sets: number) => {
    const totalSetsDuration = sets * 10 * 60; // Approximation: 10 min par set
    const totalPauses = (sets - 1) * pauseDuration;
    const totalSeconds = totalSetsDuration + totalPauses;
    const minutes = Math.floor(totalSeconds / 60);
    return `~${minutes} min`;
  };

  if (!isInitialized) {
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

  if (!user) {
    return (
      <Container>
        <Header>
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Mes sessions</h1>
          <div className="w-10" />
        </Header>
        <Main>
          <Card className="mt-8">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Bookmark className="mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="mb-2 text-lg font-semibold">
                Connecte-toi pour sauvegarder tes sessions
              </h2>
              <p className="mb-6 text-muted-foreground">
                Crée et sauvegarde tes sessions personnalisées pour les
                retrouver facilement.
              </p>
              <Link href="/auth/login">
                <Button>Se connecter</Button>
              </Link>
            </CardContent>
          </Card>
        </Main>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Mes sessions</h1>
        <Link href="/sessions/create">
          <Button variant="ghost" size="icon">
            <Plus className="h-5 w-5" />
          </Button>
        </Link>
      </Header>

      <Main>
        {isLoadingSavedSessions ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : savedSessions.length === 0 ? (
          <Card className="mt-8">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Bookmark className="mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="mb-2 text-lg font-semibold">
                Aucune session sauvegardée
              </h2>
              <p className="mb-6 text-muted-foreground">
                Crée ta première session pour commencer.
              </p>
              <Link href="/sessions/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer une session
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {savedSessions.map((session) => (
              <Card key={session.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="mb-1 font-semibold">{session.name}</h3>
                        {session.description && (
                          <p className="text-sm text-muted-foreground">
                            {session.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-4 flex gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Dumbbell className="h-4 w-4" />
                        <span>
                          {session.sets.length} exercice
                          {session.sets.length > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatDuration(
                            session.pauseDuration,
                            session.sets.length
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleLoadSession(session)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Charger
                      </Button>
                      <Link href={`/sessions/create?edit=${session.id}`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSessionToDelete(session)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
                  </Card>
                ))}
          </div>
        )}
      </Main>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog
        open={sessionToDelete !== null}
        onOpenChange={(open) => !open && setSessionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette session ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La session &quot;
              {sessionToDelete?.name}&quot; sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSession}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Container>
  );
}
