import { Check, Eye } from "lucide-react";
import { toast } from "sonner";
import { useConsumed, AddConsumedInput, ConsumedType } from "@/hooks/useConsumed";
import { cn } from "@/lib/utils";

interface ConsumedButtonProps {
  input: AddConsumedInput;
  className?: string;
  size?: "sm" | "md";
  label?: string;
}

const VERB: Record<ConsumedType, { done: string; mark: string; unmark: string }> = {
  article: { done: "Lu", mark: "Marquer comme lu", unmark: "Marquer comme non lu" },
  video:   { done: "Vu", mark: "Marquer comme vu", unmark: "Marquer comme non vu" },
  book:    { done: "Lu", mark: "Marquer comme lu", unmark: "Marquer comme non lu" },
  podcast: { done: "Écouté", mark: "Marquer comme écouté", unmark: "Marquer comme non écouté" },
};

export function ConsumedButton({ input, className, size = "sm", label }: ConsumedButtonProps) {
  const { user, isConsumed, toggle, isPending } = useConsumed();
  const active = isConsumed(input.itemType, input.itemId);
  const iconSize = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  const verbs = VERB[input.itemType];

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Connectez-vous pour suivre votre lecture.");
      return;
    }
    try {
      const added = await toggle(input);
      toast.success(added ? `${verbs.done} ✓` : "Retiré de l'historique");
    } catch {
      toast.error("Action impossible");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={active ? verbs.unmark : verbs.mark}
      aria-pressed={active}
      title={active ? `${verbs.done} — cliquer pour retirer` : verbs.mark}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm transition-colors px-2 py-1 text-[11px]",
        active
          ? "text-foreground bg-foreground/10"
          : "text-muted-foreground hover:text-foreground hover:bg-foreground/5",
        className
      )}
    >
      {active ? <Check className={iconSize} /> : <Eye className={iconSize} />}
      {(label || active) && <span>{label ?? verbs.done}</span>}
    </button>
  );
}