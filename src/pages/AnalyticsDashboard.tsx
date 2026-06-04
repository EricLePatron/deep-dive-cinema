import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, LineChart, Line,
} from "recharts";
import {
  Users, Heart, Eye, Film, ThumbsUp, ThumbsDown,
  TrendingUp, Lock, Star, Zap, CheckCircle, AlertCircle, Clock,
  BookOpen, Mic,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const DASHBOARD_PASSWORD = import.meta.env.VITE_DASHBOARD_PASSWORD ?? "deepdive2026";
const STORAGE_KEY = "dd_analytics_auth";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "https://kyprrtpmvugfcfffaelv.supabase.co";
const EDGE_URL = `${SUPABASE_URL}/functions/v1/analytics-data`;

const CHART_COLORS = { favorites: "#7dd3fc", consumed: "#6ee7b7", users: "#c4b5fd" };
const TYPE_LABELS: Record<string, string> = {
  video: "Vidéos", podcast: "Podcasts", book: "Livres", article: "Articles",
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface AnalyticsData {
  overview: {
    total_users: number; total_favorites: number; total_consumed: number;
    total_votes: number; votes_up: number; votes_down: number;
    films_tracked: number; films_rich: number;
  };
  saa_count: number;
  users_by_week: { week: string; new_users: number }[];
  activity_by_week: { week: string; favorites_added: number; items_consumed: number }[];
  top_films: { film_tmdb_id: number; title: string; year: number; favs: number; consumed: number; total: number }[];
  content_breakdown: { item_type: string; favorites_count: number; consumed_count: number }[];
  richest_films: { tmdb_id: number; video_count: number; podcast_count: number; book_count: number }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtWeek(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

// ─── UI Components ────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, color = "text-foreground",
}: { label: string; value: string | number; sub?: string; icon: React.ElementType; color?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex gap-4 items-start">
      <div className="p-2 rounded-lg bg-muted shrink-0">
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

function KPICard({
  icon: Icon, iconColor, label, value, unit = "", sub, target, targetLabel,
  alertBelow, goodAbove, targets,
}: {
  icon: React.ElementType; iconColor: string; label: string;
  value: number | null; unit?: string; sub?: string;
  target?: number; targetLabel?: string;
  alertBelow?: number; goodAbove?: number;
  targets?: { label: string; value: string }[];
}) {
  const hasValue = value !== null;
  const pct = hasValue && target ? Math.min(100, Math.round((value / target) * 100)) : 0;
  const isGood  = goodAbove  ? (value ?? 0) >= goodAbove  : pct >= 80;
  const isAlert = alertBelow ? (value ?? 0) < alertBelow  : pct < 40;
  const barColor = !hasValue ? "bg-muted" : isAlert ? "bg-red-500" : isGood ? "bg-emerald-500" : "bg-amber-400";
  const valueColor = !hasValue ? "text-muted-foreground/40"
    : isAlert ? "text-red-400" : isGood ? "text-emerald-400" : "text-foreground";
  const badge = !hasValue ? null : isGood
    ? <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full"><CheckCircle className="h-3 w-3" /> Cible</span>
    : isAlert
    ? <span className="flex items-center gap-1 text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full"><AlertCircle className="h-3 w-3" /> Alerte</span>
    : null;

  return (
    <div className={`bg-card border rounded-xl p-5 ${isAlert && hasValue ? "border-red-500/30" : isGood && hasValue ? "border-emerald-500/20" : "border-border"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${iconColor}`} />
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        </div>
        {badge}
      </div>
      <p className={`text-2xl font-display font-bold tabular-nums ${valueColor}`}>
        {hasValue ? `${value}${unit}` : "—"}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      {target !== undefined && (
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className={valueColor}>{hasValue ? `${value}${unit}` : "—"}</span>
            <span>{targetLabel ?? `cible : ${target}${unit}`}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
      {targets && (
        <div className="mt-3 pt-3 border-t border-border/50 space-y-0.5">
          {targets.map(t => (
            <div key={t.label} className="flex justify-between text-xs text-muted-foreground">
              <span>{t.label}</span><span className="text-foreground">{t.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Password Gate ────────────────────────────────────────────────────────────
function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === DASHBOARD_PASSWORD) { localStorage.setItem(STORAGE_KEY, "1"); onUnlock(); }
    else { setError(true); setInput(""); }
  }
  return (
    <div className="dark min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-sm p-8 bg-card border border-border rounded-2xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-muted rounded-full"><Lock className="h-6 w-6 text-muted-foreground" /></div>
        </div>
        <h1 className="font-display text-2xl text-center text-foreground mb-1">Analytics Deepdive</h1>
        <p className="text-sm text-center text-muted-foreground mb-6">Tableau de bord interne</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" value={input} onChange={e => { setInput(e.target.value); setError(false); }}
            placeholder="Mot de passe" autoFocus
            className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/40"
          />
          {error && <p className="text-xs text-red-400 text-center">Mot de passe incorrect</p>}
          <button type="submit" className="w-full bg-foreground text-background font-medium py-3 rounded-lg hover:opacity-90 transition-opacity">
            Accéder
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(STORAGE_KEY) === "1");

  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["analytics_data"],
    queryFn: async () => {
      const res = await fetch(EDGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: DASHBOARD_PASSWORD }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: unlocked,
    refetchInterval: 5 * 60 * 1000, // refresh toutes les 5 min
    staleTime: 2 * 60 * 1000,
  });

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;

  const ov = data?.overview;
  const upRate = ov && ov.total_votes > 0 ? Math.round((ov.votes_up / ov.total_votes) * 100) : null;
  const filmsRichPct = ov && ov.films_tracked > 0 ? Math.round((ov.films_rich / ov.films_tracked) * 100) : null;

  const weeklyUsers = data?.users_by_week.map(d => ({ ...d, week: fmtWeek(d.week) })) ?? [];
  const weeklyActivity = data?.activity_by_week.map(d => ({ ...d, week: fmtWeek(d.week) })) ?? [];
  const topFilms = data?.top_films ?? [];
  const breakdown = data?.content_breakdown.map(d => ({
    label: TYPE_LABELS[d.item_type] ?? d.item_type,
    favoris: d.favorites_count,
    consommés: d.consumed_count,
  })) ?? [];
  const richFilms = data?.richest_films ?? [];

  return (
    <div className="dark min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Deepdive Cinema · Interne</p>
            <h1 className="font-display text-4xl text-foreground tracking-tight">Analytics</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Chargement…" : error ? "Erreur de chargement" : "Données en temps réel"}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
            Impossible de charger les données. Vérifiez que la Edge Function <code>analytics-data</code> est déployée sur Supabase.
          </div>
        )}

        {/* ── North Star — SAA ── */}
        <section>
          {(() => {
            const saa = data?.saa_count ?? null;
            const isGood = saa !== null && saa >= 50;
            return (
              <div className={`rounded-2xl border p-6 ${isGood ? "border-violet-500/40 bg-violet-500/5" : "border-border bg-card"}`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isGood ? "bg-violet-500/20" : "bg-muted"}`}>
                      <Star className={`h-6 w-6 ${isGood ? "text-violet-400" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">North Star Metric</p>
                      <h2 className="font-display text-2xl text-foreground tracking-tight">SAA — Semaines Actives Approfondissantes</h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        Utilisateurs ayant exploré ≥ 2 films · ≥ 2 contenus par film cette semaine
                      </p>
                    </div>
                  </div>
                  {saa !== null && (
                    isGood
                      ? <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full shrink-0"><CheckCircle className="h-3 w-3" /> Cible M1 atteinte</span>
                      : <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full shrink-0"><Clock className="h-3 w-3" /> En construction</span>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Cette semaine", val: saa !== null ? String(saa) : "—", accent: true },
                    { label: "Cible M1", val: "50" },
                    { label: "Cible M3", val: "200" },
                    { label: "Cible M12", val: "3 000" },
                  ].map(({ label, val, accent }) => (
                    <div key={label} className="bg-background/60 rounded-xl p-4 text-center">
                      <p className={`text-3xl font-display font-bold tabular-nums ${accent && saa !== null ? (isGood ? "text-violet-400" : "text-foreground") : "text-muted-foreground"}`}>{val}</p>
                      <p className="text-xs text-muted-foreground mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </section>

        {/* ── Vue d'ensemble ── */}
        <section>
          <SectionTitle>Vue d'ensemble</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Utilisateurs" value={isLoading ? "…" : ov?.total_users ?? "—"} sub="Comptes Letterboxd connectés" icon={Users} color="text-violet-400" />
            <StatCard label="Favoris" value={isLoading ? "…" : ov?.total_favorites ?? "—"} sub="Contenus mis en favori" icon={Heart} color="text-sky-400" />
            <StatCard label="Consommés" value={isLoading ? "…" : ov?.total_consumed ?? "—"} sub="Contenus marqués comme vus" icon={Eye} color="text-emerald-400" />
            <StatCard label="Votes" value={isLoading ? "…" : ov?.total_votes ?? "—"} sub={upRate !== null ? `${upRate}% positifs` : "Feedback vidéos"} icon={TrendingUp} color="text-orange-400" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <StatCard label="Films trackés" value={isLoading ? "…" : ov?.films_tracked ?? "—"} sub="Dans le catalogue" icon={Film} color="text-orange-400" />
            <StatCard label="Films riches" value={isLoading ? "…" : ov?.films_rich ?? "—"} sub={filmsRichPct !== null ? `${filmsRichPct}% du catalogue` : "Avec 10+ contenus"} icon={Star} color="text-amber-400" />
            <StatCard label="👍 Up" value={isLoading ? "…" : ov?.votes_up ?? "—"} sub="Vidéos appréciées" icon={ThumbsUp} color="text-emerald-400" />
            <StatCard label="👎 Down" value={isLoading ? "…" : ov?.votes_down ?? "—"} sub="Signaux de mauvaise qualité" icon={ThumbsDown} color="text-red-400" />
          </div>
        </section>

        {/* ── KPIs Primaires ── */}
        <section>
          <SectionTitle>KPIs Primaires — Objectifs & État</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <KPICard
              icon={Users} iconColor="text-violet-400" label="WAU — Utilisateurs actifs / semaine"
              value={null}
              sub="Nécessite une cohorte hebdomadaire"
              targets={[
                { label: "Cible M1", value: "200" },
                { label: "Cible M3", value: "1 000" },
                { label: "Cible M6", value: "4 000" },
                { label: "Cible M12", value: "15 000" },
              ]}
            />
            <KPICard
              icon={Zap} iconColor="text-amber-400" label="Taux d'Activation 48h"
              value={null}
              sub="≥ 1 favori + ≥ 1 consommé dans les 48h post-inscription"
              targets={[
                { label: "Alerte si", value: "< 20%" },
                { label: "Cible M3", value: "30%" },
                { label: "Cible M6", value: "40%" },
              ]}
            />
            <KPICard
              icon={TrendingUp} iconColor="text-sky-400" label="Rétention J7"
              value={null}
              sub="% avec ≥ 1 action 7 jours après la première"
              targets={[
                { label: "Cible M1-M3", value: "35%" },
                { label: "Cible M3-M6", value: "40%" },
                { label: "Cible M12+", value: "50%" },
              ]}
            />
            <KPICard
              icon={ThumbsUp} iconColor="text-emerald-400" label="Taux Feedback Positif"
              value={upRate} unit="%"
              sub={`${ov?.votes_up ?? 0} 👍 / ${ov?.votes_down ?? 0} 👎 sur ${ov?.total_votes ?? 0} votes`}
              target={80} targetLabel="cible M12 : 80%"
              alertBelow={60} goodAbove={70}
              targets={[
                { label: "Alerte si", value: "< 60%" },
                { label: "Cible M3", value: "70%" },
                { label: "Cible M12", value: "80%" },
              ]}
            />
            <KPICard
              icon={Film} iconColor="text-orange-400" label="Films riches / Catalogue"
              value={filmsRichPct} unit="%"
              sub={`${ov?.films_rich ?? 0} films avec 10+ contenus sur ${ov?.films_tracked ?? 0}`}
              target={35} targetLabel="cible M12 : 35%"
              targets={[
                { label: "Cible M3", value: "15%" },
                { label: "Cible M6", value: "25%" },
                { label: "Cible M12", value: "35%" },
              ]}
            />
            <KPICard
              icon={Star} iconColor="text-violet-400" label="SAA cette semaine"
              value={data?.saa_count ?? null}
              sub="Utilisateurs Approfondissants"
              target={50} targetLabel="cible M1 : 50"
              targets={[
                { label: "Cible M1", value: "50" },
                { label: "Cible M3", value: "200" },
                { label: "Cible M6", value: "800" },
                { label: "Cible M12", value: "3 000" },
              ]}
            />
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground/60">
            <Clock className="h-3 w-3 shrink-0" />
            WAU, Activation et Rétention J7 nécessitent un tracking de cohortes à implémenter.
          </p>
        </section>

        {/* ── Nouveaux utilisateurs / semaine ── */}
        <section>
          <SectionTitle>Nouveaux utilisateurs — 12 semaines</SectionTitle>
          {isLoading ? <p className="text-sm text-muted-foreground">Chargement…</p>
          : weeklyUsers.some(w => w.new_users > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyUsers} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} labelStyle={{ color: "#e2e8f0" }} itemStyle={{ color: CHART_COLORS.users }} />
                <Bar dataKey="new_users" name="Nouveaux utilisateurs" fill={CHART_COLORS.users} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-muted-foreground">Pas encore de données.</p>}
        </section>

        {/* ── Activité hebdomadaire ── */}
        <section>
          <SectionTitle>Activité hebdomadaire — Favoris & Consommés</SectionTitle>
          {isLoading ? <p className="text-sm text-muted-foreground">Chargement…</p>
          : weeklyActivity.some(w => w.favorites_added > 0 || w.items_consumed > 0) ? (
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} labelStyle={{ color: "#e2e8f0" }} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                <Line type="monotone" dataKey="favorites_added" name="Favoris ajoutés" stroke={CHART_COLORS.favorites} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="items_consumed" name="Contenus consommés" stroke={CHART_COLORS.consumed} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-muted-foreground">Pas encore de données.</p>}
        </section>

        {/* ── Top films par engagement ── */}
        <section>
          <SectionTitle>Top 15 films — Engagement utilisateurs</SectionTitle>
          {isLoading ? <p className="text-sm text-muted-foreground">Chargement…</p>
          : topFilms.length > 0 ? (
            <div className="space-y-2">
              {topFilms.map((film, i) => {
                const pct = topFilms[0].total > 0 ? Math.round((film.total / topFilms[0].total) * 100) : 0;
                return (
                  <div key={film.film_tmdb_id} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-5 tabular-nums text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <a href={`/film/${film.film_tmdb_id}`} className="text-sm text-foreground hover:underline truncate max-w-xs">
                          {film.title || `#${film.film_tmdb_id}`}
                          {film.year ? <span className="text-muted-foreground ml-1">({film.year})</span> : null}
                        </a>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground ml-4 shrink-0">
                          <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-sky-400" /> {film.favs}</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3 text-emerald-400" /> {film.consumed}</span>
                          <span className="font-semibold text-foreground w-5 text-right">{film.total}</span>
                        </div>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-sky-500 to-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-sm text-muted-foreground">Pas encore de données d'engagement.</p>}
        </section>

        {/* ── Répartition par type ── */}
        <section>
          <SectionTitle>Répartition par type de contenu</SectionTitle>
          {isLoading ? <p className="text-sm text-muted-foreground">Chargement…</p>
          : breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={breakdown} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} width={70} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} labelStyle={{ color: "#e2e8f0" }} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                <Bar dataKey="favoris" name="Favoris" fill={CHART_COLORS.favorites} radius={[0, 4, 4, 0]} />
                <Bar dataKey="consommés" name="Consommés" fill={CHART_COLORS.consumed} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-muted-foreground">Pas encore de données.</p>}
        </section>

        {/* ── Films les plus riches ── */}
        <section>
          <SectionTitle>Films les plus riches en contenu</SectionTitle>
          {isLoading ? <p className="text-sm text-muted-foreground">Chargement…</p>
          : richFilms.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="text-xs uppercase tracking-widest text-muted-foreground pb-3 pr-4">Film</th>
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
                          <a href={`/film/${film.tmdb_id}`} className="text-sky-400 hover:underline">#{film.tmdb_id}</a>
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
          ) : <p className="text-sm text-muted-foreground">Pas encore de données.</p>}
        </section>

        {/* Footer */}
        <div className="border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">Deepdive Cinema Analytics · Usage interne · Données agrégées anonymisées</p>
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
