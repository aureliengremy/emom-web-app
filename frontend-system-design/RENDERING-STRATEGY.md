# Rendering Strategy

> Documentation des stratégies de rendu pour EMOM Web App

## 1. Vue d'ensemble

| Page | Route | Rendering | Raison |
|------|-------|-----------|--------|
| Home | `/` | CSR | Données utilisateur dynamiques |
| Login | `/auth/login` | CSR | Formulaires interactifs |
| Exercises | `/exercises` | CSR | Liste filtrable par utilisateur |
| Exercise Detail | `/exercises/[id]` | CSR | Données utilisateur + charts |
| Sessions | `/sessions` | CSR | Liste utilisateur |
| Create Session | `/sessions/create` | CSR | Formulaire complexe |
| Workout | `/workout` | CSR | Timer temps réel |
| Workout Complete | `/workout/complete` | CSR | Feedback utilisateur |
| History | `/history` | CSR | Historique utilisateur |
| Settings | `/settings` | CSR | Paramètres utilisateur |

## 2. Justification CSR

### Pourquoi pas SSG/SSR ?

L'application EMOM est une **app personnelle** où :

1. **Toutes les données sont privées** - Liées à l'utilisateur authentifié
2. **Pas de contenu public** - Pas de pages marketing, blog, etc.
3. **Interactivité immédiate** - Timer, formulaires, drag & drop

### Avantages du CSR pour ce cas

- ✅ Hydration immédiate des stores
- ✅ Pas de waterfall SSR → client
- ✅ Simplicité de déploiement
- ✅ Optimisation via Suspense + lazy loading

## 3. Optimisations appliquées

### Suspense Boundaries

Fichiers `loading.tsx` pour les routes principales :
- `/exercises/loading.tsx`
- `/exercises/[id]/loading.tsx`
- `/history/loading.tsx`
- `/sessions/loading.tsx`

### Lazy Loading

Composants lourds chargés dynamiquement :
- `LazyRepsBarChart` - Recharts (~200kB gzip)
- `LazyProgressChart` - Recharts

```typescript
// src/components/charts/lazy-charts.tsx
export const LazyRepsBarChart = dynamic(
  () => import("./reps-bar-chart").then((mod) => mod.RepsBarChart),
  { loading: () => <ChartSkeleton />, ssr: false }
);
```

## 4. Candidates SSG (futur)

Si l'app évolue vers du contenu public :

| Page potentielle | Stratégie |
|------------------|-----------|
| Landing page marketing | SSG |
| Page de tarifs | SSG |
| Documentation/FAQ | SSG + ISR |
| Blog | SSG + ISR |

## 5. Performance actuelle

### Métriques cibles

| Métrique | Cible | Status |
|----------|-------|--------|
| FCP | < 1.8s | ✅ |
| LCP | < 2.5s | ✅ |
| CLS | < 0.1 | ✅ |
| FID/INP | < 200ms | ✅ |

### Optimisations actives

- Code splitting automatique (Next.js)
- Tree shaking (imports modularisés)
- Lazy loading des charts
- Skeletons pour perceived performance
- Fonts optimisées (next/font)

---

*Dernière mise à jour : 2026-01-17*
