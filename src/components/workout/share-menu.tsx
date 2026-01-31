"use client";

import { useSyncExternalStore } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Twitter, MessageCircle } from "lucide-react";
import {
  shareWorkout,
  copyToClipboard,
  formatWorkoutForShare,
  getTwitterShareUrl,
  getWhatsAppShareUrl,
  canShare,
} from "@/lib/share-utils";
import { toast } from "sonner";
import type { Workout } from "@/types";

interface ShareMenuProps {
  workout: Workout;
}

// Check Web Share API availability (client-side only)
function useCanShare(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => canShare(),
    () => false // Server snapshot: always false
  );
}

export function ShareMenu({ workout }: ShareMenuProps) {
  const showNativeShare = useCanShare();

  const handleNativeShare = async () => {
    const result = await shareWorkout(workout, "native");
    if (result.success && result.method === "clipboard") {
      toast.success("Copié dans le presse-papiers !");
    } else if (result.success && result.method === "share") {
      toast.success("Partagé !");
    }
  };

  const handleCopyText = async () => {
    const text = formatWorkoutForShare(workout);
    try {
      await copyToClipboard(text);
      toast.success("Copié dans le presse-papiers !");
    } catch {
      toast.error("Impossible de copier le texte");
    }
  };

  const handleTwitterShare = () => {
    const url = getTwitterShareUrl(workout);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleWhatsAppShare = () => {
    const url = getWhatsAppShareUrl(workout);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Share2 className="size-4" />
          <span className="sr-only">Partager</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {showNativeShare && (
          <DropdownMenuItem onClick={handleNativeShare}>
            <Share2 className="size-4" />
            <span>Partager</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleCopyText}>
          <Copy className="size-4" />
          <span>Copier le texte</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleTwitterShare}>
          <Twitter className="size-4" />
          <span>Twitter / X</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWhatsAppShare}>
          <MessageCircle className="size-4" />
          <span>WhatsApp</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
