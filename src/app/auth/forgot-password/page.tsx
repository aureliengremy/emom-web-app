"use client";

// ============================================
// Page mot de passe oublié
// ============================================

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Container, Main } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations";

export default function ForgotPasswordPage() {
  const { isLoading, resetPassword } = useAuthStore();
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const result = await resetPassword(data.email);
    if (result.error) {
      toast.error(result.error);
    } else {
      setEmailSent(true);
    }
  };

  return (
    <Container>
      <Main>
        <div className="flex min-h-[60vh] flex-col items-center justify-center py-8">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-center text-lg">
                Mot de passe oublié
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {emailSent ? (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Un email de réinitialisation a été envoyé. Vérifie ta boîte
                    de réception et clique sur le lien pour définir un nouveau
                    mot de passe.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-center text-sm text-muted-foreground">
                    Entre ton adresse email pour recevoir un lien de
                    réinitialisation.
                  </p>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    <div>
                      <Input
                        type="email"
                        placeholder="Email"
                        disabled={isLoading}
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-destructive">
                          {errors.email.message}
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
                        <Mail className="h-4 w-4" />
                      )}
                      {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
                    </Button>
                  </form>
                </>
              )}

              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Retour à la connexion
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    </Container>
  );
}
