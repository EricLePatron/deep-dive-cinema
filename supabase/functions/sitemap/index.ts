import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SITE_URL = "https://www.deepdive-cinema.com";
const MIN_CONTENT = 5; // Films avec au moins N éléments de contenu

serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Récupérer les films avec suffisamment de contenu
    const { data: films, error } = await supabase
      .from("film_content_stats")
      .select("film_id, updated_at, total_content")
      .gte("total_content", MIN_CONTENT)
      .order("total_content", { ascending: false })
      .limit(5000);

    if (error) {
      console.error("Supabase error:", error);
      return new Response("Error generating sitemap", { status: 500 });
    }

    const today = new Date().toISOString().split("T")[0];

    // Pages statiques
    const staticUrls = [
      { loc: "/", priority: "1.0", changefreq: "daily" },
      { loc: "/trending", priority: "0.8", changefreq: "daily" },
    ]
      .map(
        ({ loc, priority, changefreq }) => `  <url>
    <loc>${SITE_URL}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
      )
      .join("\n");

    // Pages film dynamiques
    const filmUrls = (films || [])
      .map(({ film_id, updated_at, total_content }) => {
        const lastmod = updated_at
          ? new Date(updated_at).toISOString().split("T")[0]
          : today;

        // Priorité basée sur la richesse du contenu
        const priority =
          total_content >= 30 ? "0.9" : total_content >= 15 ? "0.8" : "0.7";

        return `  <url>
    <loc>${SITE_URL}/film/${film_id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
      })
      .join("\n");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${filmUrls}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Sitemap error:", err);
    return new Response("Internal server error", { status: 500 });
  }
});
