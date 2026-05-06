
CREATE OR REPLACE FUNCTION public.get_video_feedback_stats(video_ids text[])
RETURNS TABLE(video_id text, ups bigint, downs bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    vf.video_id,
    COUNT(*) FILTER (WHERE vf.rating = 'up')   AS ups,
    COUNT(*) FILTER (WHERE vf.rating = 'down') AS downs
  FROM public.video_feedback vf
  WHERE vf.video_id = ANY(video_ids)
  GROUP BY vf.video_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_video_feedback_stats(text[]) TO anon, authenticated;
