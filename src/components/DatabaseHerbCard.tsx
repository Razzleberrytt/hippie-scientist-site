import { useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Herb } from "../types";
import { herbName } from "../utils/herb";
import { cleanLine, titleCase } from "../lib/pretty";
import { getText } from "../lib/fields";
import { pick } from "../lib/present";
import { normalizeHerbDetails } from "./HerbDetails";

export default function DatabaseHerbCard({ herb }: { herb: Herb }) {
  const [expanded, setExpanded] = useState(false);
  const normalized = useMemo(() => normalizeHerbDetails(herb), [herb]);

  const title = herbName(herb);
  const scientific = cleanLine(
    herb.scientific || getText(herb, "scientific", ["botanical", "latin", "latinname", "botanical_name"])
  );

  const intensityRaw = String(
    herb.intensity ?? herb.intensity_label ?? pick.intensity(herb) ?? ""
  ).toLowerCase();
  const intensityLabel = intensityRaw ? titleCase(intensityRaw) : "";

  const summarySource =
    normalized.description || normalized.effects || herb.description || herb.effects || "";
  const summary = cleanLine(summarySource);
  const preview = summary
    ? `${summary.slice(0, 120)}${summary.length > 120 ? "…" : ""}`
    : "";

  const mechanism = cleanLine((herb as any).mechanism ?? (herb as any).mechanism_of_action ?? "");

  const detailSections: Array<{ label: string; content: ReactNode }> = [];

  if (normalized.tags.length) {
    detailSections.push({
      label: "Tags",
      content: (
        <div className="flex flex-wrap gap-2">
          {normalized.tags.map((tag, index) => (
            <span
              key={`${herb.slug}-tag-${index}`}
              className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70"
            >
              {tag}
            </span>
          ))}
        </div>
      ),
    });
  }

  if (normalized.region) {
    detailSections.push({ label: "Region", content: normalized.region });
  }

  if (normalized.active_compounds.length) {
    detailSections.push({
      label: "Active Compounds",
      content: normalized.active_compounds.join(", "),
    });
  }

  if (normalized.preparation) {
    detailSections.push({ label: "Preparation", content: normalized.preparation });
  }

  if (normalized.dosage) {
    detailSections.push({ label: "Dosage", content: normalized.dosage });
  }

  if (normalized.contraindications) {
    detailSections.push({ label: "Contraindications", content: normalized.contraindications });
  }

  if (normalized.interactions) {
    detailSections.push({ label: "Interactions", content: normalized.interactions });
  }

  if (normalized.legal) {
    detailSections.push({ label: "Legal", content: normalized.legal });
  }

  if (mechanism) {
    detailSections.push({ label: "Mechanism", content: mechanism });
  }

  if (normalized.sources.length) {
    detailSections.push({
      label: "Sources",
      content: (
        <ul className="ml-5 list-disc space-y-1">
          {normalized.sources.map((source, index) => (
            <li key={`${herb.slug}-source-${index}`} className="text-white/70">
              {/^(https?:)/i.test(source) ? (
                <a className="text-white/80 underline decoration-white/30 underline-offset-4 transition hover:text-white" href={source} target="_blank" rel="noreferrer">
                  {source}
                </a>
              ) : (
                source
              )}
            </li>
          ))}
        </ul>
      ),
    });
  }

  return (
    <motion.article
      layout
      transition={{ layout: { duration: 0.4, ease: "easeOut" } }}
      className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:bg-white/10"
    >
      <h3 className="text-lg font-semibold text-white/90">{title}</h3>
      {scientific && <p className="mb-3 text-sm italic text-white/60">{scientific}</p>}

      {intensityLabel && (
        <span className="mb-3 inline-block rounded-md bg-white/10 px-2 py-1 text-xs text-white/80">
          {intensityLabel}
        </span>
      )}

      {summary && (
        <p className="text-sm text-white/80">{expanded ? summary : preview}</p>
      )}

      <button
        type="button"
        onClick={() => setExpanded(value => !value)}
        className="mt-3 rounded-md bg-accent/20 px-3 py-1 text-xs font-medium text-white transition-all hover:bg-accent/40"
      >
        {expanded ? "Show less" : "Show more"}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="mt-4 space-y-3 text-xs text-white/70"
          >
            {normalized.effects && (
              <p className="leading-relaxed text-white/75">{normalized.effects}</p>
            )}

            {detailSections.map(section => (
              <div key={section.label} className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">
                  {section.label}
                </p>
                <div className="leading-relaxed text-white/80">{section.content}</div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
