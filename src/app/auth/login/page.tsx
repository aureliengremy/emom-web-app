"use client";

// ============================================
// Page de connexion
// ============================================

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Container, Main } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import { Dumbbell, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  loginSchema,
  signupSchema,
  type LoginFormData,
  type SignupFormData,
} from "@/lib/validations";

type AuthMode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    isLoading,
    isInitialized,
    initialize,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
  } = useAuthStore();

  // Initialiser le mode depuis l'URL (tab=signup ou tab=login)
  const initialMode = searchParams.get("tab") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Form pour login
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    reset: resetLogin,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Form pour signup
  const {
    register: signupRegister,
    handleSubmit: handleSignupSubmit,
    reset: resetSignup,
    formState: { errors: signupErrors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Mettre à jour le mode si l'URL change
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "signup" || tab === "login") {
      setMode(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isInitialized && user) {
      router.push("/");
    }
  }, [isInitialized, user, router]);

  const handleLogin = async (data: LoginFormData) => {
    const result = await signInWithEmail(data.email, data.password);
    if (result.error) {
      toast.error(result.error);
    } else {
      router.push("/");
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    const result = await signUpWithEmail(data.email, data.password);
    if (result.error) {
      toast.error(result.error);
    } else if (result.needsEmailConfirmation) {
      toast.success("Compte créé ! Vérifie ton email pour confirmer.");
    } else if (result.success) {
      toast.success("Compte créé avec succès !");
      router.push("/");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch {
      toast.error("Erreur lors de la connexion avec Google");
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
    } catch {
      toast.error("Erreur lors de la connexion avec Apple");
    }
  };

  const switchMode = () => {
    const newMode = mode === "login" ? "signup" : "login";
    setMode(newMode);
    // Reset les deux forms quand on switch
    resetLogin();
    resetSignup();
  };

  if (!isInitialized) {
    return (
      <Container>
        <Main>
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Main>
      </Container>
    );
  }

  return (
    <Container>
      <Main>
        <div className="flex min-h-[60vh] flex-col items-center justify-center py-8">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary">
              <Dumbbell className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">EMOM</h1>
            <p className="text-muted-foreground">Every Minute On the Minute</p>
          </div>

          {/* Login Card */}
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-center text-lg">
                {mode === "login" ? "Connexion" : "Créer un compte"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Login Form */}
              {mode === "login" && (
                <form onSubmit={handleLoginSubmit(handleLogin)} className="space-y-3">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      disabled={isLoading}
                      {...loginRegister("email")}
                    />
                    {loginErrors.email && (
                      <p className="mt-1 text-xs text-destructive">
                        {loginErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Input
                      type="password"
                      placeholder="Mot de passe"
                      disabled={isLoading}
                      {...loginRegister("password")}
                    />
                    {loginErrors.password && (
                      <p className="mt-1 text-xs text-destructive">
                        {loginErrors.password.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                    <Mail className="h-4 w-4" />
                    {isLoading ? "Chargement..." : "Se connecter"}
                  </Button>
                </form>
              )}

              {/* Signup Form */}
              {mode === "signup" && (
                <form onSubmit={handleSignupSubmit(handleSignup)} className="space-y-3">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      disabled={isLoading}
                      {...signupRegister("email")}
                    />
                    {signupErrors.email && (
                      <p className="mt-1 text-xs text-destructive">
                        {signupErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Input
                      type="password"
                      placeholder="Mot de passe"
                      disabled={isLoading}
                      {...signupRegister("password")}
                    />
                    {signupErrors.password && (
                      <p className="mt-1 text-xs text-destructive">
                        {signupErrors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Input
                      type="password"
                      placeholder="Confirmer le mot de passe"
                      disabled={isLoading}
                      {...signupRegister("confirmPassword")}
                    />
                    {signupErrors.confirmPassword && (
                      <p className="mt-1 text-xs text-destructive">
                        {signupErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                    <Mail className="h-4 w-4" />
                    {isLoading ? "Chargement..." : "Créer le compte"}
                  </Button>
                </form>
              )}

              {/* Toggle mode */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {mode === "login"
                    ? "Pas de compte ? Créer un compte"
                    : "Déjà un compte ? Se connecter"}
                </button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou</span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <Button
                variant="outline"
                className="w-full gap-3"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuer avec Google
              </Button>

              <Button
                variant="outline"
                className="w-full gap-3"
                onClick={handleAppleSignIn}
                disabled={isLoading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Continuer avec Apple
              </Button>
            </CardContent>
          </Card>

          {/* Skip option */}
          <Button
            variant="ghost"
            className="mt-6 text-muted-foreground"
            onClick={() => {
              sessionStorage.setItem("emom-guest-mode", "true");
              router.push("/");
            }}
          >
            Continuer sans compte
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Mode invité : aucune sauvegarde ni historique
          </p>
        </div>
      </Main>
    </Container>
  );
}
