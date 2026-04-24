# RefugeMap

Annuaire géolocalisé des services d'aide aux réfugiés, demandeurs d'asile et migrants en France.

**Mobile-first · Open source · Multilingue · Aucun tracking**

---

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS |
| Carte | MapLibre GL JS + tuiles OpenFreeMap (open source, gratuit) |
| i18n | next-intl — FR, EN, AR (RTL), UK, RU, PS, FA, TI, ES |
| Base de données | PostgreSQL + PostGIS via Supabase |
| ORM | Drizzle ORM |
| État | Zustand (avec persistance offline) |
| Hébergement | Vercel (front) + Supabase (DB) |

---

## Setup rapide

### 1. Prérequis

- Node.js 20+
- Un projet [Supabase](https://supabase.com) avec l'extension PostGIS activée

### 2. Activer PostGIS sur Supabase

Dans le dashboard Supabase → SQL Editor :

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 3. Variables d'environnement

```bash
cp .env.local.example .env.local
# Remplissez DATABASE_URL avec l'URL de connexion Supabase (Transaction pooler, port 6543)
```

### 4. Migrations DB

```bash
npm run db:generate   # génère les fichiers de migration
npm run db:migrate    # applique en base
```

### 5. Lancer en local

```bash
npm run dev
# → http://localhost:3000
```

### 6. Première ingestion de données

```bash
npm run ingest        # récupère OSM + community.yaml → DB
```

---

## Déploiement Vercel

1. Créez un projet sur [vercel.com](https://vercel.com)
2. Liez ce repo GitHub
3. Ajoutez les variables d'env dans Vercel → Settings → Environment Variables :
   - `DATABASE_URL` (même valeur que `.env.local`)
   - `NEXT_PUBLIC_BASE_URL` (ex: `https://refugemap.vercel.app`)
4. Push → déploiement automatique

**Ingestion automatique :** ajoutez `DATABASE_URL` dans les secrets GitHub (Settings → Secrets → Actions). Le cron GitHub Actions tourne chaque nuit à 3h UTC.

---

## Contribuer un service

### Option A — Fichier communautaire (recommandé pour les bénévoles)

Éditez [`public/data/community.yaml`](public/data/community.yaml) et ouvrez une Pull Request. Format :

```yaml
services:
  - name: "Centre d'accueil Mon Association"
    category: housing          # housing | health | food | hygiene | language | legal | material
    lat: 48.8566
    lng: 2.3522
    address: "12 rue de la Paix"
    city: "Paris"
    postalCode: "75001"
    phone: "+33 1 23 45 67 89"
    languages: [fr, ar, en]
    hours:
      - day: Lun–Ven
        time: "9h00 – 18h00"
    description: "Description courte du service."
```

### Option B — Nouveau connecteur de source de données

1. Créez `lib/connectors/ma-source.ts`
2. Exportez une fonction `fetch*(): Promise<RawService[]>` qui normalise vers le schéma commun
3. Ajoutez-la dans `scripts/ingest/run.ts`

### Ajouter une traduction

1. Créez `messages/[code].json` en copiant `messages/fr.json`
2. Traduisez les valeurs (gardez les clés en anglais)
3. Ajoutez le code dans `lib/i18n/routing.ts` → tableau `locales`
4. Si la langue s'écrit de droite à gauche, ajoutez-la dans `rtlLocales`

---

## Structure du projet

```
app/[locale]/          Pages Next.js (carte, liste, détail, langue)
app/api/services/      API REST géospatiale (ST_DWithin PostGIS)
components/
  map/                 MapLibre + pins + écran carte
  services/            Cartes de service, filtres, liste, détail
  ui/                  Composants partagés (icônes, statuts, boutons)
lib/
  connectors/          Sources de données (OSM, community, ...)
  db/                  Schéma Drizzle + client PostgreSQL
  i18n/                Configuration next-intl
  normalizers/         Conversion vers schéma commun
messages/              Traductions JSON
public/data/           community.yaml — ajouts manuels
scripts/ingest/        Script d'ingestion quotidienne
.github/workflows/     Cron ingestion
```

---

## Éthique et conformité

- Aucun tracker (pas de Google Analytics, pas de pixels publicitaires)
- Aucune donnée personnelle collectée côté serveur
- Géolocalisation utilisée uniquement côté client, jamais envoyée au serveur
- Données sous licences Etalab (data.gouv.fr) et ODbL (OpenStreetMap)
- Code source : licence MIT

---

## Licence

MIT — voir [LICENSE](LICENSE)

Les données intégrées depuis OpenStreetMap sont sous licence [ODbL](https://opendatacommons.org/licenses/odbl/).  
Les données data.gouv.fr sont sous [Licence Ouverte Etalab 2.0](https://www.etalab.gouv.fr/licence-ouverte-open-licence).
