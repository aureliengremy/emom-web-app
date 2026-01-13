# EMOM Web App - Data Fetching Strategy

> **Version** : 1.0
> **Date** : 2026-01-13
> **Architecture** : Zustand + Supabase / IndexedDB

---

## Vue d'ensemble

L'application utilise une architecture hybride pour le data fetching :
- **Mode connecté** : Supabase (PostgreSQL) via API REST
- **Mode invité** : IndexedDB (Dexie.js) en local

Contrairement à une approche TanStack Query, nous utilisons Zustand comme couche de cache avec des stratégies explicites de rafraîchissement et d'invalidation.

---

## Architecture de cache

```
┌─────────────────────────────────────────────────────────┐
│                      UI Components                       │
└─────────────────────────┬───────────────────────────────┘
                          │ useStore selectors
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Zustand Stores                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Exercise │ │ Workout  │ │ Session  │ │ Settings │   │
│  │  Store   │ │  Store   │ │  Store   │ │  Store   │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │
└───────┼────────────┼────────────┼────────────┼──────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────┐
│                   Data Service Layer                     │
│            (data-service.ts + db.ts)                     │
└───────────────────────────┬─────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌─────────────────────┐       ┌─────────────────────┐
│      Supabase       │       │      IndexedDB      │
│   (mode connecté)   │       │   (mode invité)     │
└─────────────────────┘       └─────────────────────┘
```

---

## Stale Time par type de données

| Donnée | Stale Time | Stratégie | Justification |
|--------|------------|-----------|---------------|
| **Exercises** | Session | Chargé une fois au démarrage | Données stables, changent rarement |
| **Workouts** | Session | Chargé une fois au démarrage | Historique, pas de mise à jour externe |
| **Settings** | Session | Chargé une fois au démarrage | Préférences utilisateur locales |
| **Sessions** | On-demand | Chargé à l'ouverture de la page | Templates de séance |

### Définition des stale times

```typescript
// Durée avant qu'une donnée soit considérée "stale"
const STALE_TIMES = {
  exercises: Infinity,    // Jamais stale pendant la session
  workouts: Infinity,     // Jamais stale pendant la session
  settings: Infinity,     // Jamais stale pendant la session
  sessions: 5 * 60_000,   // 5 minutes
} as const;
```

**Note** : Avec Zustand, les données restent en mémoire pendant toute la session. Elles sont rafraîchies uniquement :
1. Au démarrage de l'application
2. Après une mutation (optimistic update)
3. Au changement d'authentification

---

## Stratégie d'invalidation

### Invalidation automatique

| Événement | Données invalidées | Action |
|-----------|-------------------|--------|
| Login | Toutes | Reload complet depuis Supabase |
| Logout | Toutes | Clear stores, reload depuis IndexedDB |
| Create exercise | exercises | Ajout optimiste au store |
| Update exercise | exercises | Update optimiste au store |
| Delete exercise | exercises | Suppression optimiste |
| Complete workout | workouts | Ajout optimiste |
| Delete workout | workouts | Suppression optimiste |
| Save session | sessions | Ajout/update optimiste |
| Delete session | sessions | Suppression optimiste |

### Pattern d'invalidation (Optimistic Update)

```typescript
// Exemple : création d'exercice
async addExercise(data) {
  const exercise = createExercise(data);

  // 1. Optimistic update (immédiat)
  set(state => ({ exercises: [...state.exercises, exercise] }));

  // 2. Persist to backend
  try {
    await saveSupabaseExercise(userId, exercise);
  } catch (error) {
    // 3. Rollback on failure
    set(state => ({
      exercises: state.exercises.filter(e => e.id !== exercise.id)
    }));
    throw error;
  }
}
```

---

## Pagination

### Stratégie actuelle : No Pagination

| Donnée | Volume estimé | Pagination |
|--------|---------------|------------|
| Exercises | ~50-100 | Non requise |
| Workouts | ~100-500/an | Non requise (MVP) |
| Sessions | ~10-20 | Non requise |

**Justification** :
- Application personnelle avec volume limité
- Toutes les données tiennent confortablement en mémoire
- Pagination ajouterait de la complexité sans bénéfice

### Évolution future (V2+)

Si le volume de workouts dépasse 1000 entrées :
```typescript
// Stratégie recommandée : cursor-based pagination
async loadWorkouts(cursor?: string, limit = 50) {
  const { data } = await supabase
    .from('workouts')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit)
    .gt('date', cursor);
}
```

---

## Optimisation des requêtes

### Request Deduplication

Empêche les requêtes concurrentes identiques :

```typescript
// Pattern de déduplication
const pendingRequests = new Map<string, Promise<any>>();

async function deduplicatedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = pendingRequests.get(key);
  if (existing) return existing;

  const promise = fetcher().finally(() => pendingRequests.delete(key));
  pendingRequests.set(key, promise);
  return promise;
}
```

### Request Cancellation (AbortController)

Pour les opérations longues ou lors de navigation :

```typescript
// Pattern de cancellation
async function fetchWithAbort<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  signal?: AbortSignal
): Promise<T> {
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }
  return fetcher(signal ?? new AbortController().signal);
}
```

### Throttling des sauvegardes

Limite la fréquence des appels API pour les updates fréquents :

```typescript
// Pattern de throttling
function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  let lastCall = 0;
  let timeout: NodeJS.Timeout | null = null;

  return ((...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn(...args);
    }
    // Schedule for later
    if (!timeout) {
      timeout = setTimeout(() => {
        timeout = null;
        lastCall = Date.now();
        fn(...args);
      }, delay - (now - lastCall));
    }
  }) as T;
}
```

---

## Cache persistant (Offline)

### IndexedDB comme cache offline

L'application supporte le mode hors-ligne via IndexedDB :

| Fonctionnalité | Online | Offline |
|----------------|--------|---------|
| Voir exercices | ✅ Supabase | ✅ IndexedDB |
| Voir historique | ✅ Supabase | ✅ IndexedDB |
| Créer workout | ✅ Supabase | ⚠️ Mode invité only |
| Modifier settings | ✅ Supabase | ✅ IndexedDB |

### Stratégie de synchronisation

```
┌──────────────┐     Login      ┌──────────────┐
│   IndexedDB  │ ──────────────►│   Supabase   │
│   (local)    │                │   (cloud)    │
└──────────────┘ ◄────────────── └──────────────┘
                    Logout
```

1. **Login** : Les données locales peuvent être synchronisées vers le cloud
2. **Logout** : Les données cloud sont perdues, retour au mode local
3. **Offline** : Les données Supabase ne sont pas accessibles, fallback impossible

---

## Gestion des erreurs

### Stratégie de retry

| Type d'erreur | Action | Retry |
|---------------|--------|-------|
| Network error | Toast + retry button | Manuel |
| 401 Unauthorized | Redirect to login | Non |
| 403 Forbidden | Toast error | Non |
| 500 Server error | Toast + retry button | Manuel |
| Timeout | Toast + retry button | Manuel |

### Pattern de gestion d'erreur

```typescript
async function safeFetch<T>(
  fetcher: () => Promise<T>,
  options?: { onError?: (error: Error) => void }
): Promise<T | null> {
  try {
    return await fetcher();
  } catch (error) {
    console.error('Fetch error:', error);
    options?.onError?.(error as Error);
    return null;
  }
}
```

---

## Métriques et monitoring

### Points de mesure recommandés

| Métrique | Description | Seuil d'alerte |
|----------|-------------|----------------|
| API latency | Temps de réponse Supabase | > 2s |
| Cache hit rate | % requêtes servies par le store | < 80% |
| Error rate | % d'échecs API | > 5% |
| Payload size | Taille des réponses | > 100KB |

---

## Résumé

| Aspect | Implémentation |
|--------|----------------|
| Cache layer | Zustand stores |
| Stale time | Session-based (Infinity) |
| Invalidation | Optimistic updates après mutations |
| Pagination | Non requise (volume faible) |
| Offline | IndexedDB (mode invité) |
| Deduplication | Map de requêtes en cours |
| Cancellation | AbortController |
| Throttling | Sur les saves fréquents |

---

*Document généré dans le cadre du Frontend System Design*
