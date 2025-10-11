import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cleanIntensity, titleCase } from "../lib/text";
import type { Herb } from "../types";
import { toHash } from "../lib/routing";
import { getCommonName } from "../lib/herbName";

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
  const reduceMotion = useReducedMotion();

  const scientificName = firstNonEmpty(
    herb.scientific,
    (herb as any).scientificName,
    (herb as any).binomial,
    (herb as any).name,
  );
  const fallbackCommon = firstNonEmpty(
    herb.common,
    (herb as any).displayName,
    (herb as any).display_name,
    herb.name,
  );
  const commonName = getCommonName(herb) ?? (fallbackCommon ? titleCase(fallbackCommon) : "");
  const heading = commonName || scientificName || "Unknown herb";
  const secondary = scientificName && heading !== scientificName
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
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass p-5 text-text will-change-transform transition-all duration-300 hover:-translate-y-0.5 hover:[box-shadow:0_0_40px_theme(colors.emerald.500/0.12)] hover:shadow-2xl/20 sm:p-6"
    >
      <header className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{heading}</h2>
        {secondary && <p className="text-sm italic text-white/60">{secondary}</p>}

        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span key={chip} className="chip text-white/80 text-xs">
                {chip}
              </span>
            ))}
          </div>
        )}

        {intensity && (
          <div className="mt-3 inline-flex rounded-full border border-yellow-500/25 bg-yellow-500/10 px-3 py-1 text-sm tracking-wide text-yellow-200">
            INTENSITY: {intensity}
          </div>
        )}
      </header>

      {summary && (
        <p className={`mt-3 text-sm leading-relaxed text-text/80 sm:text-base ${open ? '' : 'line-clamp-3'}`}>
          {summary}
        </p>
      )}

      {open && sections.length > 0 && (
        <div className="mt-4 space-y-4">
          {sections.map((section, index) => (
            <div key={index}>
              <p className="text-xs font-semibold uppercase tracking-wide text-mute">{section.label}</p>
              {Array.isArray(section.content) ? (
                <ul className="mt-1 list-disc list-inside space-y-1 text-sm text-text/80">
                  {section.content.map((item, i) => {
                    const isUrl = /^https?:\/\//i.test(item);
                    return (
                      <li key={i}>
                        {isUrl ? (
                          <a
                            href={item}
                            target="_blank"
                            rel="noreferrer"
                            className="underline decoration-dotted underline-offset-2 hover:text-text"
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
                <p className="mt-1 text-sm text-text/80">{section.content}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="btn-ghost"
          aria-expanded={open}
        >
          {open ? 'Show less' : 'Show more'}
        </button>
        <a href={toHash(detailPath)} className="btn-primary relative overflow-hidden">
          <span>View details</span>
          <span className="pointer-events-none absolute -inset-8 rounded-full bg-emerald-400/10 blur-2xl" />
        </a>
      </div>
    </motion.article>
  );
}
