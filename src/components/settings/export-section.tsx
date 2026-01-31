"use client";

// ============================================
// Section export des données
// ============================================

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileJson,
  FileSpreadsheet,
  Loader2,
  Database,
} from "lucide-react";
import { useWorkoutStore } from "@/stores/workout-store";
import { useExerciseStore } from "@/stores/exercise-store";
import { useSessionStore } from "@/stores/session-store";
import { useSettingsStore } from "@/stores/settings-store";
import {
  exportWorkoutsToJSON,
  exportWorkoutsToCSV,
  exportExercisesToJSON,
  exportExercisesToCSV,
  exportSessionsToJSON,
  exportSessionsToCSV,
  exportFullBackup,
} from "@/lib/export-utils";
import { toast } from "sonner";

type ExportType =
  | "workouts-json"
  | "workouts-csv"
  | "exercises-json"
  | "exercises-csv"
  | "sessions-json"
  | "sessions-csv"
  | "full-backup";

export function ExportSection() {
  const [loadingExport, setLoadingExport] = useState<ExportType | null>(null);

  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const exercises = useExerciseStore((s) => s.exercises);
  const savedSessions = useSessionStore((s) => s.savedSessions);
  const settings = useSettingsStore((s) => s.settings);

  const workoutCount = workoutHistory.length;
  const exerciseCount = exercises.length;
  const sessionCount = savedSessions.length;
  const hasAnyData = workoutCount > 0 || exerciseCount > 0 || sessionCount > 0;

  const handleExport = async (type: ExportType) => {
    setLoadingExport(type);

    try {
      // Petit délai pour afficher le loading
      await new Promise((resolve) => setTimeout(resolve, 100));

      switch (type) {
        case "workouts-json":
          exportWorkoutsToJSON(workoutHistory);
          toast.success("Historique exporté en JSON");
          break;
        case "workouts-csv":
          exportWorkoutsToCSV(workoutHistory);
          toast.success("Historique exporté en CSV");
          break;
        case "exercises-json":
          exportExercisesToJSON(exercises);
          toast.success("Exercices exportés en JSON");
          break;
        case "exercises-csv":
          exportExercisesToCSV(exercises);
          toast.success("Exercices exportés en CSV");
          break;
        case "sessions-json":
          exportSessionsToJSON(savedSessions);
          toast.success("Sessions exportées en JSON");
          break;
        case "sessions-csv":
          exportSessionsToCSV(savedSessions);
          toast.success("Sessions exportées en CSV");
          break;
        case "full-backup":
          exportFullBackup(workoutHistory, exercises, savedSessions, settings);
          toast.success("Sauvegarde complète exportée");
          break;
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erreur lors de l'export");
    } finally {
      setLoadingExport(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sauvegarde complète - Section mise en avant */}
      <Card className="mb-6 border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4" />
            Sauvegarde complète
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Exporte toutes tes données en un seul fichier JSON.
          </p>

          {/* Résumé des données */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{workoutCount} séances</Badge>
            <Badge variant="secondary">{exerciseCount} exercices</Badge>
            <Badge variant="secondary">{sessionCount} sessions</Badge>
          </div>

          <Button
            className="w-full gap-2"
            disabled={!hasAnyData || loadingExport !== null}
            onClick={() => handleExport("full-backup")}
          >
            {loadingExport === "full-backup" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Télécharger la sauvegarde
          </Button>

          {!hasAnyData && (
            <p className="text-center text-sm text-muted-foreground">
              Aucune donnée à exporter
            </p>
          )}
        </CardContent>
      </Card>

      {/* Export individuel */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Download className="h-4 w-4" />
            Export individuel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Export historique des séances */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Historique des séances ({workoutCount})
            </p>
            {workoutCount > 0 ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={loadingExport !== null}
                  onClick={() => handleExport("workouts-json")}
                >
                  {loadingExport === "workouts-json" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileJson className="h-4 w-4" />
                  )}
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={loadingExport !== null}
                  onClick={() => handleExport("workouts-csv")}
                >
                  {loadingExport === "workouts-csv" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}
                  CSV
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune séance à exporter
              </p>
            )}
          </div>

          {/* Export exercices */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Mes exercices ({exerciseCount})
            </p>
            {exerciseCount > 0 ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={loadingExport !== null}
                  onClick={() => handleExport("exercises-json")}
                >
                  {loadingExport === "exercises-json" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileJson className="h-4 w-4" />
                  )}
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={loadingExport !== null}
                  onClick={() => handleExport("exercises-csv")}
                >
                  {loadingExport === "exercises-csv" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}
                  CSV
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucun exercice à exporter
              </p>
            )}
          </div>

          {/* Export sessions sauvegardées */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Sessions sauvegardées ({sessionCount})
            </p>
            {sessionCount > 0 ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={loadingExport !== null}
                  onClick={() => handleExport("sessions-json")}
                >
                  {loadingExport === "sessions-json" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileJson className="h-4 w-4" />
                  )}
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={loadingExport !== null}
                  onClick={() => handleExport("sessions-csv")}
                >
                  {loadingExport === "sessions-csv" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}
                  CSV
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune session sauvegardée
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
