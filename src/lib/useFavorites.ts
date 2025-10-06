import { useEffect, useState } from "react";

const KEY = "herb_favorites";

export function useFavorites() {
  const [favs, setFavs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (Array.isArray(saved)) setFavs(saved);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(favs));
  }, [favs]);

  const toggle = (slug: string) =>
    setFavs(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );

  const clear = () => setFavs([]);

  return { favs, toggle, clear, has: (slug: string) => favs.includes(slug) };
}
