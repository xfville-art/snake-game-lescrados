# ⛽ CarbuFuel PWA

Application web progressive de consultation des prix des carburants en France.

## Fichiers

```
carbufuel/
├── index.html      ← Application complète (HTML + CSS + JS) — v5 corrigée
├── manifest.json   ← Manifeste PWA (installabilité)
├── sw.js           ← Service Worker v5 (cache offline + stratégies réseau)
├── icon-192.png    ← Icône PWA 192×192 ✅
├── icon-512.png    ← Icône PWA 512×512 ✅
└── README.md
```

## Corrections v5

- ✅ **Bug API corrigé** : parsing des prix supportant les deux formats de l'API v2.1
  (champs plats `prix_sp95` ET tableau `prix[]` avec `{nom, valeur}`)
- ✅ **Icônes PWA générées** (icon-192.png, icon-512.png) — l'installation mobile fonctionne
- ✅ **sw.js mis à jour** (version v5, assets alignés avec le nouveau index.html)
- ✅ **Rayon réglable** 2–50 km avec slider
- ✅ **Filtre par carburant** (SP95, SP98, E10, Gazole, E85, GPLc)
- ✅ **Tri** par distance / prix / nom
- ✅ **Toutes les puces prix** affichées par station
- ✅ **Lien Google Maps** par station
- ✅ **Stats locales** (min, max, moyenne, médiane)
- ✅ **Bannière hors-ligne**

## Fonctionnalités

- 🔍 Recherche par ville (api-adresse.data.gouv.fr)
- 📍 Géolocalisation GPS
- 🎚️ Rayon réglable 2–50 km
- ⛽ Filtres par type de carburant
- 📊 Tri par distance / prix / nom
- 🟢 Indicateurs prix le + bas / le + haut
- 🗺️ Lien itinéraire Google Maps
- 📦 Cache offline (dernière recherche)
- 📲 Installable iOS et Android (PWA)
- 🔔 Bannière hors-ligne
- 🎬 Générateur de scripts TikTok
- 🎥 Générateur de prompts vidéo IA

## Déploiement

### GitHub Pages (gratuit)
1. Créer un repo GitHub
2. Déposer tous les fichiers
3. Activer Pages dans Settings → Pages → Branch: main

### Netlify (gratuit, drag & drop)
1. Aller sur https://netlify.com
2. Glisser le dossier dans la zone de dépôt

### Test local
```bash
npx serve .
# ou
python3 -m http.server 8080
```

> ⚠️ Le Service Worker nécessite HTTPS ou localhost pour fonctionner.

## Sources de données

- **Prix carburants** : [data.economie.gouv.fr](https://data.economie.gouv.fr)
- **Géocodage** : [api-adresse.data.gouv.fr](https://api-adresse.data.gouv.fr)
