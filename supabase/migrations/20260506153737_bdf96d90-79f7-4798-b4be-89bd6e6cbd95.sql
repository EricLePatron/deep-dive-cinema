
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.video_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_id TEXT NOT NULL,
  film_tmdb_id INTEGER,
  rating TEXT NOT NULL CHECK (rating IN ('up','down')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, video_id)
);

ALTER TABLE public.video_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own video feedback"
  ON public.video_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own video feedback"
  ON public.video_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own video feedback"
  ON public.video_feedback FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own video feedback"
  ON public.video_feedback FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_video_feedback_user ON public.video_feedback(user_id);
CREATE INDEX idx_video_feedback_film ON public.video_feedback(film_tmdb_id);

CREATE TRIGGER update_video_feedback_updated_at
  BEFORE UPDATE ON public.video_feedback
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
