-- ============================================================
-- Analytics functions — SECURITY DEFINER pour bypasser RLS
-- Données agrégées uniquement, jamais de données personnelles
-- ============================================================

-- 1. Vue d'ensemble globale
CREATE OR REPLACE FUNCTION public.analytics_overview()
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total_users',        (SELECT COUNT(DISTINCT user_id) FROM public.letterboxd_profiles),
    'total_favorites',    (SELECT COUNT(*) FROM public.favorites),
    'total_consumed',     (SELECT COUNT(*) FROM public.consumed_items),
    'total_votes',        (SELECT COUNT(*) FROM public.video_feedback),
    'votes_up',           (SELECT COUNT(*) FROM public.video_feedback WHERE rating = 'up'),
    'votes_down',         (SELECT COUNT(*) FROM public.video_feedback WHERE rating = 'down'),
    'films_tracked',      (SELECT COUNT(*) FROM public.film_content_stats),
    'films_rich',         (SELECT COUNT(*) FROM public.film_content_stats WHERE (video_count + podcast_count + book_count) >= 10)
  );
$$;

GRANT EXECUTE ON FUNCTION public.analytics_overview() TO authenticated;

-- 2. Nouveaux utilisateurs par semaine (12 dernières semaines)
CREATE OR REPLACE FUNCTION public.analytics_users_by_week()
RETURNS TABLE(week TEXT, new_users BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    TO_CHAR(DATE_TRUNC('week', created_at), 'YYYY-MM-DD') AS week,
    COUNT(*) AS new_users
  FROM public.letterboxd_profiles
  WHERE created_at >= NOW() - INTERVAL '12 weeks'
  GROUP BY DATE_TRUNC('week', created_at)
  ORDER BY DATE_TRUNC('week', created_at);
$$;

GRANT EXECUTE ON FUNCTION public.analytics_users_by_week() TO authenticated;

-- 3. Top 15 films par engagement (favoris + consommés)
CREATE OR REPLACE FUNCTION public.analytics_top_films()
RETURNS TABLE(film_tmdb_id INTEGER, film_title TEXT, film_year INTEGER, film_poster_url TEXT, favorites_count BIGINT, consumed_count BIGINT, total_engagement BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(f.film_tmdb_id, c.film_tmdb_id)                    AS film_tmdb_id,
    COALESCE(f.film_title, c.film_title)                         AS film_title,
    COALESCE(f.film_year, c.film_year)                           AS film_year,
    COALESCE(f.film_poster_url, c.film_poster_url)               AS film_poster_url,
    COALESCE(f.cnt, 0)                                           AS favorites_count,
    COALESCE(c.cnt, 0)                                           AS consumed_count,
    COALESCE(f.cnt, 0) + COALESCE(c.cnt, 0)                     AS total_engagement
  FROM (
    SELECT film_tmdb_id, film_title, film_year, film_poster_url, COUNT(*) AS cnt
    FROM public.favorites
    WHERE film_tmdb_id IS NOT NULL
    GROUP BY film_tmdb_id, film_title, film_year, film_poster_url
  ) f
  FULL OUTER JOIN (
    SELECT film_tmdb_id, film_title, film_year, film_poster_url, COUNT(*) AS cnt
    FROM public.consumed_items
    WHERE film_tmdb_id IS NOT NULL
    GROUP BY film_tmdb_id, film_title, film_year, film_poster_url
  ) c ON f.film_tmdb_id = c.film_tmdb_id
  ORDER BY total_engagement DESC
  LIMIT 15;
$$;

GRANT EXECUTE ON FUNCTION public.analytics_top_films() TO authenticated;

-- 4. Répartition du contenu favorisé par type
CREATE OR REPLACE FUNCTION public.analytics_content_breakdown()
RETURNS TABLE(item_type TEXT, favorites_count BIGINT, consumed_count BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(f.item_type, c.item_type)   AS item_type,
    COALESCE(f.cnt, 0)                   AS favorites_count,
    COALESCE(c.cnt, 0)                   AS consumed_count
  FROM (
    SELECT item_type, COUNT(*) AS cnt FROM public.favorites GROUP BY item_type
  ) f
  FULL OUTER JOIN (
    SELECT item_type, COUNT(*) AS cnt FROM public.consumed_items GROUP BY item_type
  ) c ON f.item_type = c.item_type
  ORDER BY favorites_count DESC;
$$;

GRANT EXECUTE ON FUNCTION public.analytics_content_breakdown() TO authenticated;

-- 5. Activité par semaine (favoris + consommés)
CREATE OR REPLACE FUNCTION public.analytics_activity_by_week()
RETURNS TABLE(week TEXT, favorites_added BIGINT, items_consumed BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    TO_CHAR(DATE_TRUNC('week', w), 'YYYY-MM-DD') AS week,
    COALESCE(f.cnt, 0)                            AS favorites_added,
    COALESCE(c.cnt, 0)                            AS items_consumed
  FROM (
    SELECT DISTINCT DATE_TRUNC('week', created_at) AS w
    FROM (
      SELECT created_at FROM public.favorites
      WHERE created_at >= NOW() - INTERVAL '12 weeks'
      UNION ALL
      SELECT created_at FROM public.consumed_items
      WHERE created_at >= NOW() - INTERVAL '12 weeks'
    ) all_events
  ) weeks
  LEFT JOIN (
    SELECT DATE_TRUNC('week', created_at) AS w, COUNT(*) AS cnt
    FROM public.favorites
    WHERE created_at >= NOW() - INTERVAL '12 weeks'
    GROUP BY DATE_TRUNC('week', created_at)
  ) f ON f.w = weeks.w
  LEFT JOIN (
    SELECT DATE_TRUNC('week', created_at) AS w, COUNT(*) AS cnt
    FROM public.consumed_items
    WHERE created_at >= NOW() - INTERVAL '12 weeks'
    GROUP BY DATE_TRUNC('week', created_at)
  ) c ON c.w = weeks.w
  ORDER BY week;
$$;

GRANT EXECUTE ON FUNCTION public.analytics_activity_by_week() TO authenticated;

-- 6. Films les plus riches en contenu
CREATE OR REPLACE FUNCTION public.analytics_richest_films()
RETURNS TABLE(tmdb_id BIGINT, video_count INTEGER, podcast_count INTEGER, book_count INTEGER, total_content INTEGER, updated_at TIMESTAMPTZ)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    tmdb_id,
    video_count,
    podcast_count,
    book_count,
    (video_count + podcast_count + book_count) AS total_content,
    updated_at
  FROM public.film_content_stats
  ORDER BY (video_count + podcast_count + book_count) DESC
  LIMIT 20;
$$;

GRANT EXECUTE ON FUNCTION public.analytics_richest_films() TO authenticated;
