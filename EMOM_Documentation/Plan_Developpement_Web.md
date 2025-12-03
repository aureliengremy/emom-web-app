# Plan de Développement - EMOM Web App

**Objectif** : Version web mobile-first, mise en ligne rapide
**Stack** : Next.js 14 + TypeScript + shadcn/ui + Tailwind CSS
**Date** : Décembre 2025

---

## Phase 1 : MVP (Minimum Viable Product)

> Objectif : Application fonctionnelle et déployable

### 1.1 Setup initial

- [ ] Initialisation Next.js 14 (App Router)
- [ ] Configuration TypeScript
- [ ] Installation et configuration Tailwind CSS
- [ ] Installation shadcn/ui + thème sombre par défaut
- [ ] Structure des dossiers
- [ ] Configuration PWA (Serwist)
- [ ] Déploiement initial sur Vercel

### 1.2 Fonctionnalités core MVP

| Fonctionnalité | Priorité | Description |
|----------------|----------|-------------|
| Timer EMOM | P0 | Timer fonctionnel avec signaux sonores |
| Session rapide | P0 | Lancer un EMOM sur 1 exercice |
| 4 exercices de base | P0 | Pull-ups, Push-ups, Dips, Muscle-ups |
| Stockage local | P0 | Sauvegarde des sessions (IndexedDB) |
| Mode sombre | P0 | Interface sombre par défaut |
| Responsive mobile | P0 | Design mobile-first |

### 1.3 Écrans MVP

```
/                    → Écran d'accueil (liste exercices + lancer)
/workout             → Timer EMOM actif
/workout/complete    → Fin de séance + notes
```

---

## Phase 2 : Fonctionnalités essentielles

> Objectif : Expérience utilisateur complète

### 2.1 Gestion des exercices

- [ ] Configuration initiale (premier lancement)
- [ ] Saisie du max pour chaque exercice
- [ ] Calcul automatique EMOM recommandé (tableaux de référence)
- [ ] Ajout d'exercices personnalisés
- [ ] Édition/suppression d'exercices

### 2.2 Construction de séance avancée

- [ ] Mode multi-sets (empiler plusieurs EMOM)
- [ ] Configuration pause entre sets
- [ ] Récap avant lancement
- [ ] Transitions entre sets avec timer de pause

### 2.3 Suivi et historique

- [ ] Section "Mes exercices"
- [ ] Historique des sessions par exercice
- [ ] Statistiques basiques (total reps, nombre sessions)

### 2.4 Écrans Phase 2

```
/setup               → Configuration initiale
/exercises           → Liste "Mes exercices"
/exercises/[id]      → Détail + historique d'un exercice
/workout/build       → Construction séance multi-sets
```

---

## Phase 3 : Expérience enrichie

> Objectif : Fidélisation et engagement

### 3.1 Statistiques avancées

- [ ] Graphique d'évolution du max
- [ ] Calendrier d'activité (pastilles vertes)
- [ ] Streak (jours consécutifs)
- [ ] Objectif suivant affiché

### 3.2 Mode test de max

- [ ] Protocole de test dédié
- [ ] Mise à jour automatique du profil

### 3.3 Templates de séance

- [ ] Sauvegarde de séances types
- [ ] "Répéter le dernier entraînement"

### 3.4 Notifications

- [ ] Rappels configurables
- [ ] Messages motivants

---

## Architecture technique

### Structure des dossiers

```
src/
├── app/                    # App Router Next.js
│   ├── layout.tsx          # Layout principal + providers
│   ├── page.tsx            # Accueil
│   ├── setup/
│   │   └── page.tsx        # Configuration initiale
│   ├── exercises/
│   │   ├── page.tsx        # Liste exercices
│   │   └── [id]/
│   │       └── page.tsx    # Détail exercice
│   ├── workout/
│   │   ├── page.tsx        # Timer EMOM actif
│   │   ├── build/
│   │   │   └── page.tsx    # Construction séance
│   │   └── complete/
│   │       └── page.tsx    # Fin de séance
│   └── globals.css
│
├── components/
│   ├── ui/                 # Composants shadcn/ui
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx
│   │   └── Container.tsx
│   ├── exercises/
│   │   ├── ExerciseCard.tsx
│   │   ├── ExerciseList.tsx
│   │   └── ExerciseForm.tsx
│   ├── workout/
│   │   ├── Timer.tsx
│   │   ├── TimerCircle.tsx
│   │   ├── RepCounter.tsx
│   │   ├── SetIndicator.tsx
│   │   └── PauseScreen.tsx
│   └── session/
│       ├── SessionBuilder.tsx
│       ├── SessionRecap.tsx
│       └── SessionNotes.tsx
│
├── lib/
│   ├── utils.ts            # Utilitaires (cn, etc.)
│   ├── db.ts               # Configuration Dexie.js
│   ├── emom-tables.ts      # Tableaux de progression
│   └── sounds.ts           # Gestion sons
│
├── stores/
│   ├── workout-store.ts    # État de l'entraînement
│   ├── exercises-store.ts  # État des exercices
│   └── settings-store.ts   # Paramètres utilisateur
│
├── hooks/
│   ├── useTimer.ts         # Hook timer EMOM
│   ├── useSound.ts         # Hook sons/vibrations
│   └── useWakeLock.ts      # Garder écran allumé
│
└── types/
    └── index.ts            # Types TypeScript
```

### Modèles de données

```typescript
// Types principaux

interface Exercise {
  id: string;
  name: string;
  category: 'push' | 'pull' | 'legs' | 'core' | 'custom';
  currentMax: number;
  recommendedReps: number;
  isCustom: boolean;
  createdAt: Date;
}

interface WorkoutSet {
  id: string;
  exerciseId: string;
  duration: number;        // minutes (ex: 10)
  targetReps: number;
  completedMinutes: number;
  adjustedReps?: number;   // si "trop dur" utilisé
}

interface WorkoutSession {
  id: string;
  date: Date;
  sets: WorkoutSet[];
  pauseDuration: number;   // secondes entre sets
  totalDuration: number;   // secondes
  totalReps: number;
  rating: 'easy' | 'medium' | 'hard' | null;
  notes: string;
}

interface UserSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  theme: 'dark' | 'light';
  hasCompletedSetup: boolean;
}
```

### Composants shadcn/ui à installer

```bash
# Phase 1 - MVP
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add toast
npx shadcn@latest add progress

# Phase 2
npx shadcn@latest add dialog
npx shadcn@latest add drawer
npx shadcn@latest add input
npx shadcn@latest add slider
npx shadcn@latest add select
npx shadcn@latest add tabs
npx shadcn@latest add sheet
npx shadcn@latest add switch
npx shadcn@latest add textarea

# Phase 3
npx shadcn@latest add calendar
npx shadcn@latest add chart
```

---

## Déploiement

### Stratégie

| Environnement | Plateforme | URL |
|---------------|------------|-----|
| Production | Vercel | emom-app.vercel.app (ou domaine custom) |
| Preview | Vercel | Auto-généré par PR |

### Configuration Vercel

- Framework preset : Next.js
- Node.js version : 20.x
- Build command : `npm run build`
- Output directory : `.next`

### PWA

- Manifest.json configuré
- Service Worker (Serwist)
- Icônes app (192x192, 512x512)
- Splash screens
- Mode standalone

---

## Livrables par phase

### Phase 1 - MVP
- [ ] App déployée sur Vercel
- [ ] Timer EMOM fonctionnel
- [ ] 4 exercices de base utilisables
- [ ] Stockage local des sessions
- [ ] PWA installable

### Phase 2 - Essentielles
- [ ] Configuration initiale complète
- [ ] Exercices personnalisés
- [ ] Séances multi-sets
- [ ] Historique basique

### Phase 3 - Enrichie
- [ ] Statistiques et graphiques
- [ ] Calendrier d'activité
- [ ] Templates de séance
- [ ] Notifications

---

## Prochaines étapes immédiates

1. **Initialiser le projet Next.js**
2. **Configurer shadcn/ui avec thème sombre**
3. **Créer le layout mobile-first**
4. **Développer le composant Timer**
5. **Implémenter la session rapide**
6. **Déployer sur Vercel**

---

*Plan créé le 1er décembre 2025*
