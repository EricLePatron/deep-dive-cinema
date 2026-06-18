# Lovable — Brief : Différencier visuellement les 3 rangées de films homepage

## Problème

La homepage connectée empile 3 appels identiques au composant `FilmRowSection` dans sa moitié basse : "Vos derniers films" (8 affiches), "Tendances avec du contenu" (10 affiches), "À l'affiche" (10 affiches). Les trois sections utilisent exactement le même rendu visuel — mêmes affiches en scroll horizontal, même kicker `editorial-label`, même `font-display text-3xl`. Seul un titre textuel les distingue. Pour P4 (curieux en transition), ces 28 affiches fusionnent en une nappe indistinguable. Le retour utilisateur "trop fouillis" s'explique en grande partie ici.

## Objectif

Que les trois rangées de films soient visuellement distinctes d'un coup d'oeil, sans alourdir la page. Chaque rangée doit avoir une identité propre qui communique immédiatement sa logique (personnel / éditorial / programme).

## Ce qu'il faut construire

### 1. Différenciation de la rangée "Vos derniers films" (diary)

Cette rangée est personnelle — elle doit le signifier visuellement. Ajouter un traitement distinctif :
- Sur chaque `FilmCard` du diary, afficher une petite étoile de notation Letterboxd si `film._userRating > 0` (les données sont déjà présentes dans `personalizedFilms` via `_userRating`).
- La rangée peut afficher une petite mention "Votre diary" sous forme de badge ou puce verte (`#00E054` ou `hsl(var(--accent))`) dans le coin supérieur gauche du kicker, ou via un point coloré devant le tiret.
- L'objectif n'est pas de changer le composant `FilmCard` en profondeur, mais de signaler la différence de contexte au niveau du header de section.

### 2. Fusion des deux rangées "éditoriales" en une seule rangée différenciée

Les sections "Tendances avec du contenu" et "À l'affiche" sont deux rangées de films génériques qui se ressemblent et se suivent. Les fusionner en une seule section avec deux sous-groupes visuellement séparés est trop complexe. La solution plus simple : **supprimer l'une des deux en homepage connectée**, ou les placer dans un bloc "Pour aller ailleurs" avec un traitement visuel réduit (affiches plus petites, opacité légèrement réduite, kicker commun).

Concrètement : regrouper les sections 7 et 8 (`trendingFilms` + `nowPlayingFilms`) sous un seul bloc parent intitulé "— Pour explorer" avec :
- Un titre de section commun (ex. : "D'autres films à explorer")
- Deux sous-rangées scrollables différenciées uniquement par un label inline (pas de grand titre séparé)
- Un séparateur `border-t border-border/60` entre le bloc diary et ce bloc discovery

### 3. Espacement accru entre les blocs

Actuellement chaque section utilise `py-10 md:py-14`. Augmenter l'espace **entre** les grands blocs thématiques (diary vs discovery) : ajouter un `mt-6 md:mt-10` sur le séparateur entre les deux zones, ou utiliser `py-14 md:py-20` sur le bloc discovery. L'air supplémentaire suffit à signaler un changement de logique même sans différence visuelle forte.

## États à gérer

| Situation | Comportement |
|-----------|-------------|
| Diary vide, aucun film personnel | La rangée diary n'apparaît pas — les deux rangées discovery s'affichent normalement |
| Diary présent, trendingFilms vide | Seule la rangée "À l'affiche" s'affiche sous le bloc discovery |
| Les deux rangées discovery vides | Le bloc "Pour explorer" n'apparaît pas du tout |
| `_userRating` absent sur un film diary | Aucune étoile affichée, la card est standard |

## Ce qu'il ne faut PAS faire

- Ne pas changer le composant `FilmCard` de manière globale — les modifications de style diary doivent être conditionnelles au contexte homepage.
- Ne pas ajouter un troisième niveau de titre (on a déjà `kicker` + `title` + parfois `subtitle`).
- Ne pas réduire les affiches diary à une taille "sm" pour les différencier — la taille est déjà un signal de hiérarchie utilisé ailleurs.
- Ne pas supprimer la section "À l'affiche" — elle sert l'entrée produit pour P4 qui arrive après avoir vu un film en salle.
- Ne pas casser l'état non-connecté — les deux rangées discovery doivent rester identiques à aujourd'hui pour les visiteurs sans compte.

## Fichiers probablement concernés

- `src/pages/Index.tsx` — logique d'assemblage des sections, rendu conditionnel
- `src/components/FilmCard.tsx` — ajout optionnel du rating diary (prop `userRating?`)

## Critère de succès

Un utilisateur P4 qui arrive pour la première fois sur la homepage connectée identifie immédiatement "ses" films (diary) séparés des suggestions génériques, sans avoir à lire les titres de section.
