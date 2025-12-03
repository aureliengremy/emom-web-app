# Référence - EMOM Native App (Expo)

**Objectif** : Documenter l'existant pour s'inspirer lors du développement web
**Source** : `/Users/aureliengremy/Documents/CODE/emom-native-app/`

---

## Stack technique actuelle

| Technologie | Version | Usage |
|-------------|---------|-------|
| React Native | 0.81.5 | Framework mobile |
| Expo | 54.0.0 | Build/Run |
| React | 19.1.0 | UI |
| TypeScript | 5.9.2 | Typage |
| Zustand | 4.5.5 | État global |
| AsyncStorage | 2.2.0 | Persistance locale |
| react-native-paper | 5.12.5 | Composants UI |
| expo-av | 16.0.7 | Audio |
| expo-haptics | 15.0.7 | Vibrations |

---

## Architecture des dossiers

```
src/
├── components/
│   ├── common/           # Composants génériques
│   ├── exercises/        # ExerciseSetupCard, AddExerciseModal
│   ├── history/          # Composants historique
│   ├── session/          # PlannedSetCard, ExercisePicker
│   ├── timer/            # TimerCircle, RepsDisplay, MinuteIndicator
│   ├── ui/               # AnimatedNumber, FadeIn, AnimatedPressable
│   └── workout/          # Composants workout
├── data/                 # Tables EMOM (emomTables.ts)
├── models/               # Types TypeScript
├── navigation/           # React Navigation config
├── screens/              # 12 écrans
├── services/             # audio.ts, storage.ts
├── store/                # 4 stores Zustand
├── theme/                # colors, typography, spacing
├── utils/                # haptics.ts
└── hooks/                # Custom hooks
```

---

## 12 Écrans implémentés

| Écran | Route | Description |
|-------|-------|-------------|
| OnboardingScreen | `/onboarding` | Config initiale (saisie max) |
| HomeScreen | `/` | Accueil, liste exercices |
| SessionBuilderScreen | `/session/build` | Construction séance |
| ActiveWorkoutScreen | `/workout` | Timer EMOM actif |
| PauseScreen | `/workout/pause` | Pause entre sets |
| WorkoutSummaryScreen | `/workout/summary` | Récap + notes fin |
| ExercisesListScreen | `/exercises` | Liste tous les exercices |
| ExerciseDetailScreen | `/exercises/:id` | Détail + historique |
| MaxTestScreen | `/exercises/:id/test` | Test du maximum |
| HistoryScreen | `/history` | Historique workouts |
| WorkoutDetailScreen | `/history/:id` | Détail d'une séance |
| SettingsScreen | `/settings` | Paramètres |

---

## Gestion d'état (Zustand)

### 4 Stores

#### useWorkoutStore
```typescript
// État
currentWorkout: Workout | null
sessionPlan: SessionPlan | null
workoutHistory: Workout[]  // Persisté
timerState: TimerState

// Actions principales
startWorkout(plan)
tick()                    // Décrémente 1s, gère transitions
pauseTimer() / resumeTimer()
completeMinute(reps)
completeSet()
finishWorkout(rating, notes)
```

#### useSessionStore
```typescript
// État (non persisté)
plannedSets: PlannedSet[]
pauseDuration: number

// Actions
addSet(exercise)
removeSet(setId)
updateSetConfig(setId, config)
reorderSets(from, to)
getSessionPlan()
getTotalDuration()
```

#### useExerciseStore
```typescript
// État persisté
exercises: Exercise[]

// Actions
initializePresets()       // Crée les 4 exercices de base
addExercise(data)
updateExercise(id, updates)
updateMax(id, newMax)     // Recalcule EMOM auto
deleteExercise(id)
```

#### useUserStore
```typescript
// État persisté
profile: UserProfile

// Actions
initializeProfile()
completeOnboarding()
updateSettings(updates)
resetAllData()
```

---

## Modèles de données

### Exercise
```typescript
interface Exercise {
  id: string;
  name: string;
  type: 'preset' | 'custom';
  category: 'push' | 'pull' | 'legs' | 'core';
  currentMax: number;
  currentEMOM: EMOMConfig;
  lastTested: string;      // ISO date
  createdAt: string;
}

interface EMOMConfig {
  reps: number;
  duration: number;        // minutes
  weighted?: boolean;
  weight?: number;         // kg
}
```

### Workout
```typescript
interface Workout {
  id: string;
  date: string;
  sets: WorkoutSet[];
  totalDuration: number;   // secondes
  totalReps: number;
  rating?: 'easy' | 'medium' | 'hard';
  notes?: string;
  completed: boolean;
}

interface WorkoutSet {
  id: string;
  exerciseId: string;
  exerciseName: string;
  order: number;
  emomConfig: EMOMConfig;
  minutes: WorkoutMinute[];
  completed: boolean;
  totalReps: number;
  actualDuration: number;
}

interface WorkoutMinute {
  minuteNumber: number;
  targetReps: number;
  completedReps: number;
  status: 'pending' | 'completed' | 'failed' | 'adjusted';
}
```

### UserSettings
```typescript
interface UserSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationsEnabled: boolean;
  reminderFrequency: 'daily' | 'weekly' | 'none';
  reminderTime?: string;
  defaultPauseDuration: number;    // secondes (120)
  defaultEMOMDuration: number;     // minutes (10)
  emomMode: 'auto' | 'manual';
}
```

---

## Tables EMOM (logique métier)

### Tractions
```typescript
{ minMax: 0,  maxMax: 5,   reps: 2,  duration: 10 }
{ minMax: 5,  maxMax: 10,  reps: 3,  duration: 10 }
{ minMax: 10, maxMax: 15,  reps: 4,  duration: 10 }
{ minMax: 15, maxMax: 20,  reps: 5,  duration: 10 }
{ minMax: 20, maxMax: 25,  reps: 6,  duration: 10 }
{ minMax: 25, maxMax: 30,  reps: 8,  duration: 10 }
{ minMax: 30, maxMax: 35,  reps: 10, duration: 10 }
{ minMax: 35, maxMax: 40,  reps: 10, duration: 10, weighted: true, weight: 5 }
// ... jusqu'à 50+ avec lest
```

### Dips
```typescript
{ minMax: 0,  maxMax: 10,  reps: 4,  duration: 10 }
{ minMax: 10, maxMax: 20,  reps: 6,  duration: 10 }
{ minMax: 20, maxMax: 30,  reps: 8,  duration: 10 }
{ minMax: 30, maxMax: 40,  reps: 10, duration: 10 }
{ minMax: 40, maxMax: 50,  reps: 12, duration: 10 }
// ... jusqu'à 70+ avec lest
```

### Pompes
```typescript
{ minMax: 0,  maxMax: 20,  reps: 5,  duration: 10 }
{ minMax: 20, maxMax: 40,  reps: 8,  duration: 10 }
{ minMax: 40, maxMax: 60,  reps: 12, duration: 10 }
// 60+ → format tests de volume
```

### Muscle-ups
```typescript
{ minMax: 0,  maxMax: 3,   reps: 1, duration: 10 }
{ minMax: 3,  maxMax: 6,   reps: 2, duration: 10 }
{ minMax: 6,  maxMax: 8,   reps: 3, duration: 10 }
{ minMax: 8,  maxMax: 10,  reps: 4, duration: 10 }
{ minMax: 10, maxMax: 12,  reps: 5, duration: 10 }
```

---

## Design System

### Couleurs (Dark Mode)

```typescript
// Fonds
background: {
  primary: '#121212',      // Fond app
  secondary: '#1E1E1E',    // Cartes
  tertiary: '#2A2A2A',     // Éléments surélevés
  elevated: '#333333',     // Modals
}

// Textes
text: {
  primary: '#FFFFFF',
  secondary: '#B3B3B3',
  tertiary: '#808080',
}

// Accent principal (vert)
primary: {
  main: '#4CAF50',
  light: '#81C784',
  dark: '#388E3C',
}

// Timer (change selon temps restant)
timer: {
  safe: '#4CAF50',         // > 30s
  warning: '#FF9800',      // 10-30s
  danger: '#F44336',       // < 10s
}

// Badges niveau
badge: {
  beginner: '#4CAF50',
  intermediate: '#2196F3',
  advanced: '#9C27B0',
  expert: '#FF9800',
  master: '#F44336',
}

// Rating difficulté
rating: {
  easy: '#4CAF50',         // 😊
  medium: '#FF9800',       // 😐
  hard: '#F44336',         // 🥵
}
```

### Typographie

```typescript
// Tailles
xs: 10,   sm: 12,   md: 14,   lg: 16,
xl: 18,   2xl: 22,  3xl: 28,  4xl: 36,
5xl: 48,  6xl: 64,  7xl: 80

// Usages
timerSeconds: 80px, bold      // LE PLUS GROS
timerMinutes: 48px, semibold
repCount: 64px, bold
setCount: 28px, semibold
screenTitle: 22px, bold
cardTitle: 16px, semibold
body: 14px, regular
```

### Espacements

```typescript
xs: 4,   sm: 8,   md: 16,  lg: 24,
xl: 32,  2xl: 40, 3xl: 48, 4xl: 64

// Border radius
sm: 4,   md: 8,   lg: 12,  xl: 16,  2xl: 24,  full: 9999
```

---

## Composants clés à adapter

### TimerCircle
- Cercle SVG 280px
- Progression avec stroke-dasharray
- Couleur dynamique (vert → orange → rouge)
- Secondes en 80px au centre
- Label "EN PAUSE" si pausé

### RepsDisplay
- Nombre de reps en 64px
- Badge optionnel pour poids (lesté)
- Fond arrondi

### MinuteIndicator
- "Minute X/Y"
- Statut du set

### ExerciseSetupCard
- Input numérique avec +/-
- Affichage EMOM recommandé en temps réel

### PlannedSetCard
- Nom exercice, reps, durée
- Actions modifier/supprimer
- Drag handle pour réorganiser

---

## Points forts à conserver

1. **Architecture Zustand** - Simple et efficace
2. **Types TypeScript** - Complets et bien documentés
3. **Tables EMOM** - Logique de recommandation automatique
4. **Timer robuste** - Gestion transitions, pauses, fin de set
5. **Design system cohérent** - Palette, spacing, typography
6. **Timer visuel** - Cercle avec progression couleur
7. **Gros chiffres** - 80px pour lisibilité pendant effort
8. **Dark mode** - Moins fatiguant pendant l'entraînement
9. **Feedback multi-sensoriel** - Son + vibration

---

## Adaptations nécessaires pour le web

| Mobile (Expo) | Web (Next.js) |
|---------------|---------------|
| React Navigation | App Router (routes fichiers) |
| AsyncStorage | localStorage / IndexedDB (Dexie) |
| StyleSheet | Tailwind CSS |
| expo-av (audio) | Web Audio API |
| expo-haptics | Navigator.vibrate() (limité) |
| react-native-svg | SVG natif HTML |
| Animated (RN) | Framer Motion |

### Code réutilisable (~85%)

- `models/` → Types TypeScript (100%)
- `data/emomTables.ts` → Tables EMOM (100%)
- `store/` → Stores Zustand (adapter persistance)
- Logique métier des stores (calculs, formatters)

### À recréer

- Tous les composants UI (React Native → React Web)
- Navigation (routes Next.js)
- Styling (Tailwind + shadcn/ui)
- Services audio/haptics (Web APIs)

---

## Fichiers sources à consulter

**Types & Modèles**
- `src/models/index.ts`

**Stores**
- `src/store/useWorkoutStore.ts`
- `src/store/useSessionStore.ts`
- `src/store/useExerciseStore.ts`
- `src/store/useUserStore.ts`

**Logique métier**
- `src/data/emomTables.ts`
- `src/services/storage.ts`

**Design**
- `src/theme/colors.ts`
- `src/theme/typography.ts`
- `src/theme/spacing.ts`

**Écrans principaux**
- `src/screens/ActiveWorkoutScreen.tsx`
- `src/screens/OnboardingScreen.tsx`
- `src/screens/SessionBuilderScreen.tsx`
- `src/screens/HomeScreen.tsx`

**Composants clés**
- `src/components/timer/TimerCircle.tsx`
- `src/components/exercises/ExerciseSetupCard.tsx`
- `src/components/session/PlannedSetCard.tsx`

---

*Document généré le 1er décembre 2025*
