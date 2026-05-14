import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, LineChart, Line, ReferenceLine,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Heart, Eye, Film, ThumbsUp, ThumbsDown,
  TrendingUp, Lock, BookOpen, Mic, Star, Zap,
  CheckCircle, AlertCircle, Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type FavRow = { item_type: string; created_at: string; film_title: string; film_tmdb_id: number };
type ConsumedRow = { item_type: string; created_at: string; film_title: string; film_tmdb_id: number };
type FeedbackRow = { rating: string };
type FilmStat = { tmdb_id: number; video_count: number; podcast_count: number; book_count: number };

// ─── Constants ────────────────────────────────────────────────────────────────
const DASHBOARD_PASSWORD = "deepdive2026";
const STORAGE_KEY = "dd_analytics_auth";
const CHART_COLORS = {
  favorites: "#7dd3fc",
  consumed: "#6ee7b7",
  north_star: "#a78bfa",
};
const TYPE_LABELS: Record<string, string> = {
  video: "Vidéos", podcast: "Podcasts", book: "Livres", article: "Articles",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function formatWeekLabel(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

// ─── UI Components ────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, color = "text-foreground", badge,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color?: string; badge?: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex gap-4 items-start relative">
      <div className="p-2 rounded-lg bg-muted shrink-0">
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
        <p className="text-3xl font-display font-bold text-foreground tabular-nums">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
      {badge && <div className="absolute top-3 right-3">{badge}</div>}
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

function KPITarget({
  actual, target, unit = "", alertBelow, goodAbove,
}: {
  actual: number | null; target: number; unit?: string; alertBelow?: number; goodAbove?: number;
}) {
  if (actual === null) return <span className="text-xs text-muted-foreground/50">En attente de données</span>;
  const pct = Math.min(100, Math.round((actual / target) * 100));
  const isGood = goodAbove ? actual >= goodAbove : pct >= 80;
  const isAlert = alertBelow ? actual < alertBelow : pct < 40;
  const barColor = isAlert ? "bg-red-500" : isGood ? "bg-emerald-500" : "bg-amber-400";
  return (
    <div className="mt-2 space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className={isAlert ? "text-red-400 font-semibold" : isGood ? "text-emerald-400 font-semibold" : "text-amber-400"}>
          {actual}{unit}
        </span>
        <span>cible : {target}{unit}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StatusBadge({ ok, warn, label }: { ok?: boolean; warn?: boolean; label: string }) {
  if (ok) return (
    <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
      <CheckCircle className="h-3 w-3" /> {label}
    </span>
  );
  if (warn) return (
    <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
      <AlertCircle className="h-3 w-3" /> {label}
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
      <Clock className="h-3 w-3" /> {label}
    </span>
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
        <p className="text-sm text-center text-muted-foreground mb-6">Tableau de bord privé</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password" value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
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
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const { data: favs } = useQuery({
    queryKey: ["my_favorites", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("favorites").select("item_type, created_at, film_title, film_tmdb_id")
        .order("created_at", { ascending: false });
      return (data ?? []) as FavRow[];
    },
    enabled: unlocked,
  });

  const { data: consumed } = useQuery({
    queryKey: ["my_consumed", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("consumed_items").select("item_type, created_at, film_title, film_tmdb_id")
        .order("created_at", { ascending: false });
      return (data ?? []) as ConsumedRow[];
    },
    enabled: unlocked,
  });

  const { data: feedback } = useQuery({
    queryKey: ["my_feedback", userId],
    queryFn: async () => {
      const { data } = await supabase.from("video_feedback").select("rating");
      return (data ?? []) as FeedbackRow[];
    },
    enabled: unlocked,
  });

  const { data: richFilms } = useQuery({
    queryKey: ["rich_films"],
    queryFn: async () => {
      const { data } = await supabase
        .from("film_content_stats")
        .select("tmdb_id, video_count, podcast_count, book_count")
        .order("video_count", { ascending: false }).limit(20);
      return (data ?? []) as FilmStat[];
    },
    enabled: unlocked,
  });

  // ── Calculs ────────────────────────────────────────────────────────────────
  const totalFavs = favs?.length ?? 0;
  const totalConsumed = consumed?.length ?? 0;

  const upVotes = feedback?.filter((f) => f.rating === "up").length ?? 0;
  const downVotes = feedback?.filter((f) => f.rating === "down").length ?? 0;
  const totalVotes = upVotes + downVotes;
  const upRate = totalVotes > 0 ? Math.round((upVotes / totalVotes) * 100) : null;

  // Films explorés
  const distinctFilmsTotal = useMemo(() => new Set([
    ...(favs?.map((f) => f.film_tmdb_id) ?? []),
    ...(consumed?.map((c) => c.film_tmdb_id) ?? []),
  ]).size, [favs, consumed]);

  // Profondeur : moyens contenus par film
  const avgDepth = useMemo(() => {
    if (distinctFilmsTotal === 0) return 0;
    return +((totalFavs + totalConsumed) / distinctFilmsTotal).toFixed(1);
  }, [totalFavs, totalConsumed, distinctFilmsTotal]);

  // Couverture catalogue (films avec interactions / films trackés)
  const totalFilmsTracked = richFilms?.length ?? 0;
  const filmsRich = richFilms?.filter((f) => (f.video_count + f.podcast_count + f.book_count) >= 10).length ?? 0;
  const coveragePct = totalFilmsTracked > 0
    ? Math.round((distinctFilmsTotal / totalFilmsTracked) * 100)
    : null;

  // ── North Star — SAA (cette semaine) ──────────────────────────────────────
  const saaStatus = useMemo(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const filmMap: Record<number, number> = {};
    (favs ?? []).filter(a => new Date(a.created_at) >= weekAgo).forEach(a => {
      if (a.film_tmdb_id) filmMap[a.film_tmdb_id] = (filmMap[a.film_tmdb_id] ?? 0) + 1;
    });
    (consumed ?? []).filter(a => new Date(a.created_at) >= weekAgo).forEach(a => {
      if (a.film_tmdb_id) filmMap[a.film_tmdb_id] = (filmMap[a.film_tmdb_id] ?? 0) + 1;
    });
    const filmsWithDepth = Object.values(filmMap).filter(c => c >= 2).length;
    return {
      filmsWithDepth,
      isApprofondissant: filmsWithDepth >= 2,
      filmsNeeded: Math.max(0, 2 - filmsWithDepth),
    };
  }, [favs, consumed]);

  // ── Activité par semaine (8 semaines) ─────────────────────────────────────
  const weeklyActivity = useMemo(() => {
    const weeks: Record<string, { favoris: number; consommes: number }> = {};
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const monday = getMondayOfWeek(d).toISOString().split("T")[0];
      weeks[monday] = { favoris: 0, consommes: 0 };
    }
    (favs ?? []).forEach(f => {
      const monday = getMondayOfWeek(new Date(f.created_at)).toISOString().split("T")[0];
      if (weeks[monday]) weeks[monday].favoris++;
    });
    (consumed ?? []).forEach(c => {
      const monday = getMondayOfWeek(new Date(c.created_at)).toISOString().split("T")[0];
      if (weeks[monday]) weeks[monday].consommes++;
    });
    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, v]) => ({ week: formatWeekLabel(week), ...v }));
  }, [favs, consumed]);

  // ── Répartition par type ──────────────────────────────────────────────────
  const contentBreakdown = useMemo(() => {
    const favsByType: Record<string, number> = {};
    const consumedByType: Record<string, number> = {};
    (favs ?? []).forEach(f => { favsByType[f.item_type] = (favsByType[f.item_type] ?? 0) + 1; });
    (consumed ?? []).forEach(c => { consumedByType[c.item_type] = (consumedByType[c.item_type] ?? 0) + 1; });
    const types = Array.from(new Set([...Object.keys(favsByType), ...Object.keys(consumedByType)]));
    return types.map(t => ({
      label: TYPE_LABELS[t] ?? t,
      favoris: favsByType[t] ?? 0,
      consommés: consumedByType[t] ?? 0,
    }));
  }, [favs, consumed]);

  // ── Top films ─────────────────────────────────────────────────────────────
  const topFilms = useMemo(() => {
    const map: Record<number, { title: string; favs: number; consumed: number }> = {};
    (favs ?? []).forEach(f => {
      if (!f.film_tmdb_id) return;
      if (!map[f.film_tmdb_id]) map[f.film_tmdb_id] = { title: f.film_title, favs: 0, consumed: 0 };
      map[f.film_tmdb_id].favs++;
    });
    (consumed ?? []).forEach(c => {
      if (!c.film_tmdb_id) return;
      if (!map[c.film_tmdb_id]) map[c.film_tmdb_id] = { title: c.film_title, favs: 0, consumed: 0 };
      map[c.film_tmdb_id].consumed++;
    });
    return Object.entries(map)
      .map(([id, v]) => ({ id: Number(id), ...v, total: v.favs + v.consumed }))
      .sort((a, b) => b.total - a.total).slice(0, 10);
  }, [favs, consumed]);

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;

  return (
    <div className="dark min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">

        {/* ── Header ── */}
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

        {/* ── North Star — SAA ── */}
        <section>
          <div className={`rounded-2xl border p-6 ${saaStatus.isApprofondissant
            ? "border-violet-500/40 bg-violet-500/5"
            : "border-border bg-card"
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${saaStatus.isApprofondissant ? "bg-violet-500/20" : "bg-muted"}`}>
                  <Star className={`h-6 w-6 ${saaStatus.isApprofondissant ? "text-violet-400" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">North Star Metric</p>
                  <h2 className="font-display text-2xl text-foreground tracking-tight">SAA — Semaine Active Approfondissante</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    ≥ 2 films explorés cette semaine · ≥ 2 contenus par film (favoris + consommés)
                  </p>
                </div>
              </div>
              {saaStatus.isApprofondissant
                ? <StatusBadge ok label="Approfondissant ✦" />
                : saaStatus.filmsWithDepth === 1
                  ? <StatusBadge warn label="1 film sur 2" />
                  : <StatusBadge label="Pas encore" />
              }
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="bg-background/60 rounded-xl p-4 text-center">
                <p className="text-3xl font-display font-bold text-foreground tabular-nums">{saaStatus.filmsWithDepth}</p>
                <p className="text-xs text-muted-foreground mt-1">films enrichis cette semaine</p>
              </div>
              <div className="bg-background/60 rounded-xl p-4 text-center">
                <p className="text-3xl font-display font-bold text-foreground tabular-nums">2</p>
                <p className="text-xs text-muted-foreground mt-1">films requis pour SAA</p>
              </div>
              <div className="bg-background/60 rounded-xl p-4 text-center">
                <p className={`text-3xl font-display font-bold tabular-nums ${saaStatus.isApprofondissant ? "text-violet-400" : "text-muted-foreground"}`}>
                  {saaStatus.isApprofondissant ? "✓" : `+${saaStatus.filmsNeeded}`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {saaStatus.isApprofondissant ? "Objectif atteint" : "film(s) manquant(s)"}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Objectifs SAA globaux :</span>{" "}
                50 à M1 · 200 à M3 · 800 à M6 · 3 000 à M12 · 8 000 à M18
              </p>
            </div>
          </div>
        </section>

        {/* ── KPIs Primaires ── */}
        <section>
          <SectionTitle>KPIs Primaires — Objectifs & Actuel</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* KPI 1 — WAU */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-violet-400" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground">WAU — Utilisateurs actifs / semaine</p>
              </div>
              <p className="text-2xl font-display font-bold text-muted-foreground/40">—</p>
              <p className="text-xs text-muted-foreground mt-1">Requiert données multi-utilisateurs</p>
              <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground space-y-0.5">
                <div className="flex justify-between"><span>Cible M3</span><span className="text-foreground">1 000</span></div>
                <div className="flex justify-between"><span>Cible M6</span><span className="text-foreground">4 000</span></div>
                <div className="flex justify-between"><span>Cible M12</span><span className="text-foreground">15 000</span></div>
              </div>
            </div>

            {/* KPI 2 — Taux d'Activation */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-amber-400" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Taux d'Activation 48h</p>
              </div>
              <p className="text-2xl font-display font-bold text-muted-foreground/40">—</p>
              <p className="text-xs text-muted-foreground mt-1">≥ 1 favori + ≥ 1 consommé dans les 48h</p>
              <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground space-y-0.5">
                <div className="flex justify-between"><span>Alerte si</span><span className="text-red-400">&lt; 20%</span></div>
                <div className="flex justify-between"><span>Cible M3</span><span className="text-foreground">30%</span></div>
                <div className="flex justify-between"><span>Cible M6</span><span className="text-foreground">40%</span></div>
              </div>
            </div>

            {/* KPI 3 — Rétention J7 */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-sky-400" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Rétention J7</p>
              </div>
              <p className="text-2xl font-display font-bold text-muted-foreground/40">—</p>
              <p className="text-xs text-muted-foreground mt-1">% avec ≥ 1 action 7j après la première</p>
              <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground space-y-0.5">
                <div className="flex justify-between"><span>Cible M1-M3</span><span className="text-foreground">35%</span></div>
                <div className="flex justify-between"><span>Cible M3-M6</span><span className="text-foreground">40%</span></div>
                <div className="flex justify-between"><span>Cible M12+</span><span className="text-foreground">50%</span></div>
              </div>
            </div>

            {/* KPI 4 — Taux Feedback Positif ✅ */}
            <div className={`bg-card border rounded-xl p-5 ${
              upRate !== null && upRate < 60 ? "border-red-500/40" :
              upRate !== null && upRate >= 70 ? "border-emerald-500/30" : "border-border"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ThumbsUp className={`h-4 w-4 ${upRate !== null && upRate >= 70 ? "text-emerald-400" : "text-muted-foreground"}`} />
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Taux Feedback Positif</p>
                </div>
                {upRate !== null && (
                  upRate >= 70 ? <StatusBadge ok label="✓ Cible" />
                  : upRate < 60 ? <StatusBadge warn label="⚠ Alerte" />
                  : <StatusBadge label="En cours" />
                )}
              </div>
              <p className={`text-2xl font-display font-bold tabular-nums ${
                upRate !== null && upRate >= 70 ? "text-emerald-400" :
                upRate !== null && upRate < 60 ? "text-red-400" : "text-foreground"
              }`}>
                {upRate !== null ? `${upRate}%` : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{totalVotes} votes · {upVotes} 👍 · {downVotes} 👎</p>
              <KPITarget actual={upRate} target={80} unit="%" alertBelow={60} goodAbove={70} />
              <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground space-y-0.5">
                <div className="flex justify-between"><span>Alerte si</span><span className="text-red-400">&lt; 60%</span></div>
                <div className="flex justify-between"><span>Cible M3</span><span className="text-foreground">70%</span></div>
                <div className="flex justify-between"><span>Cible M12</span><span className="text-foreground">80%</span></div>
              </div>
            </div>

            {/* KPI 5 — Couverture Catalogue ✅ */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Film className="h-4 w-4 text-orange-400" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Couverture Catalogue</p>
              </div>
              <p className="text-2xl font-display font-bold text-foreground tabular-nums">
                {coveragePct !== null ? `${coveragePct}%` : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {distinctFilmsTotal} films sur {totalFilmsTracked} explorés
              </p>
              <KPITarget actual={coveragePct} target={35} unit="%" />
              <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground space-y-0.5">
                <div className="flex justify-between"><span>Cible M3</span><span className="text-foreground">15% du catalogue</span></div>
                <div className="flex justify-between"><span>Cible M6</span><span className="text-foreground">25% du catalogue</span></div>
                <div className="flex justify-between"><span>Cible M12</span><span className="text-foreground">35% du catalogue</span></div>
              </div>
            </div>

            {/* KPI secondaire — Profondeur session ✅ */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-4 w-4 text-sky-400" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Profondeur — Contenus / Film</p>
              </div>
              <p className={`text-2xl font-display font-bold tabular-nums ${avgDepth >= 4 ? "text-emerald-400" : "text-foreground"}`}>
                {avgDepth > 0 ? avgDepth : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">moyenne sur {distinctFilmsTotal} films explorés</p>
              <KPITarget actual={avgDepth > 0 ? avgDepth : null} target={4} unit="" goodAbove={4} />
              <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground space-y-0.5">
                <div className="flex justify-between"><span>Cible M12</span><span className="text-foreground">&gt; 4 contenus / film</span></div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground/60">
            <Clock className="h-3 w-3" />
            <span>Les KPIs WAU, Activation et Rétention J7 nécessitent les fonctions SQL multi-utilisateurs (migration Supabase)</span>
          </div>
        </section>

        {/* ── Activité par semaine ── */}
        <section>
          <SectionTitle>Activité hebdomadaire — 8 semaines</SectionTitle>
          {weeklyActivity.some(w => w.favoris > 0 || w.consommes > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                <ReferenceLine y={0} stroke="#1e293b" />
                <Line type="monotone" dataKey="favoris" name="Favoris" stroke={CHART_COLORS.favorites} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="consommes" name="Consommés" stroke={CHART_COLORS.consumed} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">Pas encore d'activité enregistrée.</p>
          )}
        </section>

        {/* ── Mon engagement global ── */}
        <section>
          <SectionTitle>Mon engagement global</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Mes favoris" value={totalFavs} sub={`sur ${new Set(favs?.map(f => f.film_tmdb_id)).size} films`} icon={Heart} color="text-sky-400" />
            <StatCard label="Contenus consommés" value={totalConsumed} sub={`sur ${new Set(consumed?.map(c => c.film_tmdb_id)).size} films`} icon={Eye} color="text-emerald-400" />
            <StatCard label="Films explorés" value={distinctFilmsTotal} sub="avec au moins 1 interaction" icon={Film} color="text-orange-400" />
            <StatCard label="Votes donnés" value={totalVotes} sub={upRate !== null ? `${upRate}% positifs` : "Aucun vote"} icon={TrendingUp} color="text-violet-400" />
          </div>
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
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} labelStyle={{ color: "#e2e8f0" }} />
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
                const pct = topFilms[0].total > 0 ? Math.round((film.total / topFilms[0].total) * 100) : 0;
                return (
                  <div key={film.id} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-5 tabular-nums text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <a href={`/film/${film.id}`} className="text-sm text-foreground hover:underline truncate max-w-xs">
                          {film.title || `Film #${film.id}`}
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
          </section>
        )}

        {/* ── Richesse du catalogue ── */}
        <section>
          <SectionTitle>Richesse du catalogue</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <StatCard label="Films trackés" value={totalFilmsTracked} sub="dans film_content_stats" icon={Film} color="text-orange-400" />
            <StatCard label="Films riches" value={filmsRich} sub="avec 10+ contenus référencés" icon={TrendingUp} color="text-emerald-400" />
            <StatCard
              label="Taux richesse"
              value={totalFilmsTracked > 0 ? `${Math.round((filmsRich / totalFilmsTracked) * 100)}%` : "—"}
              sub="du catalogue est riche"
              icon={Star}
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
          )}
        </section>

        {/* Footer */}
        <div className="border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">Deepdive Analytics · Usage interne uniquement · Données en temps réel</p>
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
