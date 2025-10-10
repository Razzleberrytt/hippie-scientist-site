import { useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import HerbDetails, { normalizeHerbDetails } from "./HerbDetails";
import type { Herb } from "../types";
import { herbName } from "../utils/herb";
import { cleanLine, titleCase } from "../lib/pretty";
import { getText } from "../lib/fields";
import { pick } from "../lib/present";
import { useFavorites } from "../lib/useFavorites";
import { intensityHue } from "../lib/ambient";

export default function DatabaseHerbCard({ herb }: { herb: Herb }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const normalized = useMemo(() => normalizeHerbDetails(herb), [herb]);
  const summary = normalized.description || normalized.effects || herb.description || "";
  const preview = summary ? cleanLine(summary) : "";
  const title = herbName(herb);
  const scientific = cleanLine(
    herb.scientific || getText(herb, "scientific", ["botanical", "latin", "latinname", "botanical_name"])
  );
  const intensityRaw = String(
    herb.intensity ?? herb.intensity_label ?? pick.intensity(herb) ?? ""
  ).toLowerCase();
  const intensityLabel = intensityRaw ? titleCase(intensityRaw) : "";
  const detailHref = `/herb/${herb.slug}`;
  const { toggle, has } = useFavorites();
  const isFavorite = has(herb.slug);

  const hue = intensityHue(herb.intensity);

  return (
    <article
      className="card transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,.35)]"
      style={{
        ["--amb-h" as any]: hue,
        boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 12px 40px -8px rgba(0,0,0,.45)",
      }}
    >
      <div className="p-4 flex flex-col gap-3">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: "var(--text-c)" }}>
              {title}
            </h3>
            {scientific && (
              <p className="text-sm italic" style={{ color: "var(--muted-c)" }}>
                {scientific}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={event => {
              event.stopPropagation();
              toggle(herb.slug);
            }}
            className="btn hover-glow focus-glow"
            aria-pressed={isFavorite}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            style={{
              paddingInline: "0.65rem",
              paddingBlock: "0.35rem",
              background: isFavorite
                ? "color-mix(in oklab, var(--accent) 25%, var(--surface-c) 75%)"
                : undefined,
            }}
          >
            <span aria-hidden>★</span>
            <span className="sr-only">Toggle favorite</span>
          </button>
        </header>

        {intensityLabel && <span className="chip hover-glow focus-glow">INTENSITY: {intensityLabel}</span>}

        {preview && (
          <p className={`text-sm ${open ? '' : 'clamp-3'}`} style={{ color: "var(--text-c)" }}>
            {preview}
          </p>
        )}
      </div>

      <div className="px-4 pb-4 flex flex-wrap gap-2 justify-between text-sm">
        <button
          className="btn hover-glow focus-glow"
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          aria-controls={panelId}
        >
          {open ? "Show less" : "Show more"}
        </button>
        <Link className="btn hover-glow focus-glow" to={detailHref}>
          View details
        </Link>
      </div>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        aria-hidden={!open}
      >
        <div className="min-h-0 overflow-hidden px-4 pb-5 border-t" style={{ borderColor: "var(--border-c)" }}>
          <HerbDetails herb={herb} />
        </div>
      </div>
    </article>
  );
}
