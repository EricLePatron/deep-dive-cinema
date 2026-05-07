CREATE TABLE IF NOT EXISTS public.youtube_cache (
  cache_key TEXT PRIMARY KEY,
  query TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_youtube_cache_expires ON public.youtube_cache(expires_at);

ALTER TABLE public.youtube_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cache readable by everyone"
  ON public.youtube_cache FOR SELECT
  USING (true);
