# Observability Strategy

> Documentation de la stratégie d'observabilité pour EMOM Web App

## 1. Error Tracking

### Sentry ✅ Configuré

**Installation effectuée** :
```bash
npm install @sentry/nextjs
```

**Fichiers créés** :
- `sentry.client.config.ts` - Configuration client
- `sentry.server.config.ts` - Configuration serveur
- `sentry.edge.config.ts` - Configuration edge/middleware

**Variables d'environnement requises** :
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=emom-web-app
```

**Fonctionnalités activées** :
- ✅ Error boundaries automatiques (`error.tsx`)
- ✅ Source maps en production
- ✅ Session replay (échantillonnage 10%)
- ✅ Performance tracing (échantillonnage 10%)
- ✅ CSP mis à jour pour autoriser Sentry

### Pour activer

1. Créer un projet sur [sentry.io](https://sentry.io)
2. Ajouter les variables d'environnement
3. Déployer

---

## 2. Analytics

### Vercel Analytics ✅ Configuré

**Installation effectuée** :
```bash
npm install @vercel/analytics
```

**Intégration** :
```typescript
// src/components/providers.tsx
import { Analytics } from "@vercel/analytics/react";

// Dans le return:
<Analytics />
```

**Fonctionnalités** :
- ✅ Page views automatiques
- ✅ Web Vitals intégrés
- ✅ Zéro configuration requise sur Vercel

### Pour activer

1. Déployer sur Vercel
2. Activer Analytics dans le dashboard Vercel
3. Les données apparaîtront automatiquement

---

## 3. Logging

### Stratégie actuelle

| Contexte | Méthode | Destination |
|----------|---------|-------------|
| Erreurs API | console.error | Browser console |
| Debug dev | console.log | Browser console |
| Web Vitals | web-vitals | Console (dev) |

### Évolution V2

Pour la production, considérer :
- **Axiom** ou **Logtail** pour le logging structuré
- **Datadog** pour l'observabilité complète
- Export des logs vers un service cloud

---

## 4. Monitoring des performances

### Implémenté

- ✅ Core Web Vitals via `web-vitals` library
- ✅ Mesure CLS, LCP, INP, FCP, TTFB
- ✅ Logging en développement

### À configurer

- ⬜ Export vers analytics en production
- ⬜ Alertes sur dégradation des métriques
- ⬜ Dashboard de suivi

---

## 5. Checklist pré-production

| Item | Priorité | Status |
|------|----------|--------|
| Configurer Sentry | 🔴 MVP | ✅ Code prêt |
| Ajouter Vercel Analytics | 🟠 V1 | ✅ Code prêt |
| Exporter Web Vitals vers analytics | 🟡 V2 | ✅ web-vitals.tsx |
| Logging structuré | 🟡 V2 | ✅ console + Sentry |

### Variables d'environnement à configurer

```env
# Sentry (créer un projet sur sentry.io)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=emom-web-app

# Optionnel: Auth token pour source maps
SENTRY_AUTH_TOKEN=xxx
```

---

*Dernière mise à jour : 2026-01-17*
