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
  // French channels
  'arte cinema', 'cahiers du cinéma', 'les inrocks',
  'télérama', 'positif', 'cinémathèque', 'institut lumière',
  'le cercle', 'blow up', 'analyse film', 'cinéaste',
  'la septième obsession', 'sofilm', 'mad movies',
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
  
  // Use cinephile-focused query terms with emphasis on interviews and Q&A
  // Adding director name helps disambiguate films like "L'Étranger" (common title)
  const query = `${filmTitle}${directorStr}${yearStr} interview OR making of OR analysis OR critique`;
  
  console.log('YouTube search query:', query);
  
  const videos = await searchYouTubeVideos(query, 50);
  
  console.log(`Found ${videos.length} raw videos from YouTube`);
  
  // Filter out marketing content but be less aggressive
  let filteredVideos = videos.filter(v => {
    const titleLower = v.title.toLowerCase();
    const descLower = v.description.toLowerCase();
    const combined = titleLower + ' ' + descLower;
    
    // Only exclude obvious trailers/marketing
    const strictMarketingKeywords = ['trailer officiel', 'official trailer', 'bande-annonce officielle', 'teaser officiel', 'tv spot'];
    return !strictMarketingKeywords.some(kw => combined.includes(kw));
  });
  
  // If too aggressive, show all
  if (filteredVideos.length < 5) {
    filteredVideos = videos;
  }
  
  console.log(`After filtering: ${filteredVideos.length} videos`);
  
  // Sort by quality score (views + duration + premium content)
  return filteredVideos.sort((a, b) => getVideoQualityScore(b) - getVideoQualityScore(a));
}

// Categorize videos by type based on title/description keywords
export function categorizeVideos(videos: YouTubeVideo[]): {
  analysis: YouTubeVideo[];
  behindTheScenes: YouTubeVideo[];
  interviews: YouTubeVideo[];
  reviews: YouTubeVideo[];
  other: YouTubeVideo[];
} {
  // Interviews & Q&A - prioritize masterclasses and crew interviews
  const interviewKeywords = [
    'masterclass', 'master class', 'q&a', 'q & a', 'qa session',
    'interview', 'entrevue', 'entretien', 'in conversation', 'roundtable',
    'actors on actors', 'press conference', 'press junket',
    'director interview', 'cast interview', 'discusses', 'talks about',
    'cinematographer', 'roger deakins', 'director of photography',
    'oscar-winning', 'academy award', 'conversation with',
    'rencontre', 'échange', 'parle de'
  ];
  
  // Making of & Behind the scenes - prioritize set visits and production documentaries
  const btsKeywords = [
    'making of', 'behind the scenes', 'bts', 'inside the making',
    'how they made', 'created with', 'set visit', 'set tour',
    'toured the set', 'on set', 'production design', 'production designer',
    'vfx', 'visual effects', 'special effects', 'practical effects',
    'documentary', 'featurette', 'coulisses', 'fabrication', 'tournage',
    'special feature', 'bonus feature', 'dans les coulisses'
  ];
  
  // Analysis & video essays
  const analysisKeywords = [
    'analysis', 'explained', 'breakdown', 'essay', 'meaning',
    'symbolism', 'deep dive', 'théorie', 'analyse', 'décryptage',
    'philosophy', 'themes', 'cinematography', 'directing',
    'visual style', 'technique', 'storytelling', 'explication',
    'comprendre', 'pourquoi'
  ];
  
  const reviewKeywords = [
    'critique', 'review in-depth', 'film analysis', 'retrospective', 
    'avis détaillé', 'criterion', 'tribute', 'legacy', 'mon avis',
    'que vaut', 'vaut-il'
  ];

  const categorized = {
    analysis: [] as YouTubeVideo[],
    behindTheScenes: [] as YouTubeVideo[],
    interviews: [] as YouTubeVideo[],
    reviews: [] as YouTubeVideo[],
    other: [] as YouTubeVideo[],
  };

  for (const video of videos) {
    const titleLower = video.title.toLowerCase();
    const descLower = video.description.toLowerCase();
    const channelLower = video.channelTitle.toLowerCase();
    const combined = titleLower + ' ' + descLower;

    // Count keyword matches for each category
    const interviewScore = interviewKeywords.filter(kw => combined.includes(kw)).length;
    const btsScore = btsKeywords.filter(kw => combined.includes(kw)).length;
    const analysisScore = analysisKeywords.filter(kw => combined.includes(kw)).length;
    const reviewScore = reviewKeywords.filter(kw => combined.includes(kw)).length;
    
    // Find the highest scoring category
    const maxScore = Math.max(interviewScore, btsScore, analysisScore, reviewScore);
    
    if (maxScore === 0) {
      categorized.other.push(video);
    } else if (interviewScore === maxScore) {
      categorized.interviews.push(video);
    } else if (btsScore === maxScore) {
      categorized.behindTheScenes.push(video);
    } else if (analysisScore === maxScore) {
      categorized.analysis.push(video);
    } else if (reviewScore === maxScore) {
      categorized.reviews.push(video);
    } else {
      categorized.other.push(video);
    }
  }

  // Sort each category by quality score (views + duration)
  Object.keys(categorized).forEach(key => {
    categorized[key as keyof typeof categorized].sort((a, b) => getVideoQualityScore(b) - getVideoQualityScore(a));
  });

  // FALLBACK: Ensure each category has content by pulling from 'other' if empty
  const minPerCategory = 2;
  const categories: (keyof typeof categorized)[] = ['interviews', 'behindTheScenes', 'analysis', 'reviews'];
  
  for (const category of categories) {
    if (categorized[category].length < minPerCategory && categorized.other.length > 0) {
      const needed = minPerCategory - categorized[category].length;
      const toMove = categorized.other.splice(0, Math.min(needed, categorized.other.length));
      categorized[category].push(...toMove);
    }
  }

  return categorized;
}
