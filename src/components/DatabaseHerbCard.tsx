import { useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import HerbDetails, { normalizeHerbDetails } from "./HerbDetails";
import type { Herb } from "../types";
import { herbName } from "../utils/herb";
import { cleanLine, titleCase } from "../lib/pretty";
import { getText } from "../lib/fields";
import { pick } from "../lib/present";
import { useFavorites } from "../lib/useFavorites";

export default function DatabaseHerbCard({ herb }: { herb: Herb }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const normalized = useMemo(() => normalizeHerbDetails(herb), [herb]);
  const summary = normalized.description || normalized.effects;
  const preview = summary ? cleanLine(summary) : "";
  const title = herbName(herb);
  const scientific = cleanLine(
    herb.scientific || getText(herb, "scientific", ["botanical", "latin", "latinname", "botanical_name"])
  );
  const intensityRaw = String(
    herb.intensity ?? herb.intensity_label ?? pick.intensity(herb) ?? ""
  ).toLowerCase();
  const intensityLabel = intensityRaw ? titleCase(intensityRaw) : "";
  const intensityTone = intensityRaw.includes("strong")
    ? "border-rose-400/40 bg-rose-500/15 text-rose-100"
    : intensityRaw.includes("moderate")
      ? "border-[rgb(var(--accent))]/40 bg-[rgb(var(--accent))]/15 text-[rgb(var(--fg))]"
      : intensityRaw.includes("mild")
        ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
        : "border-white/15 bg-white/10 text-white/70";
  const detailHref = `/herb/${herb.slug}`;
  const { toggle, has } = useFavorites();
  const isFavorite = has(herb.slug);

  return (
    <article className="rounded-2xl border border-white/10 bg-[rgb(var(--card))]/90 backdrop-blur-sm shadow-sm transition-all hover:shadow-[0_0_14px_-6px_rgba(255,255,255,0.25)]">
      <div className="space-y-3 p-4">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-[rgb(var(--accent))]">{title}</h3>
            {scientific && <p className="text-sm italic text-white/60">{scientific}</p>}
          </div>
          <button
            type="button"
            onClick={event => {
              event.stopPropagation();
              toggle(herb.slug);
            }}
            className={`text-lg transition ${isFavorite ? "text-[rgb(var(--accent))]" : "text-white/50 hover:text-white/80"}`}
            aria-pressed={isFavorite}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            ★
          </button>
        </header>

        {intensityLabel && (
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${intensityTone}`}>
            Intensity: {intensityLabel}
          </span>
        )}

        {preview && (
          <p className={`text-sm text-white/85 ${open ? "" : "line-clamp-3"}`}>{preview}</p>
        )}
      </div>

      <div className="flex items-center justify-between px-4 pb-4 text-sm">
        <button
          type="button"
          className="link"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(v => !v)}
        >
          {open ? "Show less" : "Show more"}
        </button>
        <Link className="link" to={detailHref}>
          View details
        </Link>
      </div>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        aria-hidden={!open}
      >
        <div className="min-h-0 overflow-hidden border-t border-white/10 px-4 pb-5">
          <HerbDetails herb={herb} />
        </div>
      </div>
    </article>
  );
}
