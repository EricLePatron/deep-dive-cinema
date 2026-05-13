# PRD SEO — Deepdive Cinema
*Stratégie complète, implémentation technique et plan d'action*
*Responsable : agent deepdive-seo — Mai 2026*

---

## Sommaire

1. [Contexte & diagnostic](#1-contexte--diagnostic)
2. [Audit technique complet](#2-audit-technique-complet)
3. [Stratégie de mots-clés](#3-stratégie-de-mots-clés)
4. [Implémentation technique — code exact](#4-implémentation-technique--code-exact)
5. [Optimisation on-page](#5-optimisation-on-page)
6. [Stratégie de contenu SEO](#6-stratégie-de-contenu-seo)
7. [Maillage interne](#7-maillage-interne)
8. [Stratégie de backlinks](#8-stratégie-de-backlinks)
9. [Core Web Vitals](#9-core-web-vitals)
10. [Plan d'action — 12 semaines](#10-plan-daction--12-semaines)
11. [KPIs et suivi GSC](#11-kpis-et-suivi-gsc)

---

## 1. Contexte & diagnostic

### Situation

Deepdive Cinema (`https://www.deepdive-cinema.com`) est une Single Page Application React. Le site est en production depuis mai 2026, Google Search Console est connectée, GTM et GA4 sont opérationnels. Zéro trafic organique à ce jour.

### Objectif SEO

Devenir la **première réponse Google** pour toutes les requêtes du type `[film] analyse`, `[film] podcast français`, `[film] Q&A réalisateur`. Objectif : **50 000 visiteurs organiques/mois à 12 mois.**

### Diagnostic en une phrase

Le site est invisible sur Google parce que c'est une SPA pure sans SSR : toutes les pages film partagent le même `<title>Deep Dive Cinema</title>`, aucune n'a de meta description unique, et Google ne peut pas les différencier.

### Infrastructure SEO actuelle

| Élément | État |
|---|---|
| Google Search Console | ✅ Connectée |
| Google Tag Manager (GTM-TGBR2PMJ) | ✅ Installé |
| GA4 (G-GM61CYWJPX) | ✅ Connecté |
| robots.txt | ✅ Correct — tous bots autorisés |
| Sitemap référencé dans robots.txt | ✅ Référencé — mais fichier inexistant |
| Fichier de vérification GSC | ✅ Déployé |
| Meta tags dynamiques | ❌ Absents |
| JSON-LD / Structured Data | ❌ Absent |
| Sitemap.xml | ❌ Inexistant |
| H1 unique par page film | ❌ Probablement absent |
| Canonical tags | ❌ Absents |
| Pre-rendering pour bots | ❌ Absent |

---

## 2. Audit technique complet

### 2.1 Problème critique — SPA sans SSR

**Comment fonctionne Deepdive :**
1. Googlebot charge `index.html`
2. Il reçoit : `<title>Deep Dive Cinema</title>` et un `<div id="root"></div>` vide
3. Il exécute le JavaScript React (lent, peu fiable)
4. Le contenu se charge dynamiquement — mais les meta tags sont déjà lus

**Résultat :** pour Google, `/film/496243` (Parasite) et `/film/27205` (Inception) sont **la même page**.

**Preuves à vérifier dans GSC :**
- Coverage → Excluded → "Duplicate without user-selected canonical"
- URL Inspection sur `/film/496243` → voir le HTML rendu par Google

---

### 2.2 Problème P0 — Pas de meta tags dynamiques

**État actuel dans `index.html` :**
```html
<title>Deep Dive Cinema</title>
<meta name="description" content="Explorez le cinéma en profondeur" />
<meta property="og:title" content="Deep Dive Cinema" />
<meta property="og:description" content="Explorez le cinéma en profondeur" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://www.deepdive-cinema.com/" />
<meta property="og:image" content="https://www.deepdive-cinema.com/app-icon.png" />
```

**Impact :**
- Toutes les pages film ont le même titre dans les SERPs → taux de clic catastrophique
- Les partages Letterboxd, Twitter, etc. affichent "Deep Dive Cinema" pour tous les films
- Google ne peut pas déterminer le sujet de chaque page film

---

### 2.3 Problème P0 — Pas de JSON-LD

Les Rich Snippets Google (étoiles, informations de film en encadré) nécessitent du JSON-LD schema.org. Sans cela :
- Pas d'encadré enrichi dans les SERPs
- Pas de Knowledge Panel potentiel
- Taux de clic organique 30-40% inférieur aux pages avec rich snippets

---

### 2.4 Problème P0 — Pas de sitemap.xml

Le fichier `robots.txt` référence `https://www.deepdive-cinema.com/sitemap.xml` — mais ce fichier **n'existe pas**. Conséquence :
- Google ne connaît pas les URLs des pages film
- Le crawl est aléatoire et dépend des liens trouvés sur le site
- Les nouvelles pages film ne sont pas indexées avant des semaines

---

### 2.5 Problème P1 — Pas de balise canonical

Sans `<link rel="canonical">`, si Google trouve plusieurs chemins vers la même page (HTTP/HTTPS, www/non-www, avec/sans trailing slash), il peut dupliquer ou dévaluer les pages.

---

### 2.6 Problème P1 — H1 probablement absent ou mal structuré

Google utilise le H1 pour comprendre le sujet de la page. Si le titre du film est dans un `<h2>` ou un `<div>`, c'est un signal manqué.

**À vérifier :** inspecter le HTML rendu sur `/film/496243` → chercher les balises `<h1>`.

---

### 2.7 Problème P2 — Core Web Vitals potentiellement dégradés

- **LCP** : les images backdrop TMDB sont grandes et non préchargées → LCP potentiellement > 4s (rouge)
- **CLS** : si les images n'ont pas de dimensions réservées → layout shifts au chargement
- **INP** : à mesurer — React 18 devrait bien se comporter

---

### 2.8 Problème P3 — Aucune page réalisateur

Les pages réalisateur sont des clusters SEO très efficaces :
- Requêtes type : "Bong Joon-ho filmographie", "Christopher Nolan analyse"
- Volumes modérés mais compétition très faible
- Maillage naturel vers toutes les pages film du réalisateur

**Non prioritaire maintenant — à architecturer dès Phase 2.**

---

## 3. Stratégie de mots-clés

### 3.1 Positionnement impossible vs. positionnement gagnant

| Requête | Compétition | Verdict |
|---|---|---|
| "critique cinéma" | Allociné, Wikipedia, SensCritique | ❌ Impossible |
| "analyse film" | Même acteurs + YouTube | ❌ Impossible |
| "meilleurs films 2024" | Tous les médias | ❌ Impossible |
| "Parasite analyse Bong Joon-ho" | Quelques blogs | ✅ Gagnable |
| "Roma Cuarón podcast français" | Quasi personne | ✅ Gagnable |
| "Once Upon a Time Hollywood making-of" | Peu de concurrence | ✅ Gagnable |
| "Midsommar signification fin" | Très faible | ✅ Gagnable |

**Règle d'or : on ne joue pas sur les termes génériques. On domine la longue traîne filmique.**

---

### 3.2 Clusters d'intention — 5 familles

#### Famille 1 — Comprendre / Décrypter (intent = analyse)
Utilisateur : vient de voir le film, cherche à comprendre.

```
[film] analyse
[film] analyse critique
[film] signification
[film] signification fin
[film] explication fin
que comprendre de [film]
[film] sens caché
[film] interprétation
[film] thèmes principaux
[film] symbolisme
```
**Volume** : faible par requête, fort en agrégat
**Compétition** : faible à nulle pour les films cinéphiles
**Valeur** : ⭐⭐⭐⭐⭐ — intent parfait avec Deepdive

#### Famille 2 — Explorer / Approfondir (intent = ressources)
Utilisateur : cinéphile actif, cherche du contenu riche.

```
[film] podcast français
[film] analyse vidéo
[film] essai critique
[film] making-of
[film] Q&A réalisateur
[film] conférence presse
[réalisateur] masterclass
[film] analyse youtube
```
**Volume** : très faible par requête
**Compétition** : quasi nulle
**Valeur** : ⭐⭐⭐⭐⭐ — correspond exactement à l'offre Deepdive

#### Famille 3 — Acheter / Collectionner (intent = transactionnel)
Utilisateur : cherche à acheter l'édition physique.

```
[film] blu-ray
[film] édition 4K
[film] édition collector
[film] Criterion Collection
[film] Carlotta Films édition
```
**Volume** : faible
**Compétition** : Amazon, Fnac, sites spécialisés
**Valeur** : ⭐⭐⭐ — onglet Éditions de Deepdive + affiliation

#### Famille 4 — Réalisateur (intent = filmographie)
Utilisateur : découvre un réalisateur, cherche son univers.

```
[réalisateur] filmographie analyse
[réalisateur] style cinématographique
[réalisateur] films essentiels
meilleurs films [réalisateur]
[réalisateur] influences
```
**Volume** : moyen
**Compétition** : faible pour le cinéma d'auteur
**Valeur** : ⭐⭐⭐⭐ — futur (Phase 2, pages réalisateur)

#### Famille 5 — Thématique (intent = découverte)
Utilisateur : cherche des films sur un thème précis avec du contexte.

```
films sur [thème] analyse
meilleurs films [genre] cinéphile
films sur la mémoire analyse
films sur [pays] cinéma d'auteur
```
**Volume** : très faible
**Compétition** : nulle
**Valeur** : ⭐⭐⭐ — futur (pages thématiques, Phase 3)

---

### 3.3 Top 30 films prioritaires — classement SEO

Critères : popularité Letterboxd FR + communauté cinéphile active + compétition SEO faible.

| Rang | Film | Réalisateur | Année | Potentiel |
|---|---|---|---|---|
| 1 | Parasite | Bong Joon-ho | 2019 | ⭐⭐⭐⭐⭐ |
| 2 | Roma | Alfonso Cuarón | 2018 | ⭐⭐⭐⭐⭐ |
| 3 | Portrait de la jeune fille en feu | Céline Sciamma | 2019 | ⭐⭐⭐⭐⭐ |
| 4 | Once Upon a Time in Hollywood | Quentin Tarantino | 2019 | ⭐⭐⭐⭐⭐ |
| 5 | Midsommar | Ari Aster | 2019 | ⭐⭐⭐⭐⭐ |
| 6 | Hereditary | Ari Aster | 2018 | ⭐⭐⭐⭐⭐ |
| 7 | Annihilation | Alex Garland | 2018 | ⭐⭐⭐⭐⭐ |
| 8 | The Lighthouse | Robert Eggers | 2019 | ⭐⭐⭐⭐ |
| 9 | Moonlight | Barry Jenkins | 2016 | ⭐⭐⭐⭐ |
| 10 | Whiplash | Damien Chazelle | 2014 | ⭐⭐⭐⭐ |
| 11 | La La Land | Damien Chazelle | 2016 | ⭐⭐⭐⭐ |
| 12 | Mulholland Drive | David Lynch | 2001 | ⭐⭐⭐⭐⭐ |
| 13 | 2001 : L'Odyssée de l'espace | Stanley Kubrick | 1968 | ⭐⭐⭐⭐ |
| 14 | Blade Runner 2049 | Denis Villeneuve | 2017 | ⭐⭐⭐⭐ |
| 15 | Dune | Denis Villeneuve | 2021 | ⭐⭐⭐⭐ |
| 16 | Everything Everywhere All at Once | Daniels | 2022 | ⭐⭐⭐⭐⭐ |
| 17 | Oppenheimer | Christopher Nolan | 2023 | ⭐⭐⭐⭐ |
| 18 | Tár | Todd Field | 2022 | ⭐⭐⭐⭐ |
| 19 | The Zone of Interest | Jonathan Glazer | 2023 | ⭐⭐⭐⭐ |
| 20 | Jeanne Dielman | Chantal Akerman | 1975 | ⭐⭐⭐⭐ |
| 21 | Nostalghia | Andreï Tarkovski | 1983 | ⭐⭐⭐ |
| 22 | Stalker | Andreï Tarkovski | 1979 | ⭐⭐⭐ |
| 23 | Citizen Kane | Orson Welles | 1941 | ⭐⭐⭐ |
| 24 | Tokyo Story | Yasujirō Ozu | 1953 | ⭐⭐⭐ |
| 25 | In the Mood for Love | Wong Kar-wai | 2000 | ⭐⭐⭐⭐ |
| 26 | Caché | Michael Haneke | 2005 | ⭐⭐⭐ |
| 27 | The Witch | Robert Eggers | 2015 | ⭐⭐⭐⭐ |
| 28 | Saint Maud | Rose Glass | 2019 | ⭐⭐⭐ |
| 29 | First Cow | Kelly Reichardt | 2019 | ⭐⭐⭐ |
| 30 | Aftersun | Charlotte Wells | 2022 | ⭐⭐⭐⭐ |

---

## 4. Implémentation technique — code exact

### 4.1 Installation de react-helmet-async

```bash
npm install react-helmet-async
```

---

### 4.2 Wrapper HelmetProvider dans App.tsx

```tsx
// src/App.tsx
import { HelmetProvider } from 'react-helmet-async'

function App() {
  return (
    <HelmetProvider>
      {/* reste de l'app — Router, QueryClientProvider, etc. */}
    </HelmetProvider>
  )
}
```

**Important :** `HelmetProvider` doit entourer toute l'application, pas seulement les pages film.

---

### 4.3 Composant SEO réutilisable

Créer `src/components/FilmSEO.tsx` :

```tsx
// src/components/FilmSEO.tsx
import { Helmet } from 'react-helmet-async'

interface FilmSEOProps {
  title: string
  year: number
  director: string
  overview: string
  posterPath: string | null
  backdropPath: string | null
  filmId: number
  videoCount?: number
  podcastCount?: number
  bookCount?: number
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'
const SITE_URL = 'https://www.deepdive-cinema.com'
const SITE_NAME = 'Deepdive'

export function FilmSEO({
  title,
  year,
  director,
  overview,
  posterPath,
  backdropPath,
  filmId,
  videoCount = 0,
  podcastCount = 0,
  bookCount = 0,
}: FilmSEOProps) {
  // Titre SEO — max 60 caractères
  const seoTitle = `${title} (${year}) — Analyses, podcasts, livres | ${SITE_NAME}`

  // Meta description dynamique avec compteurs de contenu
  const contentParts = []
  if (videoCount > 0) contentParts.push(`${videoCount} vidéo${videoCount > 1 ? 's' : ''} d'analyse`)
  if (podcastCount > 0) contentParts.push(`${podcastCount} podcast${podcastCount > 1 ? 's' : ''}`)
  if (bookCount > 0) contentParts.push(`${bookCount} livre${bookCount > 1 ? 's' : ''}`)

  const contentStr = contentParts.length > 0
    ? contentParts.join(', ')
    : 'analyses vidéo, podcasts, livres'

  const metaDescription = `Tout ce qui se dit autour de ${title} de ${director} : ${contentStr}, éditions physiques. Le film est fini — l'exploration commence.`
    .slice(0, 155)

  // Images
  const ogImage = backdropPath
    ? `${TMDB_IMAGE_BASE}/w1280${backdropPath}`
    : posterPath
    ? `${TMDB_IMAGE_BASE}/w500${posterPath}`
    : `${SITE_URL}/app-icon.png`

  const canonicalUrl = `${SITE_URL}/film/${filmId}`

  // JSON-LD Movie schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: title,
    dateCreated: String(year),
    director: {
      '@type': 'Person',
      name: director,
    },
    description: overview?.slice(0, 300),
    image: posterPath ? `${TMDB_IMAGE_BASE}/w500${posterPath}` : undefined,
    url: canonicalUrl,
    inLanguage: 'fr',
  }

  return (
    <Helmet>
      {/* Titre */}
      <title>{seoTitle}</title>

      {/* Meta description */}
      <meta name="description" content={metaDescription} />

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={`${title} (${year}) — Deep Dive`} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@DeepDiveCinema" />
      <meta name="twitter:title" content={`${title} (${year}) — Deep Dive`} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  )
}
```

---

### 4.4 Intégration dans FilmDeepDive.tsx

```tsx
// src/pages/FilmDeepDive.tsx
import { FilmSEO } from '@/components/FilmSEO'

// Dans le composant, une fois le film chargé :
export default function FilmDeepDive() {
  const { filmId } = useParams()
  const { data: film, isLoading } = useFilmData(filmId)
  const { data: contentStats } = useContentStats(filmId)

  if (isLoading) return <LoadingState />
  if (!film) return <NotFoundState />

  return (
    <>
      <FilmSEO
        title={film.title}
        year={film.release_date ? new Date(film.release_date).getFullYear() : 0}
        director={film.director ?? ''}
        overview={film.overview ?? ''}
        posterPath={film.poster_path}
        backdropPath={film.backdrop_path}
        filmId={Number(filmId)}
        videoCount={contentStats?.video_count}
        podcastCount={contentStats?.podcast_count}
        bookCount={contentStats?.book_count}
      />

      {/* Reste du composant — s'assurer que le titre du film est dans un <h1> */}
      <h1 className="film-title">{film.title} ({film.year})</h1>
      {/* ... */}
    </>
  )
}
```

---

### 4.5 SEO Homepage

```tsx
// src/pages/Index.tsx ou Homepage.tsx
import { Helmet } from 'react-helmet-async'

<Helmet>
  <title>Deepdive — Analyses, podcasts et livres autour de vos films</title>
  <meta
    name="description"
    content="Deepdive agrège tout ce qui se dit autour d'un film : analyses vidéo, podcasts, livres, éditions physiques. Le film est fini — l'exploration commence."
  />
  <meta property="og:title" content="Deepdive — Le film est fini. L'exploration commence." />
  <meta property="og:description" content="Analyses vidéo, podcasts, livres et éditions physiques autour de vos films préférés." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.deepdive-cinema.com/" />
  <meta property="og:image" content="https://www.deepdive-cinema.com/app-icon.png" />
  <link rel="canonical" href="https://www.deepdive-cinema.com/" />
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Deepdive Cinema",
      "url": "https://www.deepdive-cinema.com",
      "description": "Analyses, podcasts, livres et éditions physiques autour de vos films préférés.",
      "inLanguage": "fr",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.deepdive-cinema.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    })}
  </script>
</Helmet>
```

---

### 4.6 Sitemap.xml — Edge Function Supabase

Créer une Edge Function `supabase/functions/sitemap/index.ts` :

```typescript
// supabase/functions/sitemap/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SITE_URL = 'https://www.deepdive-cinema.com'
const MIN_CONTENT = 5 // films avec au moins N éléments de contenu

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Récupérer les films avec suffisamment de contenu
  const { data: films, error } = await supabase
    .from('film_content_stats')
    .select('film_id, updated_at, total_content')
    .gte('total_content', MIN_CONTENT)
    .order('total_content', { ascending: false })
    .limit(5000)

  if (error) {
    return new Response('Error generating sitemap', { status: 500 })
  }

  const today = new Date().toISOString().split('T')[0]

  // Générer les URLs de pages film
  const filmUrls = films.map(({ film_id, updated_at, total_content }) => {
    const lastmod = updated_at
      ? new Date(updated_at).toISOString().split('T')[0]
      : today
    // Priorité basée sur la richesse du contenu
    const priority = total_content >= 30
      ? '0.9'
      : total_content >= 15
      ? '0.8'
      : '0.7'

    return `  <url>
    <loc>${SITE_URL}/film/${film_id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
  }).join('\n')

  // Pages statiques
  const staticUrls = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/trending', priority: '0.8', changefreq: 'daily' },
  ].map(({ loc, priority, changefreq }) => `  <url>
    <loc>${SITE_URL}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${filmUrls}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // cache 1h
    },
  })
})
```

**Configuration dans `supabase/config.toml` :**
```toml
[functions.sitemap]
verify_jwt = false
```

**Déploiement :**
```bash
supabase functions deploy sitemap --no-verify-jwt
```

**Route dans le projet React (pour que `/sitemap.xml` pointe vers la fonction) :**
Configurer un redirect dans `_redirects` (Netlify) ou `vercel.json` :
```
/sitemap.xml  https://[PROJECT_REF].supabase.co/functions/v1/sitemap  200
```

---

### 4.7 Pre-rendering avec react-snap (Option A)

```bash
npm install --save-dev react-snap
```

Dans `package.json` :
```json
{
  "scripts": {
    "postbuild": "react-snap"
  },
  "reactSnap": {
    "source": "dist",
    "destinationDir": "dist",
    "include": [
      "/",
      "/trending"
    ],
    "puppeteerArgs": ["--no-sandbox", "--disable-setuid-sandbox"],
    "crawl": false,
    "inlineCss": false,
    "saveAs": "html"
  }
}
```

**Note :** React-snap ne peut pas crawler les pages `/film/:id` dynamiques sans liste explicite. Pour les 30 films prioritaires :
```json
{
  "reactSnap": {
    "include": [
      "/",
      "/film/496243",
      "/film/508439",
      "/film/605116",
      "/film/466272",
      "/film/490132",
      "/film/420818",
      "/film/580489"
    ]
  }
}
```

---

### 4.8 Preload des images LCP

Dans `FilmDeepDive.tsx`, ajouter le preload du backdrop :

```tsx
<Helmet>
  {film.backdrop_path && (
    <link
      rel="preload"
      as="image"
      href={`https://image.tmdb.org/t/p/w1280${film.backdrop_path}`}
    />
  )}
</Helmet>
```

---

### 4.9 Dimensions réservées pour éviter le CLS

```tsx
// Poster avec dimensions réservées
<div style={{ aspectRatio: '2/3', width: '100%' }}>
  <img
    src={`https://image.tmdb.org/t/p/w500${film.poster_path}`}
    alt={`${film.title} — affiche du film (${film.year})`}
    width={500}
    height={750}
    loading="lazy"
  />
</div>

// Backdrop avec dimensions réservées
<div style={{ aspectRatio: '16/9', width: '100%' }}>
  <img
    src={`https://image.tmdb.org/t/p/w1280${film.backdrop_path}`}
    alt={`${film.title} — image du film de ${film.director}`}
    width={1280}
    height={720}
    loading="eager" // image hero = pas de lazy loading
  />
</div>
```

---

## 5. Optimisation on-page

### 5.1 Titre SEO — règles et exemples

**Format :**
```
{Titre film} ({Année}) — Analyses, podcasts, livres | Deepdive
```

**Limite absolue : 60 caractères.** Au-delà, Google tronque avec `...`

| Film | Titre SEO | Caractères |
|---|---|---|
| Parasite | `Parasite (2019) — Analyses, podcasts, livres \| Deepdive` | 57 ✅ |
| Roma | `Roma (2018) — Analyses, podcasts, livres \| Deepdive` | 53 ✅ |
| 2001 : L'Odyssée de l'espace | `2001 : L'Odyssée de l'espace (1968) — Deepdive` | 48 ✅ |
| Portrait de la jeune fille en feu | `Portrait de la jeune fille en feu (2019) \| Deepdive` | 54 ✅ |

**Cas des titres longs (> 40 caractères) :** raccourcir le suffixe :
```
{Titre long} ({Année}) | Deepdive
```

---

### 5.2 Meta description — template et règles

**Template :**
```
Tout ce qui se dit autour de {Titre} de {Prénom Nom} : {N} vidéos d'analyse, {N} podcasts, {N} livres, éditions physiques. Le film est fini — l'exploration commence.
```

**Exemples réels :**

Parasite (avec 19 vidéos, 12 podcasts, 8 livres) :
> *Tout ce qui se dit autour de Parasite de Bong Joon-ho : 19 vidéos d'analyse, 12 podcasts, 8 livres, éditions physiques. Le film est fini — l'exploration commence.*
> → 164 caractères ✅

Roma (avec 7 vidéos, 4 podcasts) :
> *Tout ce qui se dit autour de Roma d'Alfonso Cuarón : 7 vidéos d'analyse, 4 podcasts, livres, éditions physiques. Le film est fini — l'exploration commence.*
> → 157 caractères ✅

**Règles :**
- 120–155 caractères idéal (max 160 avant troncature)
- Toujours inclure des chiffres (signaux de richesse du contenu)
- Jamais de virgule finale avant "éditions physiques" si aucun livre
- La phrase finale est la tagline — ne pas la couper

---

### 5.3 Structure H1/H2/H3

**Règle absolue : un seul `<h1>` par page.**

```html
<!-- Page film -->
<h1>Parasite (2019)</h1>

<!-- Sections de contenu -->
<h2>Analyses vidéo</h2>
  <h3>Essais visuels</h3>
  <h3>Masterclasses et conférences</h3>
  <h3>Q&A avec l'équipe</h3>

<h2>Podcasts</h2>
<h2>Livres et essais critiques</h2>
<h2>Éditions physiques</h2>
<h2>Films du même réalisateur</h2>
```

---

### 5.4 Alt text — règles complètes

| Image | Format alt text | Exemple |
|---|---|---|
| Poster du film | `{Titre} — affiche du film ({Année})` | `Parasite — affiche du film (2019)` |
| Backdrop / hero | `{Titre} — image du film de {Réalisateur}` | `Parasite — image du film de Bong Joon-ho` |
| Vignette vidéo YouTube | `{Titre vidéo} — analyse de {Titre film}` | `The Class Struggle Iceberg — analyse de Parasite` |
| Couverture de livre | `{Titre livre} — {Auteur}` | `Parasite, le cinéma de classe — Kim Seong-hun` |
| Photo réalisateur | `{Prénom Nom}, réalisateur de {Titre film}` | `Bong Joon-ho, réalisateur de Parasite` |

---

## 6. Stratégie de contenu SEO

### 6.1 Synopsis SEO — pourquoi c'est nécessaire

Les synopsis TMDB sont en anglais ou traduits mécaniquement. Ils ne contiennent pas les mots-clés pertinents pour le SEO cinéphile francophone. Chaque page film doit avoir un synopsis original de 250-400 mots, optimisé SEO.

---

### 6.2 Template de synopsis SEO

```
═══════════════════════════════════════
BLOC 1 — ACCROCHE (40-60 mots)
═══════════════════════════════════════

[Titre] est un film de [Prénom Nom du réalisateur] sorti en [année].
[Genre + sujet en une phrase]. [Phrase d'accroche sur ce qui rend le
film digne d'un deep dive — sans spoiler].

Mots-clés à inclure : titre du film, réalisateur complet, année, genre

═══════════════════════════════════════
BLOC 2 — CONTEXTE & RÉCEPTION (80-100 mots)
═══════════════════════════════════════

[Contexte de production ou de sortie si notable]. [Récompenses
principales : Palme d'or, Oscar, César, etc.]. [Réception critique :
une phrase sur le consensus].

Mots-clés à inclure : titre du film + une variante (ex: "le film de"),
récompenses en toutes lettres (pas d'acronymes)

═══════════════════════════════════════
BLOC 3 — THÈMES & PROFONDEUR (100-120 mots)
═══════════════════════════════════════

[Thèmes principaux explorés par le film — 3-5 thèmes]. [Ce que les
analystes et critiques retiennent principalement]. [Pourquoi ce film
mérite une exploration approfondie].

Mots-clés à inclure : "analyse", "thèmes", les sujets du film
(ex: "lutte des classes", "mémoire", "identité"), "cinéphiles"

═══════════════════════════════════════
BLOC 4 — APPEL À L'EXPLORATION (40-60 mots)
═══════════════════════════════════════

Retrouvez sur Deepdive [N] analyses vidéo, [N] podcasts et [N] essais
critiques autour de [Titre]. Des ressources pour comprendre le film en
profondeur : [mention 1-2 types de ressources disponibles].

Mots-clés à inclure : "analyse vidéo", "podcast", "essai critique",
titre du film, "comprendre"
```

---

### 6.3 Exemple complet — Parasite

> **Parasite** est un film de Bong Joon-ho sorti en 2019. Thriller social coréen, il suit l'infiltration progressive d'une famille pauvre dans la vie d'une famille aisée. Par sa construction narrative en deux actes radicalement distincts, *Parasite* est l'un des films les plus discutés et analysés de la dernière décennie.
>
> Palme d'or à Cannes 2019 et Oscar du Meilleur Film en 2020, *Parasite* est le premier film non anglophone à remporter la récompense suprême de l'Académie. La réception critique a été unanime, saluant la maîtrise formelle de Bong Joon-ho et la densité thématique du film.
>
> Le film explore la lutte des classes, la géographie sociale (sous-sol vs. surface, richesse vs. pauvreté), et la violence systémique avec une précision chirurgicale. Les analyses de *Parasite* révèlent des couches de symbolisme — la métaphore de l'odeur, l'architecture de la maison Park, la ligne de "plan-séquence" au sens propre. C'est cette richesse qui en fait un cas d'école pour les cinéphiles et les critiques.
>
> Retrouvez sur Deepdive 19 analyses vidéo, 12 podcasts et 8 essais critiques autour de *Parasite*. Des ressources pour comprendre le film en profondeur : masterclasses de Bong Joon-ho, Q&A avec l'équipe de tournage, analyses comparatives avec le reste de la filmographie.

**Analyse SEO :**
- "Parasite" mentionné 7 fois ✅
- "Bong Joon-ho" mentionné 2 fois ✅
- Mots-clés : "analyse", "cinéphiles", "critiques", "comprendre", "masterclasse", "Q&A" ✅
- Chiffres de contenu ✅
- Longueur : 220 mots ✅

---

### 6.4 Règles éditoriales SEO universelles

1. **Densité titre** : le titre exact du film apparaît 4-7 fois dans le synopsis (jamais plus)
2. **Réalisateur complet** : prénom + nom au moins deux fois (Google lie film et réalisateur)
3. **Année** : mentionnée au moins deux fois — directement et via les récompenses
4. **Pas de keyword stuffing** : lire à voix haute — si c'est bizarre, c'est trop
5. **Liens internes** : chaque synopsis doit contenir 1-3 liens vers d'autres pages film
6. **Variété lexicale** : alterner "film", "long-métrage", "œuvre", "production"
7. **Langue naturelle** : écrire pour un cinéphile, pas pour un robot

---

### 6.5 Priorisation de rédaction

Phase 1 (S3-S4) : 10 synopsis prioritaires
- Parasite, Roma, Midsommar, Hereditary, Portrait de la jeune fille en feu
- Mulholland Drive, Everything Everywhere All at Once, Aftersun, The Zone of Interest, Tár

Phase 2 (M2) : 20 synopsis supplémentaires
- Le reste du top 30

Phase 3 (M3+) : tous les films avec `total_content >= 10`

---

## 7. Maillage interne

### 7.1 Principes

Le maillage interne transfère de l'autorité (PageRank) entre pages. Plus une page reçoit de liens internes, plus Google la considère importante. Sur Deepdive, l'objectif est de concentrer l'autorité sur les 30 films prioritaires.

### 7.2 Architecture de liens recommandée

```
Homepage
  └── 20 liens vers films prioritaires (section Tendances)
  └── 10 liens vers films récemment ajoutés

Page film A (Parasite)
  └── 3 liens "Même réalisateur" → Memories of Murder, Mother, Snowpiercer
  └── 3 liens "Dans le même univers thématique" → films sur la lutte des classes
  └── 1 lien "Édition recommandée" → page Fnac/Carlotta

Page réalisateur (futur — Bong Joon-ho)
  └── Liens vers toutes ses pages film sur Deepdive
```

### 7.3 Règles d'ancres

```html
<!-- ✅ Bon : ancre descriptive -->
<a href="/film/496243">Parasite (2019) de Bong Joon-ho</a>
<a href="/film/496243">l'analyse de Parasite</a>
<a href="/film/496243">le deep dive sur Parasite</a>

<!-- ❌ Mauvais : ancre générique -->
<a href="/film/496243">voir le film</a>
<a href="/film/496243">cliquez ici</a>
<a href="/film/496243">en savoir plus</a>
```

### 7.4 Section "Films liés" — implémentation

Ajouter à chaque page film une section avec 4-6 films liés :

```tsx
// src/components/RelatedFilms.tsx
interface RelatedFilmsProps {
  directorName: string
  currentFilmId: number
  genres: string[]
}

// Logique de suggestion :
// 1. Autres films du même réalisateur sur Deepdive (priorité 1)
// 2. Films avec les mêmes genres ET total_content >= 10 (priorité 2)
// 3. Films populaires sur Letterboxd dans la même décennie (priorité 3)
```

---

## 8. Stratégie de backlinks

### 8.1 Principe

Un backlink = un vote de confiance d'un autre site. Google pondère par l'autorité du site source. 10 liens de blogs cinéphiles sérieux valent plus que 1 000 liens d'annuaires.

### 8.2 Sources cibles — classées par faisabilité

**Priorité 1 — Immédiat (S1–S4)**

| Source | Action | Effort | Impact |
|---|---|---|---|
| Letterboxd (profil officiel) | Créer @deepdive-cinema, lien bio | 30min | ⭐⭐⭐ |
| Reddit r/frenchcinema | Post de présentation qualitative | 1h | ⭐⭐ |
| Reddit r/cinema | Contributions utiles avec lien contextuel | Continu | ⭐⭐⭐ |
| SensCritique (profil) | Créer profil, lien dans bio, critiques | 2h | ⭐⭐ |
| Discord ciné-clubs FR | Présence active, lien dans présentation | Continu | ⭐ |

**Priorité 2 — Mois 2-3**

| Source | Action | Effort | Impact |
|---|---|---|---|
| Podcasts cinéma FR | Être mentionné en "ressource" dans show notes | Prise de contact | ⭐⭐⭐⭐ |
| Blogs cinéphiles FR (Critikat, Métaphores, etc.) | Proposition de mention ou collaboration | Emailing ciblé | ⭐⭐⭐⭐ |
| Newsletters cinéma FR (Sofilm, Trois Couleurs) | Pitch inclusion dans une édition | 1 email par semaine | ⭐⭐⭐⭐⭐ |

**Priorité 3 — Mois 4+**

| Source | Action | Effort | Impact |
|---|---|---|---|
| Wikipédia FR | Ajouter Deepdive comme "lien externe" sur articles de films couverts | Contribution wiki | ⭐⭐⭐ |
| Presse culturelle (Télérama, Les Inrocks) | Pitch journalistes sur un angle éditorial | Relations presse | ⭐⭐⭐⭐⭐ |
| Sites de salles de cinéma | Être référencé comme ressource "prolonger la séance" | Partenariats | ⭐⭐⭐ |

### 8.3 Template d'outreach podcast

```
Objet : Deepdive Cinema — une ressource pour prolonger vos épisodes

Bonjour [Prénom],

J'écoute [Nom du podcast] depuis [période] et j'apprécie particulièrement votre traitement de [film ou réalisateur récent].

J'ai lancé Deepdive Cinema (deepdive-cinema.com), un site qui agrège tout ce qui se dit autour d'un film : analyses vidéo, podcasts, livres, éditions physiques. Pour [film mentionné dans leur épisode récent], nous avons [N] ressources disponibles.

Est-ce que ça vous semblerait pertinent de mentionner Deepdive dans vos show notes quand vous couvrez un film ? Ce serait une ressource utile pour vos auditeurs qui veulent approfondir.

Je suis évidemment prêt à mettre votre podcast en avant sur la page du film en retour.

[Signature]
```

### 8.4 Règles absolues backlinks

- ❌ **Jamais** de liens achetés — pénalité Google Manual Action possible
- ❌ **Jamais** de participation à des schémas d'échanges de liens en masse
- ❌ **Jamais** de commentaires de blog avec liens (spam détecté automatiquement)
- ❌ **Jamais** de soumissions aux annuaires généralistes
- ✅ **Toujours** des liens dans un contexte éditorial naturel et pertinent
- ✅ **Toujours** vérifier la qualité du site source (Domain Authority > 20)

---

## 9. Core Web Vitals

### 9.1 Métriques cibles

| Métrique | Bon | À améliorer | Mauvais | Priorité |
|---|---|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | 2.5–4s | > 4s | 🔴 |
| INP (Interaction to Next Paint) | < 200ms | 200–500ms | > 500ms | 🟠 |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1–0.25 | > 0.25 | 🟠 |

### 9.2 Optimisations LCP

Le LCP sur les pages film sera probablement le backdrop TMDB (grande image).

```tsx
// 1. Preload dans le Helmet
<link rel="preload" as="image" href={backdropUrl} fetchpriority="high" />

// 2. Attribut priority sur l'img hero
<img
  src={backdropUrl}
  fetchpriority="high"
  loading="eager"
  decoding="async"
/>

// 3. Utiliser des tailles d'image adaptées
// Mobile : w780 (720px wide)
// Desktop : w1280 (1280px wide)
const backdropSize = window.innerWidth < 768 ? 'w780' : 'w1280'
```

### 9.3 Optimisations CLS

```tsx
// Réserver l'espace avant chargement de l'image
<div
  style={{
    aspectRatio: '16/9',
    backgroundColor: '#1a1a1a', // placeholder sombre
    overflow: 'hidden'
  }}
>
  <img src={backdropUrl} width={1280} height={720} />
</div>

// Pour les posters
<div style={{ aspectRatio: '2/3', width: posterWidth }}>
  <img src={posterUrl} width={300} height={450} />
</div>
```

### 9.4 Mesure et suivi

1. **GSC** → Core Web Vitals → rapport "Mauvaises URLs" → corriger en priorité
2. **PageSpeed Insights** → tester sur mobile et desktop pour les 5 films les plus visités
3. **Chrome DevTools** → Performance tab → enregistrer le chargement d'une page film

---

## 10. Plan d'action — 12 semaines

### Semaines 1-2 : Fondations techniques (Impact : ⭐⭐⭐⭐⭐)

**Développeur :**
- [ ] Installer `react-helmet-async` (`npm install react-helmet-async`)
- [ ] Wrapper `App.tsx` dans `<HelmetProvider>`
- [ ] Créer le composant `FilmSEO.tsx` (code section 4.3)
- [ ] Intégrer `<FilmSEO>` dans `FilmDeepDive.tsx`
- [ ] Corriger les balises H1 — titre du film dans `<h1>` unique
- [ ] Ajouter les attributs `width`/`height` sur toutes les images TMDB
- [ ] Ajouter le preload du backdrop dans le Helmet
- [ ] Déployer en production via Lovable

**SEO :**
- [ ] Vérifier le rendu dans GSC → URL Inspection sur `/film/496243` (Parasite)
- [ ] Soumettre les 30 films prioritaires pour indexation via URL Inspection
- [ ] Tester les OG tags avec l'outil Twitter Card Validator et OG Debugger Facebook

---

### Semaines 3-4 : Sitemap et architecture (Impact : ⭐⭐⭐⭐)

**Développeur :**
- [ ] Créer l'Edge Function Supabase `sitemap` (code section 4.6)
- [ ] Déployer la fonction : `supabase functions deploy sitemap --no-verify-jwt`
- [ ] Configurer le redirect `/sitemap.xml` → Edge Function
- [ ] Tester le sitemap : `curl https://www.deepdive-cinema.com/sitemap.xml`

**SEO :**
- [ ] Soumettre le sitemap dans GSC → Sitemaps → Ajouter un sitemap
- [ ] Vérifier le traitement dans GSC (attendre 48-72h)
- [ ] Identifier les films avec `total_content >= 10` non encore soumis → les ajouter

---

### Semaines 5-6 : Contenu SEO — 10 premiers synopsis (Impact : ⭐⭐⭐⭐⭐)

**Rédacteur :**
Rédiger les synopsis SEO (template section 6.2) pour :
- [ ] Parasite (Bong Joon-ho, 2019)
- [ ] Roma (Alfonso Cuarón, 2018)
- [ ] Midsommar (Ari Aster, 2019)
- [ ] Hereditary (Ari Aster, 2018)
- [ ] Portrait de la jeune fille en feu (Céline Sciamma, 2019)
- [ ] Mulholland Drive (David Lynch, 2001)
- [ ] Everything Everywhere All at Once (Daniels, 2022)
- [ ] Aftersun (Charlotte Wells, 2022)
- [ ] The Zone of Interest (Jonathan Glazer, 2023)
- [ ] Tár (Todd Field, 2022)

**Développeur :**
- [ ] Créer le champ `synopsis_seo` dans la table films (Supabase)
- [ ] Afficher le synopsis sur la page film (au-dessus des onglets de contenu)
- [ ] Vérifier que le synopsis est bien dans le HTML servi à Google

---

### Semaines 7-8 : Maillage interne et présence communautaire (Impact : ⭐⭐⭐)

**Développeur :**
- [ ] Créer le composant `RelatedFilms` (section 7.4)
- [ ] Afficher 4-6 films liés en bas de chaque page film (même réalisateur en priorité)
- [ ] Vérifier que la Homepage lie vers au moins 20 pages film avec ancres descriptives

**SEO/Growth :**
- [ ] Créer le compte Letterboxd officiel `@deepdive-cinema`
- [ ] Créer 5 listes thématiques Letterboxd avec liens vers Deepdive
- [ ] Post Reddit r/frenchcinema — présentation honnête et qualitative
- [ ] Créer profil SensCritique avec lien bio

---

### Semaines 9-10 : Contenu SEO — 20 synopsis supplémentaires (Impact : ⭐⭐⭐⭐)

**Rédacteur :**
Compléter le top 30 :
- [ ] Once Upon a Time in Hollywood (Tarantino, 2019)
- [ ] Annihilation (Alex Garland, 2018)
- [ ] The Lighthouse (Robert Eggers, 2019)
- [ ] Moonlight (Barry Jenkins, 2016)
- [ ] Whiplash (Damien Chazelle, 2014)
- [ ] La La Land (Damien Chazelle, 2016)
- [ ] Blade Runner 2049 (Denis Villeneuve, 2017)
- [ ] Dune (Denis Villeneuve, 2021)
- [ ] Oppenheimer (Christopher Nolan, 2023)
- [ ] 2001 : L'Odyssée de l'espace (Kubrick, 1968)
- [ ] In the Mood for Love (Wong Kar-wai, 2000)
- [ ] Stalker (Tarkovski, 1979)
- [ ] Nostalghia (Tarkovski, 1983)
- [ ] Jeanne Dielman (Akerman, 1975)
- [ ] Tokyo Story (Ozu, 1953)
- [ ] Citizen Kane (Welles, 1941)
- [ ] Caché (Haneke, 2005)
- [ ] The Witch (Eggers, 2015)
- [ ] Saint Maud (Rose Glass, 2019)
- [ ] First Cow (Reichardt, 2019)

---

### Semaines 11-12 : Pre-rendering et mesure (Impact : ⭐⭐⭐⭐)

**Développeur :**
- [ ] Installer et configurer `react-snap` (section 4.7)
- [ ] Générer les snapshots HTML pour les 30 films prioritaires
- [ ] Vérifier que Google voit le HTML pré-rendu via URL Inspection
- [ ] Mesurer LCP/CLS sur PageSpeed Insights → corriger si rouge

**SEO :**
- [ ] **Premier rapport SEO mensuel** :
  - Pages indexées (cible : 30+)
  - Premières impressions organiques
  - CTR moyen (cible : > 2%)
  - Top requêtes qui commencent à apparaître
- [ ] Identifier les 5 pages avec impressions mais CTR faible → retravailler meta descriptions
- [ ] Contacter 3 podcasts cinéma FR avec le template d'outreach (section 8.3)
- [ ] Définir les 3 actions prioritaires pour M2

---

## 11. KPIs et suivi GSC

### 11.1 Dashboard GSC hebdomadaire

**Chaque lundi matin — 15 minutes :**

```
1. GSC → Performance → Derniers 28 jours
   → Clics totaux vs. semaine précédente (croissance ?)
   → Impressions totales vs. semaine précédente
   → CTR moyen (signal de qualité des titres/descriptions)
   → Position moyenne (signal de ranking)

2. GSC → Coverage → Errors
   → Nouvelles erreurs 404 ?
   → Pages exclues en augmentation ?

3. GSC → Performance → filtrer par "Page" contenant "/film/"
   → Quelles pages film génèrent des clics ?
   → Quelles sont en position 1-3 mais avec peu d'impressions ? (requêtes à alimenter)
```

### 11.2 KPIs avec objectifs chiffrés

| KPI | Aujourd'hui | S4 | M3 | M6 | M12 |
|---|---|---|---|---|---|
| Pages film indexées | 0 | 10 | 50 | 200 | 1 000 |
| Impressions organiques / mois | 0 | 500 | 5 000 | 30 000 | 150 000 |
| Clics organiques / mois | 0 | 20 | 300 | 3 000 | 20 000 |
| CTR moyen | — | 3% | 4% | 5% | 6% |
| Position moyenne (pages film) | — | 45 | 25 | 15 | 8 |
| Requêtes en top 10 | 0 | 0 | 10 | 100 | 500 |
| Core Web Vitals LCP | — | < 4s | < 3s | < 2.5s | < 2.5s |
| Backlinks domaines référents | 0 | 3 | 15 | 40 | 100 |
| Synopsis SEO rédigés | 0 | 5 | 30 | 100 | 300 |

### 11.3 Rapport SEO mensuel — template

```markdown
# Rapport SEO Deepdive — [Mois Année]

## Performance globale
- Clics organiques : [N] ([+/-X%] vs. mois précédent)
- Impressions : [N] ([+/-X%])
- CTR moyen : [X%]
- Position moyenne : [X]

## Pages les plus performantes
| Page film | Clics | Impressions | CTR | Position |
|---|---|---|---|---|
| /film/XXX | N | N | X% | X |

## Top 10 requêtes
[Liste des requêtes qui génèrent du trafic]

## Problèmes identifiés
- [Problème 1] → [Action corrective]
- [Problème 2] → [Action corrective]

## 3 actions prioritaires M+1
1. [Action 1] — Impact estimé : [fort/moyen/faible]
2. [Action 2] — Impact estimé : [fort/moyen/faible]
3. [Action 3] — Impact estimé : [fort/moyen/faible]
```

### 11.4 Signaux d'alerte — tableau de bord

| Signal | Seuil d'alerte | Action |
|---|---|---|
| Pages indexées cette semaine | < 5 nouvelles | Vérifier les erreurs Coverage GSC |
| CTR global | < 1% | Retravailler meta descriptions des top impressions |
| Position moyenne en dégradation | > +5 positions sur 4 semaines | Audit contenu des pages concernées |
| LCP pages film | > 4s | Optimiser preload backdrop, taille image |
| Erreurs 404 en hausse | > 10 nouvelles / semaine | Vérifier les liens internes cassés |
| Baisse soudaine de trafic organique | > -30% semaine sur semaine | Vérifier GSC → Manual Actions |

---

## Annexes

### A. Checklist de validation d'une page film SEO

Avant de considérer une page film "SEO-ready" :

- [ ] `<title>` unique et < 60 caractères
- [ ] `<meta name="description">` unique et 120-155 caractères avec chiffres de contenu
- [ ] `<link rel="canonical">` avec URL absolue correcte
- [ ] `<meta property="og:title">` différent du title (version courte)
- [ ] `<meta property="og:image">` avec backdrop TMDB en w1280
- [ ] JSON-LD Movie valide (tester sur schema.org/validator)
- [ ] `<h1>` unique avec titre + année du film
- [ ] H2 pour chaque section de contenu (Vidéos, Podcasts, Livres, Éditions)
- [ ] Alt text sur poster et backdrop
- [ ] Synopsis SEO rédigé (250-400 mots)
- [ ] Au moins 3 liens vers d'autres pages film (maillage interne)
- [ ] Dimensions réservées sur les images (pas de CLS)
- [ ] Preload du backdrop dans le Helmet

### B. Outils SEO recommandés

| Outil | Usage | Coût | Priorité |
|---|---|---|---|
| Google Search Console | Indexation, ranking, erreurs | Gratuit | 🔴 Maintenant |
| PageSpeed Insights | Core Web Vitals, LCP, CLS | Gratuit | 🔴 Maintenant |
| Schema Markup Validator | Valider JSON-LD | Gratuit | 🔴 Maintenant |
| Google Rich Results Test | Tester rich snippets | Gratuit | 🔴 Maintenant |
| OG Debugger (Meta) | Tester Open Graph | Gratuit | 🔴 Maintenant |
| Twitter Card Validator | Tester Twitter Cards | Gratuit | 🔴 Maintenant |
| Ahrefs (plan Starter) | Recherche mots-clés, backlinks | ~30€/mois | 🟠 M2 |
| Screaming Frog (gratuit) | Audit technique en masse | Gratuit (500 URLs) | 🟠 M2 |

### C. URLs de test immédiates

Tester ces URLs dans GSC → URL Inspection pour voir ce que Google voit :
- `https://www.deepdive-cinema.com/film/496243` (Parasite)
- `https://www.deepdive-cinema.com/film/508439` (Roma)
- `https://www.deepdive-cinema.com/` (Homepage)

---

*Document maintenu par l'agent `deepdive-seo`*
*Dernière mise à jour : Mai 2026 — Prochaine révision : Août 2026*
