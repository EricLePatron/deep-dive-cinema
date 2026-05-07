import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { useFavorites, AddFavoriteInput } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  input: AddFavoriteInput;
  className?: string;
  size?: "sm" | "md";
  label?: string;
}

export function FavoriteButton({ input, className, size = "sm", label }: FavoriteButtonProps) {
  const { user, isFavorite, toggle, isPending } = useFavorites();
  const active = isFavorite(input.itemType, input.itemId);
  const iconSize = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Connectez-vous pour ajouter aux favoris.");
      return;
    }
    try {
      const added = await toggle(input);
      toast.success(added ? "Ajouté aux favoris" : "Retiré des favoris");
    } catch {
      toast.error("Action impossible");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm transition-colors",
        "px-2 py-1 text-[11px]",
        active
          ? "text-foreground bg-foreground/10"
          : "text-muted-foreground hover:text-foreground hover:bg-foreground/5",
        className
      )}
    >
      <Bookmark className={cn(iconSize, active && "fill-foreground")} />
      {label && <span>{label}</span>}
    </button>
  );
}