import { useState } from "react";
import type { Herb } from "../types";
import { slugify } from "../lib/slug";
import { FavoriteStar } from "./FavoriteStar";

export const uniqNonEmpty = (arr?: any[]) =>
  [...new Set((arr || []).map(String).map(s => s.trim()).filter(Boolean))];

export const listify = (v: any) =>
  Array.isArray(v) ? uniqNonEmpty(v) : typeof v === "string" ? v.trim() : "";

export const clampSentence = (s?: string) =>
  (s || "").replace(/\s+/g, " ").trim().replace(/\s*[,;]\s*$/, "");

export const fmtIntensity = (v?: string) =>
  (v || "")
    .toString()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^none$/i, "");

export function DatabaseHerbCard({ herb }: { herb: Herb }) {
  const [open, setOpen] = useState(false);

  const name =
    herb.common?.trim() ||
    herb.scientific?.trim() ||
    herb.name?.trim() ||
    herb.slug?.trim() ||
    "Unknown herb";
  const sci = herb.scientific?.trim() || (herb as any).scientificname?.trim();
  const intensity = fmtIntensity(
    (herb.intensity ||
      (herb as any).intensity_label ||
      (herb as any).intensityClean ||
      "") as string
  );
  const summary = clampSentence(
    (Array.isArray(herb.description)
      ? herb.description.join(" ")
      : herb.description) ||
      (Array.isArray(herb.effects)
        ? uniqNonEmpty(herb.effects).join(", ")
        : (herb.effects as string | undefined)) ||
      ""
  );

  const toArray = (value: unknown): string[] => {
    if (Array.isArray(value)) return uniqNonEmpty(value);
    if (typeof value === "string") {
      return uniqNonEmpty(value.split(/[,\n•]+/));
    }
    return [];
  };

  const tags = uniqNonEmpty([
    ...toArray(herb.tags),
    ...toArray(herb.compounds),
    ...toArray((herb as any).compoundsDetailed),
  ]).slice(0, 6);

  const slugSource = herb.slug?.trim() || name;
  const herbSlug = slugify(slugSource);
  const detailId = `herb-${herbSlug}-details`;

  return (
    <article className="rounded-2xl border border-white/10 bg-card/70 p-4 shadow-lg backdrop-blur sm:p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-title">{name}</h3>
          {sci && <p className="-mt-0.5 text-sm text-subtle">{sci}</p>}
        </div>
        <FavoriteStar herbId={herb.id || herb.slug || herbSlug} />
      </header>

      {intensity && (
        <div className="mt-3">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-surface/80 px-3 py-1 text-xs font-medium text-subtle">
            INTENSITY: {intensity}
          </span>
        </div>
      )}

      {summary && <p className="mt-3 text-base text-body">{summary}</p>}

      {tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {tags.map(tag => (
            <li
              key={tag}
              className="rounded-full border border-white/10 bg-surface/70 px-2.5 py-1 text-xs text-subtle"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setOpen(value => !value)}
          aria-expanded={open}
          aria-controls={detailId}
        >
          {open ? "Show less" : "Show more"}
        </button>
        <a
          href={`#/herb/${herbSlug}`}
          className="hidden text-sm text-link sm:inline-block"
        >
          Open page →
        </a>
      </div>

      <section
        id={detailId}
        hidden={!open}
        className="mt-4 grid gap-4 rounded-xl border border-white/10 bg-surface/60 p-4"
      >
        {section("Effects", listify(herb.effects || (herb as any).effectsSummary))}
        {section("Description", herb.description)}
        {section(
          "Preparation & Forms",
          listify(
            (herb as any).preparation ||
              (herb as any).preparations ||
              (herb as any).forms ||
              (herb as any).preparationsText
          )
        )}
        {section(
          "Active Compounds",
          listify(herb.compounds || (herb as any).active_compounds)
        )}
        {section(
          "Contraindications",
          listify(
            herb.contraindications ||
              (herb as any).contraindicationsText ||
              (herb as any).contraindication
          )
        )}
        {section(
          "Interactions",
          listify(herb.interactions || (herb as any).drugInteractions)
        )}
        {section("Region", listify(herb.region || (herb as any).regionNotes))}
        {legalBlock(
          (herb.legal as string | undefined) ||
            (herb as any).legalstatus ||
            (herb as any).legalStatus ||
            (herb as any).legalnotes
        )}
        {sourcesBlock(herb.sources || (herb as any).sourcesText)}
      </section>
    </article>
  );
}

function section(label: string, content: string | string[] | undefined) {
  const arr = Array.isArray(content) ? content : content ? [content] : [];
  if (!arr.length) return null;
  return (
    <div>
      <h4 className="mb-1 text-sm font-semibold text-white/90">{label}</h4>
      {arr.length === 1 ? (
        <p className="text-sm leading-6 text-body">{arr[0]}</p>
      ) : (
        <ul className="list-disc pl-5 text-sm leading-6 text-body">
          {arr.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function legalBlock(legal?: string) {
  if (!legal?.trim()) return null;
  return (
    <p className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs text-amber-300/90">
      <strong className="font-semibold">Legal:</strong> {legal.trim()}
    </p>
  );
}

function sourcesBlock(sources?: string[] | string) {
  const arr = Array.isArray(sources)
    ? uniqNonEmpty(sources)
    : sources
    ? uniqNonEmpty(String(sources).split(/\s*[\n•]+?\s*/))
    : [];
  if (!arr.length) return null;
  return (
    <div>
      <h4 className="mb-1 text-sm font-semibold text-white/90">Sources</h4>
      <ul className="list-disc break-words pl-5 text-sm text-body">
        {arr.map((source, index) => (
          <li key={index}>
            {/^(https?:\/\/)/.test(source) ? (
              <a
                className="text-link"
                href={source}
                target="_blank"
                rel="noopener noreferrer"
              >
                {source}
              </a>
            ) : (
              source
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DatabaseHerbCard;
