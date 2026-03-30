"use client";

// ============================================
// Page de réinitialisation du mot de passe
// ============================================

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Container, Main } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/validations";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { user, isLoading, isInitialized, initialize, updatePassword } =
    useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Rediriger vers login si pas de session (le callback doit d'abord établir la session)
  useEffect(() => {
    if (isInitialized && !user) {
      router.push("/auth/login");
    }
  }, [isInitialized, user, router]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    const result = await updatePassword(data.password);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Mot de passe mis à jour avec succès !");
      router.push("/");
    }
  };

  if (!isInitialized || !user) {
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
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-center text-lg">
                Nouveau mot de passe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Choisis un nouveau mot de passe pour ton compte.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div>
                  <Input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    disabled={isLoading}
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    disabled={isLoading}
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="h-4 w-4" />
                  )}
                  {isLoading
                    ? "Mise à jour..."
                    : "Mettre à jour le mot de passe"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </Main>
    </Container>
  );
}
