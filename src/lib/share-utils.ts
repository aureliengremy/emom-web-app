// ============================================
// Utilitaires de partage de séances
// Fonctions pour partager les workouts via Web Share API, presse-papiers
// ou réseaux sociaux (Twitter/X, WhatsApp)
// ============================================

import { Workout, WorkoutRating } from "@/types";

// === Types ===

export type SharePlatform = "native" | "twitter" | "whatsapp";

export interface ShareResult {
  success: boolean;
  method: "share" | "clipboard" | "twitter" | "whatsapp";
}

// === Fonctions utilitaires ===

/**
 * Vérifie si l'API Web Share est disponible
 * @returns true si navigator.share existe
 */
export function canShare(): boolean {
  return typeof navigator !== "undefined" && !!navigator.share;
}

/**
 * Copie le texte dans le presse-papiers
 * @param text - Le texte à copier
 * @returns Promise résolue si la copie a réussi
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    throw new Error("Clipboard API non disponible");
  }
  await navigator.clipboard.writeText(text);
}

/**
 * Retourne l'emoji correspondant au rating de la séance
 * @param rating - Le rating de la séance
 * @returns L'emoji correspondant ou une chaîne vide
 */
function getRatingEmoji(rating?: WorkoutRating): string {
  switch (rating) {
    case "easy":
      return "😎 Facile";
    case "medium":
      return "💪 Moyen";
    case "hard":
      return "🔥 Difficile";
    default:
      return "";
  }
}

/**
 * Formate une date ISO en format français lisible
 * @param isoDate - Date au format ISO
 * @returns Date formatée en français
 */
function formatDateFr(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Calcule la durée totale en minutes
 * @param totalDuration - Durée en secondes
 * @returns Durée en minutes (arrondie)
 */
function getDurationMinutes(totalDuration: number): number {
  return Math.round(totalDuration / 60);
}

/**
 * Extrait les noms d'exercices uniques de la séance
 * @param workout - La séance
 * @returns Liste des noms d'exercices uniques
 */
function getUniqueExerciseNames(workout: Workout): string[] {
  const names = workout.sets.map((set) => set.exerciseName);
  return [...new Set(names)];
}

/**
 * Formate un workout en texte partageable
 * @param workout - La séance à formater
 * @returns Texte formaté pour le partage
 */
export function formatWorkoutForShare(workout: Workout): string {
  const date = formatDateFr(workout.date);
  const duration = getDurationMinutes(workout.totalDuration);
  const exerciseNames = getUniqueExerciseNames(workout);
  const exerciseList = exerciseNames.join(", ");
  const ratingLine = getRatingEmoji(workout.rating);

  // Construction du message
  let message = `🏋️ Séance EMOM terminée !
📅 ${date}
💪 ${workout.totalReps} reps
⏱️ ${duration} min
🎯 Exercices: ${exerciseList}`;

  // Ajout du rating si présent
  if (ratingLine) {
    message += `\n${ratingLine}`;
  }

  return message;
}

// === URLs de partage réseaux sociaux ===

/**
 * Génère l'URL de partage Twitter/X
 * @param workout - La séance à partager
 * @returns URL Twitter intent avec le texte encodé
 */
export function getTwitterShareUrl(workout: Workout): string {
  const text = formatWorkoutForShare(workout);
  const encodedText = encodeURIComponent(text);
  return `https://twitter.com/intent/tweet?text=${encodedText}`;
}

/**
 * Génère l'URL de partage WhatsApp
 * @param workout - La séance à partager
 * @returns URL WhatsApp avec le texte encodé
 */
export function getWhatsAppShareUrl(workout: Workout): string {
  const text = formatWorkoutForShare(workout);
  const encodedText = encodeURIComponent(text);
  // Utilise api.whatsapp.com pour une meilleure compatibilité mobile/desktop
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

/**
 * Ouvre une URL de partage dans une nouvelle fenêtre
 * @param url - L'URL à ouvrir
 */
function openShareWindow(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Partage un workout via Web Share API, presse-papiers ou réseau social
 * - "native" (défaut): Utilise Web Share API si disponible, sinon clipboard
 * - "twitter": Ouvre Twitter/X avec le texte pré-rempli
 * - "whatsapp": Ouvre WhatsApp avec le texte pré-rempli
 * @param workout - La séance à partager
 * @param platform - Plateforme de partage (native, twitter, whatsapp)
 * @returns Résultat du partage avec la méthode utilisée
 */
export async function shareWorkout(
  workout: Workout,
  platform: SharePlatform = "native"
): Promise<ShareResult> {
  // Partage vers Twitter
  if (platform === "twitter") {
    const url = getTwitterShareUrl(workout);
    openShareWindow(url);
    return { success: true, method: "twitter" };
  }

  // Partage vers WhatsApp
  if (platform === "whatsapp") {
    const url = getWhatsAppShareUrl(workout);
    openShareWindow(url);
    return { success: true, method: "whatsapp" };
  }

  // Comportement par défaut: Web Share API ou clipboard
  const text = formatWorkoutForShare(workout);

  // Tentative avec Web Share API
  if (canShare()) {
    try {
      await navigator.share({
        title: "Ma séance EMOM",
        text: text,
      });
      return { success: true, method: "share" };
    } catch (error) {
      // L'utilisateur a annulé ou erreur - fallback vers clipboard
      // Note: AbortError signifie que l'utilisateur a annulé, ce n'est pas une erreur
      if (error instanceof Error && error.name === "AbortError") {
        return { success: false, method: "share" };
      }
    }
  }

  // Fallback vers le presse-papiers
  try {
    await copyToClipboard(text);
    return { success: true, method: "clipboard" };
  } catch {
    return { success: false, method: "clipboard" };
  }
}
