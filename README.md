# Deepdive Cinema

> **Le film est fini. L'exploration commence.**

Un hub d'exploration cinéphile : pour chaque film, tout ce qui se dit, s'écrit et s'enregistre autour de lui — analyses vidéo, podcasts, livres, éditions physiques. En une page.

**→ [deepdive-cinema.com](https://www.deepdive-cinema.com)**

---

## Pourquoi ce produit existe

Il existe un vide entre *voir un film* et *comprendre pourquoi il t'a marqué*.

Letterboxd journalise. MUBI diffuse. Allociné informe. **Personne n'agrège le corpus critique sérieux** — les présentations de cinémathèque, les leçons de cinéma, les podcasts culturels, les essais, les éditions collector — autour d'un film précis, en une page, sans bruit.

Deepdive comble ce vide. Public cible : cinéphiles avancés, étudiants en cinéma, programmateurs, lecteurs des Cahiers. Non-cible assumée : grand public en quête de "quoi regarder ce soir".

---

## Positionnement

|  | **Deepdive** | Letterboxd | MUBI | Allociné |
|---|---|---|---|---|
| **Cœur** | Exploration après le film | Journal + social | Streaming curé | Base de données |
| **Contenu** | Analyses · podcasts · livres · Q&As | Notes · reviews | Films | Infos · bandes-annonces |
| **Ton** | Cinémathèque | Social | Art & essai | Grand public |
| **Langue** | FR en premier | EN | EN | FR |

**Avantage défendable :** curation algorithmique + tonalité cinémathèque + ancrage Letterboxd + corpus multi-formats (vidéo + audio + texte + physique). Aucun concurrent ne fait cette combinaison.

---

## Ce que le produit fait concrètement

### Page film — le cœur

Pour un film donné, Deepdive agrège en temps réel et filtre par pertinence :

- **Vidéos** — présentations cinémathèque, leçons de cinéma, analyses universitaires (pas de trailers, jamais)
- **Podcasts** — émissions culturelles FR qui ont traité ce film
- **Livres** — essais, monographies, scripts publiés, filtrés par IA pour éliminer tout ce qui n'est pas directement lié au film ou au réalisateur
- **Éditions physiques** — Blu-ray collector, Criterion, Wild Side, avec liens d'achat

Chaque contenu est scoré, ranked, et peut être voté par les utilisateurs. Un contenu downvoté par suffisamment d'utilisateurs disparaît automatiquement.

### Homepage personnalisée

Connectée au compte Letterboxd de l'utilisateur. La homepage devient son diary cinéphile : les films qu'il a vus récemment, avec du contenu disponible pour chacun.

### Tendances de ta cinéphilie *(feature en cours)*

Détecte automatiquement les obsessions récentes (même réalisateur, même mouvement cinématographique, même pays, même décennie) et propose d'aller plus loin dans cette direction — visible depuis la homepage.

---

## Architecture technique

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (SPA)                         │
│         React 18 · Vite 5 · TypeScript · Tailwind        │
│              TanStack Query · shadcn/ui                   │
└──────────────────────┬──────────────────────────────────┘
                       │ Supabase Client
┌──────────────────────▼──────────────────────────────────┐
│              Supabase (Backend as a Service)              │
│                                                          │
│  PostgreSQL  ·  Auth (Google OAuth)  ·  RLS              │
│                                                          │
│  Edge Functions (Deno)                                   │
│  ├── youtube-search      API YouTube → scoring algo       │
│  ├── podcast-search      iTunes Podcasts                 │
│  ├── book-search         Open Library + Gemini AI        │
│  ├── french-editions     Firecrawl (scraping)            │
│  ├── letterboxd-feed     Parser diary utilisateur        │
│  ├── analytics-data      Dashboard métriques internes    │
│  └── sitemap             SEO · XML dynamique             │
└──────────────────────────────────────────────────────────┘

APIs externes : TMDB · YouTube Data API · Open Library
               iTunes · Firecrawl · Lovable AI Gateway
```

**Règle d'architecture :** toute API externe passe par une Edge Function. Jamais d'appel direct depuis le client (sécurité des clés, quota management, cache centralisé).

---

## Features techniques notables

### Algorithme de curation vidéo

Chaque requête YouTube lance 4 recherches parallèles avec des stratégies différentes (cinémathèque FR, Q&As post-projection, analyses internationales, making-of). Les résultats sont fusionnés, dédupliqués, scorés sur ~15 signaux (durée, chaîne, titre, vues, date) et le signal de feedback utilisateur (upvotes/downvotes) ajuste le ranking en temps réel.

Un seuil de masquage automatique retire les vidéos dépassant un score négatif cumulé — sans intervention manuelle.

### Recommandation de livres par IA

Migration complète vers [Open Library](https://openlibrary.org) (gratuit, sans quota) après épuisement du quota Google Books. Gemini 2.5 Flash score chaque résultat sur une grille stricte (0–100) : seuls les livres directement consacrés au film, au réalisateur, ou au mouvement cinématographique exact passent le seuil 45. Résultat zéro préférable à un résultat hors sujet.

### Dashboard analytics interne

Edge Function protégée par mot de passe, contournant le RLS Supabase via service role key. Calcule la North Star (SAA), les KPIs hebdomadaires, les top films, la répartition des contenus — en agrégeant toutes les tables comportementales.

---

## Stratégie produit documentée

Ce repo contient la documentation produit complète, produite en binôme avec un système d'agents IA spécialisés :

| Document | Contenu |
|---|---|
| [`PRD.md`](./PRD.md) | Vision, stack, architecture, composants, règles de design |
| [`VISION_STRATEGIE.md`](./VISION_STRATEGIE.md) | Positionnement, roadmap phases 1→4, PMF criteria |
| [`DATA_STRATEGIE.md`](./DATA_STRATEGIE.md) | North Star (SAA), 5 KPIs primaires, 8 secondaires, funnels |
| [`ACQUISITION_STRATEGIE.md`](./ACQUISITION_STRATEGIE.md) | De 0 à 50K MAU — canaux, séquencement, budgets |
| [`PRD_SEO.md`](./PRD_SEO.md) | Audit SEO complet, meta tags, JSON-LD, sitemap, plan 12 semaines |

---

## Système d'agents IA

Le produit est développé avec un système d'agents Claude Code spécialisés, chacun avec son domaine de responsabilité et son contexte produit complet :

```
.claude/agents/
├── deepdive-head-of-product   Vision, arbitrage, priorisation       (Claude Opus)
├── deepdive-ux                Design system, wireframes, briefs
├── deepdive-ux-researcher     Personas, études synthétiques, frictions
├── deepdive-analytics         SQL, KPIs, dashboards, funnels
├── deepdive-growth            Acquisition, SEO, rétention, A/B testing
├── deepdive-recommender       Algos YouTube/livres, scoring, qualité
└── deepdive-seo               Meta tags, JSON-LD, sitemap, longue traîne
```

Chaque agent porte le contexte produit complet (personas, design system, schéma Supabase, décisions d'architecture). Ils peuvent être invoqués en parallèle pour des analyses multi-perspectives — voir les docs stratégiques pour des exemples de sorties.

---

## North Star & métriques

**SAA — Semaines Actives Approfondissantes**

> Nombre d'utilisateurs ayant exploré ≥ 2 films différents dans la semaine, avec ≥ 2 contenus consommés ou mis en favori par film.

Cette métrique capture l'essence du produit : pas une visite, une vraie exploration.

| M1 | M3 | M6 | M12 |
|---|---|---|---|
| 50 SAA | 200 | 800 | 3 000 |

---

## Stack

```
Frontend    React 18 · Vite 5 · TypeScript · Tailwind CSS · shadcn/ui
Backend     Supabase (PostgreSQL · Auth · Edge Functions · RLS)
Runtime     Deno (Edge Functions)
IA          Gemini 2.5 Flash via Lovable AI Gateway
APIs        TMDB · YouTube Data API · Open Library · iTunes · Firecrawl
Deploy      Lovable Cloud (CI/CD automatique sur push main)
Typo        Fraunces (display serif) · Nunito (body)
```

---

## Lancer le projet en local

```bash
git clone https://github.com/EricLePatron/deep-dive-cinema
cd deep-dive-cinema
npm install
npm run dev
```

Les Edge Functions Supabase se déploient automatiquement via Lovable sur push sur `main`.

---

## Design system

Esthétique éditoriale cinémathèque — inspirée de MUBI Notebook et Letterboxd :

- Fond quasi-noir `#0A0A0A` · texte off-white
- Zéro couleur d'accent (pas de doré, pas de rouge)
- `rounded-sm` uniquement — pas de border-radius généreux
- Hover en opacité uniquement, jamais de changement de couleur
- Tokens HSL sémantiques dans `index.css` — jamais de couleur en dur dans les composants

---

*Deepdive Cinema — 2026*
