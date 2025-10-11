import React from "react";
import { cleanIntensity, titleCase } from "../lib/text";
import type { Herb } from "../types";
import { toHash } from "../lib/routing";

function toArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((entry) => String(entry).trim()).filter(Boolean);
  return String(value)
    .split(/[;,|]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function firstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

export default function DatabaseHerbCard({ herb }: { herb: Herb }) {
  const [open, setOpen] = React.useState(false);

  const commonName = firstNonEmpty(herb.common, (herb as any).commonName, herb.name);
  const scientificName = firstNonEmpty(herb.scientific, (herb as any).scientificName, (herb as any).binomial);
  const heading = commonName || scientificName || "Unknown herb";
  const secondary = scientificName && scientificName !== commonName
    ? scientificName
    : firstNonEmpty((herb as any).family, (herb as any).category_label, toArray((herb as any).category)[0]);

  const summary = firstNonEmpty(
    herb.summary,
    herb.description,
    herb.effectsSummary,
    herb.effects
  );

  const chips = Array.from(
    new Set(
      [
        ...toArray((herb as any).chem_class),
        ...toArray((herb as any).drug_class),
        ...toArray((herb as any).category),
        ...(Array.isArray(herb.compoundClasses) ? herb.compoundClasses : []),
        ...(Array.isArray(herb.pharmCategories) ? herb.pharmCategories : []),
      ]
        .map((chip) => titleCase(String(chip)))
        .filter(Boolean)
    )
  ).slice(0, 3);

  const intensity = cleanIntensity(
    firstNonEmpty((herb as any).intensityClean, herb.intensityLabel, herb.intensity)
  );

  const slugSource = firstNonEmpty(herb.slug, heading, scientificName);
  const slug = slugSource
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const detailPath = slug ? `/herb/${encodeURIComponent(slug)}` : "/herb";

  const effects = firstNonEmpty(herb.effectsSummary, herb.effects);
  const legal = firstNonEmpty(herb.legalStatus as string, herb.legalstatus as string, herb.legal as string, herb.legalnotes as string);
  const sources = toArray(herb.sources).slice(0, 3);

  const sections: Array<{ label: string; content: string | string[] }> = [];
  if (effects) sections.push({ label: "Effects", content: effects });
  if (legal) sections.push({ label: "Legal", content: legal });
  if (sources.length) sections.push({ label: "Sources", content: sources });

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-sm md:p-5">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold">{heading}</h2>
        {secondary && <p className="italic text-white/70">{secondary}</p>}

        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {chips.map((chip, index) => (
              <span
                key={index}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/80"
              >
                {chip}
              </span>
            ))}
          </div>
        )}

        {intensity && (
          <div className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-amber-200">
            <span className="mr-1 opacity-80">Intensity:</span>
            {intensity}
          </div>
        )}
      </header>

      {summary && (
        <p className={`mt-3 text-white/80 leading-relaxed ${open ? "" : "line-clamp-3"}`}>
          {summary}
        </p>
      )}

      {open && sections.length > 0 && (
        <div className="mt-3 space-y-3">
          {sections.map((section, index) => (
            <div key={index}>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/50">{section.label}</p>
              {Array.isArray(section.content) ? (
                <ul className="mt-1 list-disc list-inside space-y-1 text-sm text-white/75">
                  {section.content.map((item, i) => {
                    const isUrl = /^https?:\/\//i.test(item);
                    return (
                      <li key={i}>
                        {isUrl ? (
                          <a
                            href={item}
                            target="_blank"
                            rel="noreferrer"
                            className="underline decoration-dotted hover:text-white"
                          >
                            {item}
                          </a>
                        ) : (
                          item
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-1 text-sm text-white/75">{section.content}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="btn-secondary"
          aria-expanded={open}
        >
          {open ? "Show less" : "Show more"}
        </button>
        <a href={toHash(detailPath)} className="btn-primary">
          View details
        </a>
      </div>
    </article>
  );
}
