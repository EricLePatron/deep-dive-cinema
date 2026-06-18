# Lovable — Brief : Refonte de l'onglet Aperçu en vrai best-of condensé

## Problème

L'onglet "Aperçu" de la page film (`FilmDeepDive.tsx`, `TabsContent value="overview"`) affiche jusqu'à 6 sous-sections simultanément : articles, livres, deux grilles de vidéos distinctes (making-of et analyses), podcasts, éditions physiques. C'est une page dans la page : l'utilisateur charge l'onglet censé être une introduction et se retrouve face à 16 éléments de contenu cliquables répartis en 6 blocs, dont deux grilles vidéo visuellement identiques consécutives. L'effet est celui d'un déversement de contenu, pas d'une curation. P4 décroche. P2 ne sait pas où commencer.

## Objectif

Transformer l'Aperçu en un vrai best-of éditorial : 1 article + 1 vidéo + 1 podcast + 1 livre, chacun présenté comme une sélection assumée, avec des renvois clairs vers les onglets dédiés pour ceux qui veulent la liste complète.

## Ce qu'il faut construire

### 1. Nouveau layout Aperçu : grille best-of 2x2

Remplacer les 6 sous-sections par une grille de 4 "picks" éditoriaux, un par format :

```
[Article featured — pleine largeur]
[Vidéo pick]  [Podcast pick]  [Livre pick]
```

Ou en variante mobile-first :
```
[Article — full width]
[Vidéo — full width]
[Podcast]  [Livre]
```

Chaque pick est l'item n°1 de la liste correspondante (déjà disponible). Pas de grille 3 colonnes — une seule card par format, clairement identifiée.

Sous chaque pick, un lien `editorial-label` vers l'onglet dédié :
- "→ X vidéos disponibles" (renvoie vers onglet Vidéos)
- "→ X podcasts disponibles" (renvoie vers onglet Podcasts)
- etc.

Ce lien remplace le bouton "Voir tout" actuel du `SectionHeader`.

### 2. Supprimer la dualité "Autour du tournage" / "Regards & analyses" dans l'Aperçu

Ces deux sous-sections existent dans l'onglet Vidéos dédié, où elles ont leur place. Dans l'Aperçu, elles créent de la confusion. Dans le best-of, choisir la vidéo avec le meilleur score (déjà calculé dans `videos.all` qui est trié) et l'afficher en pick unique intitulé "Analyse vidéo". La distinction making-of / analyse reste dans l'onglet Vidéos.

### 3. Conserver PhysicalMediaSection uniquement dans l'onglet Éditions

`PhysicalMediaSection` est actuellement appelée à la fois dans l'Aperçu (ligne 551) et dans l'onglet Éditions (ligne 651). C'est un doublon complet. La retirer de l'Aperçu. À la place, afficher uniquement une ligne de statut si des éditions existent : "X éditions françaises disponibles → Voir les éditions". Si aucune édition, ne rien afficher.

### 4. Afficher un état "Aucun contenu" explicite

Si tous les formats sont vides (aucun article, aucune vidéo, aucun podcast, aucun livre), afficher un message clair à la place de la grille :
- Titre : "Pas encore de contenu indexé"
- Sous-titre : "Le contenu autour de ce film est peut-être disponible dans les onglets ci-dessus, ou sera ajouté prochainement."
- Icône : `Film` de lucide-react, taille `h-10 w-10`, `text-muted-foreground`

## États à gérer

| Situation | Comportement |
|-----------|-------------|
| Tous les formats ont du contenu | Grille best-of 4 picks complète |
| 1 ou 2 formats vides | Grille partielle, les picks manquants ne s'affichent pas |
| Aucun format disponible | Message "Pas encore de contenu indexé" |
| Données en cours de chargement | Squelette de la grille avec `SectionLoader` par pick |
| Un pick individuel charge | `SectionLoader` dans le slot du format concerné, les autres s'affichent |

## Ce qu'il ne faut PAS faire

- Ne pas supprimer les onglets dédiés (Livres, Vidéos, Podcasts, Articles) — ils restent intacts avec leur contenu complet.
- Ne pas réduire le pick article à une card compacte — l'`ArticleCard variant="featured"` est le bon traitement, le garder.
- Ne pas forcer 4 picks si 2 seulement ont du contenu — la grille s'adapte au contenu disponible.
- Ne pas déplacer la logique de tri dans ce composant — utiliser les données déjà triées par les hooks existants.
- Ne pas ajouter de bouton "Charger plus" dans l'Aperçu — c'est le rôle des onglets dédiés.

## Fichiers probablement concernés

- `src/pages/FilmDeepDive.tsx` — refonte du `TabsContent value="overview"` (lignes 433–560)

## Critère de succès

Un utilisateur P4 qui arrive sur une page film et clique sur "Aperçu" comprend en moins de 5 secondes ce que Deepdive a trouvé sur ce film, et voit un chemin clair pour aller plus loin dans le format qui l'intéresse.
