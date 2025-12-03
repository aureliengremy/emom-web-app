# Spécifications Application EMOM

**Document de référence pour le développement**  
Date de création : Novembre 2025

---

## Concept général

Application de suivi d'entraînement EMOM (Every Minute On the Minute) simple et efficace.

**Philosophie** : Minimaliste, direct au but, gros chiffres lisibles pendant l'effort.

**Principe** : 100% EMOM - tous les sets sont au format EMOM.

---

## 1. Écran d'accueil

### Affichage principal

- **Boutons des exercices** : Affichage de tous les exercices (de base + customs)
  - Exercices pré-chargés : Pull-ups, Push-ups, Dips, Muscle-ups
  - Exercices personnalisés ajoutés par l'utilisateur
- **Badge niveau actuel** sur chaque exercice (ex: "8 tractions / EMOM 10'")
- **Bouton principal** : "Lancer un entraînement"
- **Accès** : "Mes exercices" (pour le suivi)

### Design

- Mode sombre par défaut (moins fatiguant)
- Interface minimaliste
- Gros boutons tactiles
- Pas de fioritures

---

## 2. Configuration initiale (première utilisation)

### Setup des exercices de base

- Pour chaque exercice : "Quel est ton max actuel ?"
  - Curseur ou input numérique
  - L'app calcule automatiquement l'EMOM recommandé selon les tableaux
- Sauvegarde du profil utilisateur

---

## 3. Gestion des exercices

### Exercices pré-chargés

- Pull-ups (Tractions)
- Push-ups (Pompes)
- Dips
- Muscle-ups

### Ajout d'exercices personnalisés

- **Bouton "+ Ajouter un exercice"**
- Champs à remplir :
  - Nom de l'exercice (ex: "Archer Push-ups")
  - Catégorie optionnelle (Push / Pull / Legs / Core)
  - Max actuel
- L'app propose automatiquement un EMOM adapté basé sur les ratios des tableaux

### Principe

- Chaque exercice (de base ou custom) = même traitement
- Même interface de suivi pour tous

---

## 4. Construction de séance

### Modes disponibles

- **Mode "Session rapide"** : 1 seul EMOM sur 1 exercice
- **Mode "Entraînement complet"** : Construction d'une séance multi-sets

### Construction multi-sets

- **Empiler des sets EMOM** :
  - Sélection exercice → ajouté à la liste
  - Possibilité de répéter le même exercice plusieurs fois
  - Ex: Tractions (set 1) + Tractions (set 2) + Dips (set 1)
- **Définir la pause entre sets** : curseur unique (1, 2, 3 min...)
- Affichage du récap de la séance avant de lancer
- **Bouton "Démarrer"**

### Templates (optionnel)

- Sauvegarde d'entraînements types : "Mon Push Day", "Mon Pull Day"
- Option "Répéter le dernier entraînement"

---

## 5. Pendant l'entraînement

### Écran EMOM actif

#### Affichage

- **En-tête** : "Set 1/3 - Tractions - 10 min"
- **Timer circulaire central** : gros et visible
- **Nombre de reps à faire** : affiché en ÉNORME
- **Compteur de minutes** : Minute 1/10, 2/10, etc.

#### Fonctionnalités

- **Signal sonore + vibration** à chaque début de minute
- **Bouton "✓ Série validée"** après chaque série
- **Bouton "Trop dur"** (visible en permanence)
  - Permet de réduire les reps pour les minutes restantes
  - Ajustement à la volée

#### Auto-enchaînement

- Les minutes s'enchaînent automatiquement dans un set EMOM
- Pas de click nécessaire entre les minutes du même set

---

## 6. Fin de set et transitions

### Fin d'un SET EMOM complet

#### Si autre SET prévu dans la séance

- Écran de transition :
  - "Set 1/3 terminé ✓"
  - **Timer de pause** qui décompte (ex: 2 min)
  - Preview du prochain set
  - **Bouton "Lancer Set 2/3 - Dips"**
  - L'utilisateur clique quand il est prêt (pas d'auto-lancement)
  - Bouton "Skip pause" optionnel

#### Si dernier SET de la séance

- Passage direct à l'écran de fin de séance

---

## 7. Fin de séance

### Écran récapitulatif

- "Séance terminée 💪"
- **Récap global** :
  - Nombre de sets effectués
  - Temps total
  - Volume total de reps
  - Liste des exercices travaillés

### Notes de fin de séance

- **Note rapide** : Émojis prédéfinis
  - 💪 Facile
  - 😐 Moyen
  - 🥵 Dur
- **Zone de texte libre** (optionnelle) :
  - Ressenti général
  - Commentaires personnalisés
  - Qualité du sommeil, nutrition, forme du jour, etc.

### Sauvegarde

- Sauvegarde automatique de la séance avec toutes les données

---

## 8. Section "Mes exercices" - Suivi des performances

### Vue d'ensemble

- **Liste de tous les exercices** (classiques + customs)
- Pour chaque exercice, affichage en aperçu :
  - Nom
  - Max actuel
  - EMOM actuel recommandé
  - Dernière session effectuée (date)
  - Badge ou indicateur visuel
- **Bouton "Voir l'historique"** sur chaque exercice

---

## 9. Historique détaillé par exercice

### Graphique d'évolution

- **Graphique du max** au fil du temps
- Visualisation de la progression

### Calendrier d'activité

- Vue calendrier avec pastilles vertes les jours travaillés
- Streak (jours consécutifs)

### Liste des sessions

Pour chaque session :

- Date
- Nombre de sets effectués
- Durée totale
- Volume de reps
- Note donnée (💪 😐 🥵)
- Notes texte si renseignées

### Statistiques

- **Total de reps** sur cet exercice (all time)
- **Nombre de sessions** réalisées
- **Streak** actuel
- **Progression** depuis X semaines
- **Objectif suivant** clairement affiché  
  Ex: "Plus que 2 tractions pour passer au niveau suivant!"

### Action disponible

- **Bouton "Tester mon nouveau max"**
  - Lance un mode test pour réévaluer le max
  - Recalcule automatiquement l'EMOM recommandé

---

## 10. Fonctionnalités supplémentaires

### Notifications

- Rappels motivants : "T'as pas fait ton EMOM cette semaine!"
- Notifications configurables

### Mode test de max

- Protocole de test dédié pour évaluer le maximum
- Mise à jour automatique du profil après validation

### Timer

- Chrono auto qui démarre au lancement de la séance
- Signaux sonores et vibrations configurables

---

## 11. Tableaux de référence EMOM

### Référence des progressions (intégrés dans l'app)

Les tableaux suivants servent de base au calcul automatique des EMOM recommandés :

#### Tractions (Pull-ups)

| Max | EMOM 10' |
|-----|----------|
| 0 à 5 | 2 reps |
| 5 à 10 | 3 reps |
| 10 à 15 | 4 reps |
| 15 à 20 | 5 reps |
| 20 à 25 | 6 reps |
| 25 à 30 | 8 reps |
| 30 à 35 | 10 reps |
| 35 à 40 | 10 reps lestées à 5kg |
| 40 à 45 | 10 reps lestées à 10kg |
| 45 à 50 | 10 reps lestées à 15kg |

#### Dips

| Max | EMOM 10' |
|-----|----------|
| 0 à 10 | 4 reps |
| 10 à 20 | 6 reps |
| 20 à 30 | 8 reps |
| 30 à 40 | 10 reps |
| 40 à 50 | 12 reps |
| 50 à 60 | 14 reps |
| 60 à 70 | 16 reps |
| 70+ | 10 reps lestés de 10kg à ∞ kg |

#### Push-ups (Pompes)

Format débutant - intermédiaire :

| Max | EMOM 10' |
|-----|----------|
| 0 à 20 | 5 reps |
| 20 à 40 | 8 reps |
| 40 à 60 | 12 reps |
| 60+ | passage au format tests de volume |

#### Muscle-ups

| Max | EMOM 10' |
|-----|----------|
| 0 à 3 | 1 rep |
| 3 à 6 | 2 reps |
| 6 à 8 | 3 reps |
| 8 à 10 | 4 reps |
| 10 à 12 | 5 reps |

---

## 12. Principes de design

### Interface

- **Minimaliste** : uniquement l'essentiel
- **Gros chiffres** : lisibles pendant l'effort
- **Mode sombre** par défaut
- **Contraste élevé** pour la lisibilité
- **Boutons tactiles** larges et accessibles

### UX

- **Pas de friction** : minimum de clics pour lancer un workout
- **Feedback immédiat** : son, vibration, visuel
- **Logique claire** : flow intuitif
- **Pas de surprise** : l'utilisateur garde le contrôle (validation manuelle entre sets)

### Performance

- **Légèreté** : app rapide et réactive
- **Offline first** : fonctionne sans connexion
- **Sauvegarde auto** : aucune perte de données

---

## 13. Synthèse du flow utilisateur

```
ÉCRAN D'ACCUEIL
    ↓
CONSTRUCTION SÉANCE (sélection exercices + pauses)
    ↓
LANCEMENT
    ↓
SET 1 EMOM (minutes auto-enchaînées)
    ↓ (fin du set)
PAUSE + PREVIEW
    ↓ (click manuel)
SET 2 EMOM (minutes auto-enchaînées)
    ↓ (fin du set)
PAUSE + PREVIEW
    ↓ (click manuel)
SET 3 EMOM (minutes auto-enchaînées)
    ↓ (fin de séance)
NOTES + RÉCAP
    ↓
SAUVEGARDE AUTO
    ↓
RETOUR ACCUEIL ou HISTORIQUE
```

---

## Notes finales

**Philosophie de l'app** : Simple, efficace, sans distraction. L'objectif est de faciliter le suivi EMOM et la progression, pas de gamifier à outrance ou de noyer l'utilisateur sous les stats.

**Évolutivité** : L'architecture permet d'ajouter facilement de nouveaux exercices, de nouvelles variantes EMOM, ou des fonctionnalités de partage si nécessaire.

**Public cible** : Pratiquants de calisthenics, CrossFit, musculation au poids du corps, tous niveaux.

---

**Fin du document de spécifications**
