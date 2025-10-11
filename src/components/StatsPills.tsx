import { useEffect, useMemo, useState } from "react";
import herbsRaw from "../data/herbs/herbs.normalized.json";

type HerbRecord = {
  activeCompounds?: string[];
  compounds?: string[];
};

type BlogPostSummary = { slug: string; date?: string };
type BlogIndex = {
  posts?: BlogPostSummary[];
};

const isArray = Array.isArray;

export default function StatsPills() {
  const herbCount = useMemo(() => (isArray(herbsRaw) ? herbsRaw.length : 0), []);

  const compoundCount = useMemo(() => {
    if (!isArray(herbsRaw)) return 0;
    const unique = new Set<string>();
    for (const herb of herbsRaw as HerbRecord[]) {
      const compounds = isArray(herb.activeCompounds)
        ? herb.activeCompounds
        : isArray(herb.compounds)
          ? herb.compounds
          : [];
      for (const entry of compounds) {
        if (!entry) continue;
        unique.add(String(entry).trim().toLowerCase());
      }
    }
    return unique.size;
  }, []);

  const [articleCount, setArticleCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;

    const applyCount = (count: number) => {
      if (!cancelled) {
        setArticleCount(Number.isFinite(count) && count > 0 ? Math.floor(count) : 0);
      }
    };

    fetch("/blogdata/index.json")
      .then(response => (response.ok ? response.json() : null))
      .then((json: BlogIndex | BlogPostSummary[] | null) => {
        if (!json) return;
        if (isArray(json)) {
          applyCount(json.length);
          return;
        }
        if (isArray(json.posts)) {
          applyCount(json.posts.length);
        }
      })
      .catch(() => {
        import("../data/blog/posts.json")
          .then(module => {
            const data = module.default as unknown;
            if (isArray(data)) {
              applyCount(data.length);
            }
          })
          .catch(() => {});
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <span className="stat-pill">
        <strong className="tabular-nums text-lg text-white">{herbCount}</strong>
        <span className="ml-2 text-zinc-300/80">psychoactive herbs</span>
      </span>
      <span className="stat-pill">
        <strong className="tabular-nums text-lg text-white">{compoundCount}</strong>
        <span className="ml-2 text-zinc-300/80">active compounds</span>
      </span>
      <span className="stat-pill">
        <strong className="tabular-nums text-lg text-white">{articleCount}</strong>
        <span className="ml-2 text-zinc-300/80">articles</span>
      </span>
    </div>
  );
}
