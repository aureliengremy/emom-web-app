// ============================================
// Sound Packs - Packs de sons pour le countdown
// Utilise Web Audio API pour generer des sons
// ============================================

import type { SoundPackId } from "@/types";

// === Types ===

export interface SoundPackSounds {
  tick10s: SoundConfig;    // Son a 10 secondes
  tick5to1: SoundConfig;   // Son de 5 a 1 seconde
  finish: SoundConfig;     // Son a la fin (0 seconde)
}

export interface SoundConfig {
  frequency: number;       // Frequence en Hz
  type: OscillatorType;    // Type d'onde (sine, square, triangle, sawtooth)
  duration: number;        // Duree en ms
  volume: number;          // Volume (0-1)
  attack?: number;         // Temps de montee en ms (optionnel)
  decay?: number;          // Temps de descente en ms (optionnel)
  secondFrequency?: number; // Deuxieme frequence pour effet (optionnel)
}

export interface SoundPack {
  id: SoundPackId;
  name: string;
  description: string;
  sounds: SoundPackSounds;
}

// === Packs de sons ===

const minimalPack: SoundPack = {
  id: "minimal",
  name: "Minimal",
  description: "Sons discrets et subtils",
  sounds: {
    tick10s: {
      frequency: 800,
      type: "sine",
      duration: 50,
      volume: 0.15,
    },
    tick5to1: {
      frequency: 1000,
      type: "sine",
      duration: 80,
      volume: 0.2,
    },
    finish: {
      frequency: 523.25, // Do5
      type: "sine",
      duration: 400,
      volume: 0.3,
      decay: 300,
    },
  },
};

const sportPack: SoundPack = {
  id: "sport",
  name: "Sport",
  description: "Beeps courts et buzzer energique",
  sounds: {
    tick10s: {
      frequency: 1200,
      type: "square",
      duration: 40,
      volume: 0.2,
    },
    tick5to1: {
      frequency: 1500,
      type: "square",
      duration: 60,
      volume: 0.25,
    },
    finish: {
      frequency: 440,
      type: "sawtooth",
      duration: 500,
      volume: 0.35,
      secondFrequency: 880,
    },
  },
};

const zenPack: SoundPack = {
  id: "zen",
  name: "Zen",
  description: "Cloche tibetaine et gong profond",
  sounds: {
    tick10s: {
      frequency: 528, // Frequence Solfege
      type: "sine",
      duration: 150,
      volume: 0.15,
      decay: 100,
    },
    tick5to1: {
      frequency: 639, // Frequence Solfege
      type: "sine",
      duration: 200,
      volume: 0.2,
      decay: 150,
    },
    finish: {
      frequency: 174.61, // Fa2 - gong profond
      type: "sine",
      duration: 800,
      volume: 0.3,
      attack: 50,
      decay: 600,
    },
  },
};

const arcadePack: SoundPack = {
  id: "arcade",
  name: "Arcade",
  description: "Sons 8-bit retro",
  sounds: {
    tick10s: {
      frequency: 440,
      type: "square",
      duration: 30,
      volume: 0.15,
    },
    tick5to1: {
      frequency: 660,
      type: "square",
      duration: 50,
      volume: 0.2,
    },
    finish: {
      frequency: 523.25,
      type: "square",
      duration: 100,
      volume: 0.25,
      secondFrequency: 659.25,
    },
  },
};

// === Liste des packs ===

export const SOUND_PACKS: SoundPack[] = [
  minimalPack,
  sportPack,
  zenPack,
  arcadePack,
];

// === Fonctions ===

/**
 * Recupere un pack de sons par son ID
 */
export function getSoundPack(packId: SoundPackId): SoundPack {
  const pack = SOUND_PACKS.find((p) => p.id === packId);
  return pack ?? minimalPack; // Fallback sur minimal
}

/**
 * Joue un son avec la configuration donnee
 * Utilise Web Audio API pour generer le son
 */
export function playSound(
  config: SoundConfig,
  audioContext: AudioContext
): void {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = config.frequency;
  oscillator.type = config.type;

  const now = audioContext.currentTime;
  const durationSec = config.duration / 1000;
  const attackSec = (config.attack ?? 10) / 1000;
  const decaySec = (config.decay ?? config.duration * 0.3) / 1000;

  // Envelope ADSR simplifiee
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(config.volume, now + attackSec);
  gainNode.gain.setValueAtTime(config.volume, now + durationSec - decaySec);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + durationSec);

  // Deuxieme frequence pour effet (si definie)
  if (config.secondFrequency) {
    oscillator.frequency.setValueAtTime(config.frequency, now);
    oscillator.frequency.linearRampToValueAtTime(
      config.secondFrequency,
      now + durationSec * 0.5
    );
  }

  oscillator.start(now);
  oscillator.stop(now + durationSec);
}

/**
 * Joue le son tick a 10 secondes
 */
export function playTick10s(
  packId: SoundPackId,
  audioContext: AudioContext
): void {
  const pack = getSoundPack(packId);
  playSound(pack.sounds.tick10s, audioContext);
}

/**
 * Joue le son tick de 5 a 1 seconde
 */
export function playTick5to1(
  packId: SoundPackId,
  audioContext: AudioContext
): void {
  const pack = getSoundPack(packId);
  playSound(pack.sounds.tick5to1, audioContext);
}

/**
 * Joue le son de fin (0 seconde)
 */
export function playFinish(
  packId: SoundPackId,
  audioContext: AudioContext
): void {
  const pack = getSoundPack(packId);
  playSound(pack.sounds.finish, audioContext);
}
