import { useMemo, useState } from "react";
import Meta from "./Meta";
import ErrorBoundary from "./ErrorBoundary";
import DatabaseHerbCard from "./DatabaseHerbCard";
import AdvancedSearch from "./AdvancedSearch";
import StatBadges from "./StatBadges";
import type { Herb } from "@/types";

export type EntityDatabasePageProps = {
  title: string;
  description: string;
  metaPath: string;
  items: Herb[];
  kind: "herb" | "compound";
  counters: {
    herbCount: number;
    compoundCount: number;
    articleCount: number;
  };
  enableAdvancedFilters?: boolean;
};

export default function EntityDatabasePage({
  title,
  description,
  metaPath,
  items,
  kind,
  counters,
  enableAdvancedFilters = false,
}: EntityDatabasePageProps) {
  const [query, setQuery] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedResults, setAdvancedResults] = useState<Herb[] | null>(null);

  const scopedItems = useMemo(
    () => (enableAdvancedFilters ? advancedResults ?? items : items),
    [advancedResults, enableAdvancedFilters, items]
  );

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return scopedItems;

    return scopedItems.filter((item) => {
      const haystack = [
        item.common,
        item.scientific,
        item.description,
        item.effects,
        (item.tags || []).join(" "),
        (item.compounds || []).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [scopedItems, query]);

  const results = filtered;

  return (
    <ErrorBoundary>
      <Meta title={`${title} | The Hippie Scientist`} description={description} path={metaPath} />
      <main className="container mx-auto max-w-screen-md space-y-6 px-4 py-6">
        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-white shadow-[0_20px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl md:p-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{title}</h1>
          <p className="mt-2 text-white/85">{description}</p>

          {enableAdvancedFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {advancedResults && (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white transition hover:bg-white/15"
                  onClick={() => setAdvancedResults(null)}
                >
                  Clear advanced filters
                </button>
              )}
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white transition hover:bg-white/15"
                onClick={() => setAdvancedOpen(true)}
              >
                Advanced search
              </button>
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
            <label className="sr-only" htmlFor={`${kind}-search-input`}>
              Search {kind === "herb" ? "herbs" : "compounds"}
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <input
                id={`${kind}-search-input`}
                className="min-w-0 flex-1 rounded-2xl border border-white/15 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder={`Search ${kind === "herb" ? "herbs" : "compounds"}, effects…`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <span className="text-sm text-white/70">{results.length} results</span>
            </div>
          </div>

          <StatBadges
            stats={[
              { label: "psychoactive herbs", value: counters.herbCount },
              { label: "active compounds", value: counters.compoundCount },
              { label: "articles", value: counters.articleCount },
            ]}
          />
        </section>

        <section className="space-y-4 pb-8">
          {results.map((item, index) => (
            <DatabaseHerbCard key={item.slug ?? item.id ?? `${kind}-${index}`} herb={item} kind={kind} />
          ))}
          {!results.length && (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-center text-white/80 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl">
              No {kind === "herb" ? "herbs" : "compounds"} match that search.
            </div>
          )}
        </section>
      </main>

      {enableAdvancedFilters && (
        <AdvancedSearch
          open={advancedOpen}
          onClose={() => setAdvancedOpen(false)}
          onApply={(res) => {
            const next = res as Herb[];
            setAdvancedResults(next.length === items.length ? null : next);
            setAdvancedOpen(false);
          }}
        />
      )}
    </ErrorBoundary>
  );
}
