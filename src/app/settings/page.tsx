"use client";

// ============================================
// Page paramètres
// ============================================

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container, Header, Main } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettingsStore } from "@/stores/settings-store";
import { useAuthStore } from "@/stores/auth-store";
import { PAUSE_DURATIONS, EMOM_DURATIONS } from "@/types";
import {
  ArrowLeft,
  Volume2,
  Vibrate,
  Clock,
  Timer,
  User,
  LogOut,
  LogIn,
  Languages,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const { user, isLoading, isInitialized, initialize, signOut } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const formatPauseDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (secs === 0) return `${mins} min`;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Déconnecté");
    } catch {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <Container>
      <Header>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Paramètres</h1>
        </div>
      </Header>

      <Main>
        {/* Compte */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Compte
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isInitialized && user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                      {(user.email?.[0] ?? "U").toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {user.user_metadata?.full_name ?? user.email}
                    </p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleSignOut}
                  disabled={isLoading}
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mode local</p>
                  <p className="text-sm text-muted-foreground">
                    Connecte-toi pour synchroniser
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => router.push("/auth/login")}
                >
                  <LogIn className="h-4 w-4" />
                  Connexion
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Langue des exercices */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Languages className="h-4 w-4" />
              Langue des exercices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={settings.language === "fr" ? "default" : "outline"}
                size="sm"
                onClick={() => updateSettings({ language: "fr" })}
                className={cn(
                  settings.language === "fr" && "ring-2 ring-primary ring-offset-2"
                )}
              >
                🇫🇷 Français
              </Button>
              <Button
                variant={settings.language === "en" ? "default" : "outline"}
                size="sm"
                onClick={() => updateSettings({ language: "en" })}
                className={cn(
                  settings.language === "en" && "ring-2 ring-primary ring-offset-2"
                )}
              >
                🇬🇧 English
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Son et vibration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-muted-foreground" />
                <span>Son</span>
              </div>
              <Button
                variant={settings.soundEnabled ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  updateSettings({ soundEnabled: !settings.soundEnabled })
                }
              >
                {settings.soundEnabled ? "Activé" : "Désactivé"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Vibrate className="h-5 w-5 text-muted-foreground" />
                <span>Vibration</span>
              </div>
              <Button
                variant={settings.vibrationEnabled ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  updateSettings({ vibrationEnabled: !settings.vibrationEnabled })
                }
              >
                {settings.vibrationEnabled ? "Activé" : "Désactivé"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Durée pause par défaut */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Pause entre sets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {PAUSE_DURATIONS.map((duration) => (
                <Button
                  key={duration}
                  variant={
                    settings.defaultPauseDuration === duration
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    updateSettings({ defaultPauseDuration: duration })
                  }
                  className={cn(
                    settings.defaultPauseDuration === duration &&
                      "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  {formatPauseDuration(duration)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Durée EMOM par défaut */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Timer className="h-4 w-4" />
              Durée EMOM par défaut
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {EMOM_DURATIONS.map((duration) => (
                <Button
                  key={duration}
                  variant={
                    settings.defaultEMOMDuration === duration
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    updateSettings({ defaultEMOMDuration: duration })
                  }
                  className={cn(
                    settings.defaultEMOMDuration === duration &&
                      "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  {duration} min
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info version */}
        <div className="text-center text-sm text-muted-foreground">
          <p>EMOM Web App v1.0</p>
          <p className="mt-1">Développé avec Next.js + Shadcn/ui</p>
        </div>
      </Main>
    </Container>
  );
}
