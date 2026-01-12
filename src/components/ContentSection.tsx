import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ContentSectionProps {
  title: string;
  icon: ReactNode;
  count?: number;
  children: ReactNode;
  className?: string;
  onViewAll?: () => void;
}

export function ContentSection({
  title,
  icon,
  count,
  children,
  className,
  onViewAll,
}: ContentSectionProps) {
  return (
    <section className={cn("py-8", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              {title}
            </h2>
            {count !== undefined && (
              <p className="text-sm text-muted-foreground">
                {count} {count === 1 ? "result" : "results"} found
              </p>
            )}
          </div>
        </div>
        
        {onViewAll && (
          <Button variant="cinema-ghost" size="sm" className="group">
            View all
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        )}
      </div>
      
      {children}
    </section>
  );
}
