# EMOM Web App - Todo List

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

## À faire

### Bugs critiques
- [x] **Les workouts ne s'ajoutent pas en DB** - CORRIGÉ : `generateId()` générait des IDs au format `timestamp-random` mais Supabase attendait des UUIDs. Correction : utilisation de `crypto.randomUUID()`

### Exercices
- [ ] Modification des niveaux des exercices
- [ ] Liste des exercices de base de callisthénie avec niveaux par défaut
- [ ] Classification des exercices (haut du corps, bas du corps, core, full body)

### Timer / Sessions
- [ ] Plus de durées disponibles dans les sets (par exercice)
- [ ] Son pour prévenir des 10 dernières secondes avant le set suivant
- [ ] Lancer le compte à rebours automatiquement lors du repos avant le prochain set
- [ ] Message de validation lors de l'arrêt/annulation d'un workout (en session ou dans historique)

### Fin de workout
- [ ] Bouton pour ajouter commentaire et/ou difficulté par exercice à la fin
- [ ] Animation de fin quand un workout est terminé (confettis)

### Historique
- [ ] Filtre jour/semaine/mois pour le chart de progression

### UX/UI
- [ ] Loading page d'historique (skeleton)
- [ ] Animation de transition entre les pages
- [ ] Toast de confirmation après suppression
- [ ] Pull-to-refresh sur mobile

---

## Rapport de sécurité - Résumé

### Vulnérabilités corrigées
- [x] Open Redirect dans OAuth callback

### Vulnérabilités à corriger (priorité moyenne)
- [ ] Validation des données utilisateur avec Zod
- [ ] Renforcer les exigences de mot de passe (8+ caractères, majuscule, chiffre)
- [ ] Ajouter rate limiting (Supabase + middleware)
- [ ] Contraintes JSONB sur les champs sets/current_emom

### Points sécurisés
- [x] RLS activé sur toutes les tables
- [x] Protection CSRF (cookies SameSite)
- [x] Protection injection SQL (client Supabase)
- [x] .env.local dans .gitignore

---

## Améliorations futures suggérées

### Fonctionnalités
- [ ] Export des données (CSV/JSON)
- [ ] Partage de workout
- [ ] Comparaison de progression entre périodes
- [ ] Objectifs personnalisés

### Technique
- [ ] Tests unitaires (Jest/Vitest)
- [ ] Tests E2E (Playwright)
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
