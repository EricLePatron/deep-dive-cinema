import { supabase } from "@/integrations/supabase/client";

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  url: string;
}

export interface YouTubeSearchResponse {
  videos: YouTubeVideo[];
  error?: string;
}

export async function searchYouTubeVideos(
  query: string,
  maxResults: number = 10
): Promise<YouTubeVideo[]> {
  const { data, error } = await supabase.functions.invoke('youtube-search', {
    body: { query, maxResults, type: 'video' },
  });

  if (error) {
    console.error('Error calling youtube-search function:', error);
    throw new Error(error.message || 'Failed to search YouTube videos');
  }

  if (data.error) {
    console.error('YouTube search error:', data.error);
    throw new Error(data.error);
  }

  return data.videos || [];
}

// Keywords to EXCLUDE - trailers, marketing, promotional content, full films, clips
const excludeKeywords = [
  'trailer', 'teaser', 'bande annonce', 'bande-annonce',
  'promo', 'promotional', 'tv spot', 'spot tv',
  'official clip', 'movie clip', 'extrait officiel',
  'first look', 'sneak peek', 'avant-première',
  'red carpet', 'tapis rouge',
  'fan reaction', 'audience reaction',
  'rank', 'ranking', 'top 10', 'top 5', 'tier list',
  'honest trailer', 'pitch meeting', 'everything wrong',
  'compilation', 'best moments', 'funny moments',
  'recap', 'in 5 minutes', 'in 10 minutes', 'in 3 minutes',
  // Full films / illegal uploads
  'full movie', 'film complet', 'complete movie', 'pelicula completa',
  'regarder le film', 'voir le film', 'watch full film', 'watch the full movie',
  'film streaming', 'streaming complet', 'streaming vf', 'streaming vostfr',
  'version intégrale', 'version integrale', 'integral version',
  'movie online', 'film en ligne', 'film entier',
  // Raw film clips / scenes
  'extrait du film', 'film clip', 'movie scene', 'scène du film',
  'full scene', 'scene complete', 'scene du film',
];

// Professional cinephile channels to prioritize
const premiumChannels = [
  // English channels - Film institutions & festivals
  'criterion collection', 'bfi', 'british film institute',
  'academy originals', 'oscars', 'tiff', 'toronto international',
  'sundance institute', 'cannes', 'venice film festival',
  'american cinematheque', 'asc', 'cinematographer',
  'directors guild', 'dga', 'writers guild', 'wga',
  'sag-aftra', 'actors on actors', 'variety',
  'hollywood reporter', 'indiewire', 'film comment',
  'sight and sound', 'little white lies', 'mubi',
  // International cinémathèques & repertory cinemas (NYC, London, Berlin, Bologna…)
  'film at lincoln center', 'filmlinc', 'film society of lincoln center',
  'museum of the moving image', 'moma', 'the museum of modern art',
  'metrograph', 'ifc center', 'film forum', 'bam', 'bamcinematek',
  'brooklyn academy of music', 'anthology film archives', 'quad cinema',
  'ucla film', 'harvard film archive', 'academy museum',
  'national film theatre', 'bfi southbank', 'ica london', 'close-up film',
  'deutsche kinemathek', 'arsenal berlin', 'filmmuseum', 'austrian film museum',
  'eye filmmuseum', 'cineteca di bologna', 'il cinema ritrovato',
  'cinémathèque suisse', 'cinematheque ontario', 'tokyo filmex',
  // Cross-interviews / craft roundtables
  'variety studio', 'close up with the hollywood reporter', 'thr roundtable',
  'the hollywood reporter', 'directors on directors', 'screen talks',
  'off camera with sam jones', 'talks at google film', 'aero theatre',
  // Quality distributors
  'a24', 'neon', 'searchlight', 'focus features',
  'arrow video', 'shout factory', 'kino lorber',
  // Video essayists & film analysis
  'every frame a painting', 'lessons from the screenplay',
  'nerdwriter', 'channel criswell', 'like stories of old',
  'the royal ocean film society', 'just write',
  'filmspotting', 'the ringer', 'the rewatchables',
  // Q&A hosts — post-screening discussions, guild screenings, festival talks
  'sag-aftra foundation', 'sag aftra foundation',   // Conversations series
  'film independent',                                // FIND events & Spirit Awards
  'california film institute',                       // Mill Valley Film Festival Q&As
  'afi',                                             // AFI Fest screenings
  'gold derby',                                      // awards season Q&As
  'below the line',                                  // craft Q&As
  'contenders film',                                 // FYC events
  'awards circuit',
  'screendaily',
  'cinemacon',
  'tribeca film festival', 'tribeca',
  'new york film festival', 'nyff',
  'telluride film festival',
  'berlin international film festival', 'berlinale',
  'international film festival rotterdam', 'iffr',
  'san francisco film society', 'sffs',
  'unifrance', 'unifrance films',
  // Quality media outlets with BTS content
  'vice', 'vanity fair', 'gq', 'wired', 'vulture',
  'collider', 'screen rant', 'deadline', 'the wrap',
  // Technical craft channels
  'dolby', 'dolby laboratories', 'imax', 'panavision',
  'arri', 'red digital cinema', 'blackmagic',
  // French channels
  'arte cinema', 'cahiers du cinéma', 'les inrocks',
  'télérama', 'positif', 'cinémathèque', 'institut lumière',
  'le cercle', 'blow up', 'analyse film', 'cinéaste',
  'la septième obsession', 'sofilm', 'mad movies',
  // French independent cinemas (cinémathèque-style introductions)
  'cinéma le champo', 'le champo', 'cinemalechampo',
  'le balzac', 'mac mahon', 'reflet médicis', 'reflet medicis',
  'le christine', 'le grand action', 'studio 28', 'studio des ursulines',
  'la filmothèque', 'la filmotheque', 'le luminor', "l'escurial",
  'cinéma du panthéon', 'cinema du pantheon', 'le brady', 'mk2',
  'gaumont rive gauche', 'pathé live', 'le saint-andré-des-arts',
  "l'arlequin", 'le nouveau latina', 'majestic bastille',
  'forum des images', 'la cinémathèque française', 'cinematheque francaise',
  // Studios & distributors with quality BTS content
  'warner bros', 'universal pictures', 'paramount',
  'sony pictures', 'lionsgate', 'mgm',
  // Film commissions & cinematography
  'film commission', 'dallas film', 'austin film', 'nyc film'
];

// High-value content keywords (boost score)
const premiumContentKeywords = [
  // Masterclasses & Q&A sessions
  'masterclass', 'master class', 'in conversation', 'q&a', 'q & a',
  'cast q&a', 'director q&a', 'audience q&a', 'screening q&a',
  'post-screening', 'post screening', 'post-projection',
  'press conference', 'conférence de presse',
  'panel discussion', 'public discussion',
  'guild screening', 'afi screening', 'sag foundation',
  'fyc', 'for your consideration', 'contenders',
  'film independent', 'california film institute',
  'oscar-winning', 'oscar winning', 'academy award',
  // Crew interviews (cinematographers, directors, etc.)
  'roger deakins', 'cinematographer', 'director of photography', 'dp',
  'director interview', 'actor interview', 'actress interview',
  'filmmaker', 'cinéaste', 'réalisateur', 'metteur en scène',
  'screenwriter', 'scénariste', 'directeur photo',
  'production designer', 'vfx supervisor', 'composer',
  // Behind the scenes & making of
  'behind the scenes', 'inside the making', 'how they made',
  'making of documentary', 'the art of', 'created with',
  'on set', 'set visit', 'set tour', 'toured the set',
  'production design', 'practical effects', 'visual effects breakdown',
  // Premium content types
  'criterion', 'restoration', 'retrospective', 'tribute',
  'legacy', 'influence', 'career retrospective',
  'press conference', 'festival', 'academy', 'bafta', 'cesar',
  'golden globes', 'press junket full', 'roundtable',
  'discusses', 'breaks down', 'explains', 'reveals',
  // Documentary style
  'documentary', 'featurette', 'exclusive', 'special feature'
];

// Get video duration in minutes
function getVideoDurationMinutes(video: YouTubeVideo): number {
  const durationParts = video.duration.split(':').map(Number);
  if (durationParts.length === 3) {
    return durationParts[0] * 60 + durationParts[1];
  } else if (durationParts.length === 2) {
    return durationParts[0];
  }
  return 0;
}

// Check if video is from a premium channel
function isPremiumChannel(video: YouTubeVideo): boolean {
  const channelLower = video.channelTitle.toLowerCase();
  return premiumChannels.some(ch => channelLower.includes(ch));
}

// Heuristic: is this video French-language content?
// Detects French chars/words in title + description, plus known French channels.
const frenchChannelHints = [
  'arte', 'cahiers du cinéma', 'cinémathèque', 'cinematheque', 'institut lumière',
  'le cercle', 'blow up', 'télérama', 'telerama', 'positif', 'la septième obsession',
  'sofilm', 'mad movies', 'les inrocks', 'allociné', 'allocine', 'france culture',
  'france inter', 'mk2', 'forum des images', 'la fémis', 'femis', 'unifrance',
  // French independent cinemas
  'le champo', 'cinemalechampo', 'le balzac', 'mac mahon', 'reflet médicis',
  'reflet medicis', 'le christine', 'le grand action', 'studio 28',
  'studio des ursulines', 'filmothèque', 'filmotheque', 'le luminor',
  'escurial', 'cinéma du panthéon', 'cinema du pantheon', 'le brady',
  'gaumont rive gauche', 'saint-andré-des-arts', 'saint andre des arts',
  'arlequin', 'nouveau latina', 'majestic bastille'
];
const frenchWordHints = [
  ' le ', ' la ', ' les ', ' un ', ' une ', ' des ', ' du ', ' de la ',
  'avec ', 'pour ', 'sans ', 'cinéma', 'cinema français', 'réalisateur', 'réalisatrice',
  'tournage', 'entretien', 'rencontre', 'présentation', 'analyse', 'décryptage',
  'critique', 'séance', 'cinémathèque', 'film français', 'long-métrage', 'court-métrage'
];
function isFrenchContent(video: YouTubeVideo): boolean {
  const channelLower = video.channelTitle.toLowerCase();
  if (frenchChannelHints.some(h => channelLower.includes(h))) return true;
  const text = ` ${video.title.toLowerCase()} ${video.description.toLowerCase()} `;
  // Strong signal: accented chars typical of French
  const accentMatches = (text.match(/[éèêëàâäîïôöûüçœ]/g) || []).length;
  if (accentMatches >= 3) return true;
  // Multiple French stopwords / vocabulary hits
  const hits = frenchWordHints.filter(w => text.includes(w)).length;
  return hits >= 2;
}

// Filter out low-quality/marketing content
function isHighQualityContent(video: YouTubeVideo, minDuration: number = 20): boolean {
  const titleLower = video.title.toLowerCase();
  const descLower = video.description.toLowerCase();
  const combined = titleLower + ' ' + descLower;
  
  // Exclude if contains marketing keywords
  if (excludeKeywords.some(kw => combined.includes(kw))) {
    return false;
  }
  
  // Premium channels get a pass on duration (they curate quality content)
  if (isPremiumChannel(video)) {
    // Still require at least 3 minutes to filter out very short clips
    const totalMinutes = getVideoDurationMinutes(video);
    return totalMinutes >= 3;
  }
  
  // Filter based on minimum duration for non-premium channels
  const totalMinutes = getVideoDurationMinutes(video);
  if (totalMinutes < minDuration) {
    return false;
  }
  
  return true;
}

// Calculate a quality score for a video - prioritize views and duration
function getVideoQualityScore(video: YouTubeVideo): number {
  let score = 0;
  const titleLower = video.title.toLowerCase();
  const descLower = video.description.toLowerCase();
  const channelLower = video.channelTitle.toLowerCase();
  const combined = titleLower + ' ' + descLower;
  
  // Premium channel bonus (+50 points) — strong editorial signal
  if (premiumChannels.some(ch => channelLower.includes(ch))) {
    score += 50;
  }

  // STRONG editorial format: "présenté par", "introduit par", "séance" — exactly the
  // cinémathèque introductions we want to surface (+80 points)
  const cinemathequeFormats = [
    'présenté par', 'présentée par', 'introduit par', 'introduite par',
    'présentation de', 'séance présentée', 'avant-séance', 'leçon de cinéma',
    'masterclass', 'ciné-club', 'cine-club',
  ];
  if (cinemathequeFormats.some(kw => combined.includes(kw))) {
    score += 80;
  }

  // Q&A / post-screening discussions — high editorial value (+60 points)
  // Cast/director Q&As at festivals, guild screenings, FYC events are prime content
  // for cinephiles wanting to go deeper after watching a film.
  const qaFormats = [
    'cast q&a', 'director q&a', 'audience q&a', 'screening q&a',
    'post-screening', 'post screening', 'post-projection',
    'press conference', 'conférence de presse',
    'panel discussion', 'public discussion',
    'guild screening', 'afi screening', 'sag foundation',
    'fyc', 'for your consideration', 'contenders',
    'film independent', 'california film institute',
  ];
  if (qaFormats.some(kw => combined.includes(kw))) {
    score += 60;
  }

  // Premium content keywords bonus (+5 per keyword, max 25)
  const contentMatches = premiumContentKeywords.filter(kw => combined.includes(kw));
  score += Math.min(contentMatches.length * 5, 25);

  // VIEW COUNT — kept as a soft signal only (max 20). Niche cinémathèque
  // content has very few views but high editorial value, so we don't let
  // popularity dominate.
  if (video.viewCount > 1000000) score += 20;
  else if (video.viewCount > 100000) score += 15;
  else if (video.viewCount > 10000) score += 10;
  else if (video.viewCount > 1000) score += 5;
  
  // DURATION bonus - longer content is better for cinephiles (up to 30 points)
  const minutes = getVideoDurationMinutes(video);
  if (minutes >= 60) score += 30;       // 1h+
  else if (minutes >= 45) score += 25;  // 45min+
  else if (minutes >= 30) score += 20;  // 30min+
  else if (minutes >= 20) score += 15;  // 20min+
  else if (minutes >= 10) score += 10;  // 10min+
  else if (minutes >= 5) score += 5;    // 5min+
  
  // Like ratio bonus (engagement quality indicator)
  if (video.likeCount > 0 && video.viewCount > 0) {
    const likeRatio = video.likeCount / video.viewCount;
    if (likeRatio > 0.05) score += 10;
    else if (likeRatio > 0.03) score += 5;
  }
  
  return score;
}

// Search for all types of film content in a single, optimized query
export async function searchFilmVideos(
  filmTitle: string,
  year?: number,
  director?: string,
  originalTitle?: string,
): Promise<YouTubeVideo[]> {
  const yearStr = year ? ` ${year}` : '';
  // Include director name for better accuracy (crucial for films with common titles)
  const directorStr = director ? ` ${director}` : '';

  // Use original title when distinct (e.g. "Roma città aperta" vs "Rome, ville ouverte"),
  // because French cinéma intros / cinémathèque presentations often reference the
  // localized title while institutional content uses the original.
  // Strip punctuation inside the quoted phrase so e.g. `"Rome, ville ouverte"` also
  // matches the Champo video titled `ROME VILLE OUVERTE …`.
  const cleanForQuery = (t: string) => t.replace(/[,;:!?."']/g, '').trim();
  const filmTitleQ = cleanForQuery(filmTitle);
  const originalTitleQ = originalTitle ? cleanForQuery(originalTitle) : '';
  const titleVariants = originalTitleQ && originalTitleQ.toLowerCase() !== filmTitleQ.toLowerCase()
    ? `("${filmTitleQ}" OR "${originalTitleQ}")`
    : `"${filmTitleQ}"`;

  // To stay within the YouTube API quota (10k units / day, ~100 units per search),
  // we run FOUR consolidated queries:
  //   1. queryIntro — narrow French cinéphile intro (no director/year so low-metadata
  //      cinémathèque presentations like "ROME VILLE OUVERTE présenté par Matthieu
  //      Macheret" on Cinéma Le Champo are surfaced even though they have empty
  //      descriptions and don't mention the director or year).
  //   2. queryFr   — broad French (cinémathèque + analyses + tournage), with director/year.
  //   3. queryEn   — international (institutional analyses + roundtables + video essays).
  //   4. queryQA   — dedicated Q&A pass: post-screening discussions, press conferences,
  //      guild/FYC screenings, festival Q&As. Kept separate so these don't compete
  //      with analysis/essay results and always get their own 25-result slot.
  // Priority order: Intro > QA > FR > EN (QA moved up: cinephiles want cast discussions).
  const queryIntro = `${titleVariants} ("présenté par" OR "présentée par" OR "introduit par" OR "introduite par" OR "présentation de" OR "séance présentée" OR "avant-séance" OR "ciné-club" OR "leçon de cinéma")`;
  const queryFr = `${titleVariants}${directorStr}${yearStr} (présentation OR cinémathèque OR "ciné-club" OR masterclass OR analyse OR décryptage OR entretien OR rencontre OR tournage OR "making of")`;
  const queryEn = `${titleVariants}${directorStr}${yearStr} (retrospective OR "actors on actors" OR roundtable OR "close up with" OR analysis OR "video essay" OR masterclass OR "making of" OR "behind the scenes" OR "in conversation")`;
  const queryQA  = `${titleVariants}${directorStr}${yearStr} ("cast q&a" OR "press conference" OR "conférence de presse" OR "post-screening" OR "post screening" OR "screening q&a" OR "audience q&a" OR "director q&a" OR "guild screening" OR "sag foundation" OR "film independent" OR "fyc" OR contenders OR "panel discussion")`;

  console.log('YouTube search queries:', { queryIntro, queryFr, queryEn, queryQA });

  const [introVideos, frVideos, enVideos, qaVideos] = await Promise.all([
    searchYouTubeVideos(queryIntro, 15).catch(() => [] as YouTubeVideo[]),
    searchYouTubeVideos(queryFr, 25).catch(() => [] as YouTubeVideo[]),
    searchYouTubeVideos(queryEn, 25).catch(() => [] as YouTubeVideo[]),
    searchYouTubeVideos(queryQA,  20).catch(() => [] as YouTubeVideo[]),
  ]);

  // Dedupe by id. Priority: Intro > QA > FR > EN — earlier position wins on conflict.
  const seen = new Set<string>();
  const videos: YouTubeVideo[] = [];
  for (const v of [...introVideos, ...qaVideos, ...frVideos, ...enVideos]) {
    if (seen.has(v.id)) continue;
    seen.add(v.id);
    videos.push(v);
  }
  
  console.log(`Found ${videos.length} raw videos from YouTube`);

  // RELEVANCE GUARD — drop videos that don't actually mention the film.
  // Stricter logic: a film title can collide with common words (e.g. "The Last
  // Blood" matched a "Cherry Bomb Blood Python" video via the description).
  // We require either:
  //   - a premium/cinémathèque channel (trusted), OR
  //   - the film title appears in the video TITLE, OR
  //   - the film title appears in the description AND (year OR director name) too.
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const titleTokens = [filmTitle, originalTitle]
    .filter(Boolean)
    .map(t => norm(t!))
    .filter(t => t.length >= 3);
  const directorN = director ? norm(director) : '';
  const yearN = year ? String(year) : '';
  const isRelevant = (v: YouTubeVideo): boolean => {
    if (isPremiumChannel(v)) return true;
    const titleN = norm(v.title);
    const descN = norm(v.description);
    const inTitle = titleTokens.some(t => titleN.includes(t));
    if (inTitle) return true;
    const inDesc = titleTokens.some(t => descN.includes(t));
    if (!inDesc) return false;
    // Description match must be corroborated by year or director to avoid false positives
    return (!!yearN && (titleN.includes(yearN) || descN.includes(yearN))) ||
           (!!directorN && (titleN.includes(directorN) || descN.includes(directorN)));
  };

  // Filter out marketing content but be less aggressive
  let filteredVideos = videos.filter(v => {
    const titleLower = v.title.toLowerCase();
    const descLower = v.description.toLowerCase();
    const combined = titleLower + ' ' + descLower;
    
    // Only exclude obvious trailers/marketing
    const strictMarketingKeywords = ['trailer officiel', 'official trailer', 'bande-annonce officielle', 'teaser officiel', 'tv spot'];
    if (strictMarketingKeywords.some(kw => combined.includes(kw))) return false;
    
    // Exclude videos shorter than 5 minutes
    const minutes = getVideoDurationMinutes(v);
    if (minutes < 5) return false;

    if (!isRelevant(v)) return false;

    return true;
  });

  // No fallback that bypasses relevance. Better to show nothing than off-topic
  // content (gorilla / Cherry Bomb Python / Clash of Clans / etc.).
  
  console.log(`After filtering: ${filteredVideos.length} videos`);
  
  // Sort: French content first, then by quality score
  return filteredVideos.sort((a, b) => {
    const aFr = isFrenchContent(a) ? 1 : 0;
    const bFr = isFrenchContent(b) ? 1 : 0;
    if (aFr !== bFr) return bFr - aFr;
    return getVideoQualityScore(b) - getVideoQualityScore(a);
  });
}

// Categorize videos into 2 editorial buckets:
// - production: tournage, making-of, BTS, interviews acteurs/réalisateurs/équipe
// - editorial: analyses, présentations, masterclass, Q&A, vidéos-essais (style cinémathèque)
export function categorizeVideos(videos: YouTubeVideo[]): {
  production: YouTubeVideo[];
  editorial: YouTubeVideo[];
} {
  // Production: how the film was made + people who made it talking about it
  const productionKeywords = [
    // Making-of & set
    'making of', 'making-of', 'behind the scenes', 'bts', 'on set', 'set visit',
    'set tour', 'inside the making', 'how they made', 'featurette', 'documentary',
    'special feature', 'bonus feature',
    'tournage', 'coulisses', 'dans les coulisses', 'fabrication', 'reportage tournage',
    // Crew / craft
    'production design', 'vfx', 'visual effects', 'practical effects', 'special effects',
    'cinematography of', 'shooting on film', 'anamorphic', 'lighting', 'color grading',
    'sound design', 'sound editing', 'sound mix', 'costume design', 'art direction',
    'editing process', 'post-production', 'post production', 'score', 'scoring',
    'film score', 'original score', 'stunt', 'choreography',
    'directeur photo', 'chef opérateur', 'monteur', 'monteuse', 'compositeur',
    'décors', 'costumes', 'cascades',
    // Interviews of cast / crew
    'interview', 'entrevue', 'entretien', 'rencontre avec', 'rencontre entre',
    'press conference', 'press junket', 'press tour',
    'director interview', 'cast interview', 'conférence de presse',
  ];

  // Editorial: cinephile analysis, presentations, video essays — the cinémathèque tone
  const editorialKeywords = [
    // Analysis / essays
    'analysis', 'analyse', 'décryptage', 'video essay', 'vidéo essai', 'essai vidéo',
    'explained', 'explication', 'breakdown', 'deep dive', 'meaning', 'symbolism',
    'symbolique', 'thèmes', 'themes', 'philosophy', 'philosophie', 'lecture du film',
    // Presentations / Q&A / talks
    'présentation', 'presentation', 'présenté par', 'présente', 'introduction',
    'masterclass', 'master class', 'conférence', 'conference', 'lecture',
    'q&a', 'q & a', 'qa session', 'questions answers',
    'cast q&a', 'director q&a', 'audience q&a', 'screening q&a',
    'post-screening', 'post screening', 'post-projection',
    'press conference', 'conférence de presse',
    'guild screening', 'afi screening', 'sag foundation',
    'fyc', 'for your consideration', 'contenders',
    'film independent', 'california film institute',
    'panel discussion', 'public discussion',
    'in conversation', 'conversation with', 'talks about', 'discusses',
    'présenté par', 'présentation de', 'introduit par', 'séance présentée',
    'avant-séance', 'ciné-club', 'cine-club', 'leçon de cinéma',
    // Cross-interviews & roundtables (editorial format, not production BTS)
    'actors on actors', 'directors on directors', 'roundtable',
    'close up with', 'screen talks', 'in conversation with',
    // Cinémathèque / institutions
    'cinémathèque', 'cinematheque', 'forum des images', 'institut lumière',
    'criterion', 'retrospective', 'rétrospective', 'tribute', 'hommage',
    'film at lincoln center', 'lincoln center', 'metrograph', 'film forum',
    'bamcinematek', 'bam cinema', 'moma', 'anthology film archives',
    'academy museum', 'bfi southbank', 'cineteca', 'arsenal berlin',
    // Reviews / critiques
    'critique', 'review in-depth', 'film analysis', 'mon avis', 'que vaut', 'vaut-il',
  ];

  const production: YouTubeVideo[] = [];
  const editorial: YouTubeVideo[] = [];
  const unknown: YouTubeVideo[] = [];

  for (const video of videos) {
    const combined = (video.title + ' ' + video.description).toLowerCase();
    const prodScore = productionKeywords.filter(kw => combined.includes(kw)).length;
    const editScore = editorialKeywords.filter(kw => combined.includes(kw)).length;

    if (prodScore === 0 && editScore === 0) {
      unknown.push(video);
    } else if (editScore > prodScore) {
      editorial.push(video);
    } else {
      production.push(video);
    }
  }

  // Distribute unknown content roughly between buckets to avoid losing it,
  // skewing toward editorial (the editorial line of the product).
  unknown.forEach((v, i) => (i % 2 === 0 ? editorial : production).push(v));

  // Sort each bucket: French first, then quality
  const sortFn = (a: YouTubeVideo, b: YouTubeVideo) => {
    const aFr = isFrenchContent(a) ? 1 : 0;
    const bFr = isFrenchContent(b) ? 1 : 0;
    if (aFr !== bFr) return bFr - aFr;
    return getVideoQualityScore(b) - getVideoQualityScore(a);
  };
  production.sort(sortFn);
  editorial.sort(sortFn);

  return { production, editorial };
}
