# PRD — Tendances de ta cinéphilie

> Feature homepage personnalisée — détection et surface des obsessions cinéphiles de l'utilisateur

**Statut** : À implémenter  
**Priorité** : P1  
**Surface** : Homepage (`/`)  
**Condition d'affichage** : utilisateur connecté + Letterboxd lié + ≥ 3 films vus en 30 jours

---

## 1. Problème

Un utilisateur connecté avec Letterboxd revient sur Deepdive après avoir vu 6 films de Wong Kar-wai en deux semaines. La homepage lui montre les mêmes films tendance globaux qu'à n'importe quel visiteur anonyme. Il ne se sent pas reconnu. Le produit ne capitalise pas sur la donnée la plus précieuse qu'il possède : ce que l'utilisateur a regardé récemment.

## 2. Objectif

Détecter automatiquement une obsession cinéphile dans le diary de l'utilisateur (réalisateur, genre, pays, décennie) et la lui révéler sous forme d'une section éditoriale personnalisée avec des films Deepdive à explorer dans cette direction.

---

## 3. Logique métier — Algorithme de détection

### 3.1 Fenêtre temporelle
Analyser les **30 derniers jours** du diary Letterboxd de l'utilisateur.  
Minimum requis : **3 films dans la fenêtre** pour déclencher la feature.

### 3.2 Données source
Pour chaque film du diary dans la fenêtre, récupérer via TMDB (déjà appelé dans `personalizedFilms`) :
- `director` (string) — depuis `getMovieCredits`
- `genres` (string[]) — depuis `getMovieDetails`
- `origin_country` (string) — depuis `getMovieDetails`, champ `production_countries[0].name`
- `release_date` → décennie calculée : `Math.floor(year / 10) * 10` (ex: 1970, 1980, 2000...)

### 3.3 Scoring des dimensions

Pour chaque dimension (réalisateur, genre, pays, décennie), compter les occurrences pondérées :

```
score(dimension, valeur) = Σ poids(film_i)
```

**Poids d'un film :**
- Film vu il y a **0–7 jours** → poids `1.3`
- Film vu il y a **8–30 jours** → poids `1.0`

**Score minimum pour déclencher une tendance : 2.5** (≈ 2 films récents ou 3 films classiques sur la même dimension)

### 3.4 Sélection de la tendance

Calculer les scores pour toutes les valeurs de toutes les dimensions.  
Sélectionner **la valeur avec le score le plus élevé**, en respectant cet ordre de priorité en cas d'égalité :
1. Réalisateur (signal le plus fort, le plus intentionnel)
2. Pays
3. Genre
4. Décennie

**Ne pas afficher une tendance "Drame"** (trop générique). Blacklist des genres à exclure : `["Drame", "Comédie", "Action", "Thriller", "Drama", "Comedy"]`

### 3.5 Titre éditorial de la tendance

Générer un titre selon la dimension détectée :

| Dimension | Template | Exemple |
|---|---|---|
| Réalisateur | `"Une obsession : {prénom} {nom}"` | "Une obsession : Wong Kar-wai" |
| Pays | `"Un voyage au cinéma {pays}"` | "Un voyage au cinéma iranien" |
| Genre | `"Une saison {genre}"` | "Une saison horreur" |
| Décennie | `"Les années {décennie}"` | "Les années 70" |

**Ligne de contexte sous le titre :**
`"{N} films en {M} jours"` — N = nombre de films dans la fenêtre sur cette dimension, M = écart entre le plus ancien et le plus récent (arrondi à la semaine si < 14 jours, sinon en jours).

### 3.6 Films suggérés

Trouver **4 à 6 films** à recommander dans la direction détectée, qui :
1. **Ne sont PAS dans le diary de l'utilisateur** (ne pas suggérer ce qu'il a déjà vu)
2. **Ont du contenu riche sur Deepdive** : `film_content_stats` avec `video_count >= 3` OU `(podcast_count >= 1 AND book_count >= 1)`
3. **Correspondent à la tendance** : même réalisateur OU même pays OU même genre OU même décennie

**Source des suggestions :**
- Pour **réalisateur** : chercher via TMDB `GET /person/{director_id}/movie_credits` les films avec `vote_count > 1000`, puis filtrer par richesse Deepdive
- Pour **pays / genre / décennie** : chercher via TMDB `GET /discover/movie` avec les filtres correspondants (`with_origin_country`, `with_genres`, `primary_release_date.gte/lte`), trié par `vote_average`, puis filtrer par richesse Deepdive

Si moins de 2 films suggestions trouvés → ne pas afficher la section.

---

## 4. Composants à créer

### 4.1 Hook — `useCinephileTrend`

**Fichier :** `src/hooks/useCinephileTrend.ts`

```typescript
export interface CinephileTrend {
  dimension: 'director' | 'country' | 'genre' | 'decade';
  value: string;           // ex: "Wong Kar-wai", "Iran", "Horreur", "1970"
  directorId?: number;     // si dimension === 'director', pour la requête TMDB
  score: number;
  filmCount: number;       // nombre de films de l'utilisateur dans cette tendance
  daySpan: number;         // écart en jours entre le plus ancien et le plus récent
  editorialTitle: string;  // "Une obsession : Wong Kar-wai"
  contextLine: string;     // "5 films en 18 jours"
  suggestions: TrendFilm[];
}

export interface TrendFilm {
  id: number;
  title: string;
  year: number;
  posterUrl: string | null;
}
```

Le hook prend en entrée `personalizedFilms` (déjà disponible dans `Index.tsx`) avec leurs métadonnées TMDB. Il retourne `{ trend: CinephileTrend | null, isLoading: boolean }`.

**Important :** ne déclencher le hook que si `personalizedFilms.length >= 3`. Utiliser `staleTime: 1000 * 60 * 30` (les tendances ne changent pas vite).

### 4.2 Composant — `CinephileTrendSection`

**Fichier :** `src/components/CinephileTrendSection.tsx`

**Props :**
```typescript
interface Props {
  trend: CinephileTrend;
}
```

**Structure visuelle :**

```
[border-t border-border]
[section py-14 px-6]

  — TENDANCES DE TA CINÉPHILIE          ← editorial-label, text-foreground/50
  
  [titre Fraunces, text-3xl md:text-4xl] ← trend.editorialTitle
  [contexte, text-sm text-foreground/50] ← trend.contextLine
  
  [grille de 4–6 FilmCard, gap-4]
    → chaque carte : poster + titre + année + lien vers /film/:id
  
  [lien discret] "Explorer →"           ← uniquement si dimension = réalisateur
                                            → pointe vers /film/:id du film le + connu
```

**Règles de design :**
- Fond : identique au reste de la page (`bg-background`) — pas de fond alterné
- Aucune couleur d'accent, aucun badge, aucun gradient
- Les posters en `rounded-sm`, ratio `2/3`
- Hover state : `opacity-80` sur l'image uniquement
- Sur mobile : grille 2 colonnes
- Sur desktop : grille 4 colonnes (ou 3 si 3 suggestions seulement)

---

## 5. Intégration dans la Homepage

**Fichier concerné :** `src/pages/Index.tsx`

### 5.1 Position dans la page

```
<Header />
<DiaryHero /> ou <ValuePropHero />      ← existant
<CinephileTrendSection />               ← NOUVEAU — ici, juste après le hero
<DiaryContentHighlights />              ← existant
<TrendingSection />                     ← existant
<EditorialFilmsSection />               ← existant
<LetterboxdOnboarding />               ← existant
<SiteFooter />                         ← existant
```

### 5.2 Condition d'affichage

```tsx
{hasDiary && trend && (
  <CinephileTrendSection trend={trend} />
)}
```

Pas d'état de chargement visible — si `isLoading` est true, simplement ne pas rendre la section (pas de skeleton, pas de spinner). La section apparaît silencieusement quand prête.

---

## 6. États à gérer

| État | Comportement |
|---|---|
| Utilisateur non connecté | Section absente |
| Connecté mais Letterboxd non lié | Section absente |
| < 3 films en 30 jours | Section absente |
| Score max < 2.5 | Section absente (pas de tendance détectée) |
| Tendance détectée, < 2 suggestions | Section absente |
| Tendance détectée, ≥ 2 suggestions | Section affichée |
| Erreur TMDB sur les suggestions | Section absente (fail silently) |

**Principe :** la section est optionnelle et additive. Elle n'apparaît que quand elle a quelque chose de pertinent à dire. Jamais d'état vide, jamais de message "aucune tendance détectée".

---

## 7. Ce qu'il ne faut PAS faire

- ❌ Afficher un pourcentage ou un score visible — trop algorithmique
- ❌ Afficher plus d'une tendance à la fois — choisir la meilleure, pas un carrousel
- ❌ Proposer un film déjà dans le diary de l'utilisateur
- ❌ Suggérer des films sans contenu Deepdive (évite les pages vides)
- ❌ Mettre un fond de couleur ou un accent visuel sur cette section — même sobriété que le reste
- ❌ Utiliser le mot "algorithme", "recommandation", "parce que vous avez aimé"
- ❌ Afficher la section si la tendance détectée est un genre trop générique (Drame, Comédie...)

---

## 8. Fichiers à créer / modifier

| Action | Fichier |
|---|---|
| **Créer** | `src/hooks/useCinephileTrend.ts` |
| **Créer** | `src/components/CinephileTrendSection.tsx` |
| **Modifier** | `src/pages/Index.tsx` — appel du hook + rendu conditionnel |

---

## 9. Critère de succès

Un utilisateur qui a vu 4 films d'un même réalisateur en 3 semaines voit apparaître sur sa homepage la section avec le titre éditorial correct, 4 films du même réalisateur qu'il n'a pas encore vus, et peut cliquer directement sur une page film Deepdive riche en contenu.
