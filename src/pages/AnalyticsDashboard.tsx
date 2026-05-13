import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Heart, BookOpen, ThumbsUp, ThumbsDown, Film,
  TrendingUp, Eye, Lock,
} from "lucide-react";

// ─── Mot de passe (simple gate, URL déjà privée) ───────────────────────────
const DASHBOARD_PASSWORD = "deepdive2026";
const STORAGE_KEY = "dd_analytics_auth";

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatWeek(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

const TYPE_LABELS: Record<string, string> = {
  video: "Vidéos",
  podcast: "Podcasts",
  book: "Livres",
  article: "Articles",
};

// ─── Composants UI ──────────────────────────────────────────────────────────
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
  primary: "#e2e8f0",
  accent: "#94a3b8",
  favorites: "#7dd3fc",
  consumed: "#6ee7b7",
  users: "#c4b5fd",
};

// ─── Password Gate ───────────────────────────────────────────────────────────
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

// ─── Dashboard principal ─────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(STORAGE_KEY) === "1");

  // Aperçu global
  const { data: overview } = useQuery({
    queryKey: ["analytics_overview"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("analytics_overview");
      if (error) throw error;
      return data as {
        total_users: number;
        total_favorites: number;
        total_consumed: number;
        total_votes: number;
        votes_up: number;
        votes_down: number;
        films_tracked: number;
        films_rich: number;
      };
    },
    enabled: unlocked,
    refetchInterval: 60_000,
  });

  // Nouveaux users par semaine
  const { data: usersByWeek } = useQuery({
    queryKey: ["analytics_users_by_week"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("analytics_users_by_week");
      if (error) throw error;
      return (data as { week: string; new_users: number }[]).map((d) => ({
        ...d,
        week: formatWeek(d.week),
      }));
    },
    enabled: unlocked,
  });

  // Activité par semaine
  const { data: activityByWeek } = useQuery({
    queryKey: ["analytics_activity_by_week"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("analytics_activity_by_week");
      if (error) throw error;
      return (data as { week: string; favorites_added: number; items_consumed: number }[]).map((d) => ({
        ...d,
        week: formatWeek(d.week),
      }));
    },
    enabled: unlocked,
  });

  // Top films
  const { data: topFilms } = useQuery({
    queryKey: ["analytics_top_films"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("analytics_top_films");
      if (error) throw error;
      return data as {
        film_tmdb_id: number;
        film_title: string;
        film_year: number;
        film_poster_url: string;
        favorites_count: number;
        consumed_count: number;
        total_engagement: number;
      }[];
    },
    enabled: unlocked,
  });

  // Répartition par type
  const { data: contentBreakdown } = useQuery({
    queryKey: ["analytics_content_breakdown"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("analytics_content_breakdown");
      if (error) throw error;
      return (data as { item_type: string; favorites_count: number; consumed_count: number }[]).map(
        (d) => ({ ...d, label: TYPE_LABELS[d.item_type] ?? d.item_type })
      );
    },
    enabled: unlocked,
  });

  // Films les plus riches
  const { data: richestFilms } = useQuery({
    queryKey: ["analytics_richest_films"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("analytics_richest_films");
      if (error) throw error;
      return data as {
        tmdb_id: number;
        video_count: number;
        podcast_count: number;
        book_count: number;
        total_content: number;
      }[];
    },
    enabled: unlocked,
  });

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;

  const upRate = overview && overview.total_votes > 0
    ? Math.round((overview.votes_up / overview.total_votes) * 100)
    : null;

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
            <p className="text-xs text-muted-foreground">Mis à jour en temps réel</p>
            <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        </div>

        {/* ── Cartes KPI ── */}
        <section>
          <SectionTitle>Vue d'ensemble</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Utilisateurs"
              value={overview?.total_users ?? "—"}
              sub="Comptes Letterboxd connectés"
              icon={Users}
              color="text-violet-400"
            />
            <StatCard
              label="Favoris sauvés"
              value={overview?.total_favorites ?? "—"}
              sub="Vidéos, podcasts, livres, articles"
              icon={Heart}
              color="text-sky-400"
            />
            <StatCard
              label="Contenus consommés"
              value={overview?.total_consumed ?? "—"}
              sub="Marqués comme vus / lus"
              icon={Eye}
              color="text-emerald-400"
            />
            <StatCard
              label="Films trackés"
              value={overview?.films_tracked ?? "—"}
              sub={`dont ${overview?.films_rich ?? "—"} avec 10+ contenus`}
              icon={Film}
              color="text-orange-400"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <StatCard
              label="Votes totaux"
              value={overview?.total_votes ?? "—"}
              sub="Feedback vidéos"
              icon={TrendingUp}
            />
            <StatCard
              label="👍 Up"
              value={overview ? `${overview.votes_up} (${upRate ?? "—"}%)` : "—"}
              sub="Vidéos appréciées"
              icon={ThumbsUp}
              color="text-emerald-400"
            />
            <StatCard
              label="👎 Down"
              value={overview?.votes_down ?? "—"}
              sub="Signaux de mauvaise qualité"
              icon={ThumbsDown}
              color="text-red-400"
            />
          </div>
        </section>

        {/* ── Nouveaux utilisateurs par semaine ── */}
        <section>
          <SectionTitle>Nouveaux utilisateurs — 12 semaines</SectionTitle>
          {usersByWeek && usersByWeek.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={usersByWeek} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
                  labelStyle={{ color: "#e2e8f0" }}
                  itemStyle={{ color: CHART_COLORS.users }}
                />
                <Bar dataKey="new_users" name="Nouveaux users" fill={CHART_COLORS.users} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">Pas encore de données.</p>
          )}
        </section>

        {/* ── Activité par semaine ── */}
        <section>
          <SectionTitle>Activité hebdomadaire — Favoris & Consommés</SectionTitle>
          {activityByWeek && activityByWeek.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={activityByWeek}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                <Line type="monotone" dataKey="favorites_added" name="Favoris ajoutés" stroke={CHART_COLORS.favorites} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="items_consumed" name="Contenus consommés" stroke={CHART_COLORS.consumed} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">Pas encore de données.</p>
          )}
        </section>

        {/* ── Top films par engagement ── */}
        <section>
          <SectionTitle>Top 15 films — Engagement utilisateurs</SectionTitle>
          {topFilms && topFilms.length > 0 ? (
            <div className="space-y-2">
              {topFilms.map((film, i) => {
                const max = topFilms[0].total_engagement;
                const pct = max > 0 ? Math.round((film.total_engagement / max) * 100) : 0;
                return (
                  <div key={film.film_tmdb_id} className="flex items-center gap-3 group">
                    <span className="text-xs text-muted-foreground w-5 tabular-nums text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <a
                          href={`/film/${film.film_tmdb_id}`}
                          className="text-sm text-foreground hover:underline truncate max-w-xs"
                        >
                          {film.film_title}
                          {film.film_year && <span className="text-muted-foreground ml-1">({film.film_year})</span>}
                        </a>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground ml-4 flex-shrink-0">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-sky-400" />
                            {film.favorites_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3 text-emerald-400" />
                            {film.consumed_count}
                          </span>
                          <span className="font-semibold text-foreground w-6 text-right">{film.total_engagement}</span>
                        </div>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-violet-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Pas encore de données d'engagement.</p>
          )}
        </section>

        {/* ── Répartition par type de contenu ── */}
        <section>
          <SectionTitle>Contenu favori par type</SectionTitle>
          {contentBreakdown && contentBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={contentBreakdown} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} width={70} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                <Bar dataKey="favorites_count" name="Favoris" fill={CHART_COLORS.favorites} radius={[0, 4, 4, 0]} />
                <Bar dataKey="consumed_count" name="Consommés" fill={CHART_COLORS.consumed} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">Pas encore de données.</p>
          )}
        </section>

        {/* ── Films les plus riches en contenu ── */}
        <section>
          <SectionTitle>Films les plus riches en contenu</SectionTitle>
          {richestFilms && richestFilms.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="text-xs uppercase tracking-widest text-muted-foreground pb-3 pr-4">Film (TMDB)</th>
                    <th className="text-xs uppercase tracking-widest text-muted-foreground pb-3 pr-4 text-right">📹 Vidéos</th>
                    <th className="text-xs uppercase tracking-widest text-muted-foreground pb-3 pr-4 text-right">🎧 Podcasts</th>
                    <th className="text-xs uppercase tracking-widest text-muted-foreground pb-3 text-right">📚 Livres</th>
                    <th className="text-xs uppercase tracking-widest text-muted-foreground pb-3 pl-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {richestFilms.map((film) => (
                    <tr key={film.tmdb_id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 pr-4">
                        <a href={`/film/${film.tmdb_id}`} className="text-foreground hover:underline">
                          #{film.tmdb_id}
                        </a>
                      </td>
                      <td className="py-2.5 pr-4 text-right tabular-nums text-sky-400">{film.video_count}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums text-violet-400">{film.podcast_count}</td>
                      <td className="py-2.5 text-right tabular-nums text-orange-400">{film.book_count}</td>
                      <td className="py-2.5 pl-4 text-right tabular-nums font-semibold text-foreground">{film.total_content}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Pas encore de données.</p>
          )}
        </section>

        {/* Footer */}
        <div className="border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Deepdive Analytics — Usage interne uniquement — Données agrégées anonymisées
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
