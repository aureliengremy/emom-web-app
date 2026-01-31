# EMOM Web App - Todo List

## Terminé : Pull-to-refresh sur mobile

### Plan d'action

- [x] Créer composant `PullToRefresh` dans `src/components/ui/pull-to-refresh.tsx`
- [x] Utiliser touch events (touchstart, touchmove, touchend)
- [x] Indicateur de chargement avec rotation pendant le pull
- [x] Callback `onRefresh` pour déclencher le rafraîchissement
- [x] Vérifier le support tactile (mobile uniquement)
- [x] Intégrer sur la page historique (`/history`)

### Fichiers ajoutés/modifiés

| Fichier | Modification |
|---------|--------------|
| `src/components/ui/pull-to-refresh.tsx` | Nouveau composant PullToRefresh |
| `src/app/history/page.tsx` | Intégration du PullToRefresh autour du contenu |

### Fonctionnalités du composant

- Fonctionne uniquement sur appareils tactiles (detecte `ontouchstart` ou `navigator.maxTouchPoints`)
- Se déclenche seulement quand on est en haut de la page (`window.scrollY === 0`)
- Indicateur visuel avec icône Loader2 qui tourne pendant le pull
- Seuil configurable (defaut 80px) pour déclencher le refresh
- Résistance au pull (0.4x) pour un effet naturel
- Animation de transition fluide avec Tailwind

### Usage

```tsx
import { PullToRefresh } from "@/components/ui/pull-to-refresh";

const handleRefresh = async () => {
  await loadData();
};

<PullToRefresh onRefresh={handleRefresh}>
  {/* Contenu de la page */}
</PullToRefresh>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Contenu à wrapper |
| `onRefresh` | `() => Promise<void>` | - | Callback async appelé au refresh |
| `threshold` | `number` | 80 | Distance en px pour déclencher le refresh |
| `disabled` | `boolean` | false | Désactiver le pull-to-refresh |
| `className` | `string` | - | Classes CSS additionnelles |

---

## Terminé : Animation de transition entre pages (framer-motion)

### Fichiers ajoutés/modifiés

| Fichier | Modification |
|---------|--------------|
| `package.json` | +framer-motion |
| `src/components/layout/page-transition.tsx` | Nouveau composant PageTransition |

### Usage

```tsx
import { PageTransition } from "@/components/layout/page-transition";

export default function MyPage() {
  return (
    <PageTransition>
      <Container>
        {/* Contenu de la page */}
      </Container>
    </PageTransition>
  );
}
```

### Notes techniques

- Le composant est un client component ("use client") car framer-motion utilise des hooks React
- Animation par defaut: fade-in (opacity 0->1) + slide (y: 10px -> 0)
- Duree: 200ms avec ease-out
- Les variants et transition sont personnalisables via props
- Compatible avec le App Router de Next.js

---

## Terminé : Smooth Scroll et Micro-interactions

### Analyse

Après lecture des fichiers :
- `globals.css` : pas de `scroll-behavior: smooth` actuellement
- `button.tsx` : a déjà `transition-all` dans les variants
- `card.tsx` : pas de transition par défaut
- `exercise-card.tsx` : a `transition-all active:scale-[0.98]` (bien)
- `timer-circle.tsx` : a `transition-all duration-200` sur le cercle (bien)
- `history/page.tsx` : les workout cards n'ont pas de hover states
- `page.tsx` (home) : les menu cards ont `transition-colors hover:bg-accent` (bien)

### Plan d'action

- [x] Ajouter `scroll-behavior: smooth` dans `globals.css`
- [x] Ajouter transition sur le composant Card de base
- [x] Améliorer les rating buttons dans la modale d'édition (history)
- [x] Ajouter hover scale subtil sur les workout cards (history)

### Fichiers modifiés

| Fichier | Modification |
|---------|--------------|
| `src/app/globals.css` | Ajout `scroll-behavior: smooth` + media query pour `prefers-reduced-motion` |
| `src/components/ui/card.tsx` | Ajout `transition-colors` dans les classes de base |
| `src/app/history/page.tsx` | Ajout `hover:shadow-md hover:scale-[1.01]` sur workout cards + `hover:scale-105 active:scale-95` sur rating buttons |

### Revue des changements

**Smooth scroll :**
- Ajouté `scroll-behavior: smooth` sur l'élément `html`
- Respecte les préférences utilisateur avec `@media (prefers-reduced-motion: reduce)` pour désactiver le smooth scroll si l'utilisateur préfère moins d'animations

**Card component :**
- Ajouté `transition-colors` aux classes de base pour permettre des transitions fluides sur les changements de couleur (hover states)

**History page - Workout cards :**
- Ajouté `transition-all hover:shadow-md hover:scale-[1.01]` pour un effet subtil au survol
- L'échelle de 1.01 est très légère et performante

**History page - Rating buttons :**
- Ajouté `hover:scale-105` pour un feedback visuel au survol
- Ajouté `active:scale-95` pour un feedback au clic
- Ajouté `scale-105` sur le bouton sélectionné pour le mettre en évidence

---

## Terminé : Sauvegarde automatique + Édition historique

### Problèmes à résoudre

1. **Perte de workout au refresh** : Quand le workout se termine et l'utilisateur est sur `/workout/complete`, si l'app se rafraîchit (ex: app rouverte en arrière-plan), le `currentWorkout` est perdu car Zustand ne persiste pas en mémoire. L'utilisateur est redirigé vers l'accueil sans sauvegarde.

2. **Pas d'édition de l'historique** : Actuellement il n'est pas possible de modifier le commentaire/ressenti d'une session passée depuis l'historique.

### Plan d'action

#### Tâche 1 : Sauvegarde automatique dès fin de workout
- [x] Modifier `tick()` dans `workout-store.ts` pour sauvegarder automatiquement le workout dès que `workoutComplete: true`
- [x] Le workout sera sauvegardé avec `rating: undefined` et `notes: undefined` par défaut
- [x] La page `/workout/complete` utilise maintenant `updateWorkoutFeedback` pour mettre à jour le workout déjà sauvegardé

#### Tâche 2 : Édition du feedback depuis l'historique
- [x] Ajouter fonction `updateWorkoutFeedback(workoutId, rating, notes)` dans `workout-store.ts`
- [x] Ajouter fonction `updateSupabaseWorkoutFeedback()` dans `data-service.ts` (mise à jour partielle)
- [x] Créer modale d'édition dans la page historique (rating + notes uniquement, pas les détails du workout)
- [x] Ajouter bouton "Modifier le ressenti" sur les cartes de workout dans l'historique

### Fichiers modifiés

| Fichier | Modification |
|---------|--------------|
| `src/stores/workout-store.ts` | +`autoSaveWorkout()`, +`updateWorkoutFeedback()`, modif `tick()` |
| `src/lib/supabase/data-service.ts` | +`updateSupabaseWorkoutFeedback()` |
| `src/app/history/page.tsx` | +Modale d'édition, +bouton "Modifier le ressenti" sur chaque carte |
| `src/app/workout/complete/page.tsx` | Utilise `updateWorkoutFeedback` au lieu de `finishWorkout` |

### Revue des changements

**Sauvegarde automatique :**
- Quand le timer atteint `workoutComplete: true`, la fonction `autoSaveWorkout()` est appelée
- Le workout est sauvegardé en base avec `rating: undefined` et `notes: undefined`
- L'utilisateur peut ensuite ajouter son ressenti sur la page de résumé
- Si l'app se rafraîchit, le workout est déjà sauvegardé dans l'historique

**Édition de l'historique :**
- Chaque carte de workout a un bouton "Modifier le ressenti"
- Une modale permet de changer uniquement le rating (emoji) et les notes
- Les détails du workout (exercices, reps, durée) ne sont pas modifiables
- L'update est optimiste avec rollback en cas d'erreur

---

## Terminé : Section 3 - Data Mutation (Checklist Frontend)

### 3.1 Forms (MVP) ✅

- [x] Installer React Hook Form + Zod + @hookform/resolvers
- [x] Créer les schémas de validation Zod (`src/lib/validations/index.ts`)
  - [x] `loginSchema` / `signupSchema` - Email, password, confirmPassword
  - [x] `exerciseSchema` - Nom, catégorie, max
  - [x] `sessionSchema` / `sessionSetSchema` - Nom, description, sets
  - [x] `workoutFeedbackSchema` / `setFeedbackSchema` - Rating, notes
- [x] Refactorer les formulaires avec React Hook Form
  - [x] `auth/login/page.tsx` - useForm + zodResolver pour login/signup
  - [x] `add-exercise-modal.tsx` - useForm + Controller pour catégorie
  - [x] `sessions/create/page.tsx` - useForm + useFieldArray pour sets
  - [x] `workout/complete/page.tsx` - Validation manuelle (pas de form complet)
- [x] Messages d'erreur utilisateur cohérents (FR)

### 3.2 Real-time Updates (V2) - N/A

Pas de real-time requis pour le MVP. L'app fonctionne en mode request/response classique.
À considérer pour le futur : synchronisation multi-device des workouts.

### 3.3 Optimistic Updates (V1) ✅

Implémenté dans les mutations suivantes :

| Mutation | Fichier | Optimistic | Rollback |
|----------|---------|------------|----------|
| `updateWorkoutFeedback` | `workout-store.ts` | ✅ | ✅ |
| `deleteWorkoutFromHistory` | `workout-store.ts` | ✅ | ✅ |
| `deleteExercise` | `exercise-store.ts` | ✅ | ✅ |

**Stratégie :**
1. Mise à jour immédiate du state local
2. Appel API en arrière-plan
3. Rollback si erreur avec état précédent sauvegardé

### Formulaires avec React Hook Form + Zod

| Fichier | useForm | zodResolver | Erreurs FR |
|---------|---------|-------------|------------|
| `auth/login/page.tsx` | ✅ | ✅ | ✅ |
| `add-exercise-modal.tsx` | ✅ | ✅ | ✅ |
| `sessions/create/page.tsx` | ✅ | ✅ | ✅ |
| `workout/complete/page.tsx` | ❌ | ❌ | ✅ (manuel) |
| `settings/page.tsx` | N/A | N/A | N/A |

---

## Historique (sections précédentes)

Voir les sections "Terminé" ci-dessous pour l'historique complet.

---

## Terminé : Exercices présets partagés en DB

### Tâches complétées

- [x] Ajouter `nameFr` et `nameEn` au type `Exercise`
- [x] Mapper `name_fr` et `name_en` dans `data-service.ts`
- [x] Créer migration avec présets partagés (`user_id = NULL`)
- [x] Mettre à jour les policies RLS (lecture présets + custom utilisateur)
- [x] Simplifier `getSupabaseExercises()` (RLS gère le filtrage)
- [x] Simplifier `initializePresets()` (mode local uniquement)

### Architecture

**Présets (partagés) :**
- `user_id = NULL`
- Accessibles par tous les utilisateurs (RLS: `user_id IS NULL`)
- Non modifiables/supprimables par les utilisateurs

**Custom (par utilisateur) :**
- `user_id = UUID de l'utilisateur`
- Accessibles uniquement par leur créateur (RLS: `user_id = auth.uid()`)
- Modifiables et supprimables

### Fichiers modifiés

- `src/types/index.ts` : Ajout de `nameFr?` et `nameEn?`
- `src/lib/supabase/data-service.ts` : `getSupabaseExercises()` sans filtre user_id
- `src/stores/exercise-store.ts` : `initializePresets()` simplifié (local only)
- `src/data/emom-tables.ts` : `getExerciseDisplayName()` utilise les champs DB
- `migrations/001_seed_exercises.sql` : 41 présets + policies RLS

---

## Terminé : Langue bilingue + Page exercices améliorée

### Tâches complétées

#### 1. Fix UUID pour Supabase
- [x] Corriger l'erreur `invalid input syntax for type uuid: "pushup-incline"`
- [x] Générer des UUID pour les exercices présets lors de la sauvegarde Supabase
- [x] Vérifier les exercices existants par nom (FR ou EN) au lieu de l'ID

#### 2. Support bilingue (FR/EN)
- [x] Ajouter type `AppLanguage = "fr" | "en"`
- [x] Ajouter champ `language` dans `UserSettings`
- [x] Refactorer `PresetExercise` avec `nameFr` et `nameEn`
- [x] Créer helpers `getPresetName()` et `getExerciseDisplayName()`
- [x] Mettre à jour `getFamilyLabel()` pour supporter les deux langues
- [x] Ajouter sélecteur de langue dans les paramètres
- [x] Mettre à jour tous les composants pour utiliser la langue

#### 3. Amélioration page exercices
- [x] Ajouter barre de recherche
- [x] Ajouter filtre par difficulté
- [x] Sections collapsibles par famille
- [x] Boutons "Tout ouvrir" / "Tout fermer"

#### 4. Fix doublons (singulier/pluriel)
- [x] Harmoniser tous les noms au singulier (ex: "Pompe" au lieu de "Pompes")
- [x] Changer l'ID "dips" en "dip"
- [x] Mettre à jour les tests

---

## Terminé : Exercices avec variantes + Feedback fin de workout

- [x] Bug fix : Race condition auth/exercices
- [x] Nouveau modèle de données (family, difficulty)
- [x] 44 exercices présets
- [x] Sélecteur de niveau dans l'UI
- [x] Feedback par exercice en fin de workout

---

## Terminé : Infrastructure de tests

- [x] Tests unitaires (Vitest) - 49 tests
- [x] Tests E2E (Playwright) - 15 tests

---

## Terminé : Améliorations + Sécurité + SEO + Error Handling

- [x] Error Boundaries (error.tsx, not-found.tsx, global-error.tsx)
- [x] Security Headers (CSP)
- [x] Skeletons de chargement
- [x] DevTools Zustand
- [x] Open Graph / Twitter cards
- [x] npm audit (0 vulnérabilités)

---

## Terminé : Animation de transition entre pages

- [x] Installer framer-motion
- [x] Créer composant `PageTransition` dans `src/components/layout/page-transition.tsx`
- [x] Documenter l'utilisation du composant

---

## Terminé : Lazy loading du chart

### Plan d'action

- [x] Implémenter le lazy loading avec `next/dynamic` dans `history/page.tsx`
- [x] Créer un ChartSkeleton inline pour le placeholder de chargement
- [x] Désactiver le SSR pour le chart (recharts ne supporte pas le SSR)

### Fichiers modifiés

| Fichier | Modification |
|---------|--------------|
| `src/app/history/page.tsx` | Import dynamique du VolumeAreaChart avec `next/dynamic` |

### Revue des changements

- Remplacé l'import statique de `VolumeAreaChart` par un import dynamique avec `next/dynamic`
- Ajouté un skeleton de chargement pendant le téléchargement du composant
- Désactivé le SSR (`ssr: false`) car recharts utilise des APIs navigateur (window, document)
- Cela améliore le temps de chargement initial en différant le téléchargement de la librairie recharts (~150kb)

---

## Core Web Vitals Analysis

### Current Status

#### Performance Monitoring Setup

| Feature | Status | Details |
|---------|--------|---------|
| `web-vitals` package | Installed (v5.1.0) | Tracks CLS, LCP, INP, FCP, TTFB |
| Web Vitals Reporter | Implemented | `src/components/analytics/web-vitals.tsx` |
| Vercel Analytics | Installed (v1.6.1) | `<Analytics />` in providers |
| Sentry | Configured | Error tracking + source maps |

**Web Vitals monitored:**
- CLS (Cumulative Layout Shift)
- LCP (Largest Contentful Paint)
- INP (Interaction to Next Paint) - replaces FID
- FCP (First Contentful Paint)
- TTFB (Time to First Byte)

Currently, metrics are logged to console in development. Production metrics are sent to Vercel Analytics automatically.

---

### What's Already Optimized

| Optimization | Implementation | File |
|--------------|----------------|------|
| Font loading | `next/font/google` with Inter | `src/app/layout.tsx` |
| Font display | Variable font with subset | `subsets: ["latin"]` |
| Lazy loading charts | `next/dynamic` with `ssr: false` | `src/app/history/page.tsx`, `src/components/charts/lazy-charts.tsx` |
| Loading skeletons | All major pages have `loading.tsx` | `src/app/*/loading.tsx` |
| Preconnect | Supabase URL preconnected | `src/app/layout.tsx` |
| DNS prefetch | `supabase.co` prefetched | `src/app/layout.tsx` |
| Reduced motion | CSS media query respect | `src/app/globals.css` |
| No images | App uses only SVG icons | No raster images to optimize |
| Security headers | CSP, X-Frame-Options, etc. | `next.config.ts` |
| Middleware optimization | Static files excluded | `src/middleware.ts` |
| useMemo/useCallback | 25 occurrences across 8 files | Various components |

---

### Recommendations

#### High Priority

1. **Send Web Vitals to analytics in production**
   - The reporter only logs to console in dev
   - Vercel Analytics captures automatically, but custom tracking to Sentry would help correlate performance with errors
   - Location: `src/components/analytics/web-vitals.tsx` (lines 21-29 commented out)

2. **Add `fetchPriority="high"` for critical resources**
   - Currently no critical images, but if adding hero images, use priority loading

#### Medium Priority

3. **Consider code splitting for heavy pages**
   - `src/app/exercises/page.tsx` imports multiple stores and components
   - Could benefit from route-based splitting

4. **Add `VolumeAreaChart` to lazy-charts.tsx**
   - Currently lazy-loaded inline in history page
   - Consolidating in `lazy-charts.tsx` would improve consistency

5. **Sentry source maps**
   - Already configured with `hideSourceMaps: true`
   - Ensure `SENTRY_ORG` and `SENTRY_PROJECT` env vars are set in production

#### Low Priority

6. **Consider `@next/bundle-analyzer`**
   - Would help identify bundle size issues
   - Not installed yet

7. **Service Worker for offline caching**
   - PWA manifest exists but no service worker
   - Would improve repeat visits (TTFB)

---

### Bundle Analysis (Manual Review)

| Package | Size (approx.) | Mitigation |
|---------|----------------|------------|
| recharts | ~150-200kb | Lazy loaded |
| @supabase/supabase-js | ~50kb | Required |
| lucide-react | Tree-shakeable | Only imported icons bundled |
| date-fns | ~10kb (tree-shakeable) | Modular imports |
| zustand | ~3kb | Minimal |
| framer-motion | ~30kb | Used for page transitions |

---

### Summary

The EMOM app has a **solid foundation** for Core Web Vitals:

- Web Vitals monitoring is set up and actively tracking metrics
- Vercel Analytics provides production insights
- Lazy loading is implemented for the heaviest dependency (recharts)
- Font loading follows best practices with `next/font`
- Loading states prevent layout shifts
- No heavy images to optimize

**Main gaps:**
1. Custom Web Vitals reporting to Sentry (commented out)
2. No bundle analyzer for ongoing monitoring
3. No service worker for offline/caching improvements

**Overall assessment:** Production-ready with room for monitoring improvements.

---

## À faire (backlog)

### UX/UI
- [x] Animation de transition entre les pages
- [x] Toast de confirmation après suppression
- [x] Pull-to-refresh sur mobile

### Technique
- [x] Lazy loading des charts
- [x] Core Web Vitals (analysis complete - see section above)
- [x] Monitoring (Sentry configured)
- [x] PWA améliorée (icons PNG, manifest enrichi, meta tags)

### Fonctionnalités futures
- [ ] Export des données
- [ ] Partage de workout
- [ ] Comparaison de progression
