import { Star } from "lucide-react";
import { useHerbFavorites } from "../hooks/useHerbFavorites";

interface FavoriteStarProps {
  herbId?: string | null;
}

export function FavoriteStar({ herbId }: FavoriteStarProps) {
  const id = herbId?.trim();
  const { toggle, isFavorite } = useHerbFavorites();

  if (!id) {
    return null;
  }

  const favorite = isFavorite(id);
  const label = favorite ? "Remove from favorites" : "Add to favorites";

  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-surface/80 text-subtle transition hover:bg-surface/90 hover:text-title focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
      aria-pressed={favorite}
      aria-label={label}
    >
      <Star className="h-5 w-5" strokeWidth={1.75} fill={favorite ? "currentColor" : "none"} />
    </button>
  );
}
