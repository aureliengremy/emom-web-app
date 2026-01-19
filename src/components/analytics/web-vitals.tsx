"use client";

// ============================================
// Web Vitals Reporter
// Mesure et log les Core Web Vitals
// ============================================

import { useEffect } from "react";
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";

function reportMetric(metric: Metric) {
  // En développement, log dans la console
  if (process.env.NODE_ENV === "development") {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value.toFixed(2),
      rating: metric.rating, // "good" | "needs-improvement" | "poor"
      delta: metric.delta.toFixed(2),
    });
  }

  // En production, on pourrait envoyer à un service d'analytics
  // Exemple: Google Analytics, Vercel Analytics, custom endpoint
  //
  // if (process.env.NODE_ENV === "production") {
  //   fetch("/api/analytics", {
  //     method: "POST",
  //     body: JSON.stringify(metric),
  //   });
  // }
}

export function WebVitalsReporter() {
  useEffect(() => {
    // Core Web Vitals
    onCLS(reportMetric);  // Cumulative Layout Shift
    onLCP(reportMetric);  // Largest Contentful Paint
    onINP(reportMetric);  // Interaction to Next Paint

    // Other Web Vitals
    onFCP(reportMetric);  // First Contentful Paint
    onTTFB(reportMetric); // Time to First Byte
  }, []);

  return null;
}
