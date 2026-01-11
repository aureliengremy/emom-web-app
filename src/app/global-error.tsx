"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log l'erreur critique (TODO: envoyer à Sentry)
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html lang="fr" className="dark">
      <body className="bg-zinc-950 text-zinc-50 min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Erreur critique</h1>
            <p className="text-zinc-400">
              Une erreur inattendue s&apos;est produite. Veuillez rafraîchir la
              page.
            </p>
          </div>

          <button
            onClick={reset}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
          >
            Rafraîchir la page
          </button>
        </div>
      </body>
    </html>
  );
}
