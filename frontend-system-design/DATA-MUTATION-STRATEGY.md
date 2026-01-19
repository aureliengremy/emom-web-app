# Data Mutation Strategy

> Documentation de la stratégie de mutation des données pour EMOM Web App

## 1. Validation des formulaires

### Stack technique

- **React Hook Form** : Gestion des formulaires
- **Zod** : Schémas de validation
- **@hookform/resolvers** : Intégration RHF + Zod

### Schémas de validation

Tous les schémas sont centralisés dans `src/lib/validations/index.ts`.

#### Auth (Login/Signup)

```typescript
// Login
loginSchema = {
  email: string().email(),
  password: string().min(6)
}

// Signup
signupSchema = {
  email: string().email(),
  password: string().min(6),
  confirmPassword: string() // Doit correspondre à password
}
```

#### Exercise

```typescript
exerciseSchema = {
  name: string().min(2).max(100),
  category: enum(["push", "pull", "legs", "core"]),
  currentMax: number().int().min(0)
}
```

#### Session

```typescript
sessionSchema = {
  name: string().min(2).max(100),
  description: string().max(500),
  sets: array(sessionSetSchema).min(1)
}

sessionSetSchema = {
  id: string(),
  exerciseId: string(),
  exerciseName: string(),
  reps: number().min(1),
  duration: number().min(1),
  weighted?: boolean,
  weight?: number
}
```

#### Workout Feedback

```typescript
workoutFeedbackSchema = {
  rating?: enum(["easy", "medium", "hard"]),
  notes?: string().max(1000)
}

setFeedbackSchema = {
  rating?: enum(["easy", "medium", "hard"]),
  comment?: string().max(500)
}
```

### Messages d'erreur

Tous les messages sont en français et cohérents :

| Type | Message |
|------|---------|
| Requis | "Ce champ est requis" |
| Email | "Email invalide" |
| Mot de passe min | "Le mot de passe doit faire au moins 6 caractères" |
| Mots de passe différents | "Les mots de passe ne correspondent pas" |
| Nom min | "Le nom doit faire au moins 2 caractères" |
| Nom max | "Le nom ne doit pas dépasser 100 caractères" |
| Au moins un exercice | "Ajoute au moins un exercice" |

---

## 2. Real-time Updates

### Statut : N/A pour MVP

L'application EMOM n'a pas besoin de mises à jour en temps réel pour les raisons suivantes :

1. **App personnelle** : Pas de collaboration entre utilisateurs
2. **Données initiées par l'utilisateur** : Les modifications sont toujours déclenchées par l'utilisateur lui-même
3. **Pas d'édition collaborative** : Pas de scénario où plusieurs personnes modifient les mêmes données

### Stratégie actuelle

- **Polling manuel** : Rechargement des données à la navigation
- **Refresh on focus** : Pas encore implémenté (candidat V2)

### Évolution possible (V2+)

Si nécessaire dans le futur (ex: partage de sessions entre utilisateurs) :

```typescript
// Supabase Realtime
const channel = supabase
  .channel('workouts')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'workouts'
  }, handleChange)
  .subscribe()
```

---

## 3. Optimistic Updates

### Principe

Mettre à jour l'UI immédiatement avant la confirmation du serveur, puis :
- **Succès** : Garder l'état optimiste
- **Erreur** : Rollback à l'état précédent + notification

### Mutations avec optimistic UI

#### Suppression de workout

```typescript
// workout-store.ts
deleteWorkoutFromHistory: async (id) => {
  // 1. Sauvegarder l'état actuel (pour rollback)
  const previousWorkouts = get().workouts;

  // 2. Update optimiste
  set({ workouts: previousWorkouts.filter(w => w.id !== id) });

  // 3. Appel API
  try {
    await deleteSupabaseWorkout(id);
  } catch (error) {
    // 4. Rollback en cas d'erreur
    set({ workouts: previousWorkouts });
    throw error;
  }
}
```

#### Ajout d'exercice

```typescript
// exercise-store.ts
addExercise: async (data) => {
  // 1. Créer l'exercice optimiste
  const optimisticExercise = { ...data, id: generateId() };

  // 2. Update optimiste
  const previousExercises = get().exercises;
  set({ exercises: [...previousExercises, optimisticExercise] });

  // 3. Appel API
  try {
    const savedExercise = await saveSupabaseExercise(userId, optimisticExercise);
    // 4. Remplacer par la vraie réponse
    set({
      exercises: get().exercises.map(e =>
        e.id === optimisticExercise.id ? savedExercise : e
      )
    });
  } catch (error) {
    // 5. Rollback
    set({ exercises: previousExercises });
    throw error;
  }
}
```

### Mutations implémentées

| Action | Optimistic | Rollback | Status |
|--------|------------|----------|--------|
| Suppression workout | ✅ | ✅ | Implémenté |
| Ajout exercice | ✅ | ✅ | Implémenté |
| Update exercice max | ✅ | ✅ | Implémenté |
| Suppression exercice | ✅ | ✅ | Implémenté |
| Sauvegarde session | ❌ | N/A | Pas nécessaire (création) |
| Suppression session | ✅ | ✅ | Implémenté |

### Feedback utilisateur

- **Toast success** : Confirmation après succès API
- **Toast error** : Message d'erreur en cas d'échec
- **Loading state** : Boutons désactivés pendant l'opération

---

## 4. Fichiers modifiés

### Nouveaux fichiers

- `src/lib/validations/index.ts` - Schémas Zod centralisés

### Formulaires refactorés

- `src/app/auth/login/page.tsx` - Login/Signup avec RHF
- `src/components/exercises/add-exercise-modal.tsx` - Modal exercice avec RHF
- `src/app/sessions/create/page.tsx` - Création session avec RHF + useFieldArray
- `src/app/workout/complete/page.tsx` - Feedback avec validation

### Dépendances ajoutées

```json
{
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "@hookform/resolvers": "^3.x"
}
```

---

*Dernière mise à jour : 2026-01-17*
