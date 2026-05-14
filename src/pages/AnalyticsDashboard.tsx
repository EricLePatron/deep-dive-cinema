import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Heart, Eye, Film, ThumbsUp, ThumbsDown,
  TrendingUp, Lock, BookOpen, Mic,
} from "lucide-react";

// ─── Password Gate ───────────────────────────────────────────────────────────
const DASHBOARD_PASSWORD = "deepdive2026";
const STORAGE_KEY = "dd_analytics_auth";

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === DASHBOARD_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "1");
      onUnlock();
    } else {
      setError(true);
      setInput("");
    }
  }

  return (
    <div className="dark min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-sm p-8 bg-card border border-border rounded-2xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-muted rounded-full">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
        <h1 className="font-display text-2xl text-center text-foreground mb-1">Analytics Deepdive</h1>
        <p className="text-sm text-center text-muted-foreground mb-6">Tableau de bord privé</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            placeholder="Mot de passe"
            autoFocus
            className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/40"
          />
          {error && <p className="text-xs text-red-400 text-center">Mot de passe incorrect</p>}
          <button
            type="submit"
            className="w-full bg-foreground text-background font-medium py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Accéder
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── UI Components ────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, color = "text-foreground",
}: { label: string; value: string | number; sub?: string; icon: React.ElementType; color?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex gap-4 items-start">
      <div className="p-2 rounded-lg bg-muted">
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
        <p className="text-3xl font-display font-bold text-foreground tabular-nums">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-xl text-foreground tracking-tight border-b border-border pb-3 mb-6">
      {children}
    </h2>
  );
}

const CHART_COLORS = {
  favorites: "#7dd3fc",
  consumed: "#6ee7b7",
  videos: "#c4b5fd",
  podcasts: "#fda4af",
  books: "#fed7aa",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type FavRow = { item_type: string; created_at: string; film_title: string; film_tmdb_id: number };
type ConsumedRow = { item_type: string; created_at: string; film_title: string; film_tmdb_id: number };
type FeedbackRow = { rating: string };
type FilmStat = { tmdb_id: number; video_count: number; podcast_count: number; book_count: number };

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(STORAGE_KEY) === "1");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // ── Mes favoris ──────────────────────────────────────────────────────────
  const { data: favs } = useQuery({
    queryKey: ["my_favorites", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("favorites")
        .select("item_type, created_at, film_title, film_tmdb_id")
        .order("created_at", { ascending: false });
      return (data ?? []) as FavRow[];
    },
    enabled: unlocked,
  });

  // ── Mes contenus consommés ───────────────────────────────────────────────
  const { data: consumed } = useQuery({
    queryKey: ["my_consumed", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("consumed_items")
        .select("item_type, created_at, film_title, film_tmdb_id")
        .order("created_at", { ascending: false });
      return (data ?? []) as ConsumedRow[];
    },
    enabled: unlocked,
  });

  // ── Mon feedback ─────────────────────────────────────────────────────────
  const { data: feedback } = useQuery({
    queryKey: ["my_feedback", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("video_feedback")
        .select("rating");
      return (data ?? []) as FeedbackRow[];
    },
    enabled: unlocked,
  });

  // ── Films les plus riches (public) ───────────────────────────────────────
  const { data: richFilms } = useQuery({
    queryKey: ["rich_films"],
    queryFn: async () => {
      const { data } = await supabase
        .from("film_content_stats")
        .select("tmdb_id, video_count, podcast_count, book_count")
        .order("video_count", { ascending: false })
        .limit(20);
      return (data ?? []) as FilmStat[];
    },
    enabled: unlocked,
  });

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;

  // ── Calculs ──────────────────────────────────────────────────────────────
  const totalFavs = favs?.length ?? 0;
  const totalConsumed = consumed?.length ?? 0;

  const upVotes = feedback?.filter((f) => f.rating === "up").length ?? 0;
  const downVotes = feedback?.filter((f) => f.rating === "down").length ?? 0;
  const totalVotes = upVotes + downVotes;
  const upRate = totalVotes > 0 ? Math.round((upVotes / totalVotes) * 100) : null;

  // Films distincts engagés
  const distinctFilmsFavs = new Set(favs?.map((f) => f.film_tmdb_id)).size;
  const distinctFilmsConsumed = new Set(consumed?.map((c) => c.film_tmdb_id)).size;
  const distinctFilmsTotal = new Set([
    ...(favs?.map((f) => f.film_tmdb_id) ?? []),
    ...(consumed?.map((c) => c.film_tmdb_id) ?? []),
  ]).size;

  // Répartition par type — favoris
  const favsByType = (favs ?? []).reduce<Record<string, number>>((acc, f) => {
    acc[f.item_type] = (acc[f.item_type] ?? 0) + 1;
    return acc;
  }, {});

  const consumedByType = (consumed ?? []).reduce<Record<string, number>>((acc, c) => {
    acc[c.item_type] = (acc[c.item_type] ?? 0) + 1;
    return acc;
  }, {});

  const typeLabels: Record<string, string> = {
    video: "Vidéos", podcast: "Podcasts", book: "Livres", article: "Articles",
  };
  const allTypes = Array.from(new Set([
    ...Object.keys(favsByType),
    ...Object.keys(consumedByType),
  ]));
  const contentBreakdown = allTypes.map((t) => ({
    label: typeLabels[t] ?? t,
    favoris: favsByType[t] ?? 0,
    consommés: consumedByType[t] ?? 0,
  }));

  // Top films engagés (favoris + consommés)
  const filmEngagement: Record<number, { title: string; favs: number; consumed: number }> = {};
  (favs ?? []).forEach((f) => {
    if (!f.film_tmdb_id) return;
    if (!filmEngagement[f.film_tmdb_id]) filmEngagement[f.film_tmdb_id] = { title: f.film_title, favs: 0, consumed: 0 };
    filmEngagement[f.film_tmdb_id].favs++;
  });
  (consumed ?? []).forEach((c) => {
    if (!c.film_tmdb_id) return;
    if (!filmEngagement[c.film_tmdb_id]) filmEngagement[c.film_tmdb_id] = { title: c.film_title, favs: 0, consumed: 0 };
    filmEngagement[c.film_tmdb_id].consumed++;
  });
  const topFilms = Object.entries(filmEngagement)
    .map(([id, v]) => ({ id: Number(id), ...v, total: v.favs + v.consumed }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // Richesse catalogue
  const totalFilmsTracked = richFilms?.length ?? 0;
  const filmsRich = richFilms?.filter((f) => (f.video_count + f.podcast_count + f.book_count) >= 10).length ?? 0;

  return (
    <div className="dark min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Deepdive Cinema</p>
            <h1 className="font-display text-4xl text-foreground tracking-tight">Analytics</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Données en temps réel</p>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* ── Mon engagement ── */}
        <section>
          <SectionTitle>Mon engagement</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Mes favoris"
              value={totalFavs}
              sub={`sur ${distinctFilmsFavs} films`}
              icon={Heart}
              color="text-sky-400"
            />
            <StatCard
              label="Contenus consommés"
              value={totalConsumed}
              sub={`sur ${distinctFilmsConsumed} films`}
              icon={Eye}
              color="text-emerald-400"
            />
            <StatCard
              label="Films explorés"
              value={distinctFilmsTotal}
              sub="avec au moins 1 interaction"
              icon={Film}
              color="text-orange-400"
            />
            <StatCard
              label="Votes donnés"
              value={totalVotes}
              sub={upRate !== null ? `${upRate}% positifs` : "Aucun vote encore"}
              icon={TrendingUp}
              color="text-violet-400"
            />
          </div>

          {totalVotes > 0 && (
            <div className="grid grid-cols-2 gap-4 mt-4 max-w-sm">
              <StatCard
                label="👍 Up"
                value={`${upVotes} (${upRate}%)`}
                sub="Vidéos appréciées"
                icon={ThumbsUp}
                color="text-emerald-400"
              />
              <StatCard
                label="👎 Down"
                value={downVotes}
                sub="Signaux qualité"
                icon={ThumbsDown}
                color="text-red-400"
              />
            </div>
          )}
        </section>

        {/* ── Répartition par type ── */}
        {contentBreakdown.length > 0 && (
          <section>
            <SectionTitle>Répartition par type de contenu</SectionTitle>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={contentBreakdown} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} width={70} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                <Bar dataKey="favoris" name="Favoris" fill={CHART_COLORS.favorites} radius={[0, 4, 4, 0]} />
                <Bar dataKey="consommés" name="Consommés" fill={CHART_COLORS.consumed} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* ── Top films ── */}
        {topFilms.length > 0 && (
          <section>
            <SectionTitle>Mes films les plus explorés</SectionTitle>
            <div className="space-y-2">
              {topFilms.map((film, i) => {
                const max = topFilms[0].total;
                const pct = max > 0 ? Math.round((film.total / max) * 100) : 0;
                return (
                  <div key={film.id} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-5 tabular-nums text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <a
                          href={`/film/${film.id}`}
                          className="text-sm text-foreground hover:underline truncate max-w-xs"
                        >
                          {film.title || `Film #${film.id}`}
                        </a>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground ml-4 flex-shrink-0">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-sky-400" /> {film.favs}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3 text-emerald-400" /> {film.consumed}
                          </span>
                          <span className="font-semibold text-foreground w-5 text-right">{film.total}</span>
                        </div>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-violet-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Richesse du catalogue (public) ── */}
        <section>
          <SectionTitle>Richesse du catalogue</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              label="Films trackés"
              value={totalFilmsTracked}
              sub="dans film_content_stats"
              icon={Film}
              color="text-orange-400"
            />
            <StatCard
              label="Films riches"
              value={filmsRich}
              sub="avec 10+ contenus référencés"
              icon={TrendingUp}
              color="text-emerald-400"
            />
            <StatCard
              label="Taux richesse"
              value={totalFilmsTracked > 0 ? `${Math.round((filmsRich / totalFilmsTracked) * 100)}%` : "—"}
              sub="du catalogue est riche"
              icon={Users}
              color="text-violet-400"
            />
          </div>

          {richFilms && richFilms.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="text-xs uppercase tracking-widest text-muted-foreground pb-3 pr-4">Film (TMDB)</th>
                    <th className="text-xs uppercase tracking-widest text-muted-foreground pb-3 pr-3 text-right">
                      <span className="flex items-center gap-1 justify-end"><Eye className="h-3 w-3" /> Vidéos</span>
                    </th>
                    <th className="text-xs uppercase tracking-widest text-muted-foreground pb-3 pr-3 text-right">
                      <span className="flex items-center gap-1 justify-end"><Mic className="h-3 w-3" /> Podcasts</span>
                    </th>
                    <th className="text-xs uppercase tracking-widest text-muted-foreground pb-3 text-right">
                      <span className="flex items-center gap-1 justify-end"><BookOpen className="h-3 w-3" /> Livres</span>
                    </th>
                    <th className="text-xs uppercase tracking-widest text-muted-foreground pb-3 pl-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {richFilms.map((film) => {
                    const total = film.video_count + film.podcast_count + film.book_count;
                    return (
                      <tr key={film.tmdb_id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 pr-4">
                          <a href={`/film/${film.tmdb_id}`} className="text-foreground hover:underline text-sky-400">
                            #{film.tmdb_id}
                          </a>
                        </td>
                        <td className="py-2.5 pr-3 text-right tabular-nums text-violet-400">{film.video_count}</td>
                        <td className="py-2.5 pr-3 text-right tabular-nums text-pink-400">{film.podcast_count}</td>
                        <td className="py-2.5 text-right tabular-nums text-orange-400">{film.book_count}</td>
                        <td className="py-2.5 pl-4 text-right tabular-nums font-semibold text-foreground">{total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Footer */}
        <div className="border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Deepdive Analytics — Usage interne uniquement — Données en temps réel via Supabase
          </p>
          <button
            onClick={() => { localStorage.removeItem(STORAGE_KEY); setUnlocked(false); }}
            className="text-xs text-muted-foreground/50 hover:text-muted-foreground mt-2 transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
