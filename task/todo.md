# EMOM Web App - Todo List

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

### Revue des changements

**Fichiers modifiés :**
- `src/types/index.ts` : Ajout `AppLanguage`, champ `language` dans `UserSettings`
- `src/data/emom-tables.ts` : 41 exercices avec `nameFr`/`nameEn`, helpers bilingues
- `src/stores/exercise-store.ts` : Génération UUID pour Supabase, vérification par nom
- `src/stores/settings-store.ts` : Ajout `language: "fr"` par défaut
- `src/lib/db.ts` : Ajout `language: "fr"` dans DEFAULT_SETTINGS
- `src/lib/supabase/data-service.ts` : Mapping du champ `language`
- `src/app/settings/page.tsx` : Sélecteur de langue
- `src/app/exercises/page.tsx` : Recherche, filtres, collapsibles
- `src/components/exercises/exercise-card.tsx` : Utilisation de la langue
- `src/data/emom-tables.test.ts` : Tests mis à jour pour noms singuliers
- `src/components/exercises/exercise-card.test.tsx` : Tests mis à jour

**Migration Supabase requise :**
```sql
ALTER TABLE user_settings ADD COLUMN language TEXT DEFAULT 'fr';
```

---

## Terminé : Exercices avec variantes + Feedback fin de workout

### Tâches complétées

#### 0. Bug fix : Exercices custom non chargés depuis Supabase
- [x] Corriger la race condition dans `providers.tsx` : initialiser l'auth AVANT de charger les exercices
  - Cause : `initializePresets()` était appelé avant `auth.initialize()`, donc `user` était toujours `null`
  - Fix : Appeler `initializeAuth()` EN PREMIER dans `Providers`, puis charger les exercices

#### 1. Refonte du système d'exercices

**1.1 Nouveau modèle de données**
- [x] Ajouter un type `ExerciseDifficulty` : "novice" | "classique" | "intermediaire" | "avance" | "expert"
- [x] Créer un type `ExerciseFamily` (ex: "pushup", "pullup", "squat"...)
- [x] Ajouter `family` et `difficulty` au type `Exercise`

**1.2 Nouvelle liste d'exercices (basée sur exercices.md)**
- [x] Refactorer `PRESET_EXERCISES` dans `emom-tables.ts` avec les nouvelles familles
- [x] Ajouter toutes les variantes : Push (Push-up, Pike Push-up, HSPU), Pull (Row, Pull-up, Chin-up, Muscle-up), Legs (Squat, Hinge), Core
- [x] Mapper chaque variante à son niveau de difficulté (44 exercices au total)

**1.3 Sélecteur de niveau dans l'UI**
- [x] Modifier `exercise-card.tsx` pour afficher la famille et le niveau de difficulté
- [x] Ajouter des helpers : `getDifficultyColor()`, `getDifficultyLabel()`, `getFamilyLabel()`
- [x] Page exercices : grouper par famille, trier par difficulté
- [x] Filtrer les exercices par catégorie (Push/Pull/Legs/Core)

#### 2. Feedback par exercice en fin de workout

**2.1 Modèle de données**
- [x] Ajouter un type `SetFeedback` : { rating?: WorkoutRating, comment?: string }
- [x] Ajouter `feedback?: SetFeedback` au type `WorkoutSet`
- [x] Ajouter `updateSetFeedback()` dans le workout-store

**2.2 UI page fin de workout**
- [x] Ajouter une section "Feedback par exercice" dans `workout/complete/page.tsx`
- [x] Cards extensibles pour chaque exercice
- [x] Pour chaque set : rating emoji + champ commentaire optionnel
- [x] Sauvegarder le feedback dans le workout

### Revue des changements

**Fichiers modifiés :**
- `src/types/index.ts` : Ajout de `ExerciseDifficulty`, `ExerciseFamily`, `SetFeedback`, mise à jour de `Exercise` et `WorkoutSet`
- `src/data/emom-tables.ts` : 44 exercices présets avec famille et difficulté, nouveaux helpers
- `src/components/providers.tsx` : Initialisation auth AVANT les exercices (fix race condition)
- `src/app/page.tsx` : Simplification du flow d'auth
- `src/components/exercises/exercise-card.tsx` : Affichage famille et niveau de difficulté
- `src/app/exercises/page.tsx` : Groupement par famille, filtres par catégorie
- `src/stores/workout-store.ts` : Ajout `updateSetFeedback()`
- `src/stores/exercise-store.ts` : Support des nouveaux champs family/difficulty
- `src/lib/supabase/data-service.ts` : Mapping des nouveaux champs DB
- `src/app/workout/complete/page.tsx` : Feedback par exercice

**Note importante :**
Pour que les nouveaux champs `family` et `difficulty` fonctionnent avec Supabase, il faut ajouter ces colonnes à la table `exercises` :
```sql
ALTER TABLE exercises ADD COLUMN family TEXT;
ALTER TABLE exercises ADD COLUMN difficulty TEXT;
```

---

## Terminé : Infrastructure de tests

### Tests unitaires (Vitest)
- [x] Configuration Vitest avec React Testing Library
- [x] Tests `emom-tables.ts` : 41 exercices présets, helpers, niveaux
- [x] Tests `types/index.ts` : fonctions de label et couleur
- [x] Tests `workout-store.ts` : actions Zustand, feedback
- [x] Tests composants : `exercise-card.tsx`

### Tests E2E (Playwright)
- [x] Configuration Playwright (chromium + Mobile Chrome)
- [x] Tests navigation : home, exercises, sessions, settings
- [x] Tests page exercices : filtres, catégories, reset
- [x] Tests page login : formulaire, mode invité

**Commandes disponibles :**
```bash
npm run test          # Vitest watch mode
npm run test:run      # Vitest single run
npm run test:coverage # Vitest avec couverture
npm run test:e2e      # Playwright headless
npm run test:e2e:ui   # Playwright UI mode
```

**Fichiers créés :**
- `vitest.config.ts`
- `src/test/setup.ts`
- `src/data/emom-tables.test.ts`
- `src/types/index.test.ts`
- `src/stores/workout-store.test.ts`
- `src/components/exercises/exercise-card.test.tsx`
- `playwright.config.ts`
- `e2e/navigation.spec.ts`

---

## Terminé : Améliorations page Historique + Sécurité

### Tâches complétées

- [x] Supprimer les blocs de debug
- [x] Implémenter `deleteSupabaseWorkout`
- [x] Corriger le chargement des workouts (race condition)
- [x] Corriger le chart qui ne s'affichait pas
- [x] Ajouter card pour utilisateurs non connectés
- [x] Revue de sécurité complète
- [x] Corriger vulnérabilité Open Redirect (OAuth callback)
- [x] Ajouter paramètre `tab` sur la page login

---

## Terminé : Bundle Size & npm Audit (Audit 4.2.2, 5.6.4)

### Tâches complétées

- [x] npm audit — 0 vulnérabilités
- [x] Build production et analyse bundle size

### Résultats

| Métrique | Valeur |
|----------|--------|
| Vulnérabilités npm | 0 |
| Assets statiques | 2.6 MB |
| Plus gros chunks | ~400 KB (Recharts, Framer Motion) |

### Note

La taille du bundle est acceptable. Les gros chunks sont des dépendances tierces nécessaires (graphiques, animations).

---

## Terminé : Security Headers (Audit 5.6.2)

### Tâches complétées

- [x] Configurer CSP headers dans next.config.ts
- [x] Ajouter headers de sécurité supplémentaires

### Headers configurés

| Header | Valeur |
|--------|--------|
| Content-Security-Policy | Restreint sources scripts, styles, images, fonts, connexions |
| X-Frame-Options | DENY (anti-clickjacking) |
| X-Content-Type-Options | nosniff (anti-MIME sniffing) |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | Désactive camera, microphone, geolocation |

### CSP autorise

- Scripts/styles: self + inline (Next.js)
- Images: self, blob, data, https
- Connexions: self + *.supabase.co (API + WebSocket)

---

## Terminé : Skeletons de chargement (Audit 4.1.x)

### Tâches complétées

- [x] Vérifier composant Skeleton existant (shadcn/ui)
- [x] Ajouter skeletons à la page exercices
- [x] Vérifier skeletons page historique (déjà implémenté)

### Pages avec skeletons

- `src/app/exercises/page.tsx` — Skeletons pendant chargement des exercices
- `src/app/history/page.tsx` — Skeletons déjà implémentés

### Checklist mise à jour

- [x] 4.1.1 Skeleton screens implémentés
- [x] 4.1.2 Loading indicators cohérents

---

## Terminé : DevTools Zustand (Audit 1.2.2)

### Tâches complétées

- [x] Ajouter middleware `devtools` à tous les stores Zustand

### Stores mis à jour

- `auth-store.ts` — AuthStore
- `exercise-store.ts` — ExerciseStore
- `session-store.ts` — SessionStore
- `settings-store.ts` — SettingsStore
- `workout-store.ts` — WorkoutStore

### Note

DevTools activés uniquement en mode développement (`NODE_ENV === "development"`).
Pour visualiser : installer l'extension Redux DevTools dans Chrome/Firefox.

---

## Terminé : Error Handling (Audit 5.8.x)

> Priorité 🔴 — Actions critiques identifiées par l'audit Frontend Architect

### Tâches complétées

- [x] Créer `app/error.tsx` — Error Boundary pour erreurs runtime
- [x] Créer `app/not-found.tsx` — Page 404 personnalisée
- [x] Créer `app/global-error.tsx` — Fallback pour erreurs critiques

### Fichiers créés

- `src/app/error.tsx` — Error Boundary avec boutons Réessayer/Accueil
- `src/app/not-found.tsx` — Page 404 avec navigation
- `src/app/global-error.tsx` — Fallback minimaliste pour erreurs critiques

### Checklist mise à jour

- [x] 5.8.1 Error Boundary global
- [x] 5.8.2 Pages 404/500 personnalisées
- [x] 5.8.3 Recovery UI (retry, refresh)

---

## À faire (backlog)

### UX/UI
- [ ] Animation de transition entre les pages
- [ ] Toast de confirmation après suppression
- [ ] Pull-to-refresh sur mobile

### Sécurité (priorité moyenne)
- [ ] Validation des données utilisateur avec Zod
- [ ] Renforcer les exigences de mot de passe (8+ caractères, majuscule, chiffre)
- [ ] Ajouter rate limiting (Supabase + middleware)
- [ ] Contraintes JSONB sur les champs sets/current_emom

---

## Améliorations futures suggérées

### Fonctionnalités
- [ ] Export des données (CSV/JSON)
- [ ] Partage de workout
- [ ] Comparaison de progression entre périodes
- [ ] Objectifs personnalisés

### Technique
- [x] Tests unitaires (Vitest) - 47 tests
- [x] Tests E2E (Playwright) - 15 tests
- [ ] Monitoring (Sentry)
- [ ] PWA améliorée (offline mode)

---

## Terminé (historique)

- [x] Timer EMOM avec sets configurables
- [x] Gestion des exercices (preset + custom)
- [x] Historique des workouts
- [x] Graphiques de progression (Recharts)
- [x] Supabase (DB + RLS)
- [x] Auth email/mot de passe
- [x] Déploiement Vercel
- [x] Page de login au lancement
- [x] Pause pendant les trainings
- [x] Countdown 10s avant séance
- [x] Notes par training
- [x] Sens du chrono (horaire)
- [x] Nettoyage page Historique
- [x] Card utilisateurs non connectés
- [x] Revue de sécurité
- [x] Exercices avec familles et niveaux de difficulté
- [x] Feedback par exercice en fin de workout
- [x] Tests unitaires (Vitest) - 49 tests
- [x] Tests E2E (Playwright) - 15 tests
- [x] Support bilingue FR/EN pour les exercices
- [x] Page exercices améliorée (recherche, filtres, collapsibles)
