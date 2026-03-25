import { ExternalLink, Book, User } from "lucide-react";
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

export function BookCard({ book }: BookCardProps) {
  return (
    <a
      href={book.infoLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all"
    >
      {/* Cover */}
      <div className="flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden bg-muted">
        {book.imageUrl ? (
          <img
            src={book.imageUrl}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Book className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <span className={cn("inline-block px-2 py-0.5 text-[10px] font-medium rounded-full border mb-1.5", categoryColors[book.category])}>
          {categoryLabels[book.category]}
        </span>
        <h4 className="font-medium text-foreground text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {book.title}
        </h4>
        {book.authors.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <User className="h-3 w-3" />
            {book.authors.join(', ')}
          </p>
        )}
        {book.description && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
            {book.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
          {book.publisher && <span>{book.publisher}</span>}
          {book.publisher && book.publishedDate && <span>·</span>}
          {book.publishedDate && <span>{book.publishedDate.substring(0, 4)}</span>}
          <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
        </div>
      </div>
    </a>
  );
}
