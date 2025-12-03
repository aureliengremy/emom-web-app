"use client";

// ============================================
// Hook useSound - Notifications sonores
// ============================================

import { useCallback, useRef, useEffect } from "react";
import { useSettingsStore } from "@/stores/settings-store";

// Fréquences des sons (Hz)
const SOUNDS = {
  beep: 880, // La4 - signal de minute
  start: 523.25, // Do5 - début
  complete: 659.25, // Mi5 - succès
  warning: 440, // La3 - attention
} as const;

type SoundType = keyof typeof SOUNDS;

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEnabled = useSettingsStore((s) => s.settings.soundEnabled);
  const vibrationEnabled = useSettingsStore((s) => s.settings.vibrationEnabled);

  // Initialiser AudioContext au premier usage
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Jouer un son
  const playSound = useCallback(
    (type: SoundType, duration = 150) => {
      if (!soundEnabled) return;

      try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = SOUNDS[type];
        oscillator.type = "sine";

        // Fade out pour éviter le click
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          ctx.currentTime + duration / 1000
        );

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration / 1000);
      } catch (error) {
        console.warn("Audio error:", error);
      }
    },
    [soundEnabled, getAudioContext]
  );

  // Vibrer
  const vibrate = useCallback(
    (pattern: number | number[] = 100) => {
      if (!vibrationEnabled) return;

      try {
        if (navigator.vibrate) {
          navigator.vibrate(pattern);
        }
      } catch (error) {
        console.warn("Vibration error:", error);
      }
    },
    [vibrationEnabled]
  );

  // Sons prédéfinis
  const playBeep = useCallback(() => {
    playSound("beep", 100);
    vibrate(50);
  }, [playSound, vibrate]);

  const playStart = useCallback(() => {
    playSound("start", 200);
    vibrate([50, 50, 50]);
  }, [playSound, vibrate]);

  const playComplete = useCallback(() => {
    playSound("complete", 300);
    vibrate([100, 50, 100]);
  }, [playSound, vibrate]);

  const playWarning = useCallback(() => {
    playSound("warning", 150);
    vibrate(200);
  }, [playSound, vibrate]);

  // Nettoyer à la destruction
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    playSound,
    vibrate,
    playBeep,
    playStart,
    playComplete,
    playWarning,
  };
}
