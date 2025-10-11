import { pickNames, cleanIntensity, titleCase } from "../lib/text";
import { hashLink } from "../lib/routes";

type Herb = {
  common?: string; commonName?: string; name?: string;
  scientific?: string; scientificName?: string; binomial?: string;
  intensity?: string;
  description?: string | null;
  summary?: string | null;
  drug_class?: string | string[];
  chem_class?: string | string[];
  category?: string | string[];
};

function toArray(v: any): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : String(v).split(/[;,]/).map((x:string)=>x.trim()).filter(Boolean);
}

export default function DatabaseHerbCard({ herb }: { herb: Herb }) {
  const names = pickNames(herb);
  const chips = [
    ...toArray(herb.chem_class),
    ...toArray(herb.drug_class),
    ...toArray(herb.category)
  ].filter(Boolean).slice(0, 2).map(titleCase);

  const intensity = cleanIntensity(herb.intensity);
  const blurb =
    (herb.summary && String(herb.summary)) ||
    (herb.description && String(herb.description)) || "";

  const slug = encodeURIComponent(
    (names.common || names.sci || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
  );

  return (
    <article className="rounded-3xl bg-white/[0.03] border border-white/10 shadow-sm p-4 md:p-5 compact-stack">
      <header className="compact-stack">
        <h3 className="text-xl md:text-2xl font-semibold">{names.common}</h3>
        {names.sci && <p className="text-white/60 italic">{names.sci}</p>}

        {chips.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-2">
            {chips.map((c, i) => (
              <span key={i} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/80">
                {c}
              </span>
            ))}
          </div>
        )}

        {intensity && (
          <div className="mt-2 inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs tracking-wide text-amber-200">
            <span className="opacity-80 mr-1">INTENSITY:</span> {intensity}
          </div>
        )}
      </header>

      {blurb && (
        <p className="mt-3 text-white/80 leading-relaxed line-clamp-4">
          {blurb}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          data-expand
          className="rounded-xl px-3 py-2 text-sm bg-white/8 hover:bg-white/12 border border-white/10"
        >
          Show more
        </button>
        <a
          href={hashLink(`/herb/${slug}`)}
          className="rounded-xl px-3 py-2 text-sm bg-emerald-600/80 hover:bg-emerald-500 text-white"
        >
          View details
        </a>
      </div>
    </article>
  );
}
