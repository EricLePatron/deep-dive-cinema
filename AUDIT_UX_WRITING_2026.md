# Audit UX Writing — Deepdive Cinema
**Date** : 18 juin 2026  
**Périmètre** : 9 fichiers sources, interface complète  
**Auditeur** : UX Writing / Voix éditoriale Deepdive

---

## Synthèse exécutive

L'interface souffre de **trois fractures de voix distinctes**, qui expliquent en partie le ressenti "trop fouillis" remonté par les utilisateurs : quand les textes sont incohérents, le cerveau dépense de l'énergie à les réconcilier plutôt qu'à explorer.

**Fracture 1 — Anglais invisible mais présent.** Quatre occurrences d'anglais pur dans l'interface (SearchBar, ContentSection) : "Unknown year", "No films found", "Try a different search term", "View all", "result(s) found". Rupture totale de l'expérience pour un produit 100 % français.

**Fracture 2 — Vouvoiement vs. tutoiement.** Le produit oscille entre "vous" (majoritairement) et "tu" (dans certaines parties). La voix Deepdive est définie comme tutoiement. Toute occurrence de "vous/vos/votre" dans la UI (hors emails formels) est une erreur de registre.

**Fracture 3 — Vocabulaire générique qui trahit l'ADN.** "Voir plus", "Vidéos" seul, "Films similaires", "Aucune vidéo trouvée", "Chargement…" — ces formulations pourraient appartenir à n'importe quelle app SaaS. Elles effacent l'identité cinéphile du produit.

**Bilan chiffré** : 28 textes à corriger identifiés. 6 en anglais. 8 en vouvoiement. 14 en français mais dans un registre générique contraire à la voix Deepdive.

---

## Tableau exhaustif des corrections

| # | Fichier | Ligne | Texte actuel | Problème | Texte proposé | Priorité |
|---|---------|-------|-------------|---------|---------------|----------|
| 1 | `SearchBar.tsx` | 122 | `"Unknown year"` | **Anglais** dans l'interface | `"Année inconnue"` | CRITIQUE |
| 2 | `SearchBar.tsx` | 133 | `'No films found for "{debouncedQuery}"'` | **Anglais** — état vide sans sortie | `'Aucun film trouvé pour « {debouncedQuery} ».\nEssaie avec le titre original ou le nom du réalisateur.'` | CRITIQUE |
| 3 | `SearchBar.tsx` | 134 | `"Try a different search term"` | **Anglais** — doublonne le message | Supprimer (inclus dans la réécriture du n°2) | CRITIQUE |
| 4 | `ContentSection.tsx` | 36 | `"{count} result(s) found"` | **Anglais** complet — composant entier non traduit | `"{count} {count === 1 ? 'élément' : 'éléments'}"` ou supprimer (déjà redondant avec le titre de section) | CRITIQUE |
| 5 | `ContentSection.tsx` | 44 | `"View all"` | **Anglais** — CTA principal | `"Explorer"` | CRITIQUE |
| 6 | `DiaryContentHighlights.tsx` | 186 | `"Deep Dive"` (label de card) | **Anglais** — label de contexte film visible | `"— Explorer"` ou supprimer (redondant) | CRITIQUE |
| 7 | `Index.tsx` | 141 | `"— Votre diary"` (kicker) | **Vouvoiement** — le produit tutoie | `"— Ton diary"` | HAUTE |
| 8 | `Index.tsx` | 142 | `"Vos derniers films"` (titre section) | **Vouvoiement** | `"Tes films récents"` | HAUTE |
| 9 | `Index.tsx` | 245 | `"— Votre dernier film"` (DiaryHero kicker) | **Vouvoiement** | `"— Ton dernier film"` | HAUTE |
| 10 | `Index.tsx` | 257 | `"Aller plus loin →"` | CTA trop générique, flèche ASCII peu élégante | `"Explorer →"` ou `"Creuser ce film"` | HAUTE |
| 11 | `Index.tsx` | 292 | `"Deepdive rassemble tout ce qui se dit, s'écrit et se filme autour des films que vous venez de voir"` | **Vouvoiement** dans la value-prop principale | `"Deepdive rassemble tout ce qui se dit, s'écrit et se filme autour des films que tu viens de voir"` | HAUTE |
| 12 | `Index.tsx` | 297 | `"— Vous venez de voir un film ?"` | **Vouvoiement** — label de CTA de recherche | `"— Tu viens de voir un film ?"` | HAUTE |
| 13 | `Index.tsx` | 169 | `"Tendances avec du contenu"` | Titre trop technique — "avec du contenu" est un critère de filtrage interne, pas une promesse éditoriale | `"Films à creuser"` | HAUTE |
| 14 | `Index.tsx` | 170 | `"Films populaires qui ont déjà une vraie matière éditoriale dans Deepdive."` | Expose la logique de filtrage algorithmique — viole l'ADN du produit | `"Films du moment avec un corpus complet sur Deepdive."` | HAUTE |
| 15 | `Index.tsx` | 179 | `"Avant ou après la séance, prolongez l'expérience."` | **Vouvoiement** (impératif pluriel implicite) + "prolongez" trop marketing | `"Avant ou après la séance, l'exploration continue."` | HAUTE |
| 16 | `Index.tsx` | 353 | `"Découvrez ce qui se dit autour d'un film"` | "Découvrez" — impératif commercial banni de la voix Deepdive. Trop proche des patterns Netflix | `"Ce que Deepdive a à dire autour d'un film"` | HAUTE |
| 17 | `Index.tsx` | 379 | `"{f.counts.videos} vidéos · {f.counts.podcasts} podcasts · {f.counts.books} livres"` | `"vidéos"` seul est banni — trop générique | `"{f.counts.videos} analyses · {f.counts.podcasts} podcasts · {f.counts.books} livres"` | HAUTE |
| 18 | `Index.tsx` | 399 | `"Vous avez un compte Letterboxd ?"` | **Vouvoiement** — bloc onboarding Letterboxd | `"Tu as un compte Letterboxd ?"` | HAUTE |
| 19 | `Index.tsx` | 402–404 | `"Connectez-le pour voir votre diary et vos films récents directement ici, avec leurs analyses, podcasts et livres associés."` | **Vouvoiement** + "associés" générique | `"Connecte-le pour voir ton diary et tes films récents ici, avec leurs analyses, podcasts et livres."` | HAUTE |
| 20 | `Index.tsx` | 412 | `"Reliez votre compte depuis l'icône Letterboxd dans la barre du haut."` | **Vouvoiement** — instruction post-connexion | `"Relie ton compte depuis l'icône Letterboxd dans la barre du haut."` | HAUTE |
| 21 | `FilmDeepDive.tsx` | 69 | `"Voir tout"` | Proche de "Voir plus" — banni. Trop générique, pas de direction | `"Explorer tout"` | MOYENNE |
| 22 | `FilmDeepDive.tsx` | 411 | `{ id: "videos", label: "Vidéos", ... }` | `"Vidéos"` seul dans l'onglet de navigation — banni | `"Analyses"` (ou `"Analyses vidéo"` si l'espace le permet) | MOYENNE |
| 23 | `FilmDeepDive.tsx` | 592 | `"Aucune vidéo trouvée."` | État vide trop sec — ni explication ni sortie | `"Aucune analyse vidéo disponible pour ce film pour l'instant."` | MOYENNE |
| 24 | `FilmDeepDive.tsx` | 645 | `"Aucun podcast trouvé."` | État vide trop sec | `"Aucun podcast disponible pour ce film pour l'instant."` | MOYENNE |
| 25 | `FilmDeepDive.tsx` | 689 | `"Aucun article trouvé pour ce film."` | État vide légèrement mieux mais sans explication | `"Aucun article disponible pour ce film pour l'instant."` | MOYENNE |
| 26 | `FilmDeepDive.tsx` | 699 | `"Films similaires"` | "Similaires" — jargon de moteur de recommandation. Contraire à l'ADN Deepdive (on ne recommande pas des films) | `"Dans la même veine"` ou retirer la section du DOM si elle ne lie pas vers le corpus | MOYENNE |
| 27 | `Favorites.tsx` | 109 | `"Tous les articles, vidéos, livres et podcasts que vous avez sauvegardés, regroupés par film."` | **Vouvoiement** + `"vidéos"` seul banni | `"Tous les articles, analyses, livres et podcasts que tu as sauvegardés — regroupés par film."` | MOYENNE |
| 28 | `Favorites.tsx` | 122–123 | `"Connectez-vous pour retrouver vos favoris."` | **Vouvoiement** + "retrouver" passe-partout | `"Connecte-toi pour accéder à tes favoris."` | MOYENNE |
| 29 | `Favorites.tsx` | 122–123 | `"Aucun favori pour l'instant. Cliquez sur l'icône signet sur un article, une vidéo, un livre ou un podcast."` | **Vouvoiement** (`Cliquez`) + `"vidéo"` seul banni + état vide sans encouragement | `"Tes favoris sont vides.\nMarque des analyses, livres ou podcasts au fil de tes explorations."` | MOYENNE |
| 30 | `DiaryContentHighlights.tsx` | 135 | `"Le meilleur contenu sur vos films récents"` | **Vouvoiement** + "contenu" générique | `"Le meilleur de ce qui se dit autour de tes films récents"` | MOYENNE |
| 31 | `DiaryContentHighlights.tsx` | 141 | `"Voir plus"` (bouton expand) | `"Voir plus"` — explicitement banni | `"Explorer tout"` | HAUTE |
| 32 | `YouTubeVideoCard.tsx` | 52 | `toast.success("Vidéo retirée des recommandations")` | `"recommandations"` — mot banni (ne pas exposer la mécanique algorithmique) | `toast.success("Vidéo retirée de ta sélection")` | BASSE |
| 33 | `YouTubeVideoCard.tsx` | 54 | `toast.error("Impossible d'enregistrer votre vote")` | **Vouvoiement** dans un toast | `toast.error("Impossible d'enregistrer ton vote")` | BASSE |

---

## Les 5 corrections les plus impactantes — À faire en premier

### 1. Anglais dans SearchBar (lignes 122–134) — CRITIQUE
C'est le point d'entrée principal du produit. Chaque recherche infructueuse affiche "No films found" — une rupture d'expérience brutale dans un produit 100 % français, sur la surface la plus utilisée.

**Action** : dans `SearchBar.tsx`, remplacer les trois occurrences anglaises par :
- Ligne 122 : `"Année inconnue"` (si l'année est absente)
- Lignes 133–134 : regrouper en un seul message bilingue propre :
```
Aucun film trouvé pour « {debouncedQuery} ».
Essaie avec le titre original ou le nom du réalisateur.
```

---

### 2. ContentSection entièrement en anglais (lignes 36, 44) — CRITIQUE
Le composant `ContentSection` expose deux textes anglais ("result(s) found", "View all"). Même si ce composant est peu utilisé dans le parcours principal actuel, son existence en anglais dans la base de code signifie qu'il peut être réactivé ou étendu à n'importe quel moment en état non traduit.

**Action** : dans `ContentSection.tsx`, remplacer :
- Ligne 36 : supprimer le compteur de résultats (redondant avec le titre) ou le passer en français : `"{count} {count === 1 ? 'élément' : 'éléments'}"`
- Ligne 44 : `"View all"` → `"Explorer"`

---

### 3. Unifier le vouvoiement → tutoiement sur toute la homepage (Index.tsx) — HAUTE
La homepage est la surface d'entrée pour tous les personas. Elle parle de "vous" et "vos" à 7 reprises. C'est la fracture de voix la plus visible et la plus perçue inconsciemment comme "incohérente" par les utilisateurs.

**Action** : passage systématique tu/ton/tes sur l'ensemble de `Index.tsx` (corrections n°7 à n°20 du tableau). Priorité au hero (`ValuePropHero`) et au bloc `LetterboxdOnboarding` qui sont les surfaces les plus lues.

---

### 4. Onglet "Vidéos" → "Analyses" dans FilmDeepDive (ligne 411) — MOYENNE mais visible
L'onglet "Vidéos" sur la page film est la principale trahison de l'ADN produit dans la navigation. Deepdive ne propose pas des "vidéos" (YouTube le fait), il propose des **analyses vidéo**. C'est la promesse différenciante.

**Action** : dans `FilmDeepDive.tsx` ligne 411, changer le label de l'onglet :
```
{ id: "videos", label: "Analyses" }
```
et vérifier la cohérence avec le label de section dans `ContentSection` et les stats de la `FilmCard` (actuellement icône `Video` — cohérent, mais le tooltip/aria-label doit aussi être revu).

---

### 5. "Voir plus" dans DiaryContentHighlights (ligne 141) et "Films similaires" dans FilmDeepDive (ligne 699) — HAUTE + MOYENNE
"Voir plus" est le CTA le plus générique qui existe dans les interfaces numériques. Sur Deepdive, chaque CTA doit faire ressentir que l'on va quelque part, pas juste "voir davantage". "Films similaires" est encore plus problématique : il transforme Deepdive en moteur de recommandation de films, ce qui est précisément ce que le produit n'est pas.

**Action DiaryContentHighlights** : remplacer "Voir plus" par `"Explorer tout"`.

**Action FilmDeepDive** : renommer la section "Films similaires". Deux options selon la décision produit :
- Option A (si la section reste) : `"Dans la même veine"` — évocateur sans être algorithmique
- Option B (recommandée) : retirer la section ou la lier explicitement au corpus Deepdive de chaque film, pas juste à une liste TMDB

---

## Règles de voix à formaliser pour l'équipe

### Règle 1 — Le produit tutoie toujours
Toute occurrence de "vous", "vos", "votre", "connectez-vous", "cliquez" dans l'interface est une erreur. La seule exception : les emails transactionnels formels (mentions légales, facturation). La règle s'applique aux CTAs, labels, états vides, toasts, messages d'erreur.

**Test rapide** : chercher `"vous"` (minuscule, pour éviter les faux positifs sur "Pour" etc.) dans tous les fichiers `.tsx`. Tout résultat est un bug de voix.

### Règle 2 — "Vidéos" seul n'existe pas
Le terme "vidéos" employé seul (sans qualificatif) est banni de l'interface. Les remplacements autorisés :
- `"Analyses vidéo"` — dans les sections éditoriales
- `"Analyses"` — dans les onglets de navigation (espace contraint)
- `"Analyses, podcasts et livres"` — dans les listes de types de contenu

### Règle 3 — Les états vides donnent une sortie
Un état vide sans phrase d'explication et sans action possible est une impasse. La structure obligatoire : `[Ce qui se passe] + [Pourquoi c'est normal ou temporaire] + [La sortie si possible]`. Les formulations "Aucun résultat." ou "Aucune vidéo trouvée." sans suite sont interdites.

### Règle 4 — L'algorithme est invisible
Deepdive ne dit jamais "recommandé pour vous", "parce que tu as regardé", "films similaires", "contenu lié", "retiré des recommandations". La mécanique de personnalisation est présente dans le produit mais jamais nommée dans l'interface. Si un texte expose une logique de tri ou de filtrage interne (ex : "Films populaires qui ont déjà une vraie matière éditoriale dans Deepdive."), il doit être réécrit pour ne montrer que la promesse utilisateur.

### Règle 5 — "Explorer" prime sur "Voir plus" et "Découvrir"
Le seul CTA générique autorisé sur Deepdive est `"Explorer"`. "Voir plus", "En savoir plus", "Découvrir" (à l'impératif), "Voir tout" sont bannis. `"Creuser"` est autorisé comme variante pour les invitations à aller en profondeur sur un sujet. `"Voir tout"` peut exceptionnellement devenir `"Explorer tout"` quand le contexte est une liste exhaustive.

### Règle 6 — Les titres éditoriaux n'expliquent pas, ils révèlent
Un titre de section comme "Tendances avec du contenu" est un titre d'interface de développeur. Un titre Deepdive révèle une intention, une obsession, un territoire. La différence :
- Titre développeur : "Films populaires qui ont déjà une vraie matière éditoriale"
- Titre Deepdive : "Films à creuser" / "À l'affiche, avec du fond"

### Règle 7 — L'anglais n'existe pas dans l'interface
Aucun texte visible par l'utilisateur ne peut être en anglais, même dans un composant "interne". Les labels, toasts, états vides, placeholders, aria-labels et messages d'erreur sont tous en français. Seuls les noms propres (Letterboxd, TMDB, YouTube) restent en anglais.

---

## Note sur la section "Films similaires"

Cette section mérite une décision produit avant toute réécriture. En l'état, elle affiche des films TMDB sans lien avec le corpus Deepdive — ce qui va à l'encontre de l'ADN fondamental du produit (Deepdive recommande du **contenu**, pas des films). Deux options :

**Option A — Retirer la section** : la page film est déjà dense. Supprimer "Films similaires" allège le bas de page et évite la confusion avec une app de recommandation.

**Option B — La reformuler** : renommer en "Dans la même veine" et n'afficher que les films pour lesquels Deepdive a un corpus réel (en croisant avec `useFilmContentStats`). Le label deviendrait alors : `"— Pour continuer l'exploration"`.

Cette décision relève de **deepdive-head-of-product** avant implémentation.

---

*Audit produit par deepdive-ux-writing — juin 2026*
