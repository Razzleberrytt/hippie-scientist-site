import clsx from "clsx";
import { useMemo, useState } from "react";
import type { Herb } from "../types";
import { slugify } from "../lib/slug";
import { FavoriteStar } from "./FavoriteStar";
import { gradientClassName } from "../lib/classMap";
import Badge from "./ui/Badge";

export const uniqNonEmpty = (arr?: any[]) =>
  [...new Set((arr || []).map(String).map(s => s.trim()).filter(Boolean))];

export const listify = (v: any) =>
  Array.isArray(v) ? uniqNonEmpty(v) : typeof v === "string" ? v.trim() : "";

export const clampSentence = (s?: string) =>
  (s || "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s*[,;]\s*$/, "");

function intensityClass(level?: Herb["intensityLevel"]) {
  switch (level) {
    case "mild":
      return "bg-emerald-900/40 text-emerald-200 ring-emerald-400/40";
    case "moderate":
      return "bg-amber-900/40 text-amber-200 ring-amber-400/40";
    case "strong":
      return "bg-rose-900/40 text-rose-200 ring-rose-400/40";
    case "variable":
      return "bg-sky-900/40 text-sky-200 ring-sky-400/40";
    default:
      return "bg-zinc-800/50 text-zinc-200 ring-zinc-500/40";
  }
}

function IntensityChip({ h }: { h: Herb }) {
  const level = h.intensityLevel;
  const label = h.intensityLabel || "Unknown";

  return (
    <Badge
      aria-label={`Intensity ${label}`}
      className={clsx(
        "max-w-full whitespace-nowrap text-[0.7rem] font-semibold uppercase tracking-[0.18em]",
        "px-3 py-1 ring-1",
        intensityClass(level)
      )}
    >
      INTENSITY: {label}.
    </Badge>
  );
}

export function DatabaseHerbCard({ herb }: { herb: Herb }) {
  const [expanded, setExpanded] = useState(false);

  const baseName = herb.name?.trim() || "";
  const rawCommon =
    herb.commonName?.trim() ||
    herb.common?.trim() ||
    (baseName && baseName.toLowerCase() !== (herb.scientific?.trim() || "").toLowerCase()
      ? baseName
      : "");
  const rawLatin =
    herb.scientificName?.trim() ||
    herb.latinName?.trim() ||
    herb.scientific?.trim() ||
    (herb as any).scientificname?.trim() ||
    "";
  const displayName =
    rawCommon || baseName || rawLatin || herb.slug?.trim() || "Unknown herb";
  const showScientific =
    Boolean(rawLatin) &&
    rawLatin.toLowerCase() !== displayName.toLowerCase();

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

  const slugSource = herb.slug?.trim() || displayName;
  const herbSlug = slugify(slugSource);
  const detailId = `herb-${herbSlug}-details`;

  const effects = listify(herb.effects || (herb as any).effectsSummary);
  const descriptionDetail = herb.description;
  const preparations = listify(
    (herb as any).preparation ||
      (herb as any).preparations ||
      (herb as any).forms ||
      (herb as any).preparationsText
  );
  const activeCompounds = listify(
    herb.compounds || (herb as any).active_compounds
  );
  const contraindications = listify(
    herb.contraindications ||
      (herb as any).contraindicationsText ||
      (herb as any).contraindication
  );
  const interactions = listify(
    herb.interactions || (herb as any).drugInteractions
  );
  const region = listify(herb.region || (herb as any).regionNotes);
  const legal =
    (herb.legal as string | undefined) ||
    (herb as any).legalstatus ||
    (herb as any).legalStatus ||
    (herb as any).legalnotes;
  const sources = herb.sources || (herb as any).sourcesText;

  const hasExtra = useMemo(
    () =>
      Boolean(
        tags.length ||
          (Array.isArray(effects) ? effects.length : effects) ||
          descriptionDetail ||
          (Array.isArray(preparations) ? preparations.length : preparations) ||
          (Array.isArray(activeCompounds)
            ? activeCompounds.length
            : activeCompounds) ||
          (Array.isArray(contraindications)
            ? contraindications.length
            : contraindications) ||
          (Array.isArray(interactions) ? interactions.length : interactions) ||
          (Array.isArray(region) ? region.length : region) ||
          legal ||
          (Array.isArray(sources) ? sources.length : sources)
      ),
    [
      activeCompounds,
      contraindications,
      descriptionDetail,
      effects,
      interactions,
      legal,
      preparations,
      region,
      sources,
      tags.length,
    ]
  );

  const chips = useMemo(
    () =>
      uniqNonEmpty([
        ...(herb.compoundClasses || []),
        ...(herb.pharmCategories || []),
      ]),
    [herb.compoundClasses, herb.pharmCategories]
  );

  const accentGradient = gradientClassName(
    herb.category || herb.category_label || herb.compoundClasses?.[0] || herb.tags?.[0],
    "psychoactive"
  );

  const showIntensity = Boolean(
    herb.intensityLabel ||
    herb.intensityLevel ||
    herb.intensity
  );

  return (
    <article className={clsx(
      "relative overflow-hidden rounded-2xl border border-white/10 bg-surface/60 p-4 shadow-lg backdrop-blur transition-all md:p-5",
      "group"
    )}>
      <div
        className={clsx(
          "pointer-events-none absolute inset-0 -z-10 opacity-60 blur-3xl transition-opacity duration-300 group-hover:opacity-75",
          accentGradient
        )}
      />
      <div
        className={clsx(
          "pointer-events-none absolute inset-x-4 top-3 h-1 rounded-full opacity-80",
          accentGradient
        )}
      />
      <header className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1">
          <h2 className="text-lg font-semibold text-zinc-100 sm:text-xl">
            {displayName}
          </h2>
          {showScientific && (
            <p className="text-sm italic text-zinc-400">{rawLatin}</p>
          )}
          {chips.length > 0 && (
            <div className="pt-1">
              <div className="flex flex-wrap gap-2">
                {chips.map(chip => (
                  <span
                    key={chip}
                    className="rounded-full border border-white/10 bg-chip px-2.5 py-1 text-xs font-medium text-emphasis opacity-90"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <FavoriteStar herbId={herb.id || herb.slug || herbSlug} />
      </header>

      {showIntensity && (
        <div className="mt-3">
          <IntensityChip h={herb} />
        </div>
      )}

      {summary && (
        <p className="mt-3 text-[15px] leading-6 text-emphasis sm:text-base">
          {summary}
        </p>
      )}

      {hasExtra && (
        <div
          className={clsx(
            "mt-3 grid transition-[grid-template-rows] duration-300 ease-out",
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div id={detailId} className="overflow-hidden">
            <div className="space-y-3 pt-3 text-[15px] leading-6 text-muted">
              {tags.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <li
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-muted"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
              {section("Effects", effects)}
              {section("Description", descriptionDetail)}
              {section("Preparation & Forms", preparations)}
              {section("Active Compounds", activeCompounds)}
              {section("Contraindications", contraindications)}
              {section("Interactions", interactions)}
              {section("Region", region)}
              {legalBlock(legal)}
              {sourcesBlock(sources)}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        {hasExtra && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setExpanded(value => !value)}
            aria-expanded={expanded}
            aria-controls={detailId}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
        <a
          href={`#/herb/${herbSlug}`}
          className="btn-ghost"
        >
          View details
        </a>
      </div>
    </article>
  );
}

function section(label: string, content: string | string[] | undefined) {
  const arr = Array.isArray(content) ? content : content ? [content] : [];
  if (!arr.length) return null;
  return (
    <div className="space-y-1">
      <h4 className="text-sm font-semibold uppercase tracking-wide text-emphasis opacity-70">
        {label}
      </h4>
      {arr.length === 1 ? (
        <p className="text-[15px] leading-6 text-muted">{arr[0]}</p>
      ) : (
        <ul className="list-disc space-y-1 pl-5 text-[15px] leading-6 text-muted">
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
    <p className="rounded-xl border border-amber-400/30 bg-amber-300/10 px-3 py-2 text-xs font-medium uppercase tracking-wide text-amber-200/90">
      Legal: {legal.trim()}
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
    <div className="space-y-1">
      <h4 className="text-sm font-semibold uppercase tracking-wide text-emphasis opacity-70">
        Sources
      </h4>
      <ul className="list-disc space-y-1 break-words pl-5 text-[15px] leading-6 text-muted">
        {arr.map((source, index) => (
          <li key={index}>
            {/^(https?:\/\/)/.test(source) ? (
              <a
                className="text-emphasis underline decoration-white/20 underline-offset-4 transition hover:text-title"
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
