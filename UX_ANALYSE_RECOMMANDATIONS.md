# Deepdive Cinema — Analyse UX & recommandations de redesign fondamental

Document produit à partir d'une lecture exhaustive du code source (`/home/user/deep-dive-cinema`), le site de production et Supabase étant inaccessibles depuis cet environnement (politique réseau, 403). Le code étant la source de vérité de ce qui est réellement rendu à l'écran (sections, composants, nombre d'éléments, ordre, états), le diagnostic ci-dessous est fiable pour traiter le retour utilisateur : *« trop fouillis, difficile de s'y retrouver, trop de contenu »*.

---

## 1. Synthèse exécutive

Deepdive a un vrai moteur de contenu (vidéos, podcasts, livres, articles, éditions physiques) mais **aucune des trois surfaces principales n'a de véritable budget de densité** : chaque page ajoute des blocs au fur et à mesure que des données sont disponibles, sans jamais retirer, masquer par défaut, ou hiérarchiser fortement. La page film (`FilmDeepDive.tsx`, 714 lignes) est l'exemple le plus net : son onglet « Aperçu » empile déjà 6 sections avec grilles de 3 cartes chacune (jusqu'à ~18 cartes) *avant même* que l'utilisateur ait choisi un onglet dédié — et les onglets eux-mêmes peuvent afficher jusqu'à 50+ vidéos, 20+ podcasts. L'accueil (`Index.tsx`) empile jusqu'à 7 sections verticales différentes rien que pour un utilisateur connecté avec un diary Letterboxd. À cela s'ajoute une **incohérence visuelle entre composants** (le langage éditorial sobre — bordures fines, labels uppercase, noir/blanc — coexiste avec des blocs `rounded-xl`, badges colorés et fonds `bg-primary/5` hérités d'un ancien design system, notamment sur les Éditions physiques), et des **micro-frictions linguistiques** (texte anglais résiduel dans la recherche : *"No films found"*, *"results found"*) qui cassent le ton "cinémathèque". Le problème n'est donc pas seulement qu'il y a "beaucoup de contenu" : c'est que **la même densité est montrée à tout le monde, tout le temps, sans jamais imposer un chemin**.

**Parti-pris de redesign en une phrase** : remplacer l'empilement exhaustif de sections par un **parcours en une chose à la fois** — une page film qui s'ouvre sur *un* choix éditorialisé (« votre première porte d'entrée »), puis déploie la richesse à la demande via un système de navigation persistant (rail latéral ou barre d'ancrage sticky) plutôt que par accumulation verticale, avec une densité par défaut strictement plafonnée (règle des 3) et un accès explicite, volontaire, à la profondeur.

---

## 2. Inventaire de l'existant

### 2.1 Accueil — `src/pages/Index.tsx`

État "utilisateur connecté avec diary Letterboxd" (le cas le plus riche, et le plus probable pour un utilisateur retenu) :

| # | Bloc | Composant | Contenu affiché | Lignes |
|---|---|---|---|---|
| 1 | Hero diary | `DiaryHero` | 1 film (backdrop plein écran + titre + synopsis 2 lignes) | 123-124, 235-263 |
| 2 | Tendances de cinéphilie | `CinephileTrendSection` | 3 à 4 posters | 135-137 |
| 3 | "Votre diary" | `FilmRowSection` | jusqu'à 8 films en rail horizontal | 139-146 |
| 4 | Loader intermédiaire | inline | spinner | 147-153 |
| 5 | "À explorer" (highlights vidéo) | `DiaryContentHighlights` | 3 cartes vidéo (extensible à 6) | 156-158 |
| 6 | "Podcasts sur vos films" | `DiaryExtraHighlights` (Section 1) | jusqu'à 3 cartes podcast | 161-163 |
| 7 | "Articles sur vos films" | `DiaryExtraHighlights` (Section 2) | jusqu'à 3 cartes article | 161-163 |
| 8 | "Pour creuser ailleurs" (tendances) | `FilmRowSection` | jusqu'à 10 films | 166-174 |
| 9 | "À l'affiche" | `FilmRowSection` | jusqu'à 10 films | 176-182 |
| 10 | Footer | `SiteFooter` | liens légaux | 185 |

**Soit jusqu'à 9 sections empilées verticalement**, chacune avec son propre header ("kicker" + titre + parfois sous-titre), avant le footer. Chaque section a un design de carte différent : rails de posters (`FilmCard`), grille de cartes vidéo full-bleed (`DiaryContentHighlights` → classe `content-card`), cartes bordées `border border-border` (`DiaryExtraHighlights`).

État "non connecté / sans profil Letterboxd" (persona P4 typique, cible prioritaire) :

| # | Bloc | Composant | Contenu | Lignes |
|---|---|---|---|---|
| 1 | Hero value-prop | `ValuePropHero` | Titre + pitch + SearchBar + 4 pictos de types de contenu | 126-131, 265-321 |
| 2 | "Exemple de deep dive" | `EditorialExamples` | 3 films (Roma, OUATIH, Parasite) avec compteurs codés en dur | 313, 323-387 |
| 3 | Bloc Letterboxd onboarding | `LetterboxdOnboarding` | CTA connexion | 316-318 |
| 4 | "À l'affiche" | `FilmRowSection` | jusqu'à 10 films | 176-182 |
| 5 | Footer | — | — | 185 |

C'est la version la plus proche d'un guidage clair, mais elle mélange déjà 2 CTA concurrents (chercher un film vs. connecter Letterboxd) et un rail "À l'affiche" purement générique, sans lien avec la promesse éditoriale.

### 2.2 Page film — `src/pages/FilmDeepDive.tsx` (714 lignes, la surface la plus dense)

Architecture verticale hors onglets :

| Bloc | Contenu | Lignes |
|---|---|---|
| Hero backdrop | image + retour | 209-234 |
| Bloc identité | poster + titre + titre original + année/durée/note/Letterboxd + réalisateur + genres (pastilles) + 2 boutons (Sauvegarder/Partager) | 236-334 |
| Bandeau Synopsis + Distribution | synopsis tronqué/expand + grille de 6 acteurs avec photo | 337-395 |
| **Bloc "Tout autour du film"** | Tabs à 6 entrées : Aperçu / Livres / Vidéos / Podcasts / Éditions / Articles | 397-693 |
| Films similaires | rail de 6 posters | 696-711 |

Détail de l'onglet **Aperçu** par défaut (`activeTab = "overview"`, ligne 96) — celui que voit *tout le monde* en arrivant sur une page film :

| Sous-section | Composant | Items affichés | Condition d'affichage |
|---|---|---|---|
| Articles & critiques | `ArticleCard` (1 featured + grille) | jusqu'à 3 | si articles ou loading |
| Livres & essais | `BookCard` grille | jusqu'à 3 | si livres ou loading |
| Autour du tournage | `YouTubeVideoCard` grille | jusqu'à 3 | si vidéos production ou loading |
| Regards & analyses | `YouTubeVideoCard` grille | jusqu'à 3 | si vidéos éditoriales ou loading |
| Podcasts | `PodcastCard` compact grille | jusqu'à 3 | si podcasts ou loading |
| Éditions physiques | `PhysicalMediaSection` (composant entier, pas un résumé) | jusqu'à 3 + bouton "voir X de plus" | toujours |

→ **6 sections avec titre + compteur + bouton "Voir tout" chacune, jusqu'à ~18 cartes**, rendues *avant tout choix de l'utilisateur*, en une seule page scrollable. Le volume réel de contenu en amont (avant troncature à 3) peut être considérable : le service YouTube (`src/services/youtube.ts:349-363`) exécute **4 requêtes de 25 résultats chacune** (Intro/QA/FR/EN), soit un potentiel de dizaines de vidéos dédupliquées réparties en 2 catégories (`useYouTube.ts`). Les chiffres affichés en page d'accueil pour les films "exemple" le confirment : Parasite = 24 vidéos, 20 podcasts, 12 livres (`Index.tsx:326`). Le nombre affiché dans les onglets (`FilmDeepDive.tsx:410-413`, `totalBooks`, `videos?.all.length`, `totalPodcasts`, `totalArticles`) n'est jamais plafonné dans les onglets dédiés — l'onglet **Vidéos** affiche l'intégralité de `videos.production` et `videos.editorial` sans pagination (ligne 612, 626), l'onglet **Podcasts** affiche tous les épisodes sans limite (ligne 642), l'onglet **Articles** affiche tous les articles répartis en 2 groupes sans limite (ligne 673, 681).

**Redondance repérée** : `PhysicalMediaSection` est monté **deux fois** dans le même parcours — une fois en résumé dans l'onglet Aperçu (ligne 553-558) et une fois en entier dans l'onglet Éditions (ligne 651-656) — chacune refaisant ses propres appels réseau (`usePhysicalMedia`, `useFrenchEditions`).

### 2.3 Favoris — `src/pages/Favorites.tsx`

Structure raisonnable : Tabs par type (Tout/Articles/Vidéos/Livres/Podcasts) puis regroupement par film (`grouped`, ligne 87-100) avec un `FilmHeader` par groupe et une grille de cartes. C'est la page la mieux hiérarchisée du produit (groupement clair, un seul niveau de désordre possible : nombreux films × nombreux items).

### 2.4 Diary (30 derniers jours) — `src/pages/Diary.tsx`

Liste simple `<ul>` d'une ligne par film (poster + titre + date + étoiles), design le plus sobre et le plus proche du "scan rapide". Aucun problème de densité ici — bon contre-exemple à généraliser.

---

## 3. Diagnostic des problèmes (classés par gravité)

### Bloquant

**B1 — L'onglet "Aperçu" de la page film n'est pas un aperçu, c'est un condensé de toute la page.**
`src/pages/FilmDeepDive.tsx:433-560`. Six sections indépendantes (Articles, Livres, Tournage, Analyses, Podcasts, Éditions) sont empilées avant même que l'utilisateur choisisse un onglet. Chaque section a son propre header, son propre "Voir tout", sa propre grille de 3 cartes — c'est déjà, à elle seule, la densité d'une page listing complète. La tension "Richesse vs Clarté" (skill deepdive-ux) impose que la page film choisisse : ici elle essaie de faire les deux en même temps dans un seul onglet.
*Impact persona* : **P4** (curieux) décroche — trop d'items à évaluer avant de cliquer un seul. **P1** (académique) doit scroller au travers de sections qui ne l'intéressent pas forcément (ex. Éditions physiques) pour atteindre les analyses vidéo.

**B2 — Aucune limite dans les onglets dédiés : la richesse devient un mur.**
`FilmDeepDive.tsx:602-643, 660-685`. Contrairement à l'onglet Aperçu (plafonné à `PREVIEW = 3`, ligne 44), les onglets Vidéos/Podcasts/Articles affichent l'intégralité des résultats sans pagination ni "charger plus". Avec des films riches (Parasite : 24 vidéos, 20 podcasts), l'onglet Vidéos peut afficher des dizaines de miniatures identiques en grille homogène sans aucun sous-classement au-delà de Production/Éditorial.
*Impact persona* : **P4** submergé, ne sait pas par où commencer. **P3** (programmateur, usage pro) pourrait en bénéficier mais n'a aucun outil de tri/filtre (par durée, par chaîne, par date) pour naviguer efficacement — juste un mur de cartes.

**B3 — L'accueil connecté empile jusqu'à 9 sections hétérogènes sans hiérarchie visuelle forte entre elles.**
`Index.tsx:118-186`. Diary hero → Tendances cinéphilie → Vos derniers films → highlights vidéo → podcasts → articles → tendances → à l'affiche → footer. Chaque section réutilise le même patron "kicker + titre + grille/rail", ce qui les rend visuellement interchangeables : rien ne dit à l'œil "commence ici, le reste est optionnel". C'est l'inverse de la règle du design system ("la homepage guide, peu de choix, fort CTA").
*Impact persona* : **P4** surtout, mais aussi **P2** (Letterboxd) qui vient pourtant avec une intention claire ("montre-moi du contenu sur MES films") et se retrouve avec 3 sections différentes qui font à peu près la même chose (diary films, highlights vidéo, podcasts+articles) sans qu'on comprenne pourquoi c'est scindé.

### Majeur

**M1 — Incohérence de design system : deux langages visuels coexistent sur la même page.**
Le composant `PhysicalMediaSection.tsx` (utilisé deux fois dans le parcours film, cf. B1) emploie `rounded-xl`, `rounded-lg`, des badges colorés (`bg-primary/5 border-primary/20`, ligne 156), des cartes `bg-muted/20` — un style "produit SaaS classique" — alors que tout le reste de la page film (Header, Synopsis, ArticleCard, BookCard, YouTubeVideoCard) utilise le langage éditorial sobre du design system (bordures fines `border-border/60`, `editorial-label` uppercase, `rounded-sm`, pas de couleur sauf le vert Letterboxd). `ContentSection.tsx` (le wrapper utilisé par `PhysicalMediaSection`, ligne 129/149) affiche même un texte non traduit : **"{count} results found"** (`ContentSection.tsx:36`) — anglais dans un produit entièrement en français.
*Impact persona* : tous, mais surtout **P1** qui "tolère zéro bruit éditorial" — cette section démonétise instantanément le sentiment "cinémathèque".

**M2 — Composants de carte incohérents entre les sections de découverte de l'accueil.**
`DiaryContentHighlights.tsx` utilise une classe `content-card` (flat, sans bordure, hover opacity) avec icônes colorées Lucide par défaut (`Heart` rouge implicite via `text-primary`), tandis que `DiaryExtraHighlights.tsx` utilise des cartes `border border-border rounded-sm bg-foreground/[0.02]`, et `CinephileTrendSection.tsx` un simple poster sans cadre. Trois patrons de carte différents pour trois blocs qui font conceptuellement la même chose ("voici du contenu sur vos films récents") juste en dessous les uns des autres sur l'accueil.
*Impact persona* : **P2/P4** — l'œil doit ré-apprendre à scanner à chaque section, ce qui contribue directement au sentiment "fouillis" remonté par les utilisateurs.

**M3 — Redondance fonctionnelle : `PhysicalMediaSection` montée deux fois, appels réseau dupliqués.**
`FilmDeepDive.tsx:553-558` et `651-656`. Même composant, mêmes hooks (`usePhysicalMedia`, `useFrenchEditions`), deux instances actives simultanément dès que l'onglet Aperçu est rendu (React Query dédoublonne le fetch mais monte deux arbres DOM et deux états `showAll` indépendants). Symptomatique du mode de construction "on ajoute au lieu de réutiliser".

**M4 — Aucune progressive disclosure sur les rails de films de l'accueil.**
`FilmRowSection` (`Index.tsx:191-233`) et le hero diary n'offrent aucune option de filtrage ("juste mes films récents", "juste les tendances"), et les rails "Pour creuser ailleurs"/"À l'affiche" utilisent un scroll horizontal caché (`scrollbar-hide`) sans indice visuel de nombre d'items restants — l'utilisateur ne sait pas s'il y a 3 ou 30 films de plus.

**M5 — Absence de hiérarchie typographique entre "sections principales" et "sections secondaires".**
Tous les titres de section de l'accueil et de la page film utilisent la même formule `font-display text-2xl/3xl/4xl` + `editorial-label` kicker, quel que soit le poids éditorial du bloc (le hero diary et le rail "À l'affiche" générique ont un traitement typographique quasi identique). Rien ne permet à l'œil de distinguer immédiatement "c'est pour vous" de "c'est générique".

**M6 — Feedback vidéo (pouces) sans libellé ni tooltip visible.**
`YouTubeVideoCard.tsx:131-158`. Les boutons pouce haut/bas n'ont qu'un `aria-label` (lecteur d'écran) — pas de `title` HTML, contrairement à `ConsumedButton.tsx:48` qui, lui, a un `title`. Incohérence d'implémentation en plus d'un vrai problème pour les nouveaux utilisateurs qui ne comprennent pas l'icône au survol.

### Mineur

**m1 — Texte anglais résiduel dans `SearchBar.tsx`** : *"No films found for..."*, *"Try a different search term"*, *"Unknown year"* (`SearchBar.tsx:121, 133-134`) — rupture de ton dans le composant le plus utilisé du produit (hero + header).

**m2 — `ContentCard.tsx` est du code mort** (aucun import ailleurs dans `src/`) avec un système de couleurs par type de contenu (ambre livre, rouge YouTube, violet podcast, vert article) totalement absent du reste du produit — vestige d'un design system précédent, source de confusion pour quiconque modifie le code en pensant qu'il est actif.

**m3 — Double CTA concurrents dans `ValuePropHero`** : recherche de film (SearchBar) et connexion Letterboxd sont présentés avec un poids visuel proche, sans qu'on indique lequel privilégier pour un nouvel utilisateur (`Index.tsx:296-318`).

**m4 — Pas de lien de navigation globale** (`Header.tsx`) vers une page "Explorer" ou "Films" — confirmé par le fait que `NavLink.tsx` existe comme wrapper mais n'est utilisé nulle part dans le code (`grep` ne retourne aucun usage hors sa propre définition). La seule façon de découvrir un film est la recherche ou les rails de l'accueil.

---

## 4. Recommandations fondamentales de redesign

### Principe directeur : **« Une décision à la fois, la richesse à la demande »**

Aujourd'hui, chaque page essaie de répondre en même temps à "qu'est-ce que je peux faire ici" et "voici tout ce qu'on a". Le nouveau principe : **toute surface d'entrée (accueil, hero de page film) ne propose qu'UN choix éditorialisé fort**, et la richesse (tous les formats, tous les items) devient une couche secondaire, accessible explicitement — jamais pré-scrollée. Concrètement :
- **Accueil = 1 hero + 1 rail** (pas 9 sections).
- **Page film = 1 recommandation "commencez par ça" + navigation vers les formats** (pas 6 sections préchargées dans "Aperçu").
- **Densité par défaut plafonnée strictement à 3, extension explicite au-delà** (déjà en germe avec `PREVIEW = 3`, mais à généraliser à *tous* les onglets, pas seulement à l'Aperçu).

### 4.1 Refonte de la page film : d'un empilement à un parcours

**Problème visé** : B1, B2, M1, M3, M6 — la page film montre tout, tout de suite, avec un onglet "Aperçu" qui est en fait déjà exhaustif.

**Proposition concrète — remplacer l'onglet "Aperçu" par un bloc "Votre première porte d'entrée"** : une seule recommandation éditorialisée (le meilleur item, tous formats confondus, choisi par un score simple : vidéo si présentation cinémathèque de qualité disponible, sinon meilleur article), affichée en grand, puis la navigation vers les 5 formats sous forme de **cartes-résumé cliquables** (pas de contenu déplié) indiquant juste le compteur et un teaser d'une ligne.

Wireframe textuel :

```
┌─────────────────────────────────────────────────────────┐
│  — Pour commencer                                         │
│  ┌───────────────────────────────────────────────────┐   │
│  │  [thumbnail grand format]                          │   │
│  │  "Roma, la mémoire comme mise en scène"             │   │
│  │  Vidéo-essai · Le Cinéma Club · 18 min              │   │
│  └───────────────────────────────────────────────────┘   │
│                                                             │
│  — Tout autour du film                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│  │ Vidéos   │ │ Podcasts │ │ Livres   │                  │
│  │ 24       │ │ 20       │ │ 9        │                  │
│  │ Analyses,│ │ La       │ │ Essais & │                  │
│  │ tournage │ │ critique │ │entretiens│                  │
│  └──────────┘ └──────────┘ └──────────┘                  │
│  ┌──────────┐ ┌──────────┐                                │
│  │ Éditions │ │ Articles │                                │
│  │ 6        │ │ 14       │                                │
│  └──────────┘ └──────────┘                                │
└─────────────────────────────────────────────────────────┘
```

Cliquer sur une carte-résumé mène à la vue détaillée du format (l'actuel onglet), qui elle-même applique une **densité par défaut de 6-9 items avec un "Charger plus" explicite** plutôt qu'un mur illimité (traite B2). Dans la vue Vidéos, ajouter un tri simple (Récentes / Les plus vues / Les plus courtes) pour que **P3** puisse naviguer un volume important efficacement.

Fusionner les deux montages de `PhysicalMediaSection` (traite M3) : le résumé devient juste la carte-compteur "Éditions · 6", le détail complet ne vit que dans la vue dédiée. Reconstruire `PhysicalMediaSection`/`ContentSection` avec les tokens du design system éditorial (`border-border/60`, `editorial-label`, `rounded-sm`, pas de badges colorés `primary/5`) pour éliminer la rupture visuelle (traite M1).

**Impact attendu** : la page film redevient scannable en un écran (hero + 1 recommandation + 5 compteurs), sans perdre la profondeur qui fait la valeur du produit pour P1/P3 — elle est juste reportée d'un clic.

### 4.2 Refonte de l'accueil : un hero, un rail, un CTA secondaire

**Problème visé** : B3, M4, M5, m3.

**Principe** : l'accueil ne doit répondre qu'à une question selon le profil :
- Utilisateur avec diary → *"voici où reprendre l'exploration"* (1 film + 1 raison).
- Utilisateur sans diary → *"voici comment ça marche, cherchez un film"* (1 phrase + recherche).

Wireframe (utilisateur avec diary) :

```
┌─────────────────────────────────────────────────────┐
│  [backdrop plein écran]                               │
│  — Votre dernier film                                 │
│  PARASITE                                              │
│  "Aller plus loin →"                                   │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  — À explorer maintenant                               │
│  [1 carte "meilleure trouvaille" mono-format,          │
│   tirée du film vu le plus récemment : ex. 1 vidéo]    │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  — Votre diary                                         │
│  [rail horizontal, 8 films]                            │
│  "Voir tout mon diary →"                                │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  — Découvrir autrement (repliable / secondaire)         │
│  Tendances · À l'affiche                                │
└─────────────────────────────────────────────────────┘
```

Concrètement :
- **Fusionner** `DiaryContentHighlights` + `DiaryExtraHighlights` (3 sections aujourd'hui : vidéos / podcasts / articles) en **une seule section "À explorer maintenant"** qui pioche le meilleur item, tous formats confondus, pour les 3 derniers films vus — pas 3 sections parallèles qui répètent la même intention avec 3 designs de carte différents (traite M2, M5).
- **Reléguer** "Tendances avec du contenu" et "À l'affiche" sous un même bloc secondaire, visuellement moins proéminent (padding réduit, pas de backdrop, kicker discret), voire dans un second temps derrière un lien "Découvrir autrement →" plutôt que deux rails supplémentaires pré-affichés.
- **Unifier le vocabulaire de carte** : un seul composant de "carte contenu" (poster/thumbnail + film associé + titre + méta) réutilisé partout sur l'accueil, dérivé du design déjà correct de `DiaryExtraHighlights` (bordure fine, `editorial-label`), pour que l'œil n'ait qu'un seul patron à apprendre.
- Pour l'état non connecté : clarifier la hiérarchie des deux CTA en rendant la recherche l'action primaire visuelle et en reléguant Letterboxd à un second temps, après le premier scroll (déjà presque le cas structurellement — juste renforcer visuellement, traite m3).

**Impact attendu** : l'accueil passe de ~9 à ~4 sections effectivement affichées par défaut ; le reste devient une extension volontaire, pas un scroll obligé.

### 4.3 Système de navigation entre types de contenu

**Problème visé** : m4 (pas de nav globale), B2 (onglets film sans repères).

- Ajouter dans `Header.tsx` un lien "Explorer" (ou "Films") menant à une future page de découverte par genre/tendance — comblant le vide identifié par la skill (problème #6) et donnant une porte d'entrée pour les utilisateurs qui n'ont ni film précis en tête ni diary Letterboxd (P4 sans compte).
- Sur la page film, remplacer la `TabsList` plate actuelle (6 onglets à poids égal, `FilmDeepDive.tsx:406-430`) par une **barre d'ancrage sticky** qui apparaît au scroll une fois qu'on a dépassé le hero, avec les mêmes 5-6 entrées mais un traitement qui distingue visuellement "Pour commencer" (nouveau, mis en avant) des formats (poids égal entre eux). Cela conserve la testabilité en URL/état actuel (`activeTab`) tout en réduisant le poids visuel initial du système à onglets.
- Introduire un différenciateur visuel léger par type de contenu (pas de couleur vive façon YouTube, mais une micro-icône cohérente déjà en partie présente : `Video`, `Mic`, `BookOpen`, `FileText`, `Disc3`) systématiquement rappelée à côté du titre de section, pour que l'œil identifie le format sans lire le label — actuellement ces icônes sont utilisées de façon incohérente (ex. `ContentSection` importe `Disc3` mais applique un traitement complètement différent des autres sections).

### 4.4 Principes de design system à corriger

**Problème visé** : M1, M2, m1, m2.

1. **Un seul langage de carte "contenu"** : bordure `border-border/60`, pas de `rounded-xl`/`rounded-lg`, pas de fond coloré (`bg-primary/5`), `editorial-label` pour toute métadonnée. `PhysicalMediaSection.tsx` et `ContentSection.tsx` doivent être réécrits pour s'aligner (ou fusionnés avec `SectionHeader` déjà défini dans `FilmDeepDive.tsx:52-74`, qui est le bon patron à généraliser).
2. **Supprimer le code mort** `ContentCard.tsx` (aucun usage) pour éviter toute réintroduction accidentelle de l'ancien système de couleurs par type.
3. **Audit et correction des chaînes anglaises résiduelles** dans `SearchBar.tsx` (3 occurrences) — trivial mais visible à chaque recherche.
4. **Hiérarchie typographique à 3 niveaux explicites** plutôt qu'un seul gabarit `font-display text-2xl/3xl/4xl` réutilisé partout : (a) titre de page/hero, (b) titre de section primaire ("À explorer maintenant"), (c) titre de section secondaire/repliable ("Découvrir autrement"). Actuellement tout est au niveau (b).
5. **Tooltips systématiques** sur toute icône seule sans libellé texte (pouces `YouTubeVideoCard.tsx:131-158`, bouton signet `FavoriteButton`) — généraliser le pattern `title=` déjà présent dans `ConsumedButton.tsx:48`.

---

## 5. Priorisation — effort × impact

| # | Recommandation | Effort | Impact | Catégorie |
|---|---|---|---|---|
| 1 | Plafonner à N items + "Charger plus" dans les onglets Vidéos/Podcasts/Articles (au lieu d'illimité) | Faible | Élevé | Quick win |
| 2 | Corriger les 3 chaînes anglaises de `SearchBar.tsx` | Très faible | Faible-moyen (mais très visible) | Quick win |
| 3 | Supprimer `ContentCard.tsx` (code mort) | Très faible | Faible (hygiène) | Quick win |
| 4 | Ajouter `title=` sur les boutons pouce de `YouTubeVideoCard` | Très faible | Moyen (P4) | Quick win |
| 5 | Ajouter un lien "Explorer" dans le `Header` | Faible | Moyen | Quick win |
| 6 | Fusionner les 2 montages de `PhysicalMediaSection` (résumé vs détail) | Moyen | Moyen | Quick win |
| 7 | Réaligner visuellement `PhysicalMediaSection`/`ContentSection` sur le design system éditorial | Moyen | Élevé (cohérence perçue) | Chantier structurant (courte portée) |
| 8 | Fusionner `DiaryContentHighlights` + `DiaryExtraHighlights` en une seule section "À explorer maintenant" multi-format | Moyen-élevé | Élevé | Chantier structurant |
| 9 | Remplacer l'onglet "Aperçu" de la page film par un bloc "Pour commencer" + cartes-compteur par format | Élevé | Très élevé | Chantier structurant |
| 10 | Refondre l'accueil (hero → 1 recommandation → diary → bloc secondaire repliable) | Élevé | Très élevé | Chantier structurant |
| 11 | Barre d'ancrage sticky pour la navigation entre formats sur la page film | Moyen | Moyen-élevé | Chantier structurant |
| 12 | Page "Explorer" (découverte par genre/tendance, sans film précis en tête) | Élevé | Élevé (surtout P4 froid) | Chantier structurant (nouvelle surface) |

**Séquencement proposé** :

- **Phase 1 (1-2 semaines, quick wins, aucun risque produit)** : items 1 à 6. Impact immédiat sur la perception de densité, sans toucher à l'architecture de l'information. Chaque item peut être un brief Lovable indépendant.
- **Phase 2 (chantier page film)** : items 7, 9, 11 — la refonte de la page film étant la surface la plus dense et la plus stratégique (c'est elle qui contient la vraie richesse produit), elle doit être traitée en premier parmi les chantiers structurants, avant l'accueil, pour établir le nouveau patron de "carte-compteur par format" qui sera réutilisé partout ailleurs.
- **Phase 3 (chantier accueil)** : items 8, 10 — réutilise les composants et patrons établis en phase 2 (carte contenu unifiée notamment).
- **Phase 4 (nouvelle surface)** : item 12, une fois que le nouveau langage de découverte est stabilisé sur les 2 pages existantes.

---

## 6. Ce qu'on ne casse pas

- **La tagline et la promesse** ("Le film est fini. L'exploration commence.") et le ton éditorial "cinémathèque, pas YouTube" — le redesign renforce cette promesse en réduisant le bruit, il ne la change pas.
- **La distinction structurelle homepage = guidage / page film = richesse** (tension #1 de la skill) — les recommandations la renforcent en la rendant plus stricte, elles ne la remettent pas en cause : la richesse reste entièrement disponible sur la page film, juste réorganisée en "à la demande" plutôt qu'en "pré-affichée".
- **Le système de règle d'or déjà en place** : masquer une section plutôt que montrer un contenu hors sujet (déjà appliqué pour les livres, `FilmDeepDive.tsx:459` : *"règle d'or : rien > hors sujet"*) — ce principe est excellent et doit être étendu, pas retiré.
- **Les catégorisations éditoriales existantes** (Production vs Éditorial pour les vidéos, Spécialisé vs Presse pour les articles, FR vs International pour les livres) — elles sont pertinentes et bien pensées, le problème n'est pas leur existence mais leur exposition simultanée sans hiérarchie.
- **Le vocabulaire éditorial** ("Explorer", "Creuser", "Votre diary", "Tout autour du film") déjà largement respecté dans le code — à généraliser (notamment corriger les résidus anglais), pas à réinventer.
- **L'intégration Letterboxd et la logique diary-driven** de l'accueil — c'est le meilleur levier de personnalisation du produit et doit rester le point d'ancrage du hero, simplement avec moins de sections qui en découlent.
- **`PREVIEW = 3` comme principe de plafonnement par défaut** (`FilmDeepDive.tsx:44`) — l'idée est juste, elle doit être appliquée plus largement (aux onglets dédiés aussi), pas abandonnée.
