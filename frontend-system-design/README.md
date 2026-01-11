# Frontend System Design — Guide de Suivi

Ce dossier contient le système de suivi pour l'architecture frontend de votre projet.

## 📁 Structure

```
frontend-system-design/
├── CHECKLIST.md          # ← Checklist centrale de suivi
├── README.md             # ← Ce fichier
└── rapports/             # ← Rapports générés automatiquement
    ├── scaffold-YYYY-MM-DD.md
    ├── audit-YYYY-MM-DD.md
    └── ...
```

## 🎯 Objectif

Ce système permet de :

1. **Suivre l'avancement** de l'implémentation des bonnes pratiques
2. **Documenter les décisions** architecturales via les rapports
3. **Tracer l'historique** des actions et validations
4. **Coordonner l'équipe** autour d'une checklist commune

## 📋 La Checklist

Le fichier `CHECKLIST.md` est le cœur du système. Il contient :

### Structure

| Section | Contenu |
|---------|---------|
| **1. Data Modelling** | Normalisation, State, Persistance |
| **2. Data Fetching** | Caching, Pagination, Optimisation |
| **3. Data Mutation** | Forms, Real-time, Optimistic updates |
| **4. Performance** | Build, Runtime, Rendering |
| **5. Production Readiness** | Security, A11y, CI/CD, SEO |

### Priorités

| Icône | Phase | Quand |
|-------|-------|-------|
| 🔴 | MVP | Avant le premier lancement |
| 🟠 | V1 | Première release complète |
| 🟡 | V2 | Améliorations post-launch |
| 🟢 | Scale | Optimisations avancées |

### Format des éléments

```markdown
| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 1.2.1 | State management configuré | 🔴 MVP | ✅ | 2025-01-11 | scaffold-2025-01-11.md |
```

- **Réf.** : Identifiant unique (Section.Sous-section.Item)
- **Status** : ⬜ À faire / ✅ Complété / 🔄 En cours
- **Date** : Date de validation
- **Rapport** : Lien vers le rapport associé

## 📊 Les Rapports

### Types de rapports

| Type | Fichier | Génération |
|------|---------|------------|
| Scaffold | `scaffold-YYYY-MM-DD.md` | `/scaffold` |
| Audit | `audit-YYYY-MM-DD.md` | `/audit` |
| Checklist Update | `checklist-update-YYYY-MM-DD.md` | `/checklist update` |
| Skill | `skill-[nom]-YYYY-MM-DD.md` | Consultation skill |
| Custom | `report-[nom]-YYYY-MM-DD.md` | `/report` |

### Contenu d'un rapport

Chaque rapport contient :

1. **Contexte** — Commande exécutée, arguments
2. **Actions réalisées** — Ce qui a été fait
3. **Résultats** — Observations, métriques
4. **Impact checklist** — Éléments mis à jour
5. **Prochaines étapes** — Recommandations

### Historique

L'historique des rapports est maintenu dans `CHECKLIST.md` :

```markdown
## Historique des rapports

| Date | Type | Commande | Fichier | Éléments impactés |
|------|------|----------|---------|-------------------|
| 2025-01-11 | Scaffold | /scaffold my-app | scaffold-2025-01-11.md | 1.2.1, 4.2.1 |
```

## 🚀 Utilisation

### Démarrer un nouveau projet

```bash
# 1. Créer le projet avec scaffold
/scaffold mon-projet

# 2. La checklist est automatiquement initialisée
# 3. Un rapport de scaffold est généré
```

### Suivre l'avancement

```bash
# Voir la checklist
/checklist show

# Voir la progression
/checklist progress

# Marquer des éléments comme complétés
/checklist update --mark "1.2.1,2.1.1"
```

### Auditer le projet

```bash
# Audit complet
/audit .

# Audit focalisé
/audit . --focus security
```

### Documenter une décision

```bash
# Générer un rapport personnalisé
/report auth-implementation --type decision
```

## 🔗 Liens avec les Skills

Chaque élément de la checklist est lié à un skill :

| Section | Skill |
|---------|-------|
| 1, 2, 3 | `.claude/skills/data-layer/SKILL.md` |
| 4 | `.claude/skills/performance/SKILL.md` |
| 5 | `.claude/skills/production-readiness/SKILL.md` |

Les skills contiennent :
- Patterns et code d'implémentation
- Exemples concrets
- Décisions architecturales
- Références aux éléments de checklist

## 📝 Bonnes pratiques

### Mise à jour régulière

- ✅ Mettre à jour la checklist après chaque implémentation significative
- ✅ Générer un rapport pour les décisions importantes
- ✅ Faire un audit avant chaque release

### Collaboration

- 📌 Versionner ce dossier avec Git
- 📌 Référencer les rapports dans les PR
- 📌 Revoir la checklist en équipe régulièrement

### Documentation

- 📚 Les rapports forment une documentation vivante
- 📚 Utiliser les notes dans la checklist pour le contexte
- 📚 Lier les issues/tickets aux références checklist

## 🛠 Commandes rapides

```bash
# Progression rapide
/checklist progress

# Prochaines priorités MVP
/checklist show --phase mvp --focus incomplete

# Audit sécurité
/audit . --focus security

# Exporter pour Notion
/checklist export --format notion
```

---

*Frontend System Design — Système de suivi*  
*Agent : `.claude/agents/frontend-architect/`*  
*Skills : `.claude/skills/`*
