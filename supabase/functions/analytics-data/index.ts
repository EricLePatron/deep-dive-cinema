import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DASHBOARD_PASSWORD = Deno.env.get('DASHBOARD_PASSWORD') ?? 'deepdive2026';

function getMondayISO(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

function buildWeekBuckets(weeks = 12): Record<string, number> {
  const buckets: Record<string, number> = {};
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    buckets[getMondayISO(d)] = 0;
  }
  return buckets;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    if (body.password !== DASHBOARD_PASSWORD) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const since12w = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000).toISOString();
    const since7d  = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000).toISOString();

    // ── Requêtes parallèles ──────────────────────────────────────────────────
    const [
      usersRes,
      favsCountRes,
      consumedCountRes,
      feedbackRes,
      filmStatsRes,
      usersByWeekRes,
      favsByWeekRes,
      consumedByWeekRes,
      topFavsRes,
      topConsumedRes,
      favsTypeRes,
      consumedTypeRes,
      weekFavsRes,
      weekConsumedRes,
    ] = await Promise.all([
      // Total users
      supabase.from('letterboxd_profiles').select('*', { count: 'exact', head: true }),
      // Total favoris
      supabase.from('favorites').select('*', { count: 'exact', head: true }),
      // Total consommés
      supabase.from('consumed_items').select('*', { count: 'exact', head: true }),
      // Feedback complet (pour compter up/down)
      supabase.from('video_feedback').select('rating'),
      // Films les plus riches
      supabase.from('film_content_stats')
        .select('tmdb_id, video_count, podcast_count, book_count')
        .order('video_count', { ascending: false }).limit(20),
      // Nouveaux users par semaine (12 sem)
      supabase.from('letterboxd_profiles')
        .select('created_at').gte('created_at', since12w),
      // Favoris par semaine
      supabase.from('favorites')
        .select('created_at').gte('created_at', since12w),
      // Consommés par semaine
      supabase.from('consumed_items')
        .select('created_at').gte('created_at', since12w),
      // Top films — favoris
      supabase.from('favorites')
        .select('film_tmdb_id, film_title, film_year, film_poster_url')
        .not('film_tmdb_id', 'is', null),
      // Top films — consommés
      supabase.from('consumed_items')
        .select('film_tmdb_id, film_title, film_year')
        .not('film_tmdb_id', 'is', null),
      // Répartition favoris par type
      supabase.from('favorites').select('item_type'),
      // Répartition consommés par type
      supabase.from('consumed_items').select('item_type'),
      // SAA — favoris cette semaine
      supabase.from('favorites')
        .select('user_id, film_tmdb_id').gte('created_at', since7d),
      // SAA — consommés cette semaine
      supabase.from('consumed_items')
        .select('user_id, film_tmdb_id').gte('created_at', since7d),
    ]);

    // ── Overview ─────────────────────────────────────────────────────────────
    const votes = feedbackRes.data ?? [];
    const votesUp   = votes.filter(v => v.rating === 'up').length;
    const votesDown = votes.filter(v => v.rating === 'down').length;
    const filmStats = filmStatsRes.data ?? [];
    const filmsRich = filmStats.filter(f => (f.video_count + f.podcast_count + f.book_count) >= 10).length;

    const overview = {
      total_users:    usersRes.count ?? 0,
      total_favorites: favsCountRes.count ?? 0,
      total_consumed:  consumedCountRes.count ?? 0,
      total_votes:    votes.length,
      votes_up:       votesUp,
      votes_down:     votesDown,
      films_tracked:  filmStats.length,
      films_rich:     filmsRich,
    };

    // ── SAA ──────────────────────────────────────────────────────────────────
    // Compter les users avec ≥2 films et ≥2 contenus/film cette semaine
    const saaMap: Record<string, Record<string, number>> = {}; // user_id → {film_id → count}
    const addToSaa = (rows: { user_id: string; film_tmdb_id: number }[]) => {
      (rows ?? []).forEach(r => {
        if (!r.user_id || !r.film_tmdb_id) return;
        if (!saaMap[r.user_id]) saaMap[r.user_id] = {};
        saaMap[r.user_id][r.film_tmdb_id] = (saaMap[r.user_id][r.film_tmdb_id] ?? 0) + 1;
      });
    };
    addToSaa((weekFavsRes.data ?? []) as { user_id: string; film_tmdb_id: number }[]);
    addToSaa((weekConsumedRes.data ?? []) as { user_id: string; film_tmdb_id: number }[]);
    const saaCount = Object.values(saaMap).filter(films =>
      Object.values(films).filter(c => c >= 2).length >= 2
    ).length;

    // ── Nouveaux users par semaine ────────────────────────────────────────────
    const userBuckets = buildWeekBuckets(12);
    (usersByWeekRes.data ?? []).forEach(r => {
      const w = getMondayISO(new Date(r.created_at));
      if (w in userBuckets) userBuckets[w]++;
    });
    const users_by_week = Object.entries(userBuckets).map(([week, new_users]) => ({ week, new_users }));

    // ── Activité par semaine ──────────────────────────────────────────────────
    const favWeekBuckets   = buildWeekBuckets(12);
    const consWeekBuckets  = buildWeekBuckets(12);
    (favsByWeekRes.data ?? []).forEach(r => {
      const w = getMondayISO(new Date(r.created_at));
      if (w in favWeekBuckets) favWeekBuckets[w]++;
    });
    (consumedByWeekRes.data ?? []).forEach(r => {
      const w = getMondayISO(new Date(r.created_at));
      if (w in consWeekBuckets) consWeekBuckets[w]++;
    });
    const activity_by_week = Object.keys(favWeekBuckets).map(week => ({
      week,
      favorites_added: favWeekBuckets[week],
      items_consumed:  consWeekBuckets[week],
    }));

    // ── Top films ─────────────────────────────────────────────────────────────
    const filmMap: Record<number, { title: string; year: number; favs: number; consumed: number }> = {};
    (topFavsRes.data ?? []).forEach(r => {
      const id = r.film_tmdb_id as number;
      if (!filmMap[id]) filmMap[id] = { title: r.film_title ?? '', year: r.film_year ?? 0, favs: 0, consumed: 0 };
      filmMap[id].favs++;
    });
    (topConsumedRes.data ?? []).forEach(r => {
      const id = r.film_tmdb_id as number;
      if (!filmMap[id]) filmMap[id] = { title: r.film_title ?? '', year: r.film_year ?? 0, favs: 0, consumed: 0 };
      filmMap[id].consumed++;
    });
    const top_films = Object.entries(filmMap)
      .map(([id, v]) => ({ film_tmdb_id: Number(id), ...v, total: v.favs + v.consumed }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 15);

    // ── Répartition par type ──────────────────────────────────────────────────
    const favTypeMap: Record<string, number> = {};
    const conTypeMap: Record<string, number> = {};
    (favsTypeRes.data ?? []).forEach(r => { favTypeMap[r.item_type] = (favTypeMap[r.item_type] ?? 0) + 1; });
    (consumedTypeRes.data ?? []).forEach(r => { conTypeMap[r.item_type] = (conTypeMap[r.item_type] ?? 0) + 1; });
    const allTypes = Array.from(new Set([...Object.keys(favTypeMap), ...Object.keys(conTypeMap)]));
    const content_breakdown = allTypes.map(t => ({
      item_type: t,
      favorites_count: favTypeMap[t] ?? 0,
      consumed_count:  conTypeMap[t] ?? 0,
    }));

    return new Response(JSON.stringify({
      overview,
      saa_count: saaCount,
      users_by_week,
      activity_by_week,
      top_films,
      content_breakdown,
      richest_films: filmStats,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
