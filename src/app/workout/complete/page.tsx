"use client";

// ============================================
// Page fin de workout
// ============================================

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkoutStore } from "@/stores/workout-store";
import { useSessionStore } from "@/stores/session-store";
import { useAuthStore } from "@/stores/auth-store";
import { formatDuration, type WorkoutRating } from "@/types";
import { Trophy, Clock, Repeat, Home, AlertCircle, ChevronDown, ChevronRight, MessageSquare, Share2 } from "lucide-react";
import { ShareButton } from "@/components/workout/share-button";
import { cn } from "@/lib/utils";

const RATING_OPTIONS: { value: WorkoutRating; emoji: string; label: string }[] = [
  { value: "easy", emoji: "😊", label: "Facile" },
  { value: "medium", emoji: "😐", label: "Moyen" },
  { value: "hard", emoji: "🥵", label: "Dur" },
];

const MAX_NOTES_LENGTH = 1000;
const MAX_COMMENT_LENGTH = 500;

export default function WorkoutCompletePage() {
  const router = useRouter();
  const { currentWorkout, updateWorkoutFeedback, updateSetFeedback } = useWorkoutStore();
  const { clearSession } = useSessionStore();
  const { user } = useAuthStore();
  const isGuest = !user;
  const [selectedRating, setSelectedRating] = useState<WorkoutRating | null>(null);
  const [notes, setNotes] = useState("");
  const [notesError, setNotesError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSetId, setExpandedSetId] = useState<string | null>(null);

  const hasPlayedConfetti = useRef(false);

  // Redirection si pas de workout en cours
  useEffect(() => {
    if (!currentWorkout) {
      router.push("/");
    }
  }, [currentWorkout, router]);

  // Animation confettis au chargement
  useEffect(() => {
    if (currentWorkout && !hasPlayedConfetti.current) {
      hasPlayedConfetti.current = true;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 250);
    }
  }, [currentWorkout]);

  if (!currentWorkout) {
    return null;
  }

  // Calculer les stats
  const totalReps = currentWorkout.sets.reduce((sum, s) => sum + s.totalReps, 0);
  const totalDuration = currentWorkout.sets.reduce(
    (sum, s) => sum + s.actualDuration,
    0
  );
  const setsCompleted = currentWorkout.sets.filter((s) => s.completed).length;

  const handleSetRating = (setId: string, rating: WorkoutRating) => {
    const set = currentWorkout.sets.find((s) => s.id === setId);
    updateSetFeedback(setId, {
      ...set?.feedback,
      rating,
    });
  };

  const handleSetComment = (setId: string, comment: string) => {
    // Validation de la longueur du commentaire
    if (comment.length > MAX_COMMENT_LENGTH) {
      return;
    }
    const set = currentWorkout.sets.find((s) => s.id === setId);
    updateSetFeedback(setId, {
      ...set?.feedback,
      comment: comment || undefined,
    });
  };

  const handleNotesChange = (value: string) => {
    if (value.length > MAX_NOTES_LENGTH) {
      setNotesError(`Maximum ${MAX_NOTES_LENGTH} caractères`);
      return;
    }
    setNotesError(null);
    setNotes(value);
  };

  const handleFinish = async () => {
    // Validation avant sauvegarde
    if (notes.length > MAX_NOTES_LENGTH) {
      setNotesError(`Maximum ${MAX_NOTES_LENGTH} caractères`);
      return;
    }

    setIsSaving(true);
    try {
      // Le workout est déjà sauvegardé automatiquement via autoSaveWorkout
      // On met juste à jour le rating et les notes
      if (currentWorkout && !isGuest) {
        await updateWorkoutFeedback(
          currentWorkout.id,
          selectedRating ?? undefined,
          notes.trim() || undefined
        );
      }
      clearSession();
      router.push("/");
    } catch (error) {
      console.error("Erreur sauvegarde feedback:", error);
      clearSession();
      router.push("/");
    }
  };

  const toggleSetExpand = (setId: string) => {
    setExpandedSetId(expandedSetId === setId ? null : setId);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background p-4 pb-32">
      {/* Header */}
      <div className="mb-8 text-center">
        <Trophy className="mx-auto mb-4 h-16 w-16 text-primary" />
        <h1 className="mb-2 text-2xl font-bold">Séance terminée !</h1>
        <p className="text-muted-foreground">Excellent travail</p>
        {/* Bouton partager */}
        <div className="mt-4">
          <ShareButton workout={currentWorkout} variant="full" />
        </div>
      </div>

      {/* Stats */}
      <div className="mx-auto mb-8 grid w-full max-w-lg grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex flex-col items-center p-4">
            <Repeat className="mb-2 h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">{totalReps}</span>
            <span className="text-xs text-muted-foreground">Reps</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-4">
            <Clock className="mb-2 h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">{formatDuration(totalDuration)}</span>
            <span className="text-xs text-muted-foreground">Durée</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-4">
            <Trophy className="mb-2 h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">{setsCompleted}</span>
            <span className="text-xs text-muted-foreground">Sets</span>
          </CardContent>
        </Card>
      </div>

      {/* Message mode invité */}
      {isGuest && (
        <div className="mx-auto mb-6 w-full max-w-lg rounded-lg bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-600">Mode invité</p>
              <p className="text-sm text-muted-foreground">
                Cette séance ne sera pas sauvegardée.
              </p>
              <Link href="/auth/login" className="text-sm text-primary hover:underline">
                Créer un compte pour garder ton historique
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Feedback par exercice - uniquement pour utilisateurs connectés */}
      {!isGuest && (
        <div className="mx-auto mb-6 w-full max-w-lg">
          <h2 className="mb-3 text-lg font-semibold">Feedback par exercice</h2>
          <div className="flex flex-col gap-2">
            {currentWorkout.sets.map((set, index) => {
              const isExpanded = expandedSetId === set.id;
              const hasFeedback = set.feedback?.rating || set.feedback?.comment;
              const commentLength = set.feedback?.comment?.length || 0;

              return (
                <Card key={set.id}>
                  <CardContent className="p-0">
                    {/* En-tête cliquable */}
                    <button
                      onClick={() => toggleSetExpand(set.id)}
                      className="flex w-full items-center justify-between p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {index + 1}. {set.exerciseName}
                        </span>
                        {hasFeedback && (
                          <span className="text-xs text-primary">
                            {set.feedback?.rating && RATING_OPTIONS.find(r => r.value === set.feedback?.rating)?.emoji}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {set.totalReps} reps
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </button>

                    {/* Zone de feedback */}
                    {isExpanded && (
                      <div className="border-t px-3 pb-3 pt-3">
                        {/* Rating par set */}
                        <div className="mb-3">
                          <span className="mb-2 block text-xs text-muted-foreground">
                            Ressenti
                          </span>
                          <div className="flex justify-center gap-3">
                            {RATING_OPTIONS.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => handleSetRating(set.id, option.value)}
                                className={cn(
                                  "flex flex-col items-center gap-1 rounded-lg p-2 transition-all",
                                  set.feedback?.rating === option.value
                                    ? "bg-primary/20 ring-1 ring-primary"
                                    : "bg-muted/50 hover:bg-muted"
                                )}
                              >
                                <span className="text-xl">{option.emoji}</span>
                                <span className="text-[10px]">{option.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Commentaire par set */}
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Commentaire (optionnel)
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {commentLength}/{MAX_COMMENT_LENGTH}
                            </span>
                          </div>
                          <div className="relative">
                            <MessageSquare className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                              type="text"
                              value={set.feedback?.comment || ""}
                              onChange={(e) => handleSetComment(set.id, e.target.value)}
                              placeholder="Ex: Forme parfaite, fatigue à la fin..."
                              maxLength={MAX_COMMENT_LENGTH}
                              className="w-full rounded-lg bg-muted/50 py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Rating global - uniquement pour les utilisateurs connectés */}
      {!isGuest && (
        <div className="mx-auto mb-6 w-full max-w-lg">
          <h2 className="mb-3 text-lg font-semibold">Ressenti global</h2>
          <div className="flex justify-center gap-4">
            {RATING_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedRating(option.value)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl p-4 transition-all",
                  selectedRating === option.value
                    ? "bg-primary/20 ring-2 ring-primary"
                    : "bg-card hover:bg-card/80"
                )}
              >
                <span className="text-3xl">{option.emoji}</span>
                <span className="text-xs">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notes globales - uniquement pour les utilisateurs connectés */}
      {!isGuest && (
        <div className="mx-auto mb-8 w-full max-w-lg">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Notes (optionnel)</h2>
            <span className="text-xs text-muted-foreground">
              {notes.length}/{MAX_NOTES_LENGTH}
            </span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Ressenti général, forme du jour..."
            maxLength={MAX_NOTES_LENGTH}
            className={cn(
              "w-full rounded-xl bg-card p-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary",
              notesError && "ring-2 ring-destructive"
            )}
            rows={3}
          />
          {notesError && (
            <p className="mt-1 text-xs text-destructive">{notesError}</p>
          )}
        </div>
      )}

      {/* Bouton terminer - fixé en bas */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pb-6 pt-8">
        <div className="mx-auto w-full max-w-lg px-4">
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={handleFinish}
            disabled={isSaving || !!notesError}
          >
            <Home className="h-5 w-5" />
            {isSaving ? "Sauvegarde..." : isGuest ? "Retour à l'accueil" : "Sauvegarder et terminer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
