

## Redesign cinéphile : style MUBI / Letterboxd

L'objectif : abandonner le côté "doré chaud / Playfair romantique" actuel pour adopter une esthétique plus **éditoriale, sobre et moderne** — celle des plateformes de référence cinéphiles. MUBI = noir profond, typo sans-serif élégante, beaucoup d'espace, accent rouge/blanc minimal. Letterboxd = vert/orange discret sur fond gris-bleu, posters au cœur du contenu, micro-typographie soignée.

### Direction visuelle

**Palette** (passage d'un système chaud doré à un noir éditorial)
- `background` : noir presque pur `#0E0E0E` (style MUBI) au lieu du bleu nuit actuel
- `foreground` : blanc cassé `#F5F2ED` 
- `muted` : gris neutre désaturé (plus de teinte chaude)
- `primary` : abandon du doré → blanc pur pour les CTA principaux (style MUBI), avec un accent secondaire **vert sourd** `#00D27A` (clin d'œil Letterboxd) ou **orange brûlé** `#E75A24` réservé aux ratings/badges
- `border` : très subtile `#1F1F1F`, parfois invisible — on sépare par l'espace plus que par le trait

**Typographie** (on quitte Playfair Display)
- Titres : **Instrument Serif** ou **GT Sectra** — un serif éditorial moderne, condensé, contemporain (vs Playfair qui fait "magazine luxe romantique")
- Corps : **Inter** conservé, mais en `font-weight 400` avec `tracking-tight`
- Petits labels : `uppercase tracking-[0.2em] text-[10px]` (style MUBI Notebook)
- Tabular nums systématiques pour années, durées, ratings

**Principes**
- Suppression totale des effets `cinema-glow`, `cinema-text-glow`, dégradés dorés et `pulse-glow`
- Cards sans bordure ni shadow — séparation par espace blanc uniquement
- Posters jamais arrondis au-delà de `rounded-sm` (MUBI/Letterboxd gardent des angles quasi droits)
- Hover : opacité subtile + sous-titrage qui apparaît, pas de scale/translate
- Animations : fondu uniquement, pas de mouvement vertical

### Refonte par écran

**1. `src/index.css` — système de design**
- Réécrire les tokens HSL (background, foreground, primary, muted, border)
- Supprimer les utilitaires `cinema-gold`, `cinema-text-glow`, `cinema-glow`, `pulse-glow`, `gold-gradient`
- Ajouter classes `.editorial-label` (uppercase tracking large) et `.poster-frame` (angles droits, ratio 2:3)
- Charger Instrument Serif via Google Fonts à la place de Playfair

**2. `tailwind.config.ts`**
- `fontFamily.display` → `Instrument Serif`
- Retirer la palette `cinema.*` (gold, warm, surface-elevated)
- Retirer keyframes `pulse-glow` et `gold-gradient`

**3. `src/components/Header.tsx`**
- Logo : remplacer la "tuile dorée + icône Film" par un wordmark pur `DEEPDIVE` en serif fin (style "MUBI" wordmark)
- Header toujours transparent en haut, devient une fine ligne `border-b` au scroll (pas de glass blur lourd)
- Boutons : ghost très discrets, juste icônes 16px

**4. `src/pages/Index.tsx` — homepage**
- Hero : passer de 70vh "spotlight image + CTA" à un **hero éditorial type MUBI Notebook** : grande image plein cadre, surimpression d'un kicker `FILM DU JOUR / À L'AFFICHE`, titre du film en serif énorme, une ligne de baseline, c'est tout. La SearchBar disparaît du hero (déjà accessible via loupe header).
- Sections : retirer les icônes colorées (Heart, Clapperboard, TrendingUp). Remplacer par un simple label éditorial uppercase `— À L'AFFICHE` au-dessus du titre serif
- Rangées de films : posters plus petits, espacés, sans hover-scale. Titre en dessous en `text-sm`, année en `text-xs text-muted` sur ligne séparée (Letterboxd pattern)

**5. `src/components/FilmCard.tsx`**
- `rounded-xl` → `rounded-sm`
- Retirer `poster-shadow` et `group-hover:scale-105`
- Hover : juste `group-hover:opacity-90`
- Métadonnées sous le poster : `font-medium text-[13px]` titre / `text-[11px] text-muted tabular-nums` année — sur deux lignes

**6. `src/pages/FilmDeepDive.tsx`**
- Hero conservé (déjà épuré) mais :
  - Titre en nouvelle serif Instrument Serif
  - Retirer le badge Letterboxd à pilule arrondie → simple ligne `— Vu · ★ 4/5` en uppercase tracking large
  - Boutons Sauvegarder/Partager : variants ghost minimaux, pas de gold gradient
- Bandeau synopsis : titre `SYNOPSIS` en kicker uppercase 10px, corps en serif léger 18px (style éditorial magazine)
- Tabs : déjà épurés, juste switcher la typo et caler le state actif sur underline blanc 1px

**7. Cards de contenu (`BookCard`, `YouTubeVideoCard`, `PodcastCard`)**
- Fond transparent (pas de `content-card` élevé)
- Séparation par grille avec gap large + bordure top fine `border-t border-border/30` optionnelle
- Image/cover en angles droits

### Détails techniques

**Fichiers modifiés**
- `src/index.css` (tokens + fonts + utilitaires)
- `tailwind.config.ts` (font-family, suppression palette cinema)
- `src/components/Header.tsx` (wordmark, transparence)
- `src/components/FilmCard.tsx` (poster nu, méta sobre)
- `src/pages/Index.tsx` (hero éditorial, sections sans icônes colorées)
- `src/pages/FilmDeepDive.tsx` (kickers uppercase, tabs underline)
- `src/components/BookCard.tsx`, `YouTubeVideoCard.tsx`, `PodcastCard.tsx` (cards plates)
- `mem://style/design-principles` (mise à jour : MUBI/Letterboxd, Instrument Serif, palette neutre, accent vert sourd)

**Hors scope** : aucune logique métier modifiée (algorithmes YouTube, books, podcasts, Letterboxd intacts). Pure refonte visuelle.

**Risque** : la suppression des classes `cinema-gold*` cassera tout composant qui les référence — un grep sera fait avant édition pour neutraliser proprement (variant `cinema-gold` du Button, classes utilitaires dans Footer, etc.).

