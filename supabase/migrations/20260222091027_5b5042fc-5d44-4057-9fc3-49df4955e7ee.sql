
-- Store Letterboxd username per user
CREATE TABLE public.letterboxd_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  username TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.letterboxd_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own letterboxd profile"
  ON public.letterboxd_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own letterboxd profile"
  ON public.letterboxd_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own letterboxd profile"
  ON public.letterboxd_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own letterboxd profile"
  ON public.letterboxd_profiles FOR DELETE
  USING (auth.uid() = user_id);
