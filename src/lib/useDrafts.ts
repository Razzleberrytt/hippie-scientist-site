import { useEffect, useState } from "react";

const KEY = "herb_fix_drafts_v1";

export type DraftMap = Record<string, Record<string, string>>; // slug -> { field: value }

export function useDrafts() {
  const [drafts, setDrafts] = useState<DraftMap>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        setDrafts(JSON.parse(raw));
      }
    } catch {
      // ignore malformed values
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(drafts));
  }, [drafts]);

  const setField = (slug: string, field: string, val: string) =>
    setDrafts(prev => ({ ...prev, [slug]: { ...(prev[slug] || {}), [field]: val } }));

  const clearSlug = (slug: string) =>
    setDrafts(prev => {
      const copy = { ...prev };
      delete copy[slug];
      return copy;
    });

  const resetAll = () => setDrafts({});

  return { drafts, setField, clearSlug, resetAll };
}
