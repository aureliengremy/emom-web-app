# EMOM Web App - Todo List

## Termine : Refactoring sons countdown dans useSound (Option B)

### Contexte

L'integration des sons de countdown dans le timer fonctionnait mais l'architecture etait sous-optimale :
- AudioContext duplique (un dans `useSound`, un dans `workout/page.tsx`)
- Logique sonore eparpillee entre le hook et la page

### Taches completees

- [x] 1. Ajouter `playCountdownTick10s`, `playCountdownTick5to1`, `playCountdownFinish` dans `use-sound.ts`
- [x] 2. Simplifier `workout/page.tsx` : supprimer AudioContext duplique, utiliser les nouvelles fonctions du hook
- [x] 3. Verifier que le build passe (14 pages, 0 erreur)
- [x] 4. Mettre a jour todo.md avec revue

### Fichiers modifies

| Fichier | Modification |
|---------|--------------|
| `src/hooks/use-sound.ts` | +import sound-packs, +lecture settings countdown, +3 fonctions (`playCountdownTick10s`, `playCountdownTick5to1`, `playCountdownFinish`), +export |
| `src/app/workout/page.tsx` | -import sound-packs, -AudioContext local (ref + callback + cleanup), simplification logique sons countdown |

### Revue des changements

**`use-sound.ts`** :
- Import de `playTick10s`, `playTick5to1`, `playFinish` depuis `sound-packs.ts`
- Lecture des settings `countdownSoundsEnabled` et `countdownSoundPack` depuis le store
- 3 nouvelles fonctions qui verifient `soundEnabled` ET `countdownSoundsEnabled` avant de jouer
- Reutilise le meme AudioContext que les autres sons (plus de duplication)

**`workout/page.tsx`** :
- Suppression de l'AudioContext local (~15 lignes : ref, getAudioContext callback, useEffect cleanup)
- Suppression de l'import direct de `sound-packs.ts`
- Logique countdown simplifiee : appel direct des fonctions du hook au lieu de gerer packId + audioCtx manuellement
- Dependances du useEffect nettoyees (plus besoin de `settings.countdownSoundPack` ni `getAudioContext`)

---

## Termine : Section choix du pack de sons dans les parametres

### Taches completees

- [x] Modifier `src/types/index.ts` pour ajouter `SoundPackId` et mettre a jour `UserSettings`
- [x] Modifier `src/stores/settings-store.ts` pour ajouter les valeurs par defaut
- [x] Creer `src/components/settings/sound-settings.tsx` avec toggle + selecteur de pack + bouton test
- [x] Integrer dans `src/app/settings/page.tsx`

### Fichiers crees/modifies

| Fichier | Modification |
|---------|--------------|
| `src/types/index.ts` | Ajout `SoundPackId = "minimal" \| "sport" \| "zen" \| "arcade"`, mise a jour `UserSettings` |
| `src/stores/settings-store.ts` | Ajout `countdownSoundPack: "minimal"` et `countdownSoundsEnabled: true` par defaut |
| `src/components/settings/sound-settings.tsx` | Nouveau composant de selection des sons |
| `src/app/settings/page.tsx` | Import et integration de `<SoundSettings />` |

### Fonctionnalites du composant SoundSettings

1. **Toggle sons de decompte** : Active/desactive les sons du countdown
2. **Selecteur de pack** : Liste des 4 packs disponibles (Minimal, Sport, Zen, Arcade)
3. **Bouton Tester** : Joue les 3 sons du pack (tick10s, tick5to1, finish) avec delai

### Design

- Style coherent avec les autres sections de parametres (Card + CardHeader + CardContent)
- Radio buttons personnalises avec checkmark
- Pack selectionne : bordure primaire + fond teinte
- Bouton Tester avec animation de pulsation pendant la lecture
- Selecteur de pack visible uniquement si les sons sont actives

### Notes techniques

- Utilise Web Audio API via les fonctions de `src/lib/sound-packs.ts`
- AudioContext cree au premier clic (requis par les navigateurs modernes)
- Nettoyage de l'AudioContext au demontage du composant
- Types stricts avec `SoundPackId` de `src/types`

---

## Termine : Review et corrections des sons dans le timer (2026-02-07)

### Fichiers analyses

| Fichier | Description |
|---------|-------------|
| `src/app/workout/page.tsx` | Page principale du timer avec logique des sons |
| `src/app/settings/page.tsx` | Page des parametres avec toggle son/vibration |
| `src/hooks/use-sound.ts` | Hook de gestion des sons (Web Audio API) |
| `src/stores/settings-store.ts` | Store des parametres utilisateur |
| `src/stores/workout-store.ts` | Store du workout et logique du timer |

### Tableau des sons implementes

| Evenement | Condition | Son joue | Ligne | Status |
|-----------|-----------|----------|-------|--------|
| Countdown termine | `result.countdownComplete` | `playStart()` | 65-68 | OK |
| Dernieres secondes countdown (3-2-1) | `status === "countdown" && countdownSeconds <= 3` | `playWarning()` | 74-76 | OK |
| Dernieres secondes timer (3-2-1) | `seconds <= 3 && seconds !== lastSecondsRef` | `playWarning()` | 79-85 | CORRIGE |
| Pause entre sets (10 dernieres sec) | `isPausingBetweenSets && pauseSeconds <= 10` | `playWarning()` | 88-94 | OK |
| Reprise apres pause | `wasPausingRef && !isPausingBetweenSets` | `playStart()` | 97-99 | OK |
| Workout termine | `result.workoutComplete` | `playComplete()` | 102-103 | OK |
| Set termine | `result.setComplete` | `playComplete()` | 105-106 | OK |
| Minute terminee | `result.minuteComplete` | `playBeep()` | 107-108 | OK |

### Bug corrige : Son de warning jouait seulement une fois

**Fichier** : `src/app/workout/page.tsx` (lignes 79-85)

**Ancien code** :
```typescript
if (seconds <= 3 && seconds > 0 && lastSecondsRef.current > 3) {
  playWarning();
}
```

**Nouveau code** :
```typescript
// Jouer un son a chaque seconde de 3 a 1 (pas seulement a la transition vers 3)
if (seconds <= 3 && seconds > 0 && seconds !== lastSecondsRef.current) {
  playWarning();
}
```

### Corrections TypeScript effectuees

| Fichier | Correction |
|---------|------------|
| `src/components/settings/sound-settings.tsx` | Ajout du type `SoundPackId` + pack "arcade" |
| `src/lib/db.ts` | Ajout des valeurs par defaut pour `countdownSoundPack` et `countdownSoundsEnabled` |
| `src/lib/supabase/data-service.ts` | Ajout du mapping pour les nouveaux champs dans `DbSettings` et `saveSupabaseSettings` |

### Conditions verifiees

| Condition | Status | Details |
|-----------|--------|---------|
| Sons ne jouent PAS pendant la pause utilisateur | OK | Ligne 59 verifie `timer.status !== "running"` |
| Sons ne jouent PAS pendant countdown initial | OK | Le countdown a ses propres sons separes |
| Sons respectent `soundEnabled` | OK | Verifie dans `useSound.ts` ligne 37 |
| Sons respectent `vibrationEnabled` | OK | Verifie dans `useSound.ts` ligne 69 |

### Edge cases verifies

| Edge case | Status | Details |
|-----------|--------|---------|
| Changement de pack de sons pendant workout | N/A | Pas de packs de sons, utilise Web Audio API |
| Nettoyage des sons a la sortie | OK | `useSound` ferme AudioContext au unmount (lignes 104-110) |
| Nettoyage du timer interval | OK | Return du useEffect (ligne 112) |
| AudioContext sur iOS/Safari | OK | Support webkitAudioContext (ligne 29) |

### Hook useSound - Analyse

Le hook est bien implemente :
- Utilise Web Audio API avec oscillateurs
- 4 types de sons avec frequences differentes (beep, start, complete, warning)
- Verification `soundEnabled` avant chaque son
- Verification `vibrationEnabled` avant chaque vibration
- Cleanup de l'AudioContext au demontage
- Support Safari via `webkitAudioContext`

### Build : OK

`npm run build` passe sans erreur (14 pages generees)

### Conclusion

L'integration des sons est globalement correcte. Le seul bug a corriger est la logique du son de warning qui ne joue qu'une fois lors de la transition vers 3 secondes, au lieu de jouer a chaque seconde (3, 2, 1).

---

## En cours : Ajout des sons de countdown (10s, 5-4-3-2-1, finish)

### Contexte

L'utilisateur souhaite ajouter des sons de decompte supplementaires :
- A 10 secondes : son discret "tick10s"
- De 5 a 1 seconde : son plus audible "tick5to1" (un par seconde)
- A 0 seconde (fin de minute) : son "finish" (gong/cloche)

### Plan d'action

- [x] 1. Creer `src/lib/sound-packs.ts` avec les definitions des packs de sons
- [x] 2. Ajouter les settings `countdownSoundsEnabled` et `countdownSoundPack` dans le store
- [ ] 3. Etendre `useSound` avec les fonctions de countdown (`playTick10s`, `playTick5to1`, `playFinish`)
- [ ] 4. Modifier `src/app/workout/page.tsx` pour jouer les sons selon `secondsRemaining`
- [ ] 5. Corriger le bug du son de warning (3-2-1)
- [ ] 6. Tester le fonctionnement

### Fichiers a creer/modifier

| Fichier | Modification |
|---------|--------------|
| `src/lib/sound-packs.ts` | Nouveau fichier avec les packs de sons |
| `src/stores/settings-store.ts` | Ajout de `countdownSoundsEnabled` et `countdownSoundPack` |
| `src/types/index.ts` | Ajout des types pour les packs de sons |
| `src/hooks/use-sound.ts` | Ajout des fonctions de countdown |
| `src/app/workout/page.tsx` | useEffect pour jouer les sons + fix bug 3-2-1 |

---

## Termine : Section Progression sur page detail exercice

### Taches completees

- [x] Creer le composant `ExerciseStatsCard` dans `src/components/exercises/exercise-stats-card.tsx`
- [x] Modifier `src/app/exercises/[id]/page.tsx` pour integrer la section Progression
- [x] Verifier que l'utilisateur est connecte avant d'afficher
- [x] Afficher un message si pas assez de donnees (minimum 2 seances)

### Fichiers crees/modifies

| Fichier | Description |
|---------|-------------|
| `src/components/exercises/exercise-stats-card.tsx` | Nouveau composant de statistiques de progression |
| `src/app/exercises/[id]/page.tsx` | Integration de la section Progression |

### Fonctionnalites du composant ExerciseStatsCard

Le composant affiche une carte avec 4 statistiques :

| Statistique | Icone | Description |
|-------------|-------|-------------|
| Seances | Target (bleu) | Nombre total de workouts contenant cet exercice |
| Reps total | Flame (orange) | Somme de toutes les reps effectuees |
| Moy. / seance | Activity (violet) | Moyenne des reps par seance |
| Progression | TrendingUp (vert/rouge) | % d'amelioration entre les premieres et dernieres seances |

### Logique de calcul

- Le composant ne s'affiche que si l'utilisateur a au moins 2 seances avec cet exercice
- La progression est calculee en comparant les 3 premieres seances aux 3 dernieres (si >= 4 seances)
- Si < 4 seances, un message indique combien de seances supplementaires sont necessaires
- L'icone de progression pivote de 180 degres si la tendance est negative

### Conditions d'affichage

La section n'apparait que si :
1. L'utilisateur est connecte (`user !== null`)
2. L'historique contient des workouts (`workoutHistory.length > 0`)
3. Au moins 2 workouts contiennent cet exercice specifique

### Props du composant

```typescript
interface ExerciseStatsCardProps {
  workouts: Workout[];
  exerciseId: string;
}
```

---

## Termine : Pull-to-refresh sur mobile

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

## Termine : Sauvegarde complete (Full Backup)

### Fonctionnalites ajoutees

- [x] Fonction `prepareFullBackup(workouts, exercises, sessions, settings?)` dans `export-utils.ts`
- [x] Metadonnees enrichies : `exportDate`, `appVersion`, `dataTypes[]`, `counts{}`
- [x] Section "Sauvegarde complete" mise en avant dans les parametres (style primaire)
- [x] Resume visuel des donnees a exporter (badges avec icones)
- [x] Exports individuels (seances, exercices, sessions JSON/CSV)

### Structure du fichier de sauvegarde

```json
{
  "metadata": {
    "exportDate": "2026-01-30T...",
    "appVersion": "1.0.0",
    "dataTypes": ["workouts", "exercises", "sessions", "settings"],
    "counts": {
      "workouts": 15,
      "exercises": 44,
      "sessions": 3
    }
  },
  "workouts": [...],
  "exercises": [...],
  "sessions": [...],
  "settings": {...}
}
```

### Fichiers modifies

| Fichier | Modification |
|---------|--------------|
| `src/lib/export-utils.ts` | +`FullBackup` type, +`prepareFullBackup()`, +`prepareSessionExport()`, +CSV utils |
| `src/components/settings/export-section.tsx` | Refonte avec sauvegarde complete en haut + exports individuels |

### UI de la section export

1. **Sauvegarde complete** (en haut, style primaire avec bordure coloree)
   - Icone Database
   - Resume des donnees a exporter (badges: X seances, Y exercices, Z sessions)
   - Bouton principal "Telecharger la sauvegarde complete"

2. **Export individuel** (section secondaire)
   - Boutons pour exporter separement seances et exercices

3. **Mes sessions sauvegardees** (section tertiaire)
   - Boutons JSON et CSV cote a cote

---

## Terminé : Partage de workout (avec réseaux sociaux)

### Plan d'action

- [x] Créer les utilitaires de partage (Web Share API, clipboard, social)
- [x] Créer le composant ShareButton
- [x] Créer le composant ShareMenu avec options
- [x] Intégrer sur la page historique
- [x] Intégrer sur la page workout complete
- [x] Ajouter `getTwitterShareUrl(workout)` pour partage Twitter/X
- [x] Ajouter `getWhatsAppShareUrl(workout)` pour partage WhatsApp
- [x] Modifier `shareWorkout` avec paramètre `platform` optionnel

### Fichiers ajoutés/modifiés

| Fichier | Modification |
|---------|--------------|
| `src/lib/share-utils.ts` | Utilitaires de partage + URLs réseaux sociaux |
| `src/components/workout/share-button.tsx` | Bouton de partage simple |
| `src/components/workout/share-menu.tsx` | Menu déroulant avec options |
| `src/app/history/page.tsx` | Ajout ShareButton sur les cartes |
| `src/app/workout/complete/page.tsx` | Ajout ShareButton après les stats |

### Fonctionnalités

- Web Share API natif (mobile)
- Copie dans le presse-papier (fallback desktop)
- Partage direct Twitter/X via `getTwitterShareUrl()`
- Partage direct WhatsApp via `getWhatsAppShareUrl()`
- Message formaté en français avec emoji

### API

```typescript
// Types
type SharePlatform = "native" | "twitter" | "whatsapp";
interface ShareResult {
  success: boolean;
  method: "share" | "clipboard" | "twitter" | "whatsapp";
}

// Fonctions exportées
getTwitterShareUrl(workout: Workout): string
getWhatsAppShareUrl(workout: Workout): string
shareWorkout(workout: Workout, platform?: SharePlatform): Promise<ShareResult>
```

### Format du message partagé

```
🏋️ Séance EMOM terminée !
📅 30/01/2026
💪 120 reps
⏱️ 15 min
🎯 Exercices: Push-ups, Squats
😊 Facile
```

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
- [x] Export des données
- [x] Partage de workout
- [x] Comparaison de progression

---

## Terminé : Comparaison de progression

### Fichiers créés/modifiés

| Fichier | Description |
|---------|-------------|
| `src/lib/comparison-utils.ts` | Utilitaires de comparaison et records personnels |
| `src/components/stats/progress-comparison.tsx` | Composant de comparaison semaine/mois + records |
| `src/lib/chart-utils.ts` | Agrégation de volume par jour/semaine/mois |
| `src/components/charts/volume-area-chart.tsx` | Graphique de progression du volume (aire) |
| `src/components/charts/progress-chart.tsx` | Graphique de progression générique (ligne) |
| `src/components/charts/reps-bar-chart.tsx` | Graphique en barres du volume hebdomadaire |
| `src/components/charts/lazy-charts.tsx` | Chargement lazy des composants recharts |
| `src/app/history/page.tsx` | Page historique avec graphiques et filtres |
| `src/app/exercises/[id]/page.tsx` | Page détail exercice avec graphique de volume |

### Fonctionnalités implémentées

#### 1. Utilitaires de comparaison (`comparison-utils.ts`)

| Fonction | Description |
|----------|-------------|
| `compareExerciseProgress(workouts, exerciseName, period1, period2)` | Compare le volume entre deux périodes |
| `getProgressionRate(workouts, exerciseName)` | Calcule le taux de progression (premier vs dernier workout) |
| `getPersonalRecords(workouts, exerciseName)` | Récupère les records (max reps/min, max total, meilleur workout) |
| `getWeeklyComparison(workouts, exerciseName)` | Compare semaine actuelle vs précédente |
| `getMonthlyComparison(workouts, exerciseName)` | Compare mois actuel vs précédent |

#### 2. Agrégation pour graphiques (`chart-utils.ts`)

| Fonction | Description |
|----------|-------------|
| `getUniqueExercises(workouts)` | Extrait les noms d'exercices uniques |
| `aggregateVolumeByDay(workouts, exerciseName)` | Volume par jour |
| `aggregateVolumeByWeek(workouts, exerciseName)` | Volume par semaine |
| `aggregateVolumeByMonth(workouts, exerciseName)` | Volume par mois |
| `filterWorkoutsByExercises(workouts, exerciseNames)` | Filtre par exercices |

#### 3. Graphiques de progression

- **VolumeAreaChart** : Graphique aire pour visualiser le volume par jour/semaine/mois
- **ProgressChart** : Graphique ligne générique avec dates formatées en français
- **RepsBarChart** : Barres hebdomadaires pour un exercice donné
- **LazyProgressChart / LazyRepsBarChart** : Versions lazy-loaded (recharts ~150-200kb)

#### 4. Page Historique (`/history`)

- Sélecteur d'exercice pour le graphique
- Toggle granularité : Jour / Semaine / Mois
- Stats globales : total séances, total reps, total minutes
- **Progression globale** : comparaison semaine vs semaine precedente (seances, reps, duree)
- Indicateurs visuels : fleches haut/bas, couleurs vert/rouge
- Filtres par exercice (badges cliquables)
- Pull-to-refresh pour recharger les données

#### 5. Page Détail Exercice (`/exercises/[id]`)

- Graphique de volume hebdomadaire (RepsBarChart, lazy-loaded)
- Historique récent des 5 dernières séances
- Stats : max actuel, reps EMOM recommandées

### Types exportés

```typescript
// comparison-utils.ts
interface Period { start: Date; end: Date; }
interface PeriodComparison {
  period1Volume: number;
  period2Volume: number;
  difference: number;
  percentageChange: number | null;
}
interface ProgressionRate {
  firstVolume: number;
  lastVolume: number;
  percentageChange: number | null;
  trend: "up" | "down" | "stable";
}
interface PersonalRecords {
  maxRepsPerMinute: number;
  maxTotalReps: number;
  bestWorkoutDate: string | null;
  totalWorkouts: number;
}
interface WeeklyComparison extends PeriodComparison { ... }
interface MonthlyComparison extends PeriodComparison { ... }

// chart-utils.ts
interface ChartDataPoint {
  date: string;
  label: string;
  volume: number;
}
```

### Comment utiliser

#### Comparaison entre périodes

```typescript
import { compareExerciseProgress, type Period } from "@/lib/comparison-utils";

const lastMonth: Period = { start: new Date("2026-01-01"), end: new Date("2026-01-31") };
const thisMonth: Period = { start: new Date("2026-02-01"), end: new Date("2026-02-28") };

const comparison = compareExerciseProgress(workouts, "Pompe", lastMonth, thisMonth);
// { period1Volume: 500, period2Volume: 650, difference: 150, percentageChange: 30 }
```

#### Records personnels

```typescript
import { getPersonalRecords } from "@/lib/comparison-utils";

const records = getPersonalRecords(workouts, "Pompe");
// { maxRepsPerMinute: 15, maxTotalReps: 180, bestWorkoutDate: "2026-01-15", totalWorkouts: 8 }
```

#### Comparaison hebdomadaire/mensuelle

```typescript
import { getWeeklyComparison, getMonthlyComparison } from "@/lib/comparison-utils";

const weekly = getWeeklyComparison(workouts, "Pompe");
const monthly = getMonthlyComparison(workouts, "Pompe");
```

#### Graphique de progression (lazy-loaded)

```typescript
import { LazyProgressChart, LazyRepsBarChart } from "@/components/charts/lazy-charts";

// Graphique ligne
<LazyProgressChart
  data={[
    { date: "2026-01-01", value: 100, label: "1 jan" },
    { date: "2026-01-08", value: 120, label: "8 jan" },
  ]}
  title="Progression des pompes"
  valueLabel="Reps"
/>

// Graphique barres hebdomadaires
<LazyRepsBarChart
  data={[
    { date: "2026-01-01", reps: 100 },
    { date: "2026-01-08", reps: 120 },
  ]}
  weeks={8}
/>
```

### Notes techniques

- Les graphiques sont lazy-loaded avec `next/dynamic` pour optimiser le chargement (recharts ~150-200kb)
- Les données sont formatées avec `date-fns` pour l'affichage en français
- Les comparaisons gèrent le cas où period1Volume === 0 (retourne null pour percentageChange)
- Le trend est "stable" si le changement est entre -5% et +5%
- Les graphiques désactivent le SSR (`ssr: false`) car recharts utilise des APIs navigateur

---

## Terminé : Composant PersonalRecords

### Fichiers créés

| Fichier | Description |
|---------|-------------|
| `src/components/stats/personal-records.tsx` | Affichage des records personnels pour un exercice |

### Props du composant

| Prop | Type | Description |
|------|------|-------------|
| `exerciseName` | `string` | Nom de l'exercice a analyser |
| `workouts` | `Workout[]` | Liste des workouts pour extraire les records |

### Records affiches

| Record | Icône | Description |
|--------|-------|-------------|
| Meilleur reps/minute | Star | Maximum de reps sur une minute donnee |
| Meilleur total en une seance | Trophy | Somme de toutes les reps pour cet exercice dans une seance |
| Plus longue serie | Award | Nombre de minutes consecutives completees sans echec |

### Modifications de comparison-utils.ts

Ajout du type `PersonalRecord` et mise a jour de `PersonalRecords` pour inclure:
- `bestRepsPerMinute: PersonalRecord` - avec date et workoutId
- `bestSessionTotal: PersonalRecord` - avec date et workoutId
- `longestStreak: PersonalRecord` - minutes consecutives completees

Ajout de la fonction `calculateLongestStreak()` pour calculer la serie.

### Design

- Badges dorés avec gradient `from-amber-400 to-yellow-500`
- Fond gradient leger `from-amber-50 to-yellow-50` (dark mode support)
- Icones lucide-react: Trophy, Star, Award
- Badge de date pour chaque record
- Message si aucun record etabli

### Usage

```tsx
import { PersonalRecords } from "@/components/stats/personal-records";

<PersonalRecords
  exerciseName="Pompe"
  workouts={workouts}
/>
```

---

## Termine : Composant ExerciseStatsCard

### Fichiers crees

| Fichier | Description |
|---------|-------------|
| `src/components/stats/exercise-stats-card.tsx` | Carte de statistiques complete par exercice |
| `src/components/stats/mini-trend-chart.tsx` | Mini graphique de tendance (AreaChart compact) |

### Fonctionnalites

Le composant `ExerciseStatsCard` combine plusieurs metriques :

1. **Header avec tendance globale** : Nom de l'exercice, nombre de seances, et tendance (pourcentage + icone)
2. **Comparaison hebdo/mensuelle** : Grille 2 colonnes avec volume actuel vs precedent
3. **Records personnels** : Max reps/min, max total reps, date du meilleur workout
4. **Mini graphique de tendance** : AreaChart compact des 10 derniers workouts (lazy-loaded)

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `exerciseName` | `string` | - | Nom de l'exercice a analyser |
| `workouts` | `Workout[]` | - | Liste des workouts a analyser |
| `expanded` | `boolean` | `false` | Etat initial ouvert/ferme |

### Usage

```tsx
import { ExerciseStatsCard } from "@/components/stats/exercise-stats-card";

// Usage basique (ferme par defaut)
<ExerciseStatsCard
  exerciseName="Pompe"
  workouts={workoutHistory}
/>

// Etat initial ouvert
<ExerciseStatsCard
  exerciseName="Traction"
  workouts={workoutHistory}
  expanded={true}
/>

// Liste de stats pour plusieurs exercices
{exercises.map((exercise) => (
  <ExerciseStatsCard
    key={exercise.id}
    exerciseName={exercise.name}
    workouts={workoutHistory}
  />
))}
```

### Notes techniques

- Utilise `Collapsible` de Radix UI (`@radix-ui/react-collapsible`) pour le toggle ouvert/ferme
- Le `MiniTrendChart` est charge dynamiquement (`next/dynamic`) pour eviter de charger recharts au premier rendu
- Les calculs (weeklyComparison, monthlyComparison, etc.) sont memoises avec `useMemo`
- Affiche un message "Aucune donnee" si l'exercice n'a jamais ete fait
- Les couleurs de tendance : vert (positif), rouge (negatif), gris (stable ou null)
- Le graphique n'apparait que si >= 3 workouts contiennent cet exercice
- Toutes les dates sont formatees en francais avec `date-fns`
