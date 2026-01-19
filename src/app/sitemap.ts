// ============================================
// Sitemap dynamique pour SEO
// ============================================

import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://emom.app";

  // Pages publiques (accessibles sans auth)
  const publicRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
  ];

  // Note: Les pages utilisateur (/exercises, /history, /sessions, /workout)
  // ne sont pas incluses car elles nécessitent une authentification
  // et ne devraient pas être indexées par les moteurs de recherche

  return publicRoutes;
}
