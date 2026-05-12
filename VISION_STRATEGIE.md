# Vision & Stratégie — Deepdive Cinema
*Document de référence fondateur — Mai 2026*

---

## 1. Vision

**Deepdive est la référence mondiale pour les cinéphiles et les passionnés de cinéma.**

Là où Letterboxd journalise et MUBI diffuse, Deepdive agrège tout ce qui se dit, s'écrit et se filme autour d'un film : analyses vidéo, podcasts, livres, éditions physiques, articles critiques. En une page, le cinéphile trouve tout le corpus intellectuel et culturel autour du film qu'il vient de voir.

**Tagline** : *"Le film est fini. L'exploration commence."*

### Ce qu'on veut être
- La **première destination** d'un cinéphile après avoir vu un film
- La **référence francophone** du cinéma d'auteur et de la culture cinéphile
- Le **compagnon de diary** Letterboxd — le prolongement naturel de chaque entrée
- L'**espace le plus dense et le mieux curé** de contenus autour du cinéma

### Ce qu'on ne sera jamais
- ❌ Un agrégateur de bandes-annonces et de marketing studio
- ❌ Un réseau social ou un système de notation communautaire
- ❌ Un service de streaming ou de recommandation "quoi regarder ce soir"
- ❌ Un moteur de recherche généraliste sur le cinéma

---

## 2. Positionnement

| | Deepdive | Letterboxd | MUBI | Allociné | Sens Critique |
|---|---|---|---|---|---|
| **Cœur** | Exploration après le film | Journal + social | Streaming curé | Base de données | Critique communautaire |
| **Contenu** | Analyses, podcasts, livres, Q&As | Notes, reviews | Films | Infos, bandes-annonces | Reviews, listes |
| **Ton** | Cinémathèque | Social | Art & essai | Grand public | Communautaire |
| **Langue** | FR en premier | EN | EN | FR | FR |
| **Complémentarité** | Après Letterboxd | ← Deepdive s'y connecte | Concurrent indirect | Concurrent indirect | Concurrent indirect |

**Avantage défendable** : personne ne fait la combinaison curation algorithmique + tonalité cinémathèque + ancrage Letterboxd + corpus multi-formats (vidéo + audio + texte + physique).

---

## 3. Public cible

### Cible principale
**Les cinéphiles actifs** — 18 à 45 ans, regardent 2+ films par semaine, ont un compte Letterboxd, lisent les Cahiers ou écoutent des podcasts cinéma, cherchent à comprendre les films en profondeur.

### Les 4 personas

| Persona | Profil | Besoin sur Deepdive | Priorité |
|---|---|---|---|
| **P1 — Académique** | 28-45 ans, lié au milieu cinéma, lecteur Cahiers/Positif | Analyses pointues, présentations cinémathèque, livres de référence | Crédibilité |
| **P2 — Explorateur Letterboxd** | 22-35 ans, 4+ films/semaine, actif sur les réseaux | Contenu autour de SON diary, signaux communautaires | Rétention |
| **P3 — Programmateur** | 30-50 ans, travaille dans une salle ou un festival | Ressources pédagogiques, introductions de qualité | Prescription B2B |
| **P4 — Curieux en Transition** | 18-30 ans, découvre le cinéma d'auteur | Guidage, entrée facile, contenu engageant | **Croissance** |

**Règle d'or** : toute décision qui améliore P4 sans dégrader P1 est un feu vert immédiat.

### Taille du marché estimée
- Letterboxd : 15M+ utilisateurs (croissance 40%/an)
- Abonnés podcasts cinéma FR : ~500K auditeurs réguliers
- Lecteurs Cahiers du Cinéma + Positif : ~80K
- Étudiants en cinéma France : ~15K/an

**Cible réaliste 12 mois** : 50 000 utilisateurs actifs mensuels

---

## 4. Stratégie de croissance

### Objectif
**Maximum d'utilisateurs** — la croissance de l'audience est la priorité absolue avant toute monétisation. Un site de référence se construit sur le volume de visiteurs fidèles, pas sur les revenus immédiats.

### Les 4 piliers d'acquisition

#### Pilier 1 — SEO (organique, composé, prioritaire)
Les pages `/film/:id` sont des pages SEO à très haute valeur. Quelqu'un qui cherche *"Roma Cuarón analyse"* ou *"Parasite podcast français"* devrait trouver Deepdive en premier résultat.

**Actions immédiates :**
- Meta tags dynamiques par film (`react-helmet-async`) — titre unique, description, OG image
- JSON-LD structured data (schema.org/Movie) sur chaque page film
- Sitemap dynamique des films avec contenu riche (≥ 10 items)
- Indexation Google Search Console déjà initiée ✅
- Google Tag Manager déjà déployé ✅ (GTM-TGBR2PMJ)
- Google Analytics 4 connecté ✅ (G-GM61CYWJPX)

**Mots-clés cibles** (longue traîne, faible compétition) :
- "[film] analyse critique"
- "[film] podcast français"
- "[film] making-of"
- "[réalisateur] essais critiques"
- "[film] Q&A director"

**Objectif 6 mois** : Top 10 Google sur 500 requêtes longue traîne ciblées

#### Pilier 2 — Letterboxd (canal naturel, effet réseau)
Letterboxd est le point de départ naturel des utilisateurs Deepdive. La connexion Letterboxd est déjà intégrée.

**Actions :**
- Compte Letterboxd officiel Deepdive avec listes thématiques
- Encourager les utilisateurs à mentionner Deepdive dans leurs reviews
- OG images soignées pour un partage visuel attractif

#### Pilier 3 — Communautés cinéphiles FR
Présence qualitative (jamais de spam) dans :
- Reddit r/cinema, r/frenchcinema
- Discord de ciné-clubs et associations
- Twitter/X : compte officiel partageant les meilleurs Q&As et analyses
- Sens Critique : présence sur les discussions films

#### Pilier 4 — Partenariats institutionnels
Les salles d'art et essai et cinémathèques sont des prescripteurs naturels :
- Cinéma Le Champo, Le Balzac, MK2, Forum des Images
- Proposition : "Prolongez la séance avec Deepdive" dans leur newsletter/programme
- Objectif : 5 salles partenaires avant fin 2026

---

## 5. Stratégie de monétisation

### Modèle choisi : Publicité contextuelle

La publicité est le modèle le plus adapté à la phase de croissance actuelle :
- **Zéro friction utilisateur** — pas de paywall, pas de restriction de contenu
- **Compatible avec la croissance** — plus on a d'utilisateurs, plus on génère de revenus
- **Simple à déployer** — Google AdSense comme baseline, puis montée en gamme

### Architecture publicitaire en 3 niveaux

#### Niveau 1 — Google AdSense (court terme, dès maintenant)
- Ads display contextuelles automatiques
- Intégration via GTM (déjà installé)
- Emplacements : sidebar page film, bas de page, entre les sections de contenu
- **Revenus estimés** : 2-5€ CPM → à 10 000 pages vues/jour = 20-50€/jour = 600-1500€/mois

#### Niveau 2 — Publicité éditoriale premium (moyen terme, > 50K users)
Partenariats directs avec des annonceurs alignés avec la culture cinéphile :
- Éditeurs de livres cinéma (Cahiers du Cinéma, Capricci, Yellow Now)
- Distributeurs et éditeurs vidéo (Carlotta, Potemkine, MK2, Arrow)
- Festivals de cinéma (Cannes, Sundance, Festival Lumière)
- Plateformes culturelles (MUBI, ARTE, France Culture)
- Chaînes de salles d'art et essai (MK2, Pathé)

**Format** : bannières éditoriales soignées, newsletters sponsorisées, mises en avant thématiques.
**Revenus estimés** : 500-2000€/mois par partenaire, 3-5 partenaires actifs

#### Niveau 3 — Affiliation éditions physiques (passif, faible effort)
Sur l'onglet Éditions, chaque Blu-ray/4K pointe vers une page d'achat affiliée (Fnac, Amazon, boutiques éditeurs). Commission : 3-8% par vente.
- **Zéro friction** — l'utilisateur clique déjà sur ces liens
- **Revenus estimés** : faibles initialement, composés avec le volume

### Règles publicitaires non-négociables
- ❌ Aucune pub pour des bandes-annonces ou du marketing studio (contre la promesse produit)
- ❌ Aucune pub pop-up ou intrusive qui dégrade l'expérience cinémathèque
- ❌ Aucun contenu sponsorisé non identifié comme tel
- ✅ Les pubs doivent être **pertinentes culturellement** — un lecteur de Deepdive ne doit pas voir une pub pour un jeu mobile
- ✅ Densité publicitaire maximale : 1 ad par écran visible

### Séquencement
```
Maintenant (< 1 000 users/jour)  : Pas de pub — construire l'audience d'abord
Phase 2    (1 000-5 000/jour)    : Google AdSense — revenus basiques
Phase 3    (5 000+ /jour)        : Partenariats éditoriaux directs
Phase 4    (20 000+ /jour)       : Newsletter sponsorisée + formats premium
```

---

## 6. Roadmap produit

### Phase 1 — Fondations (mai-juillet 2026) — EN COURS
*Objectif : produit irréprochable avant de croître*

| Priorité | Chantier | Impact |
|---|---|---|
| 🔴 P0 | Meta tags dynamiques + JSON-LD par film | SEO — indexation Google |
| 🔴 P0 | Homepage non-connectée accueillante | Acquisition P4 |
| 🔴 P0 | Filtrage éditorial des Tendances | Crédibilité P1/P2 |
| 🟠 P1 | Synopsis sur la page film | Accessibilité P4 |
| 🟠 P1 | Sitemap dynamique | SEO — crawl |
| 🟠 P1 | Tooltips sur les icônes vidéo | UX — réduction friction |
| 🟡 P2 | Onglet Aperçu = best-of multi-format | Engagement |

### Phase 2 — Personnalisation (août-octobre 2026)
*Objectif : Deepdive connaît l'utilisateur*

- **Page Réalisateur** — filmographie + corpus critique agrégé
- **Recommandations croisées** — "Vous avez aimé l'analyse de Roma → voici Mulholland Drive"
- **Export Obsidian/Markdown** — les cinéphiles prennent des notes
- **Intégration Sens Critique** — alternative FR à Letterboxd

### Phase 3 — Communauté & Monétisation (novembre 2026-janvier 2027)
*Objectif : signaux sociaux légers + premiers revenus pub*

- **Signaux de communauté** — "37 personnes ont exploré ce film" (sans profils publics)
- **Newsletter hebdomadaire** — sélection éditoriale + partenariats sponsorisés
- **Lancement Google AdSense** — si trafic > 1 000 visiteurs/jour
- **3 partenariats éditoriaux pilotes** (Carlotta, un festival, un podcast)

### Phase 4 — Référence & Revenus (2027)
*Objectif : devenir la référence, monétiser l'audience*

- **SSR ou pre-rendering** — SEO technique de niveau professionnel
- **API publique** — les salles et festivals peuvent intégrer Deepdive
- **Publicité premium** — régie publicitaire propre pour les annonceurs culturels
- **Version mobile native** — si la PWA ne suffit pas

---

## 7. KPIs et métriques de succès

### Métriques principales

| KPI | Aujourd'hui | Objectif 6 mois | Objectif 12 mois |
|---|---|---|---|
| Visiteurs uniques / mois | Baseline à établir | 10 000 | 50 000 |
| Pages film indexées (Google) | 0 (SPA) | 200 | 1 000 |
| Taux de rétention J7 | À mesurer | > 20% | > 35% |
| % users Letterboxd connectés | À mesurer | > 40% | > 55% |
| Temps moyen sur une page film | À mesurer | > 3 min | > 5 min |
| Revenus pub mensuels | 0€ | 0€ (trop tôt) | 500-2 000€ |

### Signaux de santé hebdomadaires
- 🟢 WAU en croissance
- 🟢 > 5 nouvelles connexions Letterboxd/semaine
- 🟢 Aucune page film populaire avec moins de 5 vidéos
- 🔴 Taux de rebond homepage > 70% non-connecté
- 🔴 0 vote en 48h (signal d'engagement mort)

---

## 8. Principes non-négociables

Ces principes ne peuvent être violés par aucune décision produit, même sous pression de croissance ou de revenus.

1. **Qualité avant volume** — 3 vidéos excellentes > 15 vidéos passables
2. **Éditorial avant algorithmique** — l'algo sert la curation, pas l'inverse
3. **Français d'abord** — la culture cinéphile de référence est francophone
4. **Accueil avant profondeur** — chaque surface a une porte d'entrée visible pour P4
5. **Pub culturelle uniquement** — aucune pub qui jure avec l'ambiance cinémathèque

---

## 9. Équipe d'agents Claude

Le projet dispose de 6 agents spécialisés, tous versionnés dans `.claude/skills/` :

| Agent | Rôle |
|---|---|
| `deepdive-head-of-product` | Vision, stratégie, arbitrage, orchestration |
| `deepdive-growth` | Acquisition, SEO, monétisation pub |
| `deepdive-recommender` | Algorithmes YouTube, podcasts, livres |
| `deepdive-ux` | Design, parcours, briefs Lovable |
| `deepdive-ux-researcher` | Études utilisateurs, personas, synthétiques |
| `deepdive-analytics` | Métriques, funnels, dashboards SQL |

---

*Dernière mise à jour : Mai 2026*
*Prochaine révision : Août 2026 (fin Phase 1)*
