# Stratégie d'acquisition — Deepdive Cinema
*De 0 à 50 000 utilisateurs actifs — Mai 2026*

---

## Intention

On part de zéro. Pas de budget, pas d'audience, pas de notoriété. L'objectif n'est pas de trouver 10 000 inscrits rapidement — c'est de trouver les 100 premiers utilisateurs qui **reviennent sans qu'on les y pousse**. Ce signal-là est le seul qui compte avant tout le reste.

**Objectif 12 mois :** 50 000 utilisateurs actifs mensuels
**Règle absolue :** zéro budget publicitaire avant product-market fit prouvé

---

## Cadrage stratégique (Head of Product)

### La seule obsession des 30 premiers jours

- Trouver 100 actifs récurrents, pas 1 000 inscrits. Un utilisateur qui revient en J+7 sans relance vaut 50 inscrits passifs.
- Instrumenter Supabase + GA4 immédiatement pour mesurer le retour J+1 et J+7 après la première session. Sans ce signal, tout le reste est de l'intuition.
- Publier 10 deepdives de référence sur des films à forte communauté active (Letterboxd Top Films, sorties Cannes, classiques Criterion) **avant** tout effort d'acquisition. Ces pages sont les premières preuves de valeur et les premières landing pages SEO.

### Séquencement des canaux (dans l'ordre)

1. **Letterboxd + Reddit ciné FR** (J1–J30) — Le P2 Explorateur est déjà en mode post-visionnage. On va le chercher là où il est, avec des contributions contextuelles et des liens vers les deepdives. Coût nul, feedback immédiat.
2. **SEO longue traîne** (J15–J90) — Requêtes à faible volume, intention parfaite. Chaque deepdive est un asset permanent. Canal principal à 6 mois si le contenu est solide.
3. **Réseaux sociaux** (J30+, pas avant) — Twitter/X cinéphile et carrousels Instagram uniquement quand on a des formats prouvés. Pas de présence fantôme.
4. **Partenariats éditoriaux** (M3+) — Newsletters ciné (Trois Couleurs, Sofilm), podcasts critiques. Le P1 Académique est prescripteur, pas utilisateur de masse — mais sa caution crédibilise tout le reste.

### 3 risques qui peuvent bloquer la croissance

1. **Proposition de valeur floue pour P4** — Si le Curieux en transition ne comprend pas en 8 secondes ce qu'il gagne à rester, il repart. Le "post-visionnage" doit être immédiatement palpable, pas conceptuel.
2. **Catalogue insuffisant pour les premiers arrivants** — Un utilisateur qui tombe sur un film non couvert ne revient pas. Les 200 films les plus présents sur Letterboxd doivent être couverts avant de scaler.
3. **Dépendance Letterboxd** — L'OAuth est un atout UX mais une fragilité structurelle. Diversifier les modes d'entrée avant M6.

### Signaux de traction — avant de passer à l'étape suivante

- Taux de retour J+7 > 25 % sur cohorte acquisition organique
- Au moins 3 deepdives avec trafic SEO entrant autonome > 200 sessions/mois
- 1 partage communautaire non sollicité (Reddit, Discord ciné) qui génère > 50 visites

Ces trois signaux ensemble = feu vert pour scaler le contenu et lancer les premiers partenariats.

### Posture éditoriale

- Pas de "compte officiel" générique. Voix assumée, point de vue, désaccords possibles avec la critique mainstream. Le cinéphile sérieux fuit le contenu lisse.
- Maximum 1 post tous les deux jours — la rareté crée l'attente.
- Règle : chaque publication est un tunnel vers un deepdive, jamais une fin en soi.

---

## Plan tactique phase par phase (Growth)

### Phase 0 — Semaines 1–4 : 0 → 100 utilisateurs

*Valider le canal, pas scaler.*

**Semaine 1 — Présence minimale**

- **Jour 1–2 :** Créer le compte Letterboxd officiel `@deepdive-cinema`. Bio : *"Les analyses, podcasts et livres qui prolongent chaque film."* Suivre les 500 comptes FR les plus actifs (cinéphiles, critiques, blogueurs).
- **Jour 1–2 :** Créer le compte Twitter/X. Rejoindre 3 serveurs Discord cinéphiles FR.
- **Jour 3–4 :** Poster sur SensCritique une critique longue et signée sur un film récent populaire (Cannes, César) avec lien naturel vers le deepdive correspondant. Une contribution utile, pas du spam.
- **Jour 3–4 :** Identifier 10 YouTubeurs cinéma FR (500-50k abonnés) et 5 podcasteurs — tableur avec contacts.
- **Jour 5–7 :** Post Reddit r/cinema et r/Letterboxd — présentation honnête : *"J'ai construit un outil pour prolonger l'expérience film après visionnage — retours bienvenus."* Répondre à chaque commentaire dans les 2h.

**Semaines 2–3 — Outreach manuel**

- 3 YouTubeurs cinéma FR contactés par semaine : proposition concrète de co-crédit sur une analyse qu'ils ont déjà couverte.
- Sur Letterboxd : commenter les reviews populaires FR sur les films couverts. Contributions substantielles, **pas de lien** — le profil fait le travail.
- Activation bouche-à-oreille : envoyer l'URL à 50 personnes de confiance avec message personnalisé et demande de retour explicite.

**Semaine 4 — Conversion et mesure**

- Tracker via GA4 l'événement `sign_up` avec source/medium pour identifier quel canal a converti.
- Doubler sur le canal gagnant.

**Métrique cible :** 100 utilisateurs, rétention J7 > 30 %

---

### Phase 1 — Mois 2–3 : 100 → 1 000 utilisateurs

*Activer les boucles de croissance.*

**SEO malgré la contrainte SPA**

Le site est une SPA sans SSR — toutes les pages film partagent le même `<title>Deep Dive Cinema</title>`. Solution sans refacto lourde :

- **`react-helmet-async`** — meta tags dynamiques par film (titre, description, OG image TMDB). Impact immédiat sur le rendu social (partages Letterboxd, Twitter).
- **Pre-rendering statique** (`react-snap` ou `vite-plugin-prerender`) — snapshots HTML générés au build. Les bots reçoivent du HTML, les users le React hydraté.
- **Sitemap.xml dynamique** — script Node à chaque déploiement, soumis dans Search Console.
- **Google Indexing API** — notifier Google à chaque nouvelle page film publiée (quota : 200 URLs/jour gratuit).

**Requêtes longue traîne gagnables (faible compétition, intention parfaite) :**

| Requête | Compétition |
|---|---|
| "analyse [film] signification fin" | Quasi nulle |
| "que comprendre de [film]" | Nulle |
| "références culturelles [film]" | Nulle |
| "podcast cinéma [réalisateur]" | Faible |
| "[film] making-of français" | Faible |
| "[film] Q&A réalisateur" | Nulle |

**Letterboxd comme moteur viral**

- Après chaque connexion Letterboxd réussie : prompt *"Partagez votre profil Deepdive sur Letterboxd"* avec lien pré-rempli vers leur liste de films analysés.
- Créer des listes officielles `@deepdive-cinema` sur Letterboxd par thématique (films sur la mémoire, filmographie Villeneuve...). Ces listes sont indexées dans les recherches Letterboxd.
- Tracker GA4 `letterboxd_connect` → mesurer le taux de partage post-connexion. Cible : > 8 %.

**Communautés FR — posture**

| Communauté | Action | Fréquence |
|---|---|---|
| Reddit r/cinema, r/Letterboxd | Contributions substantielles sur les films couverts | 2-3x/semaine |
| SensCritique | Critiques longues signées | 1x/semaine |
| Discord ciné-clubs FR | Présence active dans les discussions, pas de spam | Quotidien |
| Twitter/X | Thread analyse + lien deepdive sur les films du moment | 3x/semaine |

**Métrique cible :** 1 000 utilisateurs, 15 % via SEO organique

---

### Phase 2 — Mois 4–6 : 1 000 → 10 000 utilisateurs

*Scaler ce qui fonctionne.*

**Canaux à activer**

- **YouTube Shorts / TikTok cinéma FR** — Extraits 60s des analyses vidéo avec texte à l'écran. Un contenu = 3 formats. L'algorithme court format favorise la découverte froide.
- **Newsletter hebdomadaire** — *"Cette semaine sur Deepdive"* : agrégateur des meilleures analyses. Partenariats d'échange de visibilité avec newsletters cinéma existantes (Sofilm, Critikat).

**Premiers partenariats**

- **Salles art et essai** — QR code en salle *"Prolongez le film"* vers la page Deepdive du film programmé. Contrepartie : visibilité dans leur programme papier. Cibles : Le Champo, Le Balzac, Forum des Images.
- **Podcasts cinéma FR** (Aficionados, Blow Up ARTE, Le Cinéma de Minuit) — épisode croisé, lien dans les show notes.
- **YouTubeurs cinéma** — co-production d'une analyse sur un film majeur. Partage des vues, pas de budget.

**Métriques de passage à l'échelle**

| Signal | Seuil pour scaler |
|---|---|
| Rétention J30 | > 20 % |
| Trafic SEO / trafic total | > 30 % |
| Taux partage post-connexion Letterboxd | > 8 % |
| Pages film indexées Google | > 500 |
| Partages non sollicités / semaine | > 10 |

**Métrique cible :** 10 000 utilisateurs, 40 % rétention M1, 3 partenariats salles actifs

---

### Phase 3 — Mois 7–12 : 10 000 → 50 000 utilisateurs

*Devenir la référence.*

- **SEO comme canal dominant** — SSR ou pre-rendering complet si le trafic organique ne dépasse pas 40 %. Investissement structurel.
- **Lancement Google AdSense** — si trafic > 1 000 visiteurs/jour (seuil rentabilité minimal).
- **Partenariats éditoriaux directs** — Carlotta, Potemkine, MK2 : bannières éditoriales soignées dans les pages films correspondants.
- **Prescription institutionnelle** — Cinémathèque française, festival Lumière, ARTE : Deepdive comme ressource recommandée.
- **API publique** — Permettre aux salles et festivals d'intégrer les contenus Deepdive dans leurs programmes.

---

## Résumé des métriques clés

| Phase | Période | Objectif | Signal de validation |
|---|---|---|---|
| 0 | S1–S4 | 100 users | Rétention J7 > 30 % |
| 1 | M2–M3 | 1 000 users | 15 % trafic SEO organique |
| 2 | M4–M6 | 10 000 users | 3 partenariats salles, rétention M1 > 40 % |
| 3 | M7–M12 | 50 000 MAU | Deepdive dans top 10 sur 500 requêtes longue traîne |

---

## Règles non-négociables

1. **Zéro budget publicitaire avant product-market fit** — chaque euro dépensé avant M3 est un euro brûlé.
2. **La communauté avant les métriques** — une contribution utile sur Reddit vaut plus que 10 posts de promotion.
3. **Contenu d'abord, audience ensuite** — si un film n'a pas de deepdive riche, il n'est pas dans la stratégie d'acquisition.
4. **Mesurer avant de scaler** — aucun canal n'est scalé sans signal de rétention prouvé.

---

*Rédigé en collaboration : deepdive-head-of-product × deepdive-growth — Mai 2026*
*Prochaine révision : Août 2026 (fin Phase 1)*
