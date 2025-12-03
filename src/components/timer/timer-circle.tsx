"use client";

// ============================================
// Timer Circle - Cercle de progression EMOM
// ============================================

import { cn } from "@/lib/utils";

interface TimerCircleProps {
  seconds: number;
  totalSeconds?: number;
  size?: number;
  strokeWidth?: number;
  isPaused?: boolean;
  className?: string;
}

export function TimerCircle({
  seconds,
  totalSeconds = 60,
  size = 280,
  strokeWidth = 8,
  isPaused = false,
  className,
}: TimerCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = seconds / totalSeconds;
  const strokeDashoffset = circumference * (1 - progress);

  // Couleur selon le temps restant
  const getColor = () => {
    if (seconds > 30) return "var(--timer-safe)";
    if (seconds > 10) return "var(--timer-warning)";
    return "var(--timer-danger)";
  };

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {/* Cercle de fond */}
      <svg
        className="absolute -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-200"
        />
      </svg>

      {/* Contenu central */}
      <div className="relative flex flex-col items-center justify-center">
        {isPaused ? (
          <span className="text-2xl font-semibold text-muted-foreground">
            EN PAUSE
          </span>
        ) : (
          <span className="timer-seconds tabular-nums" style={{ color: getColor() }}>
            {seconds}
          </span>
        )}
      </div>
    </div>
  );
}
