"use client";

// ============================================
// Bouton de partage de séance
// ============================================

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Loader2, Check } from "lucide-react";
import { shareWorkout } from "@/lib/share-utils";
import { toast } from "sonner";
import { Workout } from "@/types";

interface ShareButtonProps {
  workout: Workout;
  variant?: "icon" | "full";
  size?: "sm" | "default";
}

export function ShareButton({
  workout,
  variant = "icon",
  size = "default",
}: ShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleShare = async () => {
    setIsLoading(true);
    setIsSuccess(false);

    try {
      const result = await shareWorkout(workout);

      if (result.success) {
        setIsSuccess(true);
        // Message différent selon la méthode utilisée
        if (result.method === "clipboard") {
          toast.success("Copié dans le presse-papier");
        } else {
          toast.success("Séance partagée !");
        }
        // Reset après 2 secondes
        setTimeout(() => setIsSuccess(false), 2000);
      }
    } catch {
      toast.error("Erreur lors du partage");
    } finally {
      setIsLoading(false);
    }
  };

  // Détermine l'icône à afficher
  const Icon = isLoading ? Loader2 : isSuccess ? Check : Share2;
  const iconClassName = isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4";

  // Mode icon uniquement
  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size={size === "sm" ? "icon-sm" : "icon"}
        onClick={handleShare}
        disabled={isLoading}
        aria-label="Partager la séance"
      >
        <Icon className={iconClassName} />
      </Button>
    );
  }

  // Mode full avec texte
  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleShare}
      disabled={isLoading}
      className="gap-2"
    >
      <Icon className={iconClassName} />
      Partager
    </Button>
  );
}
