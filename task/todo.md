# EMOM Web App - Todo List

## En cours : Sauvegarde automatique + Édition historique

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

## À faire (backlog)

### UX/UI
- [ ] Animation de transition entre les pages
- [ ] Toast de confirmation après suppression
- [ ] Pull-to-refresh sur mobile

### Technique
- [ ] Lazy loading des charts
- [ ] Core Web Vitals
- [ ] Monitoring (Sentry)
- [ ] PWA améliorée

### Fonctionnalités futures
- [ ] Export des données
- [ ] Partage de workout
- [ ] Comparaison de progression
