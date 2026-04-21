import { ExternalLink, Book, User, ShoppingCart } from "lucide-react";
import { BookResult, categoryLabels } from "@/hooks/useFilmBooks";
import { cn } from "@/lib/utils";

interface BookCardProps {
  book: BookResult;
}

const categoryColors: Record<BookResult['category'], string> = {
  film: "bg-primary/10 text-primary border-primary/20",
  director: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  cast: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  genre: "bg-violet-500/10 text-violet-500 border-violet-500/20",
};

const retailerColors: Record<string, string> = {
  Fnac: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20",
  Cultura: "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20",
  "Amazon.fr": "bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/20",
  Amazon: "bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/20",
  Decitre: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20",
};

export function BookCard({ book }: BookCardProps) {
  const isFrench = book.language === 'fr';
  return (
    <div className="group flex flex-col gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all">
      <div className="flex gap-4">
      {/* Cover */}
      <a
        href={book.infoLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden bg-muted shadow-md"
      >
        {book.imageUrl ? (
          <img
            src={book.imageUrl}
            alt={book.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Book className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </a>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          <span className={cn("inline-block px-2 py-0.5 text-[10px] font-medium rounded-full border", categoryColors[book.category])}>
            {categoryLabels[book.category]}
          </span>
          {isFrench && (
            <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
              🇫🇷 FR
            </span>
          )}
        </div>
        <a
          href={book.infoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <h4 className="font-medium text-foreground text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {book.title}
          </h4>
        </a>
        {book.authors.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <User className="h-3 w-3" />
            <span className="truncate">{book.authors.join(', ')}</span>
          </p>
        )}
        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
          {book.publisher && <span>{book.publisher}</span>}
          {book.publisher && book.publishedDate && <span>·</span>}
          {book.publishedDate && <span>{book.publishedDate.substring(0, 4)}</span>}
        </div>
      </div>
      </div>

      {/* Retailer purchase links */}
      {book.retailers && book.retailers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/40">
          <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground self-center" />
          {book.retailers.map((r) => (
            <a
              key={r.name}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md border transition-colors",
                retailerColors[r.name] || "bg-muted text-muted-foreground border-border hover:bg-muted/80"
              )}
            >
              {r.name}
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
