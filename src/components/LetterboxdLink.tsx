import { useState } from "react";
import { Link } from "react-router-dom";
import { Link2, Unlink, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLetterboxdProfile, useSaveLetterboxdUsername, useDeleteLetterboxdProfile } from "@/hooks/useLetterboxd";
import { toast } from "sonner";

export function LetterboxdLink() {
  const { profile, isLoading, user } = useLetterboxdProfile();
  const saveMutation = useSaveLetterboxdUsername();
  const deleteMutation = useDeleteLetterboxdProfile();
  const [username, setUsername] = useState("");
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    if (!username.trim()) return;
    try {
      await saveMutation.mutateAsync({ userId: user.id, username: username.trim() });
      toast.success("Compte Letterboxd relié !");
      setOpen(false);
      setUsername("");
    } catch {
      toast.error("Erreur lors de la liaison du compte");
    }
  };

  const handleUnlink = async () => {
    try {
      await deleteMutation.mutateAsync(user.id);
      toast.success("Compte Letterboxd délié");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (isLoading) return null;

  if (profile) {
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/diary"
          aria-label="Voir votre diary des 30 derniers jours"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-sm hover:bg-green-500/15 transition-colors"
        >
          <Check className="h-3.5 w-3.5 text-green-500" />
          <span className="text-green-400 font-medium">{profile.username}</span>
        </Link>
        <Button
          variant="cinema-ghost"
          size="icon"
          className="rounded-full h-8 w-8"
          onClick={handleUnlink}
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Unlink className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="cinema-outline" size="sm" className="gap-1.5">
          <Link2 className="h-3.5 w-3.5" />
          Letterboxd
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Relier votre compte Letterboxd</DialogTitle>
          <DialogDescription>
            Entrez votre nom d'utilisateur Letterboxd pour recevoir des suggestions personnalisées basées sur vos films récents. Votre profil doit être public.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="votre-pseudo"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <Button onClick={handleSave} disabled={saveMutation.isPending || !username.trim()}>
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Relier"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
