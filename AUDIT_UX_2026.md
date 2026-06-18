# Audit UX & UI — Deepdive Cinema
**Date :** 18 juin 2026
**Auditeur :** deepdive-design (Claude Sonnet 4.6)
**Base de code analysée :** src/pages/, src/components/, src/index.css

---

## Méthode

Lecture exhaustive de tous les composants de page (Index.tsx, FilmDeepDive.tsx, Favorites.tsx, Diary.tsx), de la navbar (Header.tsx), de chaque card (FilmCard, YouTubeVideoCard, ArticleCard, BookCard, PodcastCard, PhysicalMediaSection), des sections homepage (DiaryContentHighlights, DiaryExtraHighlights, CinephileTrendSection) et du design system (index.css, ContentSection). Comptage réel des éléments visuels par zone.

---

## Résumé exécutif

Le retour "trop fouillis" est fondé et localisable. Le problème n'est pas diffus — il a trois origines précises :

1. **La homepage connectée empile 7 sections distinctes** sans hiérarchie claire entre elles. L'utilisateur ne sait pas où regarder en premier.
2. **L'onglet Aperçu de la page film déclenche 6 sous-sections simultanément**, dont deux sur les vidéos, sans différenciation visuelle suffisante.
3. **Chaque card vidéo affiche 4 boutons d'action sans libellé** (favori, vu, pouce haut, pouce bas), créant une barre opaque que P4 ne comprend pas.

Ces trois problèmes expliquent à eux seuls 80 % du sentiment de fouillis. Les autres points sont réels mais secondaires.

---

## 1. Homepage — Inventaire des sections

### État connecté (avec diary Letterboxd)

| # | Section | Composant | Éléments visibles |
|---|---------|-----------|-------------------|
| 1 | Hero diary (backdrop plein écran) | `DiaryHero` | 1 image + titre + synopsis tronqué + lien |
| 2 | Tendances cinéphiles | `CinephileTrendSection` | 4 affiches + titre éditorial + contextLine |
| 3 | Vos derniers films | `FilmRowSection` | 8 affiches en scroll horizontal |
| 4 | À explorer (vidéos diary) | `DiaryContentHighlights` | 3 cards vidéo avec vignette + info film + métadonnées |
| 5 | Podcasts sur vos films | `DiaryExtraHighlights` > Section | 3 cards podcast |
| 6 | Articles sur vos films | `DiaryExtraHighlights` > Section | 3 cards article |
| 7 | Tendances avec du contenu | `FilmRowSection` | 10 affiches en scroll horizontal |
| 8 | À l'affiche | `FilmRowSection` | 10 affiches en scroll horizontal |
| 9 | Footer | `SiteFooter` | liens légaux |

**Total : 8 sections de contenu actif** sur une seule page. Trois rangées de films horizontales (sections 3, 7, 8) se suivent dans la même moitié basse de la page avec une différenciation uniquement textuelle. Pour P4, c'est illisible.

### État non-connecté

| # | Section | Éléments |
|---|---------|----------|
| 1 | Hero value-prop | Tagline + SearchBar + grille 4 ValueItems |
| 2 | Exemple deep dive | 3 affiches éditoriales avec compteurs |
| 3 | Onboarding Letterboxd | Encart CTA |
| 4 | Tendances avec du contenu | 10 affiches |
| 5 | À l'affiche | 10 affiches |

**Total : 5 sections.** Plus raisonnable, mais les sections 4 et 5 sont visuellement identiques (même composant `FilmRowSection`, même style, seul le kicker change).

---

## 2. Page Film — Inventaire de la zone Aperçu

L'onglet Aperçu (`TabsContent value="overview"`) contient jusqu'à **6 sous-sections actives simultanément** :

| # | Sous-section | Contenu affiché |
|---|-------------|-----------------|
| 1 | Articles & critiques | 1 card featured (grande) + 2 cards compactes |
| 2 | Livres & essais | 3 BookCards |
| 3 | Autour du tournage | 3 YouTubeVideoCards |
| 4 | Regards & analyses | 3 YouTubeVideoCards |
| 5 | Podcasts | 3 PodcastCards |
| 6 | Éditions physiques | `PhysicalMediaSection` complète |

C'est-à-dire potentiellement **16 éléments de contenu cliquables** dans un seul onglet censé être un "aperçu". Les sections 3 et 4 sont deux grilles de vidéos consécutives que l'utilisateur distingue uniquement par leur titre — le rendu visuel est identique.

En parallèle, la zone d'identité du film (avant les onglets) contient déjà :
- Hero backdrop
- Poster
- Titre + titre original
- Métadonnées en ligne (année · durée · note · statut vu)
- Lien réalisateur
- Pastilles genres
- 2 boutons d'action (Sauvegarder / Partager)
- Synopsis (potentiellement 4 lignes)
- Casting 6 membres (grille 2 colonnes avec photos)

**Soit ~25 éléments distincts avant même d'atteindre les onglets.**

---

## 3. Analyse par problème

---

### PROBLÈME 1 — Homepage connectée : 3 rangées de films identiques

**Criticité : CRITIQUE**

Les sections "Vos derniers films" (8 affiches), "Tendances avec du contenu" (10 affiches), "À l'affiche" (10 affiches) utilisent le même composant `FilmRowSection` avec la même apparence. Dans la moitié basse de la page, l'utilisateur fait face à 28 affiches de films en scroll horizontal, réparties en 3 lignes que seul un kicker textuel 11px différencie. C'est visuellement indistinguable pour un oeil non formé.

**Cause code :** `Index.tsx` lignes 139–183, le composant `FilmRowSection` est appelé 3 fois avec les mêmes paramètres visuels, seul `kicker` et `title` varient.

**Impact personas :** P4 (curieux en transition) décroche. P2 (Letterboxd) ne voit pas immédiatement "ses" films distincts des films éditoriaux.

---

### PROBLÈME 2 — Onglet Aperçu : doublon vidéos + surcharge

**Criticité : CRITIQUE**

L'onglet "Aperçu" affiche deux sections vidéo successives ("Autour du tournage" et "Regards & analyses") dans des grilles 3 colonnes visuellement identiques. L'utilisateur reçoit 6 vignettes vidéo qui se ressemblent, séparées uniquement par un titre. La distinction éditoriale (making-of vs analyse critique) est réelle intellectuellement mais imperceptible visuellement.

De plus, l'Aperçu contient déjà articles + livres + 2 x vidéos + podcasts + éditions : c'est un onglet qui contient autant de matière que le reste des onglets réunis. L'intention "best-of" est contredite par la quantité.

**Cause code :** `FilmDeepDive.tsx` lignes 487–525 (deux blocs `div` avec `SectionHeader` + grille 3 col), distincts uniquement par `title` et `count`.

---

### PROBLÈME 3 — Barre d'actions des cards vidéo : 4 icônes sans libellé

**Criticité : CRITIQUE**

Chaque `YouTubeVideoCard` affiche une "feedback bar" contenant : `FavoriteButton` (signet), `ConsumedButton` (oeil/check), `ThumbsUp`, `ThumbsDown`. Soit 4 boutons, tous sans libellé textuel visible, tous du même poids visuel (11px, muted).

- Le signet et l'oeil sont des icônes de feedback personnel (sauvegarder / marquer vu).
- Les pouces sont du feedback éditorial (recommander à d'autres).
- Ces deux logiques cohabitent dans la même barre sans séparation ni explication.
- P4 ne comprend pas à quoi sert "pouce bas" et ne voit aucune différence avec "pouce haut".

**Cause code :** `YouTubeVideoCard.tsx` lignes 124–159. Les 4 boutons sont alignés dans un même `div` sans séparateur ni tooltip visible au premier coup d'oeil (`aria-label` existe mais n'est pas affiché).

**Note :** Le `ConsumedButton` utilise `title` (tooltip natif), mais le `FavoriteButton` et les pouces n'en ont pas. L'`aria-label` n'est pas un tooltip visible.

---

### PROBLÈME 4 — Mélange de deux design tokens typographiques

**Criticité : IMPORTANT**

Le système de design définit Fraunces comme police d'affichage et Nunito comme police de corps. Mais `ContentSection.tsx` (utilisé par `PhysicalMediaSection`) utilise `font-display text-xl font-semibold` avec un `font-weight: 500` hérité du CSS global, mais surcharge avec `font-semibold` (600) — ce qui crée un rendu différent des autres `SectionHeader` qui n'utilisent pas `font-semibold`. Incohérence visible entre la section Éditions et les autres sections de l'Aperçu.

En outre, `ContentSection` affiche le compteur en anglais : "X results found" (ligne 37 du fichier). Le reste du produit est entièrement en français.

**Cause code :** `ContentSection.tsx` ligne 37 : `{count} {count === 1 ? "result" : "results"} found`.

---

### PROBLÈME 5 — Navigation : zéro lien de destination pour un visiteur non-connecté

**Criticité : IMPORTANT**

La navbar (`Header.tsx`) en mode non-connecté contient uniquement : logo + icône recherche + bouton "Se connecter". Il n'existe aucun lien vers une page "Explorer les films" ou une liste éditoriale. Un visiteur qui arrive sans contexte ne peut naviguer que via la SearchBar ou les 3 exemples éditoriaux hard-codés. Si la recherche ne retourne rien d'immédiatement intéressant, il n'a nulle part où aller.

**Cause code :** `Header.tsx` lignes 92–126. La branche `user = null` ne rend que le bouton de connexion.

---

### PROBLÈME 6 — DiaryContentHighlights : header rupture de style

**Criticité : MODÉRÉ**

`DiaryContentHighlights` utilise un `SectionHeader` interne avec `Heart` (icône en couleur `text-primary`) et `font-bold` (lignes 127–145). C'est la seule section de toute la homepage qui utilise une icône colorée et du gras en titre. Toutes les autres sections utilisent `editorial-label` + `font-display` sans gras. Cette rupture de style crée une incohérence visuelle perceptible même sans analyse.

**Cause code :** `DiaryContentHighlights.tsx` lignes 127–145 : `font-display text-xl md:text-3xl font-bold` + `Heart className="h-5 w-5 text-primary"`.

---

### PROBLÈME 7 — FilmCard : stats trop petites et ambigu

**Criticité : MODÉRÉ**

Les `FilmCard` avec stats affichent 3 indicateurs de contenu (vidéos / podcasts / livres) en `text-[10px]` avec des icônes `h-2.5 w-2.5`. À cette taille, les icônes sont illisibles sur la majorité des écrans. De plus, ces stats n'ont pas de libellé : un utilisateur qui ne connaît pas le produit ne sait pas ce que signifient les 3 chiffres.

**Cause code :** `FilmCard.tsx` lignes 52–56.

---

### PROBLÈME 8 — SearchBar : résultats en anglais (état vide)

**Criticité : MODÉRÉ**

Quand une recherche ne retourne aucun résultat, la SearchBar affiche : `"No films found for [query]"` et `"Try a different search term"`. Le produit est en français, ce message est en anglais.

**Cause code :** `SearchBar.tsx` lignes 133–135.

---

### PROBLÈME 9 — Page Favoris : état vide peu accueillant

**Criticité : MODÉRÉ**

Quand l'utilisateur n'a aucun favori, le message affiché est : "Aucun favori pour l'instant. Cliquez sur l'icône signet sur un article, une vidéo, un livre ou un podcast." C'est une instruction correcte mais froide, sans CTA, sans visuel, sans lien vers le contenu. Pour P4 qui découvre, c'est une impasse.

**Cause code :** `Favorites.tsx` ligne 123.

---

### PROBLÈME 10 — Deux séparateurs de section différents

**Criticité : MODÉRÉ**

Certaines sections utilisent `border-t border-border/60` (standard), d'autres `border-t border-border` (sans opacité), d'autres `border-t border-border/40`. Trois variantes du même séparateur sans raison sémantique visible. La règle du design system (`border-t border-border/60`) n'est pas appliquée uniformément.

Exemples : `CinephileTrendSection.tsx` ligne 21 (`border-t border-border`), `FilmDeepDive.tsx` ligne 697 (`border-t border-border/40`), `FilmDeepDive.tsx` ligne 337 (`border-b border-border/60`).

---

## 4. Synthèse priorisée

### CRITIQUE — Fouillis structurel immédiat

| ID | Problème | Fichiers principaux |
|----|---------|---------------------|
| P1 | Homepage : 3 rangées de films identiques empilées | `Index.tsx` |
| P2 | Aperçu film : 6 sous-sections + 2 grilles vidéo identiques | `FilmDeepDive.tsx` |
| P3 | Card vidéo : 4 boutons sans libellé ni séparation sémantique | `YouTubeVideoCard.tsx` |

### IMPORTANT — Cohérence et navigation

| ID | Problème | Fichiers principaux |
|----|---------|---------------------|
| P4 | `ContentSection` : poids typographique incohérent + texte en anglais | `ContentSection.tsx` |
| P5 | Navbar non-connectée : aucun lien de destination | `Header.tsx` |

### MODÉRÉ — Finitions et accueil

| ID | Problème | Fichiers principaux |
|----|---------|---------------------|
| P6 | `DiaryContentHighlights` : rupture de style (icône colorée + bold) | `DiaryContentHighlights.tsx` |
| P7 | FilmCard stats : 10px illisible, sans libellé | `FilmCard.tsx` |
| P8 | SearchBar : message d'erreur en anglais | `SearchBar.tsx` |
| P9 | Page Favoris : état vide sans CTA | `Favorites.tsx` |
| P10 | Séparateurs incohérents (3 variantes de border-border) | Multiple |

---

## 5. Quick wins vs refonte

### Quick wins (< 1 heure de dev chacun)

- P4 : changer "X results found" en "X éditions trouvées" dans `ContentSection.tsx`
- P8 : traduire les 2 chaînes anglaises dans `SearchBar.tsx`
- P10 : standardiser tous les séparateurs sur `border-border/60`
- P6 : supprimer `font-bold` et `text-primary` du `SectionHeader` de `DiaryContentHighlights`, aligner sur le style éditorial standard

### Moyens (2–4 heures de dev)

- P3 : ajouter des tooltips visibles + regrouper les boutons en 2 clusters distincts (personnel / éditorial)
- P7 : passer les stats FilmCard à `text-[11px]` et ajouter un titre "Contenu disponible"
- P9 : enrichir l'état vide Favoris avec une suggestion de film à explorer

### Structurel (demi-journée de dev, brief Lovable requis)

- P1 : différencier visuellement les 3 rangées de films homepage (voir LOVABLE_homepage-film-rows.md)
- P2 : reformater l'onglet Aperçu en vrai best-of condensé (voir LOVABLE_apercu-best-of.md)
- P5 : ajouter des liens de navigation pour les visiteurs non-connectés (voir LOVABLE_navbar-anonymous.md)

---

## 6. Briefs Lovable associés

Les briefs détaillés sont sauvegardés dans les fichiers suivants :

- `/home/user/deep-dive-cinema/LOVABLE_homepage-film-rows.md` — Problème P1
- `/home/user/deep-dive-cinema/LOVABLE_apercu-best-of.md` — Problème P2
- `/home/user/deep-dive-cinema/LOVABLE_video-card-actions.md` — Problème P3
- `/home/user/deep-dive-cinema/LOVABLE_navbar-anonymous.md` — Problème P5

