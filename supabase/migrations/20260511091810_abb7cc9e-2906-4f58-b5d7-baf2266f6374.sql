-- Track items the user has already consumed (read/watched/listened)
CREATE TABLE public.consumed_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_data JSONB NOT NULL,
  film_tmdb_id INTEGER,
  film_title TEXT,
  film_poster_url TEXT,
  film_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_type, item_id)
);

CREATE INDEX idx_consumed_items_user ON public.consumed_items(user_id);
CREATE INDEX idx_consumed_items_user_film ON public.consumed_items(user_id, film_tmdb_id);

ALTER TABLE public.consumed_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own consumed items"
  ON public.consumed_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consumed items"
  ON public.consumed_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own consumed items"
  ON public.consumed_items FOR DELETE
  USING (auth.uid() = user_id);