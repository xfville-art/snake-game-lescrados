# ⛽ CarbuFuel

PWA de recherche de prix carburants en temps réel, déployable sur GitHub Pages.

## Fonctionnalités

- Recherche par **ville ou code postal** (API adresse.data.gouv.fr)
- **Géolocalisation GPS** avec gestion d'erreurs complète
- **Rayon ajustable** de 2 à 50 km
- Affichage des **prix par type de carburant** (Gazole, SP95, E10, SP98, E85, GPL)
- **Filtre carburant** avec coloration relative (vert = moins cher, rouge = plus cher)
- **Tri par distance ou par prix**
- **Logo des enseignes** (Clearbit avec fallback badge coloré)
- Lien **Ouvrir dans Maps** pour chaque station
- **PWA installable** : offline partiel, icônes, raccourci GPS

## Architecture

```
CarbuFuel/
├── index.html     # Application complète (HTML + CSS + JS)
├── sw.js          # Service Worker (cache network-first)
├── manifest.json  # PWA manifest
├── icon-192.png   # Icône PWA
└── icon-512.png   # Icône PWA splash
```

> `app.js`, `style.css` et `stations.json` étaient des fichiers orphelins
> d'un ancien prototype — supprimés dans cette version.

## APIs utilisées

| API | Usage | Cache SW |
|-----|-------|----------|
| `api.prix-carburants.2aaz.fr` | Stations + prix temps réel | Non |
| `api-adresse.data.gouv.fr` | Géocodage ville/CP | Non |
| `logo.clearbit.com` | Logos enseignes | Non |

### Structure réponse 2aaz (champs utilisés)

```json
{
  "Brand": { "name": "Total" },
  "Coordinates": { "latitude": 47.9, "longitude": 1.9 },
  "Address": { "street_line": "12 rue de la paix", "city_line": "45000 Orléans" },
  "Fuels": [
    {
      "shortName": "Gazole",
      "available": true,
      "Price": { "amount": 1.759, "currency": "EUR", "last_update": "2026-03-25T08:00:00Z" }
    }
  ]
}
```

## Déploiement GitHub Pages

```bash
git add .
git commit -m "feat: CarbuFuel v2"
git push origin main
```

Activer Pages sur la branche `main`, répertoire `/` (root).

## Corrections et améliorations v2

| Problème | Correction |
|----------|------------|
| Prix jamais affichés | Lecture de `Fuels[].Price.amount` dans `render()` |
| Filtre carburant inopérant | `activeFuel` utilisé dans `render()` + filtrage réel |
| `gps()` sans callback erreur | 3 codes gérés : permission, indisponible, timeout |
| Logo onerror inline cassé | `data-attributes` + `imgFallback()` externe propre |
| Pas de protection XSS | `escHtml()` sur toutes les données API |
| Tri par prix si "Tous" actif | Bouton désactivé automatiquement |
| `app.js` / `stations.json` morts | Supprimés |
| `style.css` non linkée | Supprimée (styles dans `index.html`) |
| SW sans `clients.claim()` | Ajouté dans `activate` |
| APIs externes cachées par le SW | Exclusion explicite dans le fetch handler |
| Raccourci `?action=gps` ignoré | Géré via `URLSearchParams` au démarrage |
| Coloration prix absente | Vert/rouge relatif selon min/max du rayon |
| Pas de lien Maps | Lien Google Maps sur chaque station |
