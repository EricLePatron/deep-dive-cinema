-- Restrict film_content_stats writes to authenticated users
DROP POLICY IF EXISTS "stats insertable by anyone" ON public.film_content_stats;
DROP POLICY IF EXISTS "stats updatable by anyone" ON public.film_content_stats;

CREATE POLICY "stats insertable by authenticated"
ON public.film_content_stats FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "stats updatable by authenticated"
ON public.film_content_stats FOR UPDATE TO authenticated
USING (true) WITH CHECK (true);

REVOKE INSERT, UPDATE ON public.film_content_stats FROM anon;
GRANT INSERT, UPDATE ON public.film_content_stats TO authenticated;