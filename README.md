# ⛽ CarbuFuel PWA

Application web progressive de consultation des prix des carburants en France.

## Fichiers

```
carbufuel_pwa/
├── index.html      ← Application complète (HTML + CSS + JS)
├── manifest.json   ← Manifeste PWA (installabilité)
├── sw.js           ← Service Worker (cache offline + stratégies réseau)
├── icon-192.png    ← Icône PWA 192×192 (à fournir)
├── icon-512.png    ← Icône PWA 512×512 (à fournir)
└── README.md
```

## Fonctionnalités

- 🔍 Recherche par ville avec autocomplétion (api-adresse.data.gouv.fr)
- 📡 Géolocalisation GPS
- 🎚️ Rayon réglable 2 – 50 km
- ⛽ Filtres par type de carburant (SP95, SP98, Gazole, E10, E85, GPLc)
- 📊 Tri par distance / prix / nom
- 🟢 Indicateurs visuel prix le + bas / le + haut
- 🗺️ Lien itinéraire Google Maps
- 📦 Cache offline (dernière recherche)
- 📲 Installable sur iOS et Android
- 🔔 Bannière hors-ligne

## Déploiement

### GitHub Pages (gratuit)
1. Créer un repo GitHub
2. Déposer tous les fichiers
3. Activer Pages dans Settings → Pages → Branch: main

### Netlify (gratuit, drag & drop)
1. Aller sur https://netlify.com
2. Glisser le dossier dans la zone de dépôt

### Serveur local (test)
```bash
npx serve .
# ou
python3 -m http.server 8080
```

> ⚠️ Le Service Worker nécessite HTTPS ou localhost pour fonctionner.

## Sources de données

- **Prix carburants** : [data.economie.gouv.fr](https://data.economie.gouv.fr)
- **Géocodage** : [api-adresse.data.gouv.fr](https://api-adresse.data.gouv.fr)

## Icônes

Générer les icônes avec [realfavicongenerator.net](https://realfavicongenerator.net)  
ou créer un PNG 512×512 et redimensionner.
