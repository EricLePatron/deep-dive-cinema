# Lovable — Brief : Navbar — ajouter des destinations pour les visiteurs non-connectés

## Problème

La navbar (`Header.tsx`) en mode non-connecté ne contient que : logo + icône loupe + bouton "Se connecter". Un visiteur qui arrive pour la première fois n'a aucun lien de navigation disponible en dehors de la recherche et des 3 exemples hard-codés sur la homepage. S'il ne connaît pas de film précis à chercher, ou si la SearchBar le rebute, il est bloqué. Cette configuration favorise exclusivement les utilisateurs qui arrivent avec une intention précise (P1, P2). Elle exclut P4 qui a besoin de guidage.

## Objectif

Donner aux visiteurs non-connectés au moins un chemin de navigation alternatif à la recherche, ancré dans le vocabulaire éditorial du produit.

## Ce qu'il faut construire

### 1. Lien "Explorer" dans la navbar (non-connecté uniquement)

Ajouter un lien texte "Explorer" entre le logo et le groupe d'actions droites, visible uniquement quand `user === null`.

Comportement : scroll vers l'ancre `#discover` qui existe déjà dans `Index.tsx` (ligne 309 : `<div id="discover" className="absolute bottom-0" />`). Sur les pages autres que la homepage (`/film/:id`, `/favoris`), le lien renvoie vers `/?scroll=discover` — la homepage gère le scroll sur montage si ce paramètre est présent.

Style : `editorial-label text-foreground/70 hover:text-foreground transition-colors` — même traitement que les liens de la navbar actuelle.

### 2. Sur les pages internes (film, favoris, diary), conserver la navbar minimale

Sur les pages `/film/:id` et `/favoris`, la navbar non-connectée n'a pas besoin d'un lien "Explorer" — il serait hors contexte. Le lien n'apparaît que sur la page d'accueil `/`.

La condition : `isHome && !user` affiche le lien "Explorer". `!isHome && !user` : navbar inchangée (logo + loupe + connexion).

### 3. Sur mobile, le lien "Explorer" n'apparaît pas dans la navbar

La navbar mobile est compacte (logo + loupe + connexion). Ajouter le lien "Explorer" en mobile créerait un problème d'espace. Le lien est visible uniquement `md:` et au-dessus. Sur mobile, le scroll vers le contenu editorial est assuré par le CTA existant dans le hero `ValuePropHero` ("Voir un exemple de deep dive" — ce CTA n'existe pas encore mais peut être ajouté dans le même brief si nécessaire).

### 4. Optionnel — Ajout d'un micro-CTA textuel dans le hero non-connecté

Dans `ValuePropHero` (`Index.tsx`), après la `SearchBar`, ajouter sous le label "Vous venez de voir un film ?" un lien secondaire :
```
ou → Découvrir des exemples
```
Ce lien scrolle vers la section `EditorialExamples` (qui existe déjà). C'est une alternative à la recherche pour P4 qui n'a pas de film précis en tête.

## États à gérer

| Situation | Comportement |
|-----------|-------------|
| Visiteur non-connecté sur homepage | Lien "Explorer" visible en navbar (desktop) |
| Visiteur non-connecté sur `/film/:id` | Navbar inchangée (logo + loupe + connexion) |
| Utilisateur connecté sur n'importe quelle page | Lien "Explorer" absent, navbar actuelle inchangée |
| Page `/film/:id` — déjà sur la page film | Le lien "Explorer" n'a pas de sens contextuel, ne pas l'afficher |

## Ce qu'il ne faut PAS faire

- Ne pas ajouter une navigation complète (mega-menu, sidebar) — le produit n'a pas encore de section "catalogue" dédiée.
- Ne pas déplacer le bouton "Se connecter" — sa position est correcte et visible.
- Ne pas utiliser une icône seule pour "Explorer" — le mot doit être visible car il est dans le vocabulaire éditorial du produit.
- Ne pas ajouter d'autres liens dans la navbar non-connectée (pas de "Films", "Podcasts", etc.) — le catalogue n'est pas une page existante.

## Fichiers probablement concernés

- `src/components/Header.tsx` — condition `!user` dans le rendu de la navbar, ajout du lien "Explorer"
- `src/pages/Index.tsx` — optionnel : micro-CTA dans `ValuePropHero` (fonction ligne 265)

## Critère de succès

Un visiteur P4 non-connecté qui arrive sur la homepage et ne connaît aucun film à chercher trouve un chemin visuel vers le contenu éditorial sans avoir à utiliser la SearchBar.
