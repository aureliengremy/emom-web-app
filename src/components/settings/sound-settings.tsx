"use client";

// ============================================
// Section de configuration des sons du countdown
// ============================================

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/stores/settings-store";
import { Volume2, VolumeX, Music, Play, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { SoundPackId } from "@/types";
import {
  SOUND_PACKS,
  playTick10s,
  playTick5to1,
  playFinish,
} from "@/lib/sound-packs";

export function SoundSettings() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const [testingPack, setTestingPack] = useState<SoundPackId | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialiser l'AudioContext au premier clic (requis par les navigateurs)
  const getAudioContext = (): AudioContext => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  };

  // Nettoyer l'AudioContext au demontage
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleToggleSounds = () => {
    updateSettings({ countdownSoundsEnabled: !settings.countdownSoundsEnabled });
  };

  const handleSelectPack = (packId: SoundPackId) => {
    updateSettings({ countdownSoundPack: packId });
  };

  const handleTestPack = async (packId: SoundPackId) => {
    setTestingPack(packId);

    try {
      const audioContext = getAudioContext();

      // Jouer les 3 sons avec un delai entre chacun
      playTick10s(packId, audioContext);

      await new Promise((resolve) => setTimeout(resolve, 400));
      playTick5to1(packId, audioContext);

      await new Promise((resolve) => setTimeout(resolve, 400));
      playFinish(packId, audioContext);

      await new Promise((resolve) => setTimeout(resolve, 600));

      const pack = SOUND_PACKS.find((p) => p.id === packId);
      toast.success(`Pack "${pack?.name}" teste`);
    } catch (error) {
      console.error("Erreur lors du test du pack:", error);
      toast.error("Impossible de tester le pack");
    } finally {
      setTestingPack(null);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Music className="h-4 w-4" />
          Sons du countdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle activer/desactiver */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.countdownSoundsEnabled ? (
              <Volume2 className="h-5 w-5 text-muted-foreground" />
            ) : (
              <VolumeX className="h-5 w-5 text-muted-foreground" />
            )}
            <span>Sons de decompte</span>
          </div>
          <Button
            variant={settings.countdownSoundsEnabled ? "default" : "outline"}
            size="sm"
            onClick={handleToggleSounds}
          >
            {settings.countdownSoundsEnabled ? "Active" : "Desactive"}
          </Button>
        </div>

        {/* Selecteur de pack (visible seulement si sons actives) */}
        {settings.countdownSoundsEnabled && (
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">
              Choisis le style de sons :
            </p>
            <div className="space-y-2">
              {SOUND_PACKS.map((pack) => {
                const isSelected = settings.countdownSoundPack === pack.id;
                const isTesting = testingPack === pack.id;

                return (
                  <div
                    key={pack.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-3 transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <button
                      type="button"
                      className="flex flex-1 items-start gap-3 text-left"
                      onClick={() => handleSelectPack(pack.id)}
                    >
                      <div
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        )}
                      >
                        {isSelected && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{pack.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {pack.description}
                        </p>
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 shrink-0"
                      onClick={() => handleTestPack(pack.id)}
                      disabled={isTesting}
                    >
                      {isTesting ? (
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                          <span className="h-2 w-2 animate-pulse rounded-full bg-primary delay-75" />
                          <span className="h-2 w-2 animate-pulse rounded-full bg-primary delay-150" />
                        </span>
                      ) : (
                        <>
                          <Play className="mr-1 h-3 w-3" />
                          Tester
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
