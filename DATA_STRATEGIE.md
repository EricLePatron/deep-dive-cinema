# Stratégie Data — Deep Dive Cinema

> Document co-produit par les agents **deepdive-analytics** et **deepdive-growth**.
> Mis à jour : 2026-05-13

---

## 1. North Star Metric

### SAA — Semaines Actives Approfondissantes

**Définition :** Nombre d'utilisateurs ayant exploré **≥ 2 films différents** dans la semaine, avec **≥ 2 contenus consommés ou mis en favori** par film.

**Pourquoi cette métrique ?**
- Elle capture l'essence du produit : pas juste une visite, une vraie exploration
- Elle discrimine l'utilisateur actif superficiel (1 film par curiosité) de l'utilisateur réellement engagé (multi-films, multi-contenus)
- Elle est directement corrélée à la rétention long terme et au bouche-à-oreille

**Formule SQL :**
```sql
SELECT COUNT(DISTINCT user_id) AS saa
FROM (
  SELECT user_id, film_tmdb_id, COUNT(*) AS contenus
  FROM (
    SELECT user_id, film_tmdb_id FROM favorites WHERE created_at >= NOW() - INTERVAL '7 days'
    UNION ALL
    SELECT user_id, film_tmdb_id FROM consumed_items WHERE created_at >= NOW() - INTERVAL '7 days'
  ) actions
  GROUP BY user_id, film_tmdb_id
  HAVING COUNT(*) >= 2
) films_riches
GROUP BY user_id
HAVING COUNT(DISTINCT film_tmdb_id) >= 2;
```

**Objectifs SAA :**

| Période | SAA cible |
|---|---|
| M1 (base) | 50 |
| M3 | 200 |
| M6 | 800 |
| M12 | 3 000 |
| M18 | 8 000 |

---

## 2. KPIs Primaires

Ces 5 métriques constituent le tableau de bord hebdomadaire obligatoire.

### KPI 1 — WAU (Weekly Active Users)

**Définition :** Utilisateurs ayant réalisé ≥ 1 action (favori, consommation, feedback) dans les 7 derniers jours.

**Objectifs :**
| M1 | M3 | M6 | M12 |
|---|---|---|---|
| 200 | 1 000 | 4 000 | 15 000 |

---

### KPI 2 — Taux d'Activation

**Définition :** % des nouveaux inscrits ayant ajouté ≥ 1 favori ET consommé ≥ 1 contenu dans les 48h suivant l'inscription.

**Seuil cible :** 30% à M3, 40% à M6.

**Alerte :** < 20% → l'onboarding est cassé.

---

### KPI 3 — Rétention J7

**Définition :** % des utilisateurs ayant réalisé ≥ 1 action 7 jours après leur première action.

**Objectifs :**
| Phase | Rétention J7 |
|---|---|
| M1-M3 | 35% |
| M3-M6 | 40% |
| M6-M12 | 45% |
| M12+ | 50% |

---

### KPI 4 — Taux de Feedback Positif

**Définition :** % des votes "up" sur le total des votes (up + down) sur les contenus vidéo.

**Objectifs :** 70% à M3 → 80% à M12.

**Signal qualité catalogue :** si le taux passe sous 60%, les contenus recommandés sont de mauvaise qualité.

---

### KPI 5 — Couverture Catalogue Actif

**Définition :** % des films du catalogue ayant ≥ 1 interaction (favori ou consommation) dans les 30 derniers jours.

**Objectif :** éviter la concentration excessive sur quelques blockbusters.
- M3 : 15% du catalogue actif
- M6 : 25% du catalogue actif
- M12 : 35% du catalogue actif

---

## 3. KPIs Secondaires

Métriques de diagnostic consultées mensuellement ou en cas d'alerte.

| KPI | Définition | Cible M12 |
|---|---|---|
| MAU | Utilisateurs actifs du mois | 20 000 |
| WAU/MAU Stickiness | WAU/MAU — mesure la fréquence de retour | > 30% |
| Profondeur de session | Contenus vus par session | > 4 |
| TFCC (Taux de Fil Complété) | % d'utilisateurs ayant complété tous les types de contenu (vidéo + podcast + livre) pour un film | 15% |
| Nouveaux inscrits / semaine | Vélocité d'acquisition | 500 |
| Distribution par type | Répartition des contenus consommés (vidéo / podcast / livre / physique) | Vidéo 60%, Podcast 25%, Livre 10%, Physique 5% |
| Concentration top-10 | % des interactions sur les 10 films les plus populaires | < 40% |
| Taux de churn récupéré | % d'utilisateurs inactifs 30j qui reviennent après relance | > 15% |

---

## 4. Funnels de Conversion

### Funnel Principal — Découverte vers Habitué

```
Visiteur unique
    ↓  10% (visiteur → inscrit)
Nouvel inscrit
    ↓  55-70% (inscrit → connecte Letterboxd)
Utilisateur connecté
    ↓  70% (connecté → premier favori < 48h)
Utilisateur activé
    ↓  35% (activé → récurrent M1)
Utilisateur récurrent
    ↓  [SAA target]
Approfondissant actif
```

**Benchmarks funnels :**

| Étape | Taux actuel (estimé) | Cible M6 |
|---|---|---|
| Visiteur → Inscrit | 5% | 10% |
| Inscrit → Letterboxd connecté | 40% | 65% |
| Connecté → Premier favori | 50% | 70% |
| Activé → Récurrent M1 | 20% | 35% |

---

### Funnel Contenu — Exploration d'un film

```
Arrivée sur page film
    ↓  [LCP < 2.5s]
Scroll ≥ 50% de la page
    ↓
Clic sur un contenu (vidéo / podcast / livre)
    ↓
Consommation enregistrée (consumed_items)
    ↓
Vote feedback (up/down)
```

---

### Funnel Rétention — Courbe d'engagement

| Cohorte | J1 | J7 | J30 | M3 |
|---|---|---|---|---|
| Cible M12 | 50% | 40% | 28% | 20% |

---

## 5. Roadmap Croissance — 0 → 50K MAU

### Phase 1 — Fondations (M0 → M3) : 0 → 2 000 MAU

**Objectif :** Product-Market Fit initial. Valider que le core loop fonctionne.

**Actions prioritaires :**
- SEO P0 : meta tags dynamiques + JSON-LD + sitemap (✅ déployé)
- Onboarding optimisé : connexion Letterboxd en < 3 clics
- 20 films phares avec contenu riche (≥ 10 ressources chacun)
- Présence Reddit r/frenchcinema + SensCritique

**KPIs de phase :**
- WAU : 200 → 500
- SAA : 30 → 100
- Taux d'activation : > 25%

**Signal PMF Phase 1 :**
- Sean Ellis score > 40% ("très déçu si Deepdive disparaissait")
- Rétention M1 > 25%

---

### Phase 2 — Traction (M3 → M6) : 2 000 → 10 000 MAU

**Objectif :** Première boucle virale organique. Le K coefficient atteint 0.15.

**Actions prioritaires :**
- SEO : 200+ pages film indexées, premières positions longue traîne
- Pages réalisateur (maillage interne)
- Feature "Partage de liste" (levier K coefficient)
- Partenariats podcasts cinéma FR (backlinks + audience)

**KPIs de phase :**
- WAU : 500 → 3 000
- SAA : 100 → 600
- K coefficient : 0.10 → 0.15
- Rétention J7 : > 40%

---

### Phase 3 — Accélération (M6 → M12) : 10 000 → 30 000 MAU

**Objectif :** SEO becomes the primary acquisition channel. K coefficient atteint 0.20.

**Actions prioritaires :**
- SEO : 1 000+ pages indexées, 50 000+ impressions/semaine GSC
- Pré-rendering (Cloudflare Worker ou react-snap)
- Newsletter cinéphile hebdomadaire (rétention + réactivation)
- Couverture presse culturelle FR (Télérama, Les Inrocks)

**KPIs de phase :**
- WAU : 3 000 → 10 000
- SAA : 600 → 2 000
- K coefficient : 0.15 → 0.20
- MAU/WAU stickiness : > 28%

---

### Phase 4 — Scale (M12 → M18) : 30 000 → 50 000 MAU

**Objectif :** Croissance composée autonome. Le SEO et le viral font le travail.

**Actions prioritaires :**
- SSR/ISR migration (Next.js ou Remix) pour débloquer le plafond SEO
- Internationalisation (EN + ES)
- Contenu exclusif (interviews réalisateurs, partenariats festivals)

**KPIs de phase :**
- MAU : 30 000 → 50 000
- SAA : 2 000 → 8 000
- NPS : > 40

---

## 6. Mix Trafic Cible

| Source | Part actuelle (estimée) | Cible M12 |
|---|---|---|
| SEO organique | < 5% | 45% |
| Direct / bookmarks | 70% | 25% |
| Social / communautés | 20% | 20% |
| Referral / backlinks | 5% | 10% |

---

## 7. Signaux d'Alerte

### Niveau 1 — Surveillance (action sous 48h)

| Signal | Seuil | Action |
|---|---|---|
| Taux d'activation < 20% | Hebdo | Audit onboarding |
| Rétention J7 < 30% | Hebdo | Analyse cohorte, UX audit |
| Taux feedback positif < 60% | Hebdo | Audit qualité catalogue |
| WAU en baisse 2 semaines consécutives | Hebdo | Root cause analysis |

### Niveau 2 — Critique (action immédiate)

| Signal | Seuil | Action |
|---|---|---|
| WAU -30% semaine vs semaine | Immédiat | Incident report, rollback si déploiement récent |
| 0 nouveau inscrit en 48h | Immédiat | Vérifier pipeline inscription |
| Taux feedback positif < 50% | Immédiat | Suspendre recommandations automatiques |
| Pages indexées GSC < 10 nouvelles/semaine | Hebdo | Debug crawl, re-soumission sitemap |

### Niveau 3 — Stratégique (pivot potentiel)

| Signal | Seuil | Implication |
|---|---|---|
| Sean Ellis score < 40% à M3 | M3 | Retravailler la proposition de valeur |
| K coefficient < 0.10 à M6 | M6 | Retravailler la feature de partage |
| Rétention M1 < 20% à M6 | M6 | Retravailler le core loop |
| SAA stagnante 3 mois | Mensuel | Analyse quali, interviews utilisateurs |

---

## 8. Mesure du Product-Market Fit

### Critères PMF Deepdive

| Critère | Seuil PMF | Mesure |
|---|---|---|
| Sean Ellis | > 40% "très déçu" | Enquête in-app (M3) |
| Rétention M1 | > 30% | SQL cohortes |
| DAU/MAU | > 0.15 | Dashboard analytics |
| NPS | > 40 | Enquête in-app (M6) |
| K coefficient | > 0.15 | Tracking invitations |

**PMF = atteint quand les 5 critères sont validés simultanément.**

---

## 9. Infrastructure Data

### Tables Supabase utilisées

| Table | Rôle | Métriques alimentées |
|---|---|---|
| `letterboxd_profiles` | Profils utilisateurs | WAU, MAU, nouveaux inscrits, rétention |
| `favorites` | Favoris | Taux d'activation, engagement par film |
| `consumed_items` | Contenus consommés | SAA, profondeur session, TFCC |
| `video_feedback` | Votes up/down | Taux feedback positif |
| `film_content_stats` | Richesse du catalogue | Couverture catalogue, films riches |
| `youtube_cache` | Cache vidéos | N/A (operational) |

### Fonctions SQL Analytics (SECURITY DEFINER)

Toutes les fonctions renvoient des données agrégées uniquement — jamais de données personnelles.

```sql
analytics_overview()          -- KPIs globaux en un appel
analytics_users_by_week()     -- Nouveaux inscrits par semaine (12 semaines)
analytics_activity_by_week()  -- Favoris + consommations par semaine
analytics_top_films()         -- Top 15 films par engagement
analytics_content_breakdown() -- Répartition favoris/consommés par type
analytics_richest_films()     -- Top 20 films les plus riches en contenu
```

### Dashboard Privé

URL : `/analytics-deepdive-prive-2026` (mot de passe requis)

Accessible uniquement en interne. Contient : KPI cards, courbes d'activité hebdo, top films, répartition contenu.

---

## 10. Reporting Cadence

| Rapport | Fréquence | Format | Responsable |
|---|---|---|---|
| Dashboard KPIs | Temps réel | `/analytics-deepdive-prive-2026` | Auto |
| Rapport hebdo WAU/SAA | Lundi matin | Slack / Notes | deepdive-analytics |
| Rapport cohortes rétention | Mensuel (J1) | Markdown + SQL | deepdive-analytics |
| Rapport acquisition mix trafic | Mensuel | GA4 + GSC | deepdive-growth |
| Rapport PMF | M3, M6, M12 | Document structuré | deepdive-growth + analytics |
| Rapport SEO | Mensuel | GSC + dashboard | deepdive-seo |

---

## 11. Définitions Partagées

Pour éviter toute ambiguïté entre équipes :

| Terme | Définition |
|---|---|
| **Utilisateur actif** | A réalisé ≥ 1 action (favori, consommation, feedback) dans les 7 derniers jours |
| **Utilisateur activé** | A ajouté ≥ 1 favori ET consommé ≥ 1 contenu dans les 48h après inscription |
| **Approfondissant** | Répond aux critères SAA (≥ 2 films, ≥ 2 contenus par film, dans la semaine) |
| **Film riche** | film_content_stats.total_content ≥ 10 |
| **Contenu consommé** | Entrée dans `consumed_items` (clic confirmé sur une ressource externe) |
| **Favori** | Entrée dans `favorites` (bookmark explicite d'un contenu) |
| **K coefficient** | Nouveaux inscrits via referral / Total nouveaux inscrits |
| **Churn** | Utilisateur qui était WAU il y a 4 semaines et n'a pas eu d'activité depuis 30 jours |

---

*Document vivant — à mettre à jour à chaque évolution majeure du produit ou des objectifs.*
