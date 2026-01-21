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
  'red carpet', 'tapis rouge', 'premiere', 'première',
  'fan reaction', 'audience reaction',
  'rank', 'ranking', 'top 10', 'top 5', 'tier list',
  'honest trailer', 'pitch meeting', 'everything wrong',
  'compilation', 'best moments', 'funny moments', 'scene',
  'recap', 'explained in', 'minutes'
];

// Professional cinephile channels to prioritize
const premiumChannels = [
  // English channels
  'criterion collection', 'bfi', 'british film institute',
  'academy originals', 'oscars', 'tiff', 'toronto international',
  'sundance institute', 'cannes', 'venice film festival',
  'american cinematheque', 'asc', 'cinematographer',
  'directors guild', 'dga', 'writers guild', 'wga',
  'sag-aftra', 'actors on actors', 'variety',
  'hollywood reporter', 'indiewire', 'film comment',
  'sight and sound', 'little white lies', 'mubi',
  'a24', 'neon', 'searchlight', 'focus features',
  'arrow video', 'shout factory', 'kino lorber',
  'every frame a painting', 'lessons from the screenplay',
  'nerdwriter', 'channel criswell', 'like stories of old',
  'the royal ocean film society', 'just write',
  'filmspotting', 'the ringer', 'the rewatchables',
  // French channels
  'arte cinema', 'cahiers du cinéma', 'les inrocks',
  'télérama', 'positif', 'cinémathèque', 'institut lumière',
  'le cercle', 'blow up', 'analyse film', 'cinéaste',
  'la septième obsession', 'sofilm', 'mad movies',
  // Studios & distributors with quality content
  'warner bros', 'universal pictures', 'paramount',
  'sony pictures', 'lionsgate', 'mgm'
];

// High-value content keywords (boost score)
const premiumContentKeywords = [
  'masterclass', 'in conversation', 'q&a', 'q & a',
  'director interview', 'actor interview', 'actress interview',
  'filmmaker', 'cinéaste', 'réalisateur', 'metteur en scène',
  'screenwriter', 'scénariste', 'cinematographer', 'directeur photo',
  'behind the camera', 'making of documentary', 'the art of',
  'criterion', 'restoration', 'retrospective', 'tribute',
  'legacy', 'influence', 'career retrospective',
  'press conference', 'festival', 'academy', 'bafta', 'cesar',
  'golden globes', 'press junket full', 'roundtable',
  'discusses', 'breaks down', 'explains', 'reveals'
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

// Filter out low-quality/marketing content
function isHighQualityContent(video: YouTubeVideo, minDuration: number = 20): boolean {
  const titleLower = video.title.toLowerCase();
  const descLower = video.description.toLowerCase();
  const combined = titleLower + ' ' + descLower;
  
  // Exclude if contains marketing keywords
  if (excludeKeywords.some(kw => combined.includes(kw))) {
    return false;
  }
  
  // Filter based on minimum duration
  const totalMinutes = getVideoDurationMinutes(video);
  if (totalMinutes < minDuration) {
    return false;
  }
  
  return true;
}

// Calculate a quality score for a video
function getVideoQualityScore(video: YouTubeVideo): number {
  let score = 0;
  const titleLower = video.title.toLowerCase();
  const descLower = video.description.toLowerCase();
  const channelLower = video.channelTitle.toLowerCase();
  const combined = titleLower + ' ' + descLower;
  
  // Premium channel bonus (+50 points)
  if (premiumChannels.some(ch => channelLower.includes(ch))) {
    score += 50;
  }
  
  // Premium content keywords bonus (+10 per keyword, max 40)
  const contentMatches = premiumContentKeywords.filter(kw => combined.includes(kw));
  score += Math.min(contentMatches.length * 10, 40);
  
  // Duration bonus (longer = better for in-depth content)
  const minutes = getVideoDurationMinutes(video);
  if (minutes >= 60) score += 20;
  else if (minutes >= 40) score += 15;
  else if (minutes >= 25) score += 10;
  
  // High engagement bonus
  if (video.viewCount > 1000000) score += 15;
  else if (video.viewCount > 100000) score += 10;
  else if (video.viewCount > 10000) score += 5;
  
  // Like ratio bonus (if we have likes)
  if (video.likeCount > 0 && video.viewCount > 0) {
    const likeRatio = video.likeCount / video.viewCount;
    if (likeRatio > 0.05) score += 10;
    else if (likeRatio > 0.03) score += 5;
  }
  
  return score;
}

// Search for all types of film content in a single, optimized query
export async function searchFilmVideos(filmTitle: string, year?: number): Promise<YouTubeVideo[]> {
  const yearStr = year ? ` ${year}` : '';
  // Use cinephile-focused query terms with emphasis on interviews and Q&A
  const query = `${filmTitle}${yearStr} interview OR q&a OR masterclass OR making of OR analysis`;
  const videos = await searchYouTubeVideos(query, 30);
  
  // First try to get 20+ minute videos
  let filteredVideos = videos.filter(v => isHighQualityContent(v, 20));
  
  // If no long videos found, fallback to 10-20 minute videos
  if (filteredVideos.length === 0) {
    filteredVideos = videos.filter(v => isHighQualityContent(v, 10));
  }
  
  // Sort by quality score (highest first)
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
  const analysisKeywords = ['analysis', 'explained', 'breakdown', 'essay', 'meaning', 'symbolism', 'deep dive', 'théorie', 'analyse', 'décryptage', 'philosophy', 'themes', 'cinematography', 'directing', 'visual style', 'technique'];
  const btsKeywords = ['making of', 'behind the scenes', 'bts', 'production', 'how they made', 'vfx', 'special effects', 'documentary', 'coulisses', 'fabrication', 'tournage', 'on set', 'featurette'];
  const interviewKeywords = ['interview', 'q&a', 'q & a', 'qa', 'press junket', 'talk show', 'cast interview', 'director interview', 'entrevue', 'conversation with', 'discusses', 'talks about', 'masterclass', 'in conversation', 'roundtable', 'actors on actors', 'press conference'];
  const reviewKeywords = ['critique', 'review in-depth', 'film analysis', 'retrospective', 'avis détaillé', 'criterion', 'tribute', 'legacy'];

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
    const combined = titleLower + ' ' + descLower;

    if (interviewKeywords.some(kw => combined.includes(kw))) {
      categorized.interviews.push(video);
    } else if (analysisKeywords.some(kw => combined.includes(kw))) {
      categorized.analysis.push(video);
    } else if (btsKeywords.some(kw => combined.includes(kw))) {
      categorized.behindTheScenes.push(video);
    } else if (reviewKeywords.some(kw => combined.includes(kw))) {
      categorized.reviews.push(video);
    } else {
      categorized.other.push(video);
    }
  }

  // Sort each category by quality score
  Object.keys(categorized).forEach(key => {
    categorized[key as keyof typeof categorized].sort((a, b) => getVideoQualityScore(b) - getVideoQualityScore(a));
  });

  return categorized;
}
