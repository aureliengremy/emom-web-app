# EMOM Web App - Domain Model

> **Version** : 1.0
> **Date** : 2026-01-13
> **Phase** : MVP

---

## Vue d'ensemble

EMOM (Every Minute On the Minute) est une application d'entraînement basée sur un protocole de fitness où l'utilisateur effectue un nombre défini de répétitions au début de chaque minute, puis se repose jusqu'à la minute suivante.

---

## Entités principales

### 1. Exercise (Exercice)

Représente un type d'exercice que l'utilisateur peut effectuer.

```typescript
Exercise {
  id: string                    // Identifiant unique
  name: string                  // Nom par défaut
  nameFr?: string               // Nom en français
  nameEn?: string               // Nom en anglais
  type: "preset" | "custom"     // Préset (système) ou personnalisé
  category: ExerciseCategory    // push | pull | legs | core
  family?: ExerciseFamily       // Groupe de variantes (pushup, pullup, squat...)
  difficulty?: ExerciseDifficulty // novice → expert
  currentMax: number            // Record personnel
  currentEMOM: EMOMConfig       // Configuration EMOM recommandée
  lastTested: string            // Date du dernier test
  createdAt: string             // Date de création
}
```

**Règles métier :**
- Les exercices `preset` sont fournis par le système (41 exercices)
- Les exercices `custom` sont créés par l'utilisateur
- `currentMax` détermine les recommandations EMOM via les tables de calcul
- Un exercice appartient à une seule `category` et une seule `family`

### 2. Workout (Séance)

Représente une séance d'entraînement complétée.

```typescript
Workout {
  id: string
  date: string                  // Date ISO de la séance
  sets: WorkoutSet[]            // Sets effectués
  totalDuration: number         // Durée totale en secondes
  totalReps: number             // Total des répétitions
  rating?: WorkoutRating        // easy | medium | hard
  notes?: string                // Notes libres
  completed: boolean            // Séance terminée ou abandonnée
}
```

**Règles métier :**
- Un workout contient au moins 1 set
- `completed: false` indique une séance abandonnée
- Le `rating` est optionnel et saisi en fin de séance

### 3. WorkoutSet (Set)

Représente un bloc d'exercice au sein d'un workout.

```typescript
WorkoutSet {
  id: string
  exerciseId: string            // Référence à l'exercice
  exerciseName: string          // Nom snapshot (dénormalisé)
  order: number                 // Position dans le workout
  emomConfig: EMOMConfig        // Configuration utilisée
  minutes: WorkoutMinute[]      // Détail minute par minute
  completed: boolean            // Set terminé
  totalReps: number             // Reps effectuées
  actualDuration: number        // Durée réelle en secondes
  feedback?: SetFeedback        // Feedback utilisateur
}
```

**Règles métier :**
- `exerciseName` est dénormalisé pour l'historique (l'exercice peut être supprimé)
- Chaque minute est trackée individuellement dans `minutes[]`

### 4. SavedSession (Session sauvegardée)

Template de séance réutilisable.

```typescript
SavedSession {
  id: string
  userId: string                // Propriétaire
  name: string                  // Nom de la session
  description?: string          // Description optionnelle
  sets: PlannedSet[]            // Configuration des sets
  pauseDuration: number         // Pause entre sets (secondes)
  createdAt: string
  updatedAt: string
}
```

**Règles métier :**
- Une session appartient à un seul utilisateur
- Les sessions peuvent être chargées pour démarrer un workout

### 5. UserSettings (Paramètres)

Préférences utilisateur.

```typescript
UserSettings {
  soundEnabled: boolean         // Sons activés
  vibrationEnabled: boolean     // Vibration activée
  defaultPauseDuration: number  // Pause par défaut (secondes)
  defaultEMOMDuration: number   // Durée EMOM par défaut (minutes)
  hasCompletedSetup: boolean    // Onboarding terminé
  language: AppLanguage         // fr | en
}
```

---

## Relations entre entités

```
┌──────────────┐
│   Exercise   │
└──────┬───────┘
       │ 1
       │
       │ référence
       │
       ▼ *
┌──────────────┐       ┌──────────────┐
│  PlannedSet  │◄──────│SavedSession  │
└──────────────┘   *   └──────────────┘
       │                      │
       │                      │ appartient à
       │                      ▼
       │               ┌──────────────┐
       │               │     User     │
       │               └──────────────┘
       │                      │
       │ devient              │ possède
       ▼                      ▼
┌──────────────┐       ┌──────────────┐
│  WorkoutSet  │──────►│   Workout    │
└──────────────┘   *   └──────────────┘
       │
       │ contient
       ▼ *
┌──────────────┐
│WorkoutMinute │
└──────────────┘
```

---

## Flux de données

### 1. Création de séance

```
User → Sélectionne exercices → Crée PlannedSets → (Optionnel) Sauvegarde SavedSession
```

### 2. Exécution d'un workout

```
PlannedSets → Timer démarre → WorkoutMinutes trackées → WorkoutSet créé → Workout enregistré
```

### 3. Consultation historique

```
Workouts → Filtrage par exercice/date → Calcul statistiques → Affichage charts
```

---

## Types énumérés

| Type | Valeurs | Description |
|------|---------|-------------|
| ExerciseCategory | push, pull, legs, core | Catégorie musculaire |
| ExerciseFamily | pushup, pullup, squat, hinge, core, dip, pike, hspu, chinup, muscleup, custom | Famille d'exercice |
| ExerciseDifficulty | novice, classique, intermediaire, avance, expert | Niveau de difficulté |
| WorkoutRating | easy, medium, hard | Ressenti post-workout |
| MinuteStatus | pending, completed, failed, adjusted | État d'une minute |
| TimerStatus | idle, countdown, running, paused, finished | État du timer |
| AppLanguage | fr, en | Langue de l'interface |

---

## Invariants

1. **Exercise.currentMax >= 0** : Le max ne peut pas être négatif
2. **Workout.sets.length >= 1** : Un workout a au moins un set
3. **WorkoutSet.minutes.length == emomConfig.duration** : Autant de minutes que la durée configurée
4. **SavedSession.userId != null** : Une session a toujours un propriétaire
5. **PlannedSet.reps >= 1** : Au moins une répétition par minute
6. **PlannedSet.duration in [2..20]** : Durée entre 2 et 20 minutes

---

## Calcul EMOM

Le système utilise des tables de correspondance pour recommander une configuration EMOM basée sur le `currentMax` :

```
currentMax → Lookup table → EMOMConfig { reps, duration }
```

**Règle générale** : Plus le max est élevé, plus le nombre de reps par minute augmente tout en gardant la séance gérable.

---

*Document généré dans le cadre du Frontend System Design*
