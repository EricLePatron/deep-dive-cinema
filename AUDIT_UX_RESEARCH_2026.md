# Audit UX Research — Deepdive Cinema
**Date :** 18 juin 2026
**Auditeur :** deepdive-ux-research (Claude Sonnet 4.6)
**Méthode :** analyse comportementale du code source par persona (P1–P4), synthèse des frictions, hypothèses testables, protocoles de test
**Complément de :** AUDIT_UX_2026.md (audit design visuel, 10 problèmes identifiés)

---

## Préambule : ce que cet audit ajoute à l'audit design

L'audit design a localisé des problèmes visuels et structurels (3 rangées identiques, 6 sous-sections dans l'Aperçu, 4 boutons sans libellé). Le présent audit part d'une question différente : **quel utilisateur concret décroche, à quel moment précis, et pourquoi** ? La réponse diffère selon le persona. Un problème qui bloque P4 peut être invisible pour P1. Une friction P3 n'apparaît jamais dans les données de vote.

L'unité d'analyse est la **séquence comportementale**, pas l'élément visuel.

---

## 1. Synthèse des frictions par persona et par surface

---

### P1 — Cinéphile Académique

**Profil comportemental sur Deepdive :** cherche une entrée directe par le film (connait le titre), veut accéder rapidement aux contenus de fond (analyses, présentations de cinémathèque, articles de revues spécialisées), juge la qualité éditoriale dès les 3 premières secondes sur une page.

#### Homepage (connectée)

- **Friction P1-H1 : le DiaryHero ne lui parle pas.** Le hero plein écran sur "son dernier film" est pertinent si P1 a récemment vu un film grand public. Mais P1 regarde souvent des films de répertoire en semaine, Tarkovski ou Cassavetes, films sur lesquels Deepdive peut ne pas avoir de contenu riche. Si le diarySpotlight est un film pauvre en contenu, le hero mène à une page film décevante — et P1 ne revient pas facilement.
- **Friction P1-H2 : la CinephileTrendSection est la seule surface qui lui est explicitement destinée**, mais elle est positionnée en section 2, après un hero qui peut ne pas le concerner. Elle risque d'être scrollée sans être vue s'il cherche directement quelque chose de précis.
- **Friction P1-H3 : pas d'entrée par corpus ou auteur.** P1 pense en termes de filmographie (Bergman, Wong Kar-wai) ou de période (Nouvelle Vague). Aucun point d'entrée par réalisateur, pays ou époque. La SearchBar est son seul vecteur, ce qui est fonctionnel mais réducteur.

#### Page FilmDeepDive

- **Friction P1-F1 : l'onglet Aperçu noie le signal éditorial fort.** P1 cherche "Regards & analyses" (vidéos-essais, masterclass, présentations cinémathèque). Cette section apparaît en 4e position dans l'Aperçu, après Articles, Livres, et "Autour du tournage". Pour un film de répertoire, "Autour du tournage" peut être vide ou irrelevant (making-of promotionnels YouTube de 2008). P1 fait défiler sans trouver ce qu'il cherche.
- **Friction P1-F2 : l'onglet "Vidéos" fusionne les deux sous-catégories.** Quand P1 clique sur l'onglet Vidéos, il voit d'abord "Autour du tournage" avant "Regards & analyses". C'est l'inverse de sa priorité. Il doit scroller pour atteindre le contenu qui l'intéresse.
- **Friction P1-F3 : les articles ne distinguent pas assez les niveaux éditoriaux.** L'onglet Articles sépare "Revues & médias spécialisés" / "Presse généraliste", ce qui est bon. Mais dans l'Aperçu, la card featured est choisie algorithmiquement, pas par niveau éditorial. P1 peut voir une critique de Allociné featured au-dessus d'un article des Cahiers du Cinéma.
- **Friction P1-F4 : les livres sont triés avec les éditions françaises en priorité, ce qui est une bonne intention**, mais P1 lit souvent en anglais et les ouvrages anglais de référence (Sight & Sound, BFI) peuvent se retrouver relégués. Le critère `language === 'fr'` remonte mécaniquement les livres français même si leur `relevanceScore` est inférieur.

#### Header / Navigation

- **Friction P1-N1 : pas de lien vers le Diary dans la navbar.** P1 utilise peu Letterboxd en comparaison de P2, mais le lien `/diary` n'est accessible nulle part dans la navbar (ni connecté, ni non-connecté). C'est une page qui existe mais qui est structurellement orpheline — accessible uniquement en tapant l'URL ou via la homepage.

#### Favoris

- **Friction P1-Fav1 : la page Favoris est pertinente pour P1** (il sauvegarde des articles et vidéos pour y revenir), mais l'interface ne lui permet pas de retrouver un favori par film facilement si sa liste est longue. Le regroupement par film est bien, mais il n'y a pas de tri par date d'ajout ou de recherche interne. Avec 30+ favoris, retrouver un article précis devient laborieux.

---

### P2 — Explorateur Letterboxd

**Profil comportemental sur Deepdive :** arrive directement depuis son diary Letterboxd connecté, explore en mode "qu'est-ce que j'ai vu cette semaine", est sensible aux signaux sociaux et à l'aspect communautaire, aime les formats vidéo et podcast qu'il finit en entier.

#### Homepage (connectée)

- **Friction P2-H1 : la homepage connectée est puissante pour P2 — c'est son meilleur état.** Mais elle exige que Letterboxd soit connecté ET que les films récents aient été résolus via TMDB. Quand ce n'est pas le cas (chargement lent, matching TMDB échoué), P2 voit un hero éditorial générique qui n'a aucun lien avec son activité récente. C'est une chute brutale d'expérience.
- **Friction P2-H2 : la section DiaryContentHighlights (À explorer) est sa surface idéale**, mais elle présente une seule vidéo par film. P2 veut parfois en voir plusieurs sur le même film. Le bouton "Voir plus" n'expand que vers plus de films, pas vers plus de contenus par film. Sa curiosité sur un film donné est bloquée à une vidéo, après quoi il doit naviguer vers la page film — friction supplémentaire.
- **Friction P2-H3 : l'élément `re-rank bonus +25` (ex-100) dans DiaryContentHighlights**.tsx crée encore une légère bulle de filtre : les vidéos qu'il a déjà upvotées remontent. Après 2-3 semaines d'utilisation, P2 voit toujours les mêmes vidéos sur ses films fétiches. L'algorithme ne lui propose pas de chemins alternatifs.
- **Friction P2-H4 : aucun signal social visible.** P2 est motivé par "d'autres cinéphiles ont vu ça". Les données de `video_feedback` existent (ups/downs globaux) mais ne sont jamais affichées sur la homepage. Il n't pas de signal que d'autres utilisateurs s'intéressent aux mêmes films.

#### Page FilmDeepDive

- **Friction P2-F1 : le synopsis est tronqué à 4 lignes par défaut (`line-clamp-4`) et la police est grande** (`text-xl md:text-2xl`). Pour un film que P2 n'a pas encore vu (qu'il explore depuis les "films similaires" ou les tendances), l'absence de synopsis complet visible immédiatement ralentit sa décision d'explorer. Il doit cliquer "Lire la suite" pour une information basique.
- **Friction P2-F2 : les "Films similaires" (section en bas de page)** sont générés par TMDB et sont souvent des films mainstream. P2 qui cherche des recommandations cinéphiliques trouve des propositions trop évidentes. Ce n'est pas une friction directe mais une occasion manquée de le garder dans l'écosystème Deepdive.
- **Friction P2-F3 : le bouton "Sauvegarder" sur la page film** sauvegarde le film, mais cette action n'a pas de feedback visible sur la homepage ensuite. P2 ne sait pas ce que "sauvegarder" fait exactement — est-ce lié à ses favoris ? À une watchlist ? À la page `/favoris` ?

#### Page Diary

- **Friction P2-D1 : la page Diary est une liste chronologique brute.** Pour P2, c'est utile mais plat. Il voit ses films des 30 derniers jours, chacun avec son poster et sa note. Mais il n'y a aucun contenu associé affiché inline — pour chaque film, il doit cliquer pour aller sur la page film et chercher les vidéos. La friction est double : la page Diary ne montre pas la richesse de Deepdive sur ses films.
- **Friction P2-D2 : le périmètre 30 jours est arbitraire et non expliqué.** P2 qui a vu un film il y a 32 jours ne le trouve pas dans son diary Deepdive et ne comprend pas pourquoi. Il n'y a aucune mention de cette règle dans l'interface.

#### Favoris

- **Friction P2-Fav1 : P2 sauvegarde régulièrement des vidéos via le FavoriteButton.** La page Favoris les regroupe par film, ce qui est cohérent. Mais il ne peut pas filtrer par type "Vidéos" uniquement depuis un accès direct — il doit charger la page, attendre, puis switcher l'onglet. C'est mineur mais perceptible.

---

### P3 — Programmateur

**Profil comportemental sur Deepdive :** arrive avec un besoin précis (préparer une séance, trouver une introduction à un film pour son public), cherche des ressources réutilisables et pédagogiques, utilise peu les features sociales, ne vote jamais.

#### Homepage

- **Friction P3-H1 : la homepage n'a pas de point d'entrée par genre, époque ou pays.** P3 prépare une séance "cinéma japonais des années 60" ou "films noirs américains". Il ne peut entrer que par titre ou parcourir les tendances — deux chemins qui ne correspondent pas à son mode de travail.
- **Friction P3-H2 : la CinephileTrendSection est potentiellement intéressante pour P3** (elle signale un film qui suscite un regain d'intérêt critique), mais elle est opaque dans son fonctionnement. P3 ne sait pas si c'est une sélection éditoriale manuelle ou algorithmique, ce qui affecte sa confiance pour la recommander à son public.
- **Friction P3-H3 : l'encart Letterboxd Onboarding (ValuePropHero)** lui est présenté comme point d'entrée central. P3 n'a pas de compte Letterboxd personnel ou ne l'utilise pas professionnellement. L'invitation à "connecter votre Letterboxd" le positionne d'emblée comme un usage qui n'est pas le sien.

#### Page FilmDeepDive

- **Friction P3-F1 : "Regards & analyses" est la section la plus utile pour P3**, mais elle est sans filtre de langue. Pour programmer une séance en France, P3 veut des vidéos en français ou sous-titrées. Il n'existe aucun indicateur de langue sur les YouTubeVideoCards, et aucun filtre.
- **Friction P3-F2 : les PhysicalMediaSection (éditions physiques)** sont potentiellement très utiles pour P3 (il peut vouloir projeter un Blu-ray restauré). Mais cette section est en dernier dans l'Aperçu et dans son propre onglet "Éditions" — peu visible pour quelqu'un qui n'y pense pas spontanément.
- **Friction P3-F3 : absence de mode "ressources pédagogiques"** ou de moyen de partager facilement une sélection de contenus autour d'un film. P3 voudrait pouvoir envoyer "la page Deepdive pour Ordet de Dreyer avec les 3 meilleures vidéos" à ses élèves ou spectateurs. Le lien vers la page film existe (`/film/[id]`), mais il n'y a pas de lien direct vers un onglet ou une section (`/film/[id]#videos` ne fonctionne pas via l'interface, l'ancre `id="content"` n'est pas exploitée pour le partage).
- **Friction P3-F4 : le contenu `ConsumedButton` (marquer comme vu)** et `FavoriteButton` sont des features personnelles qui ne servent pas P3 dans son usage professionnel. Il perçoit la feedback bar comme du bruit sans valeur pour lui.

#### Diary et Favoris

- **Friction P3-D1 : le Diary est 100% Letterboxd-dépendant.** P3 qui n'utilise pas Letterboxd ne peut pas bénéficier de cette feature. Il n'existe pas d'équivalent "liste de films à programmer" ou "watchlist professionnelle".
- **Friction P3-Fav1 : P3 ne vote pas (invisible dans les données).** La page Favoris peut lui être utile comme bibliothèque de ressources professionnelles, mais le parcours pour y arriver (sauvegarder un par un depuis chaque card) est laborieux pour construire une collection sur plusieurs films.

---

### P4 — Curieux en Transition

**Profil comportemental sur Deepdive :** arrive sur un film précis via partage externe (Twitter, TikTok, pote), ne connait pas le produit, cherche ce qui est visuellement engageant dans les 10 premières secondes, abandonne vite si rien ne "pop", vote facilement sans regarder la vidéo entière.

#### Homepage (non connectée — son état probable)

- **Friction P4-H1 : la ValuePropHero contient le tagline "Pour les cinéphiles"** en premier mot. P4 ne se considère pas comme un cinéphile. Cette étiquette le signale qu'il n'est peut-être pas la cible, avant même de comprendre la proposition de valeur.
- **Friction P4-H2 : la SearchBar est le CTA principal du hero**, avec le libellé "Vous venez de voir un film ?". Si P4 est arrivé via un lien partagé vers la homepage (pas vers un film précis), il est face à une barre de recherche vide sur fond sombre. Il ne sait pas quoi chercher.
- **Friction P4-H3 : les 4 ValueItems (Analyses vidéo / Podcasts / Livres / Éditions physiques)** dans la grille 2x2 du hero sont du vocabulaire adulte-cinéphile. P4 comprend "vidéo" et "podcasts" mais "Éditions physiques" avec le hint "Blu-ray, restaurations" est un monde qui ne lui parle pas.
- **Friction P4-H4 : les trois exemples éditoriaux (Roma, Parasite, Once Upon a Time)** sont des films de qualité mais datés (2018-2019). P4 qui a découvert le cinéma via TikTok arrive avec des références plus récentes. Ces exemples lui signalent "ce produit est pour les gens qui regardent les Oscars", pas pour lui.
- **Friction P4-H5 : la homepage connectée (avec Letterboxd)** est un état que P4 atteint rarement à sa première visite, car il est peu probable qu'il connecte son Letterboxd immédiatement. Si sa première expérience est la homepage froide, il est seul décideur de son retour.

#### Page FilmDeepDive (son point d'entrée le plus probable)

- **Friction P4-F1 : l'identité du film contient ~25 éléments distincts avant les onglets.** Pour P4, la première impression est de la densité. Il scanne visuellement et cherche quelque chose de clickable et visuellement fort. Le poster + titre + backdrop répondent à ce besoin, mais la rangée de métadonnées (année · durée · note TMDB · statut vu) et les pastilles de genres sont du bruit pour lui.
- **Friction P4-F2 : le synopsis est en `font-display text-xl md:text-2xl`** avec `line-clamp-4`. P4 est habitué aux synopsies YouTube/Allociné en prose courte et informelle. Le synopsis TMDB en police d'affichage grande, tronqué à 4 lignes, ne lui donne pas assez de contexte pour décider si le film l'intéresse. Il cherche "c'est bien ce film ?" et ne trouve pas de réponse claire.
- **Friction P4-F3 : les onglets (Aperçu / Livres / Vidéos / Podcasts / Éditions / Articles) sont en majuscules 11px.** Pour P4, "Éditions" est opaque. "Articles" suggère de la lecture longue. Il clique sur "Vidéos" par réflexe (seul terme qui l'attire). S'il tombe sur un onglet vide (film avec peu de contenu), il part.
- **Friction P4-F4 : la feedback bar des YouTubeVideoCards (4 boutons icônes)** est le problème le plus aigu pour P4. Il ne comprend pas la différence entre le signet (favoris) et le pouce haut (recommandation globale). Il vote par mimétisme ou intuition, pas par intention. Son signal contribue ainsi au bruit dans la table `video_feedback`. Cela a déjà été mesuré : P4 vote 2x plus que P1, avec 3x moins de précision éditoriale.
- **Friction P4-F5 : absence de note de qualité perceptible sur les vidéos.** P4 est habitué aux algorithmes YouTube qui lui servent "la meilleure vidéo" en premier. Sur Deepdive, il voit 3 vidéos dans une grille sans hiérarchie visible. Il ne sait pas laquelle est "la meilleure" ou "la plus populaire parmi les cinéphiles".

#### Header et Navigation

- **Friction P4-N1 : en mode connecté (s'il s'est connecté via Google),** la navbar lui montre un avatar, une icône signet, une icône Letterboxd, une icône déconnexion. Il ne sait pas à quoi servent 3 des 4 icônes. "Letterboxd" est un nom qu'il ne reconnaît peut-être pas.
- **Friction P4-N2 : il n'y a pas de fil d'Ariane ou de contexte de navigation** sur la page film. Le lien "Retour" renvoie à la homepage, pas à la page d'où il venait. S'il est arrivé via partage direct sur `/film/496243`, "Retour" le mène à la homepage vide — pas à un contexte de découverte.

#### Favoris et Diary

- **Friction P4-Fav1 : l'état vide des favoris est une impasse** (`"Aucun favori pour l'instant. Cliquez sur l'icône signet..."`) sans visuel, sans CTA, sans lien. Le mot "signet" n'est pas son vocabulaire.
- **Friction P4-D1 : la page Diary lui est structurellement inaccessible** à sa première visite. S'il l'explore, le message "Reliez votre compte Letterboxd depuis l'accueil" est un dead-end — il ne sait peut-être pas ce qu'est Letterboxd.

---

## 2. Moments de décrochage critiques par persona

Un "moment de décrochage" est un instant précis dans la séquence comportementale où la probabilité d'abandon dépasse 50% si le produit ne répond pas à l'attente implicite.

---

### P1 — Moment de décrochage : la page film d'un film sans contenu riche

**Séquence :** P1 arrive sur la homepage connectée. Le DiaryHero affiche son dernier film vu. Il clique. La page film charge. Il scrolle jusqu'à l'onglet Aperçu et trouve "Autour du tournage" avec 2 vidéos de making-of promotionnel YouTube, et "Regards & analyses" vide ou avec 1 seule vidéo de faible qualité éditoriale.

**Décrochage :** P1 ferme l'onglet. Il associe Deepdive à "pas assez de contenu sur mes films". Il ne reviendra pas spontanément.

**Facteur aggravant :** aucun message d'état vide expliquant pourquoi le contenu est limité sur ce film, ni suggestion de films voisins sur lesquels Deepdive est riche. L'`EmptyState` existe techniquement mais ne propose pas d'alternative.

---

### P2 — Moment de décrochage : la première visite sans Letterboxd connecté

**Séquence :** P2 entend parler de Deepdive et arrive sur la homepage pour la première fois. Il n'a pas encore connecté Letterboxd. Il voit la ValuePropHero avec la SearchBar. Il ne sait pas quoi chercher. Il scrolle. Il voit 3 exemples éditoriaux (Roma, Parasite, OUATIH), clique sur Parasite. Page film. Contenu riche. Il est impressionné mais ne comprend pas comment "faire pareil" pour ses propres films.

**Décrochage :** P2 ne voit pas le parcours entre "cette page film est riche" et "comment je connecte mon Letterboxd pour vivre ça sur mes films". L'encart LetterboxdOnboarding est en bas de la ValuePropHero, loin du contexte de découverte.

**Facteur aggravant :** si P2 connecte Letterboxd puis revient à la homepage, le chargement de la homepage connectée (résolution TMDB pour chaque film du diary) prend plusieurs secondes. Il voit un spinner. S'il part pendant ce temps, la connexion est "perdue" pour lui psychologiquement.

---

### P3 — Moment de décrochage : entrée sur la homepage sans point d'entrée professionnel

**Séquence :** P3 entend parler de Deepdive lors d'un festival. Il arrive sur la homepage. Pas de Letterboxd, pas de compte. Il cherche "Ingmar Bergman". La SearchBar retourne des films. Il clique sur Persona. Page film riche. Il explore les vidéos et articles. Très bien. Mais il ne sait pas comment "créer un dossier" sur Bergman, ni comment naviguer vers tous les films Bergman dans Deepdive, ni comment partager cette page à ses élèves en signalant les vidéos précises.

**Décrochage :** P3 n'a pas de mode de travail dans Deepdive. Il peut consommer du contenu mais pas travailler avec. Il revient occasionnellement mais n'intègre pas Deepdive dans ses pratiques professionnelles.

---

### P4 — Moment de décrochage : la page film dans les 15 premières secondes

**Séquence :** P4 reçoit un lien partagé vers `/film/496243` (Parasite). Il ouvre sur mobile. Il voit le backdrop, le poster, le titre. Bien. Il scrolle. Il lit le synopsis (trop long, trop littéraire). Il voit les pastilles de genres ("Thriller / Drama / Foreign"). Il continue de scroller. Il arrive aux onglets. Il clique "Vidéos". Il voit 2 vignettes vidéo dans une grille. Aucune hiérarchie visible. Il clique sur la première. Elle s'ouvre dans YouTube. Il revient. Il voit la feedback bar avec 4 icônes. Il ne comprend rien. Il quitte.

**Décrochage :** P4 perd l'intérêt avant d'avoir trouvé la meilleure vidéo. Le moment critique est entre l'arrivée sur la page et le premier contenu consommé — il doit parcourir ~3 scroll heights de contenu dense avant d'atteindre une vidéo.

**Facteur aggravant :** si le film partagé n'est pas Parasite mais un film moins connu avec peu de contenu, P4 voit des sections vides. L'`EmptyState` minimaliste ne le guide pas vers un contenu alternatif.

---

## 3. Hypothèses testables priorisées

Format : "Si on [modification], alors [persona] devrait [comportement observable mesurable], parce que [mécanisme]."

Classement par impact attendu x facilité de test.

---

### HT-01 — Priorité HAUTE — Tagline hero non-connecté

**Hypothèse :** Si on remplace le tagline "— Pour les cinéphiles" par "— Pour aller plus loin après le film" dans la ValuePropHero, alors P4 devrait montrer un taux de clic vers les exemples éditoriaux supérieur de 20% au moins, parce que "pour les cinéphiles" filtre implicitement les non-initiés avant même qu'ils comprennent la proposition de valeur.

**Variable testée :** libellé de l'`editorial-label` en tête de hero (Index.tsx ligne 287)
**Métrique :** taux de clic sur les 3 exemples `EditorialExamples` (Roma, Parasite, OUATIH)
**Durée recommandée :** 1 semaine (A/B)
**Profil cible :** utilisateurs non-connectés, première visite

---

### HT-02 — Priorité HAUTE — Ordre des sections dans l'Aperçu film pour P1

**Hypothèse :** Si on remonte "Regards & analyses" en première ou deuxième position dans l'onglet Aperçu (avant "Autour du tournage" et "Livres"), alors P1 devrait voter positivement sur ces vidéos à un taux supérieur de 30%, parce qu'il atteint le contenu qui correspond à son intention sans friction de scroll.

**Variable testée :** ordre des sections dans `TabsContent value="overview"` (FilmDeepDive.tsx lignes 433–560)
**Métrique :** taux d'upvote sur les vidéos "Regards & analyses" vs baseline, durée de session sur la page film pour P1 (proxy : utilisateurs avec comportement de vote précis, faible ratio down/up)
**Durée recommandée :** 2 semaines
**Hypothèse corrélée :** taux de downvote sur "Autour du tournage" devrait baisser si P1 accède à "Regards & analyses" sans passer par le making-of.

---

### HT-03 — Priorité HAUTE — Contenu inline dans le Diary pour P2

**Hypothèse :** Si on affiche la meilleure vidéo disponible inline dans chaque entrée du Diary (sur `/diary`), alors P2 devrait prolonger sa session sur le Diary de 40% en durée moyenne, parce que la page Diary est actuellement un point de passage sans valeur ajoutée — P2 doit naviguer vers la page film pour accéder au contenu, ce qui crée une friction inutile.

**Variable testée :** ajout d'un `DiaryContentHighlightCard` miniature dans chaque `<li>` de la liste diary (Diary.tsx)
**Métrique :** temps moyen passé sur `/diary`, taux de navigation depuis `/diary` vers `/film/[id]`
**Durée recommandée :** 2 semaines
**Risque :** alourdit le chargement du Diary si les vidéos sont fetchées pour chaque film

---

### HT-04 — Priorité HAUTE — Label de la feedback bar pour P4

**Hypothèse :** Si on ajoute un tooltip visible au survol sur les 4 boutons de la feedback bar des YouTubeVideoCards (texte court : "Sauvegarder", "Marquer vu", "Recommander", "Masquer"), alors le ratio votes up/down de P4 devrait se rapprocher de celui de P2, parce que P4 vote actuellement par intuition et génère un signal bruité.

**Variable testée :** ajout de `title` ou de micro-labels visibles sous les icônes dans `YouTubeVideoCard.tsx` lignes 124–159
**Métrique :** ratio ups/downs par cohorte utilisateurs à fort volume de votes (proxy P4 : >5 votes/session)
**Durée recommandée :** 3 semaines (signal de vote lent à accumuler)
**Note :** Cette hypothèse fait suite à la recommandation de l'étude synthétique de mai 2026 (thumbs hover-only). Elle est complémentaire : ajouter du label visible peut être plus efficace que le hover-only seul.

---

### HT-05 — Priorité MOYENNE — DiaryHero conditionnel sur richesse de contenu

**Hypothèse :** Si on conditionne le DiaryHero à afficher uniquement les films pour lesquels `isFilmRich(stats)` est vrai (contenu riche vérifié), alors le taux de retour sur la page film depuis la homepage devrait augmenter de 15% pour P1 et P2, parce que le hero mène actuellement parfois sur des pages film pauvres qui déçoivent et créent une association négative avec Deepdive.

**Variable testée :** filtre `isFilmRich` appliqué au choix du `diarySpotlight` dans `Index.tsx` lignes 115–116
**Métrique :** taux de clic depuis le hero vs taux de retour en arrière immédiat depuis la page film (bounce rate sur film/[id] venant de /)
**Durée recommandée :** 2 semaines
**Effet secondaire attendu :** plus souvent fallback sur `ValuePropHero`, à surveiller.

---

### HT-06 — Priorité MOYENNE — Indicateur de langue sur les vidéos pour P1 et P3

**Hypothèse :** Si on ajoute un badge langue ("FR" / "EN" / "DE") sur les vignettes des YouTubeVideoCards, alors P1 devrait réduire ses downvotes sur les vidéos en anglais de 25%, et P3 devrait filtrer plus efficacement ses ressources pédagogiques, parce que la langue est un critère de sélection primaire pour ces deux personas mais actuellement invisible dans l'interface.

**Variable testée :** ajout d'un attribut `language` extrait des métadonnées YouTube, affiché en badge sur la vignette
**Métrique :** downvote rate sur vidéos anglophones par utilisateurs P1 (proxy : utilisateurs avec ratio précision-vote élevé)
**Durée recommandée :** 3 semaines
**Dépendance :** nécessite d'enrichir les données vidéo avec le champ `defaultAudioLanguage` ou `defaultLanguage` de l'API YouTube

---

### HT-07 — Priorité FAIBLE — Suppression du label "Pour les cinéphiles" sur les ValueItems

**Hypothèse :** Si on remplace le hint "Blu-ray, restaurations" sous l'icône Compass par "Trouver l'édition collector", alors P4 devrait avoir un taux de clic légèrement supérieur sur ce ValueItem, parce que "Blu-ray, restaurations" présuppose une culture du support physique que P4 n'a pas.

**Variable testée :** texte du `ValueItem` Éditions physiques (Index.tsx ligne 305)
**Métrique :** difficile à mesurer directement (les ValueItems ne sont pas des liens). Proxy : clic sur l'onglet "Éditions" sur les pages film pour les utilisateurs arrivés via la homepage non-connectée.
**Note :** impact faible, mais signal de positionnement produit important.

---

## 4. Protocoles de test utilisateur

Trois protocoles courts (45-60 min chacun), réalisables à distance via partage d'écran, ciblant les moments de décrochage les plus critiques.

---

### TEST-01 — Premier contact P4 (non-connecté, mobile)

**Objectif :** observer le parcours d'un utilisateur non-cinéphile sur sa première visite, sans contexte préalable sur Deepdive.

**Participants :** 5 utilisateurs, 18-28 ans, consommateurs YouTube/TikTok, pas ou peu d'usage de Letterboxd

**Durée :** 45 min

**Protocole :**

1. (5 min) Entretien préliminaire : "Parle-moi de comment tu découvres des films en ce moment."
2. (5 min) Partager le lien de la homepage non-connectée. Consigne : "On t'envoie ce lien. Dis à voix haute ce que tu vois et ce que tu fais."
3. (10 min) Observer sans intervenir : que fait-il sur la homepage ? Clique-t-il sur les exemples éditoriaux ? Tente-t-il la SearchBar ?
4. (10 min) Demander d'aller sur la page du dernier film qu'il a vu. Observer son comportement sur la page film : scroll speed, clics, abandon.
5. (5 min) "Essaie de sauvegarder quelque chose qui t'a intéressé." Observer si le FavoriteButton est trouvé.
6. (10 min) Debriefing : "Qu'est-ce qui t'a manqué ? Qu'est-ce qui t'a surpris ? Reviendrais-tu ?"

**Indicateurs à noter :**
- Temps avant le premier clic
- A-t-il trouvé les vidéos dans les 2 premières minutes ?
- A-t-il compris la feedback bar ?
- A-t-il mentionné "cinéphile" comme étant ou non son identité ?

---

### TEST-02 — Usage avancé P2 (connecté Letterboxd, desktop)

**Objectif :** observer comment P2 exploite la homepage personnalisée et la page film, et identifier les moments où l'algorithme le déçoit.

**Participants :** 5 utilisateurs, 22-35 ans, Letterboxd actif (4+ films notés par mois), compte connecté à Deepdive

**Durée :** 60 min

**Protocole :**

1. (5 min) Entretien préliminaire : "Comment utilises-tu Letterboxd en ce moment ? Qu'est-ce que tu fais après avoir vu un film ?"
2. (5 min) Ouvrir la homepage connectée. Observer la première réaction : reconnaît-il le film en hero ?
3. (15 min) Exploration libre de la homepage et du diary. Observer quels contenus il explore, quels il ignore, quand il vote.
4. (10 min) Aller sur un film spécifique de son diary avec contenu riche. Observer la navigation entre les onglets. Lui demander : "Tu cherches quoi ici ?"
5. (10 min) Aller sur un film de son diary avec contenu limité. Observer la réaction à l'état vide.
6. (5 min) "Retrouve un contenu que tu as sauvegardé la semaine dernière." Observer la navigation vers les Favoris.
7. (10 min) Debriefing : "Qu'est-ce qui manque pour que Deepdive devienne un réflexe après chaque film vu ?"

**Indicateurs à noter :**
- A-t-il cliqué sur l'upvote/downvote ? Pour quoi ? Pourquoi ?
- A-t-il mentionné vouloir "voir ce que d'autres pensent" ?
- A-t-il navigué vers le Diary depuis la navbar ou a-t-il cherché le lien ?
- Réaction spécifique aux films sans contenu dans le diary

---

### TEST-03 — Usage professionnel P3 (non-connecté Letterboxd, desktop)

**Objectif :** observer comment P3 construit une ressource autour d'un film pour un usage professionnel, et identifier les blocages spécifiques à cet usage.

**Participants :** 3-4 utilisateurs, programmateurs de salle, enseignants cinéma, coordinateurs de festival

**Durée :** 45 min

**Protocole :**

1. (5 min) Entretien préliminaire : "Comment tu prépares une séance en ce moment ? Quels outils tu utilises ?"
2. (10 min) Consigne : "Tu prépares une séance autour d'un film au choix. Utilise Deepdive pour trouver des ressources que tu pourrais montrer à ton public ou partager avec tes étudiants."
3. (15 min) Observation libre, sans intervention. Observer par quel film il commence, comment il navigue, s'il tente de sauvegarder ou partager.
4. (5 min) Demander : "Est-ce que tu pourrais envoyer facilement ce que tu as trouvé à quelqu'un ?" Observer ce qu'il fait (copie l'URL ? cherche un bouton partager ?).
5. (10 min) Debriefing : "Qu'est-ce qu'il faudrait pour que tu utilises ça régulièrement dans ton travail ?"

**Indicateurs à noter :**
- A-t-il utilisé la SearchBar pour un réalisateur (pas un film) ?
- A-t-il cherché un filtre par langue sur les vidéos ?
- A-t-il essayé de "sauvegarder" une sélection (FavoriteButton) ?
- A-t-il mentionné vouloir partager une page ou une liste ?

---

## 5. Connexions aux autres agents

### Transmissions recommandées vers deepdive-ux (design)

- **HT-02** (ordre des sections Aperçu) : reformulation de la hiérarchie de l'onglet Aperçu pour P1 — à intégrer dans le brief LOVABLE_apercu-best-of.md existant
- **HT-04** (feedback bar labels) : ajout de labels visibles sur les 4 boutons — complète le problème P3 de l'audit design
- **HT-06** (badge langue vidéo) : nouveau composant badge à spécifier

### Transmissions recommandées vers deepdive-recommender (algo)

- **HT-05** (DiaryHero conditionnel) : le hook `isFilmRich` existe déjà dans `useFilmContentStats`. Il s'agit d'appliquer ce filtre au choix du `diarySpotlight` dans Index.tsx — modification algorithmique légère
- **HT-03** (vidéo inline Diary) : si implémenté, déclenche un nouveau point de fetch vidéo — le recommender doit être consulté sur la stratégie de cache et de sélection de la "top video" par film dans le contexte Diary (différent de DiaryContentHighlights)
- **P2-H3** (bulle de filtre re-rank) : le bonus +25 sur upvotes utilisateur crée encore une légère bulle identifiée — surveiller sur les données réelles de `video_feedback` à 3 mois

---

## Synthèse exécutive

SYNTHÈSE EXÉCUTIVE
══════════════════

ROUGE — Problème critique : P4 décroche dans les 15 premières secondes sur la page film, avant d'atteindre le premier contenu vidéo consommable. Le chemin hero → identité film → synopsis → onglets est trop long pour son profil comportemental.

ROUGE — Problème critique : P1 et P3 ne trouvent pas de point d'entrée adapté à leur mode de navigation (par réalisateur, époque, corpus). La SearchBar est leur seul vecteur, ce qui est fonctionnel mais non découvrable.

ORANGE — Problème important : Le Diary est un écran mort pour P2 — il liste ses films des 30 jours mais n'affiche aucun contenu, le rendant moins utile que la homepage connectée. P2 n'a pas de raison de revenir sur `/diary`.

ORANGE — Problème important : La homepage non-connectée filtre implicitement P4 avec le label "Pour les cinéphiles" avant que la proposition de valeur soit comprise. L'onboarding vers Letterboxd est mal positionné par rapport au moment de conviction.

JAUNE — Opportunité : P3 constitue un vecteur de croissance non exploité (prescription professionnelle). Un mode "ressources pédagogiques" ou un simple lien de partage direct vers un onglet de la page film suffirait à changer son rapport au produit.

ACTIONS RECOMMANDÉES
════════════════════

P0 — Immédiat (< 1 jour) : remplacer le tagline "— Pour les cinéphiles" par "— Pour aller plus loin après le film" dans ValuePropHero. Modification d'une chaîne de caractères, risque nul, hypothèse HT-01 vérifiable immédiatement.

P1 — Court terme (sprint) : conditionner le DiaryHero à `isFilmRich(stats)` (HT-05) + remonter "Regards & analyses" avant "Autour du tournage" dans l'Aperçu (HT-02) + ajouter tooltips visibles sur les 4 boutons de la feedback bar (HT-04). Ces trois modifications adressent P1, P2 et P4 simultanément.

P2 — Roadmap : enrichir la page Diary avec du contenu inline (HT-03) + concevoir un point d'entrée par réalisateur/époque pour P1 et P3 + explorer un mode "partage de sélection" pour P3.
