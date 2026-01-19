"use client";

// ============================================
// Lazy-loaded chart components
// ============================================

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Skeleton loading pour les charts
function ChartSkeleton() {
  return (
    <div className="flex h-[200px] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

// Lazy-loaded RepsBarChart - recharts est une dépendance lourde (~200kB)
export const LazyRepsBarChart = dynamic(
  () => import("./reps-bar-chart").then((mod) => mod.RepsBarChart),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

// Lazy-loaded ProgressChart
export const LazyProgressChart = dynamic(
  () => import("./progress-chart").then((mod) => mod.ProgressChart),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);
