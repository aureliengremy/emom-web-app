# EMOM Web App - Bounded Contexts

> **Version** : 1.0
> **Date** : 2026-01-13
> **Phase** : MVP

---

## Vue d'ensemble

L'application EMOM est organisée en 5 bounded contexts distincts, chacun avec sa propre responsabilité et son propre modèle de données.

```
┌─────────────────────────────────────────────────────────────────┐
│                        EMOM Web App                              │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────┤
│  Exercise   │   Workout   │   Session   │    User     │Analytics│
│ Management  │  Execution  │  Planning   │   Profile   │         │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────┘
```

---

## 1. Exercise Management (Gestion des exercices)

### Responsabilité
Gestion du catalogue d'exercices disponibles, incluant les exercices présets et personnalisés.

### Entités
- `Exercise`
- `PresetExercise`
- `ExerciseFamily`
- `ExerciseDifficulty`

### Store
`exercise-store.ts`

### Pages / Composants
- `/exercises` - Liste des exercices
- `/exercises/[id]` - Détail d'un exercice
- `ExerciseCard` - Carte d'exercice
- `AddExerciseModal` - Création d'exercice custom

### Opérations
| Action | Description |
|--------|-------------|
| `initializePresets()` | Charge les exercices présets |
| `addCustomExercise()` | Crée un exercice personnalisé |
| `updateExercise()` | Met à jour un exercice |
| `deleteExercise()` | Supprime un exercice custom |
| `updateExerciseMax()` | Met à jour le record personnel |

### Dépendances externes
- `emom-tables.ts` : Tables EMOM et exercices présets
- Supabase : Stockage des exercices custom

---

## 2. Workout Execution (Exécution de séance)

### Responsabilité
Gestion du timer EMOM, suivi des répétitions minute par minute, et enregistrement des workouts complétés.

### Entités
- `Workout`
- `WorkoutSet`
- `WorkoutMinute`
- `TimerState`
- `SetFeedback`

### Store
`workout-store.ts`

### Pages / Composants
- `/workout` - Timer actif
- `/workout/complete` - Fin de séance
- `TimerCircle` - Cercle de progression

### Opérations
| Action | Description |
|--------|-------------|
| `startWorkout()` | Démarre une séance |
| `startNextSet()` | Passe au set suivant |
| `completeMinute()` | Enregistre les reps d'une minute |
| `pauseWorkout()` | Met en pause |
| `resumeWorkout()` | Reprend |
| `abandonWorkout()` | Abandonne la séance |
| `completeWorkout()` | Finalise et sauvegarde |
| `updateSetFeedback()` | Ajoute un feedback par set |

### Dépendances externes
- `use-sound.ts` : Sons et vibrations
- Supabase : Sauvegarde des workouts

---

## 3. Session Planning (Planification de séance)

### Responsabilité
Construction et sauvegarde de templates de séances réutilisables.

### Entités
- `PlannedSet`
- `SessionPlan`
- `SavedSession`

### Store
`session-store.ts`

### Pages / Composants
- `/` (home) - Session builder
- `/sessions` - Liste des sessions sauvegardées
- `/sessions/create` - Création/édition de session
- `PlannedSetConfig` - Configuration d'un set

### Opérations
| Action | Description |
|--------|-------------|
| `addSet()` | Ajoute un exercice à la séance |
| `removeSet()` | Retire un exercice |
| `updateSetConfig()` | Modifie reps/durée |
| `reorderSets()` | Réordonne les sets |
| `saveCurrentSession()` | Sauvegarde la session |
| `loadSessionPlan()` | Charge une session sauvegardée |
| `clearSession()` | Vide le builder |

### Dépendances externes
- Exercise Management : Pour la sélection d'exercices
- Supabase : Sauvegarde des sessions

---

## 4. User Profile (Profil utilisateur)

### Responsabilité
Authentification, paramètres utilisateur et préférences.

### Entités
- `User` (Supabase Auth)
- `UserSettings`
- `AppLanguage`

### Stores
- `auth-store.ts`
- `settings-store.ts`

### Pages / Composants
- `/auth/login` - Connexion
- `/settings` - Paramètres

### Opérations
| Action | Description |
|--------|-------------|
| `signIn()` | Connexion email/password |
| `signUp()` | Inscription |
| `signOut()` | Déconnexion |
| `continueAsGuest()` | Mode invité |
| `updateSettings()` | Sauvegarde les préférences |

### Dépendances externes
- Supabase Auth : Authentification
- IndexedDB : Stockage local des settings

---

## 5. Analytics (Statistiques)

### Responsabilité
Historique des workouts, visualisation des progrès et statistiques.

### Entités
- `Workout` (lecture seule)
- `ChartDataPoint`

### Store
`workout-store.ts` (partie lecture)

### Pages / Composants
- `/history` - Historique des séances
- `ProgressChart` - Graphique de progression
- `RepsBarChart` - Volume hebdomadaire
- `VolumeAreaChart` - Progression par exercice

### Opérations
| Action | Description |
|--------|-------------|
| `loadWorkouts()` | Charge l'historique |
| `deleteWorkout()` | Supprime une séance |
| `getWorkoutsByExercise()` | Filtre par exercice |

### Dépendances externes
- Supabase : Lecture des workouts
- Recharts : Visualisation

---

## Communication inter-contextes

### Flux de données

```
┌─────────────────┐
│    Exercise     │
│   Management    │
└────────┬────────┘
         │ fournit exercices
         ▼
┌─────────────────┐     crée session    ┌─────────────────┐
│     Session     │◄────────────────────│      User       │
│    Planning     │                     │     Profile     │
└────────┬────────┘                     └─────────────────┘
         │ démarre workout
         ▼
┌─────────────────┐
│     Workout     │
│    Execution    │
└────────┬────────┘
         │ enregistre
         ▼
┌─────────────────┐
│    Analytics    │
└─────────────────┘
```

### Interfaces partagées

| Interface | Contextes | Type |
|-----------|-----------|------|
| `Exercise` | Exercise ↔ Session | Entité partagée |
| `PlannedSet` | Session ↔ Workout | DTO de transfert |
| `Workout` | Workout ↔ Analytics | Entité partagée |
| `User` | Tous | Via auth-store |

---

## Isolation des contextes

Chaque contexte est relativement isolé :

1. **Stores séparés** : Chaque contexte a son propre store Zustand
2. **Pages dédiées** : Routes distinctes par contexte
3. **Composants encapsulés** : Composants organisés par fonctionnalité

### Points de couplage (à surveiller)

1. **Exercise → Session** : La sélection d'exercices dans le builder
2. **Session → Workout** : La création de workout à partir d'un plan
3. **Auth → Tous** : L'état de connexion affecte tous les contextes

---

## Évolutions futures

### Contextes potentiels

| Contexte | Description | Priorité |
|----------|-------------|----------|
| Social | Partage de sessions, classements | 🟡 V2 |
| Coaching | Programmes pré-définis, recommandations | 🟢 Scale |
| Gamification | Badges, achievements, streaks | 🟢 Scale |

---

*Document généré dans le cadre du Frontend System Design*
