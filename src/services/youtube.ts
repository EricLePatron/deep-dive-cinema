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

// Keywords to EXCLUDE - trailers, marketing, promotional content
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
  'recap', 'in 5 minutes', 'in 10 minutes', 'in 3 minutes'
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
  // Quality distributors
  'a24', 'neon', 'searchlight', 'focus features',
  'arrow video', 'shout factory', 'kino lorber',
  // Video essayists & film analysis
  'every frame a painting', 'lessons from the screenplay',
  'nerdwriter', 'channel criswell', 'like stories of old',
  'the royal ocean film society', 'just write',
  'filmspotting', 'the ringer', 'the rewatchables',
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
  'la filmothèque', 'la filmotheque', 'le luminor', 'l''escurial',
  'cinéma du panthéon', 'cinema du pantheon', 'le brady', 'mk2',
  'gaumont rive gauche', 'pathé live', 'le saint-andré-des-arts',
  'l''arlequin', 'le nouveau latina', 'majestic bastille',
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
  'france inter', 'mk2', 'forum des images', 'la fémis', 'femis', 'unifrance'
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
  
  // Premium channel bonus (+30 points)
  if (premiumChannels.some(ch => channelLower.includes(ch))) {
    score += 30;
  }
  
  // Premium content keywords bonus (+5 per keyword, max 25)
  const contentMatches = premiumContentKeywords.filter(kw => combined.includes(kw));
  score += Math.min(contentMatches.length * 5, 25);
  
  // VIEW COUNT is now a major factor (up to 50 points)
  if (video.viewCount > 10000000) score += 50;       // 10M+ views
  else if (video.viewCount > 5000000) score += 45;   // 5M+ views
  else if (video.viewCount > 1000000) score += 40;   // 1M+ views
  else if (video.viewCount > 500000) score += 35;    // 500K+ views
  else if (video.viewCount > 100000) score += 25;    // 100K+ views
  else if (video.viewCount > 50000) score += 15;     // 50K+ views
  else if (video.viewCount > 10000) score += 10;     // 10K+ views
  
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
export async function searchFilmVideos(filmTitle: string, year?: number, director?: string): Promise<YouTubeVideo[]> {
  const yearStr = year ? ` ${year}` : '';
  // Include director name for better accuracy (crucial for films with common titles)
  const directorStr = director ? ` ${director}` : '';

  // Editorial / cinémathèque style: presentations, analyses, masterclass + production: tournage, making-of, interviews
  // We run two queries (FR-leaning + EN) to maximise French content presence then merge & dedupe.
  const queryFr = `${filmTitle}${directorStr}${yearStr} présentation OR analyse OR masterclass OR entretien OR rencontre OR making of OR tournage`;
  const queryEn = `${filmTitle}${directorStr}${yearStr} presentation OR analysis OR video essay OR masterclass OR interview OR making of OR behind the scenes`;

  console.log('YouTube search queries:', { queryFr, queryEn });

  const [frVideos, enVideos] = await Promise.all([
    searchYouTubeVideos(queryFr, 30).catch(() => [] as YouTubeVideo[]),
    searchYouTubeVideos(queryEn, 30).catch(() => [] as YouTubeVideo[]),
  ]);

  // Dedupe by id, FR results first so they win on conflict
  const seen = new Set<string>();
  const videos: YouTubeVideo[] = [];
  for (const v of [...frVideos, ...enVideos]) {
    if (seen.has(v.id)) continue;
    seen.add(v.id);
    videos.push(v);
  }
  
  console.log(`Found ${videos.length} raw videos from YouTube`);
  
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
    
    return true;
  });
  
  // If too aggressive, fallback but still enforce 5min minimum
  if (filteredVideos.length < 5) {
    filteredVideos = videos.filter(v => getVideoDurationMinutes(v) >= 5);
  }
  // Ultimate fallback: all videos
  if (filteredVideos.length < 3) {
    filteredVideos = videos;
  }
  
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
    'press conference', 'press junket', 'roundtable', 'actors on actors',
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
    'in conversation', 'conversation with', 'talks about', 'discusses',
    // Cinémathèque / institutions
    'cinémathèque', 'cinematheque', 'forum des images', 'institut lumière',
    'criterion', 'retrospective', 'rétrospective', 'tribute', 'hommage',
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
