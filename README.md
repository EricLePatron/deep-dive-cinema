# Deepdive Cinema

> **The film is over. The exploration begins.**

A cinephile exploration hub: for every film, everything written, recorded, and said around it — video essays, podcasts, books, physical editions. All in one page.

**→ [deepdive-cinema.com](https://www.deepdive-cinema.com)**

---

## Why this product exists

There's a gap between *watching a film* and *understanding why it moved you*.

Letterboxd journals. MUBI streams. Allociné informs. **Nobody aggregates serious critical content** — cinematheque presentations, film school lectures, cultural podcasts, essays, collector editions — around a specific film, in one page, without noise.

Deepdive fills that gap. Target audience: advanced cinephiles, film students, programmers, Cahiers du Cinéma readers. Deliberate non-target: mainstream audience looking for "what to watch tonight."

---

## Positioning

|  | **Deepdive** | Letterboxd | MUBI | Allociné |
|---|---|---|---|---|
| **Core** | Post-film exploration | Journal + social | Curated streaming | Database |
| **Content** | Essays · podcasts · books · Q&As | Ratings · reviews | Films | Info · trailers |
| **Tone** | Cinematheque | Social | Art house | Mainstream |
| **Language** | French-first | EN | EN | FR |

**Defensible edge:** algorithmic curation + cinematheque tone + Letterboxd integration + multi-format corpus (video + audio + text + physical). No competitor combines all four.

---

## What the product does

### Film page — the core

For any given film, Deepdive aggregates in real time and filters by relevance:

- **Videos** — cinematheque presentations, film school lectures, academic analyses (no trailers, ever)
- **Podcasts** — French cultural shows that covered this film
- **Books** — essays, monographs, published scripts, AI-filtered to exclude anything not directly tied to the film or director
- **Physical editions** — collector Blu-rays, Criterion, Wild Side, with purchase links

Every item is scored, ranked, and user-votable. Content that accumulates enough downvotes is automatically hidden — no manual moderation needed.

### Personalized homepage

Connected to the user's Letterboxd account. The homepage becomes their cinephile diary: recently watched films, with available content for each.

### Cinephile trends *(in progress)*

Automatically detects recent obsessions (same director, same cinematic movement, same country, same decade) and suggests going deeper — surfaced on the homepage.

---

## Technical architecture

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
│  ├── youtube-search      YouTube API → scoring algo      │
│  ├── podcast-search      iTunes Podcasts                 │
│  ├── book-search         Open Library + Gemini AI        │
│  ├── french-editions     Firecrawl (scraping)            │
│  ├── letterboxd-feed     User diary parser               │
│  ├── analytics-data      Internal metrics dashboard      │
│  └── sitemap             SEO · dynamic XML               │
└──────────────────────────────────────────────────────────┘

External APIs: TMDB · YouTube Data API · Open Library
               iTunes · Firecrawl · Lovable AI Gateway
```

**Architecture rule:** all external API calls go through an Edge Function. Never direct from the client (key security, quota management, centralized cache).

---

## Notable technical features

### Video curation algorithm

Each query fires 4 parallel YouTube searches with different strategies (French cinematheque, post-screening Q&As, international essays, making-ofs). Results are merged, deduplicated, scored across ~15 signals (duration, channel, title, views, date), and user feedback (upvotes/downvotes) adjusts ranking in real time.

An automatic hide threshold removes videos that accumulate enough negative score — no manual intervention required.

### AI-powered book recommendations

Full migration to [Open Library](https://openlibrary.org) (free, no quota) after Google Books API quota exhaustion. Gemini 2.5 Flash scores each result on a strict grid (0–100): only books directly dedicated to the film, director, or exact cinematic movement pass the threshold of 45. Zero results is preferable to an irrelevant result.

### Internal analytics dashboard

Password-protected Edge Function, bypassing Supabase RLS via service role key. Computes the North Star metric (SAA), weekly KPIs, top films, content breakdown — aggregating all behavioral tables.

---

## Product strategy — documented

This repo contains the full product documentation, co-produced with a system of specialized AI agents:

| Document | Content |
|---|---|
| [`PRD.md`](./PRD.md) | Vision, stack, architecture, components, design rules |
| [`VISION_STRATEGIE.md`](./VISION_STRATEGIE.md) | Positioning, phases 1→4 roadmap, PMF criteria |
| [`DATA_STRATEGIE.md`](./DATA_STRATEGIE.md) | North Star (SAA), 5 primary KPIs, 8 secondary, funnels |
| [`ACQUISITION_STRATEGIE.md`](./ACQUISITION_STRATEGIE.md) | 0 to 50K MAU — channels, sequencing, budgets |
| [`PRD_SEO.md`](./PRD_SEO.md) | Full SEO audit, meta tags, JSON-LD, sitemap, 12-week plan |

---

## AI agent system

The product is built with a system of specialized Claude Code agents, each with a specific area of responsibility and full product context:

```
.claude/agents/
├── deepdive-head-of-product   Vision, arbitration, prioritization   (Claude Opus)
├── deepdive-ux                Design system, wireframes, Lovable briefs
├── deepdive-ux-researcher     Personas, synthetic studies, friction analysis
├── deepdive-analytics         SQL, KPIs, dashboards, funnels
├── deepdive-growth            Acquisition, SEO, retention, A/B testing
├── deepdive-recommender       YouTube/book algorithms, scoring, quality
└── deepdive-seo               Meta tags, JSON-LD, sitemap, long-tail
```

Each agent carries full product context (personas, design system, Supabase schema, architecture decisions) and can be invoked in parallel for multi-perspective analysis.

---

## North Star metric

**SAA — Active Deep-Dive Weeks** *(Semaines Actives Approfondissantes)*

> Number of users who explored ≥ 2 different films in a week, with ≥ 2 pieces of content consumed or saved per film.

This metric captures the product's essence: not a visit, a real exploration.

| M1 | M3 | M6 | M12 |
|---|---|---|---|
| 50 SAA | 200 | 800 | 3,000 |

---

## Stack

```
Frontend    React 18 · Vite 5 · TypeScript · Tailwind CSS · shadcn/ui
Backend     Supabase (PostgreSQL · Auth · Edge Functions · RLS)
Runtime     Deno (Edge Functions)
AI          Gemini 2.5 Flash via Lovable AI Gateway
APIs        TMDB · YouTube Data API · Open Library · iTunes · Firecrawl
Deploy      Lovable Cloud (auto CI/CD on push to main)
Typography  Fraunces (display serif) · Nunito (body)
```

---

## Running locally

```bash
git clone https://github.com/EricLePatron/deep-dive-cinema
cd deep-dive-cinema
cp .env.example .env.local   # fill in your Supabase credentials
npm install
npm run dev
```

Supabase Edge Functions are deployed automatically via Lovable on push to `main`.

---

## Design system

Editorial cinematheque aesthetic — inspired by MUBI Notebook and Letterboxd:

- Near-black background `#0A0A0A` · off-white text
- Zero accent color (no gold, no red)
- `rounded-sm` only — no generous border-radius
- Opacity-only hover states, no color shifts
- Semantic HSL tokens in `index.css` — no hardcoded colors in components

---

*Deepdive Cinema — 2026*
