import React from "react";
import clsx from "clsx";
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

export default function DatabaseHerbCard({
  herb,
  kind = "herb",
}: {
  herb: Herb;
  kind?: "herb" | "compound";
}) {
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
  const heading =
    commonName ||
    scientificName ||
    (kind === "compound" ? "Unknown compound" : "Unknown herb");
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
        ...(Array.isArray(herb.tags) ? herb.tags : []),
      ]
        .map((chip) => titleCase(String(chip)))
        .filter(Boolean)
    )
  ).slice(0, 3);

  const intensityLevel = (herb.intensityLevel || (herb as any).intensityLevel || '').toString().toLowerCase();
  const intensityLabel = cleanIntensity(
    firstNonEmpty(
      (herb as any).intensityClean,
      herb.intensityLabel,
      typeof herb.intensity === 'string' ? herb.intensity : '',
    )
  );
  const intensityTone = intensityLevel.includes('strong')
    ? 'bg-rose-500/20 text-rose-100 ring-1 ring-rose-300/40'
    : intensityLevel.includes('moderate')
    ? 'bg-amber-500/20 text-amber-100 ring-1 ring-amber-300/40'
    : intensityLevel.includes('mild')
    ? 'bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-300/40'
    : intensityLevel.includes('variable')
    ? 'bg-sky-500/20 text-sky-100 ring-1 ring-sky-300/40'
    : 'bg-white/6 text-white/90 ring-1 ring-white/15';
  const benefits = firstNonEmpty(herb.benefits as string, (herb as any).benefits as string);

  const slugSource = firstNonEmpty(herb.slug, heading, scientificName);
  const slug = slugSource
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const detailBase = kind === "compound" ? "/compounds" : "/herbs";
  const detailPath = slug
    ? `${detailBase}/${encodeURIComponent(slug)}`
    : detailBase;

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
      className={clsx(
        "relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl ring-1 ring-white/12",
        "shadow-[inset_0_1px_0_rgba(255,255,255,.2)] transition duration-300",
        "mx-auto w-full max-w-screen-md px-4 py-5 text-white/90 hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.65)]",
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl">
        <div className="absolute inset-px rounded-[calc(theme(borderRadius.3xl)-1px)] border border-white/10" />
      </div>

      <div className="relative space-y-4">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{heading}</h2>
          {secondary && <p className="text-sm italic text-white/60">{secondary}</p>}

          {(chips.length > 0 || intensityLabel || benefits) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-1.5 text-[12px] text-white/80"
                >
                  {chip}
                </span>
              ))}
              {intensityLabel && (
                <span className={clsx('inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 text-[12px]', intensityTone)}>
                  <span className="font-semibold uppercase tracking-wide text-[11px] text-white/80">Intensity:</span>
                  {intensityLabel}
                </span>
              )}
              {benefits && (
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-1.5 text-[12px] text-white/80">
                  {benefits}
                </span>
              )}
            </div>
          )}
        </header>

        {summary && (
          <p className={`text-sm leading-relaxed text-white/75 sm:text-base ${open ? '' : 'line-clamp-3'}`}>
            {summary}
          </p>
        )}

        {open && sections.length > 0 && (
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div key={index}>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/55">{section.label}</p>
                {Array.isArray(section.content) ? (
                  <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-white/70">
                    {section.content.map((item, i) => {
                      const isUrl = /^https?:\/\//i.test(item);
                      return (
                        <li key={i}>
                          {isUrl ? (
                            <a
                              href={item}
                              target="_blank"
                              rel="noreferrer"
                              className="underline decoration-dotted underline-offset-2 transition hover:text-white"
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
                  <p className="mt-1 text-sm text-white/70">{section.content}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/15 hover:text-white"
            aria-expanded={open}
          >
            {open ? 'Show less' : 'Show more'}
          </button>
          <a
            href={toHash(detailPath)}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/85 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-400/90"
          >
            View details
          </a>
        </div>
      </div>
    </motion.article>
  );
}
