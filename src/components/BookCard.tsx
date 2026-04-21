import { ExternalLink, Book, User, ShoppingCart } from "lucide-react";
import { BookResult, categoryLabels } from "@/hooks/useFilmBooks";
import { cn } from "@/lib/utils";

interface BookCardProps {
  book: BookResult;
}

export function BookCard({ book }: BookCardProps) {
  const isFrench = book.language === 'fr';
  return (
    <div className="group flex flex-col gap-3 p-4 rounded-lg bg-muted/20 border border-border/40 hover:border-border hover:bg-muted/30 transition-colors">
      <div className="flex gap-4">
      {/* Cover */}
      <a
        href={book.infoLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 w-20 h-28 rounded-md overflow-hidden bg-muted"
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
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>{categoryLabels[book.category]}</span>
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
          <h4 className="font-medium text-foreground text-sm leading-tight line-clamp-2">
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
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/30 items-center">
          <ShoppingCart className="h-3 w-3 text-muted-foreground" />
          {book.retailers.map((r) => (
            <a
              key={r.name}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md border border-border/50 text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/40 transition-colors"
            >
              {r.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
