"use client";

// ============================================
// PullToRefresh - Composant pull-to-refresh pour mobile
// ============================================

import { useRef, useState, useCallback, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  /** Seuil de distance pour déclencher le refresh (px) */
  threshold?: number;
  /** Désactiver le pull-to-refresh */
  disabled?: boolean;
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  disabled = false,
  className,
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const startY = useRef(0);
  const isPulling = useRef(false);

  // Vérifier si c'est un appareil tactile
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || isRefreshing) return;

      // Vérifier si on est en haut de la page
      const container = containerRef.current;
      if (!container) return;

      // Seulement si le scroll est en haut
      if (window.scrollY > 0) return;

      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    },
    [disabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPulling.current || disabled || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      // Seulement si on tire vers le bas
      if (diff > 0) {
        // Résistance pour un effet plus naturel
        const resistance = 0.4;
        const distance = Math.min(diff * resistance, threshold * 1.5);
        setPullDistance(distance);
      }
    },
    [disabled, isRefreshing, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;

    isPulling.current = false;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold * 0.6); // Garder un peu visible pendant le refresh

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  // Ne pas rendre l'indicateur sur desktop
  if (!isTouchDevice) {
    return <div className={className}>{children}</div>;
  }

  const progress = Math.min(pullDistance / threshold, 1);
  const showIndicator = pullDistance > 10 || isRefreshing;

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Indicateur de pull */}
      <div
        className={cn(
          "absolute left-1/2 z-20 flex -translate-x-1/2 items-center justify-center transition-all duration-200",
          showIndicator ? "opacity-100" : "opacity-0"
        )}
        style={{
          top: Math.max(pullDistance - 40, -40),
          height: 40,
        }}
      >
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-md border",
            progress >= 1 && "bg-primary/10"
          )}
        >
          <Loader2
            className={cn(
              "h-5 w-5 text-primary transition-transform",
              isRefreshing && "animate-spin"
            )}
            style={{
              transform: isRefreshing
                ? undefined
                : `rotate(${progress * 360}deg)`,
            }}
          />
        </div>
      </div>

      {/* Contenu avec décalage */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
