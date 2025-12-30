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
- [ ] Liste des exercices de base de callisthénie avec niveaux par défaut (en prenant en compte leurs variantes qui on des diffulcultés différentes). Dans l'idéal, quand je selectionne push up par exemple, je peux choisir le niveau facile, moyen ou difficile dans un select. Cela correspondra à la liste donnée dans le fichier 'exercices.md'.
- [ ] Classification des exercices (haut du corps, bas du corps, core, full body, pull, push, legs...) et donc un filtre pour les exercices par type et difficulté.

### Timer / Sessions
- [x] Plus de durées disponibles dans les sets (2, 3, 4, 5, 6, 8, 10, 12, 14, 15, 16, 18, 20 min)
- [x] Son pour prévenir des 10 dernières secondes avant le set suivant
- [x] Lancer le compte à rebours automatiquement lors du repos avant le prochain set
- [x] Message de validation lors de l'arrêt/annulation d'un workout (en session)
- [x] Ajout d'un bouton "Créer sessions" à côté de celui "Session rapide"
- [x] Ajouter un menu "Mes sessions" qui permettrait d'avoir les sessions créées
- [x] Revoir "Session rapide" car on ne peut pas ajouter les exercices ajoutés et ça ne semble pas très utile finalement (donc peut-être revoir si la section "Lancement rapide" est toujours utile)
  - [x] Section "Lancement rapide" supprimée
  - [x] Dialog "Créer sessions" transformé en constructeur complet avec liste d'exercices
- [x] Dans la création de session, permettre la modification des séries par exercice (reps, durée, poids)
- [x] Dans la création de session, réduire la hauteur de la liste d'exercices pour toujours avoir accès au bouton sauvegarder
- [x] Dans "Mes sessions", ajouter la possibilité de modifier les sessions existantes

### Fin de workout
- [ ] Bouton pour ajouter commentaire et/ou difficulté par exercice à la fin
- [x] Animation de fin quand un workout est terminé (confettis)

### Historique
- [x] Filtre jour/semaine/mois pour le chart de progression

### UX/UI
- [x] Loading page d'historique (skeleton)
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
