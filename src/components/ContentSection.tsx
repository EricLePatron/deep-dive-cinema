import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentSectionProps {
  title: string;
  count?: number;
  children: ReactNode;
  className?: string;
  onViewAll?: () => void;
}

export function ContentSection({
  title,
  count,
  children,
  className,
  onViewAll,
}: ContentSectionProps) {
  return (
    <section className={cn("py-8", className)}>
      <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-border">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-2xl text-foreground tracking-tight">
            {title}
          </h2>
          {count !== undefined && count > 0 && (
            <span className="editorial-label tabular-nums">{count}</span>
          )}
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="editorial-label flex items-center gap-1 transition-colors hover:text-foreground group"
          >
            Voir tout
            <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      {children}
    </section>
  );
}
