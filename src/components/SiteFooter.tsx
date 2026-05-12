import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-16 py-10 px-6">
      <div className="container mx-auto flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <span className="font-display text-xl">Deep<span className="italic">dive</span></span>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 editorial-label text-foreground/60">
          <Link to="/mentions-legales" className="hover:text-foreground transition-colors">Mentions légales</Link>
          <Link to="/confidentialite" className="hover:text-foreground transition-colors">Confidentialité</Link>
          <Link to="/cgu" className="hover:text-foreground transition-colors">CGU</Link>
          <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
        </nav>
        <span className="editorial-label text-foreground/50">© 2026 Deepdive</span>
      </div>
    </footer>
  );
}
