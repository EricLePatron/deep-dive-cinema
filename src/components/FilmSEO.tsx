import { Helmet } from 'react-helmet-async';

interface FilmSEOProps {
  title: string;
  year: number;
  director: string;
  synopsis: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  filmId: number;
  videoCount?: number;
  podcastCount?: number;
  bookCount?: number;
}

const SITE_URL = 'https://www.deepdive-cinema.com';
const SITE_NAME = 'Deepdive';

export function FilmSEO({
  title,
  year,
  director,
  synopsis,
  posterUrl,
  backdropUrl,
  filmId,
  videoCount = 0,
  podcastCount = 0,
  bookCount = 0,
}: FilmSEOProps) {
  // Titre SEO — max 60 caractères
  const rawTitle = `${title} (${year}) — Analyses, podcasts, livres | ${SITE_NAME}`;
  const seoTitle = rawTitle.length > 60
    ? `${title} (${year}) | ${SITE_NAME}`
    : rawTitle;

  // Meta description dynamique avec compteurs de contenu
  const contentParts: string[] = [];
  if (videoCount > 0) contentParts.push(`${videoCount} vidéo${videoCount > 1 ? 's' : ''} d'analyse`);
  if (podcastCount > 0) contentParts.push(`${podcastCount} podcast${podcastCount > 1 ? 's' : ''}`);
  if (bookCount > 0) contentParts.push(`${bookCount} livre${bookCount > 1 ? 's' : ''}`);

  const contentStr = contentParts.length > 0
    ? contentParts.join(', ')
    : 'analyses vidéo, podcasts, livres';

  const metaDescription = `Tout ce qui se dit autour de ${title} de ${director} : ${contentStr}, éditions physiques. Le film est fini — l'exploration commence.`.slice(0, 155);

  // Images OG — utilise le backdrop en priorité
  const ogImage = backdropUrl || posterUrl || `${SITE_URL}/app-icon.png`;

  const canonicalUrl = `${SITE_URL}/film/${filmId}`;

  // JSON-LD Movie schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: title,
    dateCreated: String(year),
    director: {
      '@type': 'Person',
      name: director,
    },
    description: synopsis?.slice(0, 300) || undefined,
    image: posterUrl || undefined,
    url: canonicalUrl,
    inLanguage: 'fr',
  };

  return (
    <Helmet>
      {/* Titre */}
      <title>{seoTitle}</title>

      {/* Meta description */}
      <meta name="description" content={metaDescription} />

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={`${title} (${year}) — Deep Dive`} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@DeepDiveCinema" />
      <meta name="twitter:title" content={`${title} (${year}) — Deep Dive`} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Preload backdrop pour LCP */}
      {backdropUrl && (
        <link rel="preload" as="image" href={backdropUrl} />
      )}

      {/* JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
}
