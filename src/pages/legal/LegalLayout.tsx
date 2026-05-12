import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { SiteFooter } from "@/components/SiteFooter";
import { ReactNode } from "react";

export function LegalLayout({ title, kicker, updated, children }: { title: string; kicker: string; updated: string; children: ReactNode }) {
  return (
    <div className="dark min-h-screen bg-background safe-top safe-bottom">
      <Header />
      <main className="container mx-auto px-6 pt-32 pb-20 max-w-3xl">
        <div className="editorial-label mb-4 text-foreground/60">— {kicker}</div>
        <h1 className="font-display text-4xl md:text-6xl text-foreground tracking-tight mb-3">{title}</h1>
        <p className="editorial-label text-foreground/50 mb-12">Dernière mise à jour : {updated}</p>
        <article className="prose-legal space-y-8 text-foreground/80 font-light leading-relaxed">
          {children}
        </article>
        <div className="mt-16 pt-8 border-t border-border">
          <Link to="/" className="editorial-label text-foreground/60 hover:text-foreground transition-colors">← Retour à l'accueil</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
