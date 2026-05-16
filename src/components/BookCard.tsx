import { Book, User, ShoppingCart } from "lucide-react";
import { BookResult, categoryLabels } from "@/hooks/useFilmBooks";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ConsumedButton } from "@/components/ConsumedButton";
import { useConsumed } from "@/hooks/useConsumed";
import { cn } from "@/lib/utils";

interface BookCardProps {
  book: BookResult;
  film?: { tmdbId?: number; title?: string; posterUrl?: string | null; year?: number };
  director?: string;
}

export function BookCard({ book, film, director }: BookCardProps) {
  const isFrench = book.language === 'fr';
  const { isConsumed } = useConsumed();
  const consumed = isConsumed("book", book.id);

  // Personnalise le label "Sur le réalisateur" avec le nom réel
  const categoryLabel = book.category === 'director' && director
    ? `Sur ${director}`
    : categoryLabels[book.category];
  return (
    <div className={cn(
      "group relative flex flex-col gap-3 pt-4 border-t border-border/60 transition-opacity hover:opacity-90",
      consumed && "opacity-60 hover:opacity-90"
    )}>
      <div className="absolute top-2 right-0 flex items-center gap-1">
        <ConsumedButton input={{ itemType: "book", itemId: book.id, itemData: book, film }} />
        <FavoriteButton input={{ itemType: "book", itemId: book.id, itemData: book, film }} />
      </div>
      <div className="flex gap-4">
        {/* Cover */}
        <a
          href={book.infoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 w-20 h-28 overflow-hidden bg-muted rounded-sm"
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
              <Book className="h-7 w-7 text-muted-foreground" />
            </div>
          )}
        </a>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="editorial-label mb-1.5 flex items-center gap-2">
            <span>{categoryLabel}</span>
            {isFrench && (
              <>
                <span className="text-border">·</span>
                <span>FR</span>
              </>
            )}
          </div>
          <a
            href={book.infoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <h4 className="font-display text-lg leading-tight text-foreground line-clamp-2">
              {book.title}
            </h4>
          </a>
          {book.authors.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
              <User className="h-3 w-3" />
              <span className="truncate">{book.authors.join(', ')}</span>
            </p>
          )}
          <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground tabular-nums">
            {book.publisher && <span>{book.publisher}</span>}
            {book.publisher && book.publishedDate && <span>·</span>}
            {book.publishedDate && <span>{book.publishedDate.substring(0, 4)}</span>}
          </div>
        </div>
      </div>

      {/* Retailer purchase links */}
      {book.retailers && book.retailers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <ShoppingCart className="h-3 w-3 text-muted-foreground" />
          {book.retailers.map((r) => (
            <a
              key={r.name}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-sm border border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
            >
              {r.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
