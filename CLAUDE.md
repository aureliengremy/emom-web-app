# EMOM Web App - Instructions Claude

## RÈGLES IMPORTANTES

1. **Commence par réfléchir au problème**, lis le code pour repérer les fichiers pertinents, et écris un plan dans `task/todo.md`.

2. **Le plan doit contenir une liste de tâches** que tu pourras cocher au fur et à mesure que tu les complètes.

3. **Avant de commencer à travailler**, vérifie avec moi et je validerai le plan.

4. **Ensuite, commence à travailler** sur les tâches, en les marquant comme complètes au fur et à mesure.

5. **À chaque étape**, donne-moi simplement une explication générale des changements que tu fais.

6. **Rends chaque tâche et chaque changement de code aussi simples que possible.** Nous voulons éviter tout changement massif ou complexe. Chaque modification doit impacter le moins de code possible. Tout tourne autour de la simplicité.

7. **Enfin, ajoute une section de revue** dans le fichier `task/todo.md` avec un résumé des changements que tu as effectués et toute autre information pertinente.

8. **NE SOIS PAS PARESSEUX. JAMAIS.** S'il y a un bug, trouve la cause profonde et règle-le. Pas de fixes temporaires. Tu es un développeur, ne sois jamais paresseux.

9. **SIMPLICITÉ ABSOLUE.** Fais que toutes les corrections et changements de code soient aussi simples que possible. Ils ne doivent impacter que le code nécessaire, lié à la tâche, et rien d'autre. L'impact doit être aussi faible que possible. Ton objectif est de ne pas introduire de bugs.

---

## Description du projet

Application web mobile-first pour entraînements EMOM (Every Minute On the Minute). L'app permet de :
- Créer et gérer des exercices personnalisés
- Configurer des séances EMOM avec durées variables (4, 6, 8, 10, 12, 14 minutes)
- Timer avec compte à rebours, pause et sons
- Historique des séances avec statistiques
- Authentification via Supabase (email/password + OAuth prévu)

## Stack technique

- **Framework** : Next.js 14+ (App Router)
- **Langage** : TypeScript
- **UI** : Tailwind CSS + shadcn/ui
- **State** : Zustand
- **DB locale** : IndexedDB (Dexie.js)
- **DB cloud** : Supabase (PostgreSQL)
- **Auth** : Supabase Auth
- **Charts** : Recharts
- **Déploiement** : Vercel

## Structure du projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── auth/               # Pages d'authentification
│   ├── exercises/          # Liste et détail des exercices
│   ├── history/            # Historique des séances
│   ├── settings/           # Paramètres utilisateur
│   └── workout/            # Timer et fin de séance
├── components/             # Composants React
│   ├── exercises/          # Composants exercices
│   ├── layout/             # Container, Header, Main
│   ├── session/            # Configuration de séance
│   ├── timer/              # Timer circle
│   └── ui/                 # shadcn/ui components
├── data/                   # Tables EMOM et presets
├── hooks/                  # Custom hooks (useSound)
├── lib/                    # Utilitaires
│   ├── db.ts               # IndexedDB avec Dexie
│   └── supabase/           # Client et data-service Supabase
├── stores/                 # Zustand stores
│   ├── auth-store.ts       # Authentification
│   ├── exercise-store.ts   # Exercices
│   ├── session-store.ts    # Session builder
│   ├── settings-store.ts   # Paramètres
│   └── workout-store.ts    # Workout en cours + historique
└── types/                  # Types TypeScript
```

## Conventions de code

- Composants en français dans les commentaires
- Noms de variables/fonctions en anglais (camelCase)
- Fichiers en kebab-case
- Utiliser les types définis dans `src/types/index.ts`
- Préférer `useMemo` pour les filtres de listes (éviter boucles infinies Zustand)

## Fonctionnalités clés

### Timer EMOM
- Countdown 10s avant le début
- Timer 60s par minute, sens horaire
- Pause manuelle possible
- Sons à 3s de la fin, fin de minute, fin de set
- Pause automatique entre les sets

### Authentification
- Mode invité (pas de sauvegarde)
- Email/mot de passe
- OAuth Google/Apple (à configurer)

### Stockage
- Utilisateur connecté : Supabase
- Mode invité : pas de stockage
- Hybride possible (IndexedDB comme fallback)

## Variables d'environnement

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

## Commandes

```bash
npm run dev      # Développement
npm run build    # Build production
npm run lint     # Linter
```

## Todo list

Voir `task/todo.md` pour les tâches en cours.

---

## Frontend Architect

Ce projet utilise l'agent Frontend Architect pour le suivi de l'architecture frontend.

### Agent
- `.claude/agents/frontend-architect/AGENT.md`

### Commandes disponibles
- `/audit` — Analyse architecturale du projet
- `/scaffold` — Génère une structure de projet
- `/checklist` — Gère la checklist de suivi

### Skills
- `.claude/skills/data-layer/SKILL.md` — State, fetching, mutations
- `.claude/skills/performance/SKILL.md` — Performance, rendering
- `.claude/skills/production-readiness/SKILL.md` — Security, a11y, CI/CD, SEO

### Suivi
- Checklist : `frontend-system-design/CHECKLIST.md`
- Rapports : `frontend-system-design/rapports/`