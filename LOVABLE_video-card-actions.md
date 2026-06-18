# Lovable — Brief : Clarifier les boutons d'action sur les cards vidéo

## Problème

Chaque `YouTubeVideoCard` affiche une barre de 4 boutons en bas de card : signet (favori), oeil/check (vu), pouce haut, pouce bas. Ces 4 icônes sont alignées côte à côte sans libellé visible, au même poids visuel (11px, texte muted), sans séparation sémantique. Or ils relèvent de deux logiques distinctes : le signet et l'oeil sont des actions **personnelles** (pour moi) ; les pouces sont des actions **éditoriales** (pour la communauté). P4 ne comprend pas à quoi sert "pouce bas" — aucune explication n'est donnée. Le `aria-label` existe mais n'est pas affiché. Le résultat est une barre opaque que les nouveaux utilisateurs ignorent ou utilisent à mauvais escient.

## Objectif

Rendre les 4 boutons d'action compréhensibles au premier coup d'oeil, en séparant clairement les deux logiques et en ajoutant des libellés contextuels sur les actions les plus importantes.

## Ce qu'il faut construire

### 1. Séparation visuelle des deux clusters d'actions

Diviser la barre en deux groupes séparés par un séparateur `|` ou un espace plus grand (`gap-4` entre les groupes vs `gap-1` à l'intérieur) :

**Groupe gauche — Actions personnelles :**
- `FavoriteButton` avec libellé : "Sauvegarder" (état inactif) / "Sauvegardé" (état actif)
- `ConsumedButton` avec libellé : "Marquer vu" (inactif) / "Vu" (actif)

**Groupe droit — Feedback éditorial :**
- Pouce haut (sans libellé, icône seule suffit)
- Pouce bas (sans libellé, icône seule suffit)

Le groupe droit reste discret (icônes seules, `text-muted-foreground`), car le feedback éditorial est une action secondaire.

### 2. Libellés sur les boutons personnels

Pour `FavoriteButton` et `ConsumedButton` dans le contexte `YouTubeVideoCard`, passer la prop `label` qui existe déjà dans les deux composants :
- `FavoriteButton` : `label={active ? "Sauvegardé" : "Sauvegarder"}`
- `ConsumedButton` : le composant gère déjà l'affichage du label via `verbs.done` quand actif — s'assurer que le libellé est visible aussi à l'état inactif, en passant `label="Marquer vu"` quand inactif.

### 3. Tooltip sur les boutons de feedback éditorial

Ajouter l'attribut `title` (tooltip natif, cohérent avec `ConsumedButton` qui l'utilise déjà) sur les boutons pouce haut et pouce bas :
- Pouce haut : `title="Recommander cette vidéo"`
- Pouce bas : `title="Moins pertinent — retirer des suggestions"`

### 4. Alignement de la barre avec le contenu de la card

La barre d'actions (`div` ligne 124 dans `YouTubeVideoCard.tsx`) utilise actuellement `mt-3 pt-2` sans bordure. Ajouter `border-t border-border/40` pour signaler visuellement que c'est une zone d'interaction distincte du contenu (titre / chaîne / métadonnées).

## États à gérer

| État | Comportement attendu |
|------|---------------------|
| Utilisateur non connecté, clic favori | Toast "Connectez-vous pour sauvegarder" — comportement actuel, inchangé |
| Favori actif | Icône signet remplie + texte "Sauvegardé" en `text-foreground` |
| Favori inactif | Icône signet vide + texte "Sauvegarder" en `text-muted-foreground` |
| Vu actif | Icône check + texte "Vu" en `text-foreground` |
| Vu inactif | Icône oeil + texte "Marquer vu" en `text-muted-foreground` |
| Pouce haut actif | Icône en `text-foreground bg-foreground/10` — comportement actuel, inchangé |
| Pouce bas actif | Icône en `text-foreground bg-foreground/10` — comportement actuel, inchangé |
| Card en variant "compact" | La barre d'actions n'est pas affichée dans le variant compact (diaryHighlights) — inchangé |

## Ce qu'il ne faut PAS faire

- Ne pas supprimer les boutons de feedback éditorial (pouces) — ils existent pour une raison produit (signal de qualité).
- Ne pas ajouter une modal ou un drawer explicatif — un libellé court suffit.
- Ne pas rendre les libellés permanents sur les boutons éditoriaux (pouces) — cela alourdirait la barre.
- Ne pas modifier la logique métier des boutons — uniquement le rendu visuel et les libellés.
- Ne pas changer `FavoriteButton.tsx` et `ConsumedButton.tsx` de manière globale — les libellés doivent être passés en prop depuis `YouTubeVideoCard`, pour ne pas affecter les autres usages (ArticleCard, BookCard, PodcastCard) qui ont leurs propres contextes.

## Fichiers probablement concernés

- `src/components/YouTubeVideoCard.tsx` — refonte de la "Feedback bar" (lignes 124–159)

## Critère de succès

Un utilisateur P4 qui voit une card vidéo pour la première fois comprend sans aide externe la différence entre "Sauvegarder" et "Marquer vu", et sait à quoi servent les pouces.
