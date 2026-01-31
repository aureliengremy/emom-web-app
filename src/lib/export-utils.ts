// ============================================
// Utilitaires d'export des données
// ============================================

import type { Workout, Exercise, SavedSession, UserSettings } from "@/types";

// === Types d'export ===

interface ExportMetadata {
  exportDate: string;
  appVersion: string;
  count: number;
}

interface FullBackupMetadata {
  exportDate: string;
  appVersion: string;
  dataTypes: string[];
  counts: {
    workouts: number;
    exercises: number;
    sessions: number;
  };
}

export interface FullBackup {
  metadata: FullBackupMetadata;
  workouts: Workout[];
  exercises: Exercise[];
  sessions: SavedSession[];
  settings?: UserSettings;
}

// === Export JSON ===

export function exportWorkoutsToJSON(workouts: Workout[]): void {
  const exportData = {
    metadata: createMetadata(workouts.length),
    data: workouts,
  };
  downloadFile(JSON.stringify(exportData, null, 2), "emom-workouts.json", "application/json");
}

export function exportExercisesToJSON(exercises: Exercise[]): void {
  const exportData = {
    metadata: createMetadata(exercises.length),
    data: exercises,
  };
  downloadFile(JSON.stringify(exportData, null, 2), "emom-exercises.json", "application/json");
}

export function exportSessionsToJSON(sessions: SavedSession[]): void {
  const exportData = {
    metadata: createMetadata(sessions.length),
    data: sessions,
  };
  downloadFile(JSON.stringify(exportData, null, 2), "emom-sessions.json", "application/json");
}

// === Sauvegarde complète ===

export function exportFullBackup(
  workouts: Workout[],
  exercises: Exercise[],
  sessions: SavedSession[],
  settings?: UserSettings
): void {
  const backup: FullBackup = {
    metadata: {
      exportDate: new Date().toISOString(),
      appVersion: "1.0.0",
      dataTypes: ["workouts", "exercises", "sessions", ...(settings ? ["settings"] : [])],
      counts: {
        workouts: workouts.length,
        exercises: exercises.length,
        sessions: sessions.length,
      },
    },
    workouts,
    exercises,
    sessions,
    ...(settings && { settings }),
  };

  const date = new Date().toISOString().split("T")[0];
  downloadFile(
    JSON.stringify(backup, null, 2),
    `emom-backup-complet-${date}.json`,
    "application/json"
  );
}

// === Export CSV ===

export function exportWorkoutsToCSV(workouts: Workout[]): void {
  const headers = [
    "Date",
    "Durée (min)",
    "Reps totales",
    "Exercices",
    "Ressenti",
    "Notes",
  ];

  const rows = workouts.map((workout) => {
    const exerciseNames = [...new Set(workout.sets.map((s) => s.exerciseName))].join(", ");
    const durationMin = Math.round(workout.totalDuration / 60);

    return [
      formatDateFrench(workout.date),
      durationMin.toString(),
      workout.totalReps.toString(),
      escapeCsvValue(exerciseNames),
      translateRating(workout.rating),
      escapeCsvValue(workout.notes ?? ""),
    ];
  });

  const csv = [headers.join(";"), ...rows.map((row) => row.join(";"))].join("\n");
  // Ajout du BOM UTF-8 pour Excel
  downloadFile("\uFEFF" + csv, "emom-workouts.csv", "text/csv;charset=utf-8");
}

export function exportExercisesToCSV(exercises: Exercise[]): void {
  const headers = [
    "Nom",
    "Catégorie",
    "Type",
    "Difficulté",
    "Max actuel",
    "Dernière mise à jour",
  ];

  const rows = exercises.map((exercise) => [
    escapeCsvValue(exercise.nameFr || exercise.name),
    translateCategory(exercise.category),
    translateExerciseType(exercise.type),
    translateDifficulty(exercise.difficulty),
    exercise.currentMax.toString(),
    formatDateFrench(exercise.lastTested),
  ]);

  const csv = [headers.join(";"), ...rows.map((row) => row.join(";"))].join("\n");
  downloadFile("\uFEFF" + csv, "emom-exercises.csv", "text/csv;charset=utf-8");
}

export function exportSessionsToCSV(sessions: SavedSession[]): void {
  const headers = [
    "Nom",
    "Description",
    "Exercices",
    "Durée pause (s)",
    "Créée le",
    "Modifiée le",
  ];

  const rows = sessions.map((session) => {
    const exercisesStr = session.sets
      .map((s, i) => `${i + 1}. ${s.exerciseName}: ${s.reps} reps x ${s.duration} min`)
      .join(" | ");

    return [
      escapeCsvValue(session.name),
      escapeCsvValue(session.description || ""),
      escapeCsvValue(exercisesStr),
      session.pauseDuration.toString(),
      formatDateFrench(session.createdAt),
      formatDateFrench(session.updatedAt),
    ];
  });

  const csv = [headers.join(";"), ...rows.map((row) => row.join(";"))].join("\n");
  downloadFile("\uFEFF" + csv, "emom-sessions.csv", "text/csv;charset=utf-8");
}

// === Helpers ===

function createMetadata(count: number): ExportMetadata {
  return {
    exportDate: new Date().toISOString(),
    appVersion: "1.0.0",
    count,
  };
}

function escapeCsvValue(value: string): string {
  // Échapper les guillemets et entourer de guillemets si nécessaire
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    const escaped = value.split('"').join('""');
    return '"' + escaped + '"';
  }
  return value;
}

function formatDateFrench(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function translateRating(rating?: string): string {
  switch (rating) {
    case "easy":
      return "Facile";
    case "medium":
      return "Moyen";
    case "hard":
      return "Difficile";
    default:
      return "";
  }
}

function translateCategory(category: string): string {
  switch (category) {
    case "push":
      return "Poussée";
    case "pull":
      return "Tirage";
    case "legs":
      return "Jambes";
    case "core":
      return "Core";
    default:
      return category;
  }
}

function translateExerciseType(type: string): string {
  return type === "preset" ? "Prédéfini" : "Personnalisé";
}

function translateDifficulty(difficulty?: string): string {
  switch (difficulty) {
    case "novice":
      return "Novice";
    case "classique":
      return "Classique";
    case "intermediaire":
      return "Intermédiaire";
    case "avance":
      return "Avancé";
    case "expert":
      return "Expert";
    default:
      return "";
  }
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
