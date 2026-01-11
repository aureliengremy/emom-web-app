# Frontend System Design — Checklist de Suivi

> **Projet** : EMOM Web App
> **Créé le** : 2026-01-11
> **Dernière mise à jour** : 2026-01-11
> **Phase actuelle** : MVP

---

## Progression globale

```
[███████░░░░░░░░░░░░░] 35% (22/62 éléments)
```

| Section | Progression | Status |
|---------|-------------|--------|
| 1. Data Modelling | 7/12 | 🟡 |
| 2. Data Fetching | 1/10 | 🔴 |
| 3. Data Mutation | 0/8 | 🔴 |
| 4. Performance | 6/14 | 🟡 |
| 5. Production Readiness | 8/18 | 🟡 |

---

## 1. Data Modelling

> 📚 Skill : `.claude/skills/data-layer/SKILL.md`

### 1.1 Normalisation

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 1.1.1 | Structure de données définie (nested/flat) | 🔴 MVP | ✅ | 2026-01-11 | audit-2026-01-11.md |
| 1.1.2 | Types TypeScript pour les entités | 🔴 MVP | ✅ | 2026-01-11 | audit-2026-01-11.md |

### 1.2 State Management

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 1.2.1 | Store principal configuré | 🔴 MVP | ✅ | 2026-01-11 | audit-2026-01-11.md |
| 1.2.2 | DevTools activés (dev) | 🟠 V1 | ✅ | 2026-01-11 | audit-2026-01-11.md |
| 1.2.3 | Selectors implémentés | 🟠 V1 | ✅ | 2026-01-11 | audit-2026-01-11.md |
| 1.2.4 | Memoization en place | 🟡 V2 | ⬜ | - | - |

### 1.3 Outils / Libraries

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 1.3.1 | Choix state management (Zustand/Redux/etc.) | 🔴 MVP | ✅ | 2026-01-11 | audit-2026-01-11.md |
| 1.3.2 | Configuration middleware (si Redux) | 🟡 V2 | ❌ | 2026-01-11 | N/A (Zustand) |

### 1.4 Persistance

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 1.4.1 | Stratégie de persistance définie | 🟠 V1 | ✅ | 2026-01-11 | audit-2026-01-11.md |
| 1.4.2 | localStorage configuré (si utilisé) | 🟠 V1 | ❌ | 2026-01-11 | N/A (IndexedDB) |
| 1.4.3 | IndexedDB configuré (si utilisé) | 🟡 V2 | ✅ | 2026-01-11 | audit-2026-01-11.md |

### 1.5 Domain Driven Design

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 1.5.1 | Modèle de domaine documenté | 🟡 V2 | ⬜ | - | - |
| 1.5.2 | Bounded contexts identifiés | 🟢 Scale | ⬜ | - | - |

---

## 2. Data Fetching

> 📚 Skill : `.claude/skills/data-layer/SKILL.md`

### 2.1 Caching Frontend

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 2.1.1 | TanStack Query configuré | 🔴 MVP | ⬜ | - | - |
| 2.1.2 | Stale time défini par type de données | 🟠 V1 | ⬜ | - | - |
| 2.1.3 | Stratégie d'invalidation définie | 🟠 V1 | ⬜ | - | - |
| 2.1.4 | Cache persistant (si offline) | 🟢 Scale | ⬜ | - | - |

### 2.2 Pagination

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 2.2.1 | Stratégie de pagination choisie | 🟠 V1 | ⬜ | - | - |
| 2.2.2 | Infinite loading implémenté (si nécessaire) | 🟡 V2 | ⬜ | - | - |

### 2.3 Request Optimisation

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 2.3.1 | Debouncing sur les recherches | 🔴 MVP | ⬜ | - | - |
| 2.3.2 | Request cancellation (AbortController) | 🟠 V1 | ⬜ | - | - |
| 2.3.3 | Deduplication des requêtes | 🟡 V2 | ⬜ | - | - |
| 2.3.4 | Throttling configuré | 🟡 V2 | ⬜ | - | - |

---

## 3. Data Mutation

> 📚 Skill : `.claude/skills/data-layer/SKILL.md`

### 3.1 Forms

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 3.1.1 | React Hook Form configuré | 🔴 MVP | ⬜ | - | - |
| 3.1.2 | Validation Zod en place | 🔴 MVP | ⬜ | - | - |
| 3.1.3 | Messages d'erreur utilisateur | 🔴 MVP | ⬜ | - | - |

### 3.2 Real-time Updates

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 3.2.1 | Stratégie real-time définie (WS/SSE/Polling) | 🟡 V2 | ⬜ | - | - |
| 3.2.2 | Reconnection handling | 🟡 V2 | ⬜ | - | - |

### 3.3 Optimistic Updates

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 3.3.1 | Mutations avec optimistic UI | 🟠 V1 | ⬜ | - | - |
| 3.3.2 | Rollback en cas d'erreur | 🟠 V1 | ⬜ | - | - |
| 3.3.3 | Feedback utilisateur immédiat | 🟠 V1 | ⬜ | - | - |

---

## 4. Performance

> 📚 Skill : `.claude/skills/performance/SKILL.md`

### 4.1 Perceived Performance

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 4.1.1 | Skeleton screens implémentés | 🔴 MVP | ✅ | 2026-01-11 | audit-2026-01-11.md |
| 4.1.2 | Loading indicators cohérents | 🔴 MVP | ✅ | 2026-01-11 | audit-2026-01-11.md |
| 4.1.3 | Suspense boundaries configurés | 🟠 V1 | ⬜ | - | - |

### 4.2 Build Time

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 4.2.1 | Code splitting activé | 🔴 MVP | ✅ | 2026-01-11 | audit-2026-01-11.md |
| 4.2.2 | Bundle size analysé (<200kB gzip) | 🟠 V1 | ✅ | 2026-01-11 | 2.6MB total, chunks OK |
| 4.2.3 | Tree shaking vérifié | 🟠 V1 | ⬜ | - | - |
| 4.2.4 | Imports optimisés (modularize) | 🟡 V2 | ⬜ | - | - |

### 4.3 Rendering Strategies

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 4.3.1 | Stratégie de rendu choisie (SSR/SSG/CSR) | 🔴 MVP | ✅ | 2026-01-11 | audit-2026-01-11.md |
| 4.3.2 | Pages statiques identifiées (SSG) | 🟠 V1 | ⬜ | - | - |
| 4.3.3 | ISR configuré (si applicable) | 🟡 V2 | ⬜ | - | - |
| 4.3.4 | Streaming SSR (si applicable) | 🟢 Scale | ⬜ | - | - |

### 4.4 Runtime

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 4.4.1 | Images optimisées (next/image) | 🔴 MVP | ⬜ | - | - |
| 4.4.2 | Lazy loading des composants lourds | 🟠 V1 | ⬜ | - | - |
| 4.4.3 | Fonts optimisées (preload, swap) | 🟠 V1 | ✅ | 2026-01-11 | audit-2026-01-11.md |
| 4.4.4 | Preload des ressources critiques | 🟡 V2 | ⬜ | - | - |

### 4.5 Métriques

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 4.5.1 | Core Web Vitals mesurés | 🟠 V1 | ⬜ | - | - |
| 4.5.2 | Lighthouse score > 90 | 🟡 V2 | ⬜ | - | - |

---

## 5. Production Readiness

> 📚 Skill : `.claude/skills/production-readiness/SKILL.md`

### 5.1 Accessibility

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 5.1.1 | HTML sémantique | 🔴 MVP | ⬜ | - | - |
| 5.1.2 | Navigation clavier fonctionnelle | 🔴 MVP | ⬜ | - | - |
| 5.1.3 | ARIA labels sur éléments interactifs | 🟠 V1 | ⬜ | - | - |
| 5.1.4 | Contrastes WCAG AA | 🟠 V1 | ⬜ | - | - |
| 5.1.5 | Skip link | 🟡 V2 | ⬜ | - | - |
| 5.1.6 | Tests avec screen reader | 🟢 Scale | ⬜ | - | - |

### 5.2 Internationalisation

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 5.2.1 | i18n configuré (si multi-langue) | 🟡 V2 | ⬜ | - | - |
| 5.2.2 | Fichiers de traduction | 🟡 V2 | ⬜ | - | - |

### 5.3 Observability

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 5.3.1 | Error tracking (Sentry) configuré | 🔴 MVP | ⬜ | - | - |
| 5.3.2 | Analytics en place | 🟠 V1 | ⬜ | - | - |
| 5.3.3 | Logging structuré | 🟡 V2 | ⬜ | - | - |

### 5.4 Infrastructure

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 5.4.1 | CDN configuré | 🟠 V1 | ⬜ | - | - |
| 5.4.2 | HTTP caching (Cache-Control) | 🟠 V1 | ⬜ | - | - |
| 5.4.3 | Compression (gzip/brotli) | 🟠 V1 | ⬜ | - | - |

### 5.5 CI/CD

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 5.5.1 | Linting automatisé (ESLint) | 🔴 MVP | ✅ | 2026-01-11 | audit-2026-01-11.md |
| 5.5.2 | Type checking (tsc) | 🔴 MVP | ✅ | 2026-01-11 | audit-2026-01-11.md |
| 5.5.3 | Tests unitaires | 🟠 V1 | ✅ | 2026-01-11 | audit-2026-01-11.md |
| 5.5.4 | Tests E2E | 🟡 V2 | ✅ | 2026-01-11 | audit-2026-01-11.md |
| 5.5.5 | Deploy preview (PR) | 🟠 V1 | ⬜ | - | - |
| 5.5.6 | Deploy production automatisé | 🟠 V1 | ⬜ | - | - |

### 5.6 Security

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 5.6.1 | Protection XSS | 🔴 MVP | ✅ | 2026-01-11 | audit-2026-01-11.md |
| 5.6.2 | CSP headers configurés | 🟠 V1 | ✅ | 2026-01-11 | audit-2026-01-11.md |
| 5.6.3 | Input sanitization | 🔴 MVP | ⬜ | - | - |
| 5.6.4 | Audit dépendances (npm audit) | 🟠 V1 | ✅ | 2026-01-11 | 0 vulnérabilités |

### 5.7 SEO

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 5.7.1 | Meta tags dynamiques | 🟠 V1 | ⬜ | - | - |
| 5.7.2 | Open Graph tags | 🟠 V1 | ⬜ | - | - |
| 5.7.3 | Sitemap.xml | 🟡 V2 | ⬜ | - | - |
| 5.7.4 | Données structurées (JSON-LD) | 🟡 V2 | ⬜ | - | - |

### 5.8 Error Handling

| Réf. | Élément | Priorité | Status | Date | Rapport |
|------|---------|----------|--------|------|---------|
| 5.8.1 | Error Boundary global | 🔴 MVP | ✅ | 2026-01-11 | audit-2026-01-11.md |
| 5.8.2 | Pages 404/500 personnalisées | 🔴 MVP | ✅ | 2026-01-11 | audit-2026-01-11.md |
| 5.8.3 | Recovery UI (retry, refresh) | 🟠 V1 | ✅ | 2026-01-11 | audit-2026-01-11.md |

---

## Historique des rapports

| Date | Type | Commande | Fichier | Éléments impactés |
|------|------|----------|---------|-------------------|
| 2026-01-11 | Audit | /audit | audit-2026-01-11.md | 1.1.1, 1.1.2, 1.2.1, 1.2.3, 1.3.1, 1.4.1, 1.4.3, 4.2.1, 4.3.1, 4.4.3, 5.5.1-4, 5.6.1 |

<!-- 
Exemple d'entrée :
| 2025-01-11 | Scaffold | /scaffold my-app | scaffold-2025-01-11.md | 1.2.1, 4.2.1, 5.5.1, 5.8.1 |
| 2025-01-12 | Audit | /audit . | audit-2025-01-12.md | 2.1.1, 5.6.1, 5.6.3 |
-->

---

## Légende

### Priorités

| Icône | Phase | Description |
|-------|-------|-------------|
| 🔴 | MVP | Critique — Requis pour le lancement |
| 🟠 | V1 | Important — Première release complète |
| 🟡 | V2 | Recommandé — Améliorations |
| 🟢 | Scale | Avancé — Optimisation à l'échelle |

### Status

| Icône | Signification |
|-------|---------------|
| ⬜ | À faire |
| ✅ | Complété |
| 🔄 | En cours |
| ⏸️ | En pause |
| ❌ | Non applicable |

---

## Notes

_Espace pour notes additionnelles sur le projet_

---

*Checklist générée par Frontend Architect*  
*Documentation : `frontend-system-design/README.md`*  
*Rapports : `frontend-system-design/rapports/`*
