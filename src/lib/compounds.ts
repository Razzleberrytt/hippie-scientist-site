import { compounds } from "@/data/compounds/compounds";
import type { Herb } from "../types";
import { titleCase } from "./text";
import { safeArray, safeLower, safeSlug, safeTrim } from "@/lib/search-safe";

const INTENSITY_MAP: Record<string, Herb["intensityLevel"]> = {
  mild: "mild",
  moderate: "moderate",
  strong: "strong",
};

const INTENSITY_LABELS: Record<string, Herb["intensityLabel"]> = {
  mild: "Mild",
  moderate: "Moderate",
  strong: "Strong",
};

const INTENSITY_EMOJI: Record<string, string> = {
  mild: "🌱",
  moderate: "🔥",
  strong: "⚡",
};

function cleanTag(value: unknown): string {
  return safeTrim(value)
}

export function decorateCompounds(): Herb[] {
  const seen = new Set<string>();

  return safeArray<any>(compounds)
    .map((compound) => {
      const name = safeTrim(compound?.name);
      const slug = safeSlug(compound?.slug || compound?.id || name);

      if (!name || !slug || seen.has(slug)) return null;
      seen.add(slug);

      const intensityKey = safeLower(compound?.psychoactivity);
      const intensityLevel = INTENSITY_MAP[intensityKey];
      const intensityLabel = INTENSITY_LABELS[intensityKey];
      const intensityEmoji = INTENSITY_EMOJI[intensityKey];

      const type = safeTrim(compound?.type);
      const psychoactivity = safeTrim(compound?.psychoactivity);
      const description = safeTrim(compound?.description);
      const mechanismOfAction = compound?.mechanismOfAction;
      const typeTag = type ? `🧪 ${titleCase(type)}` : null;
      const psychoTag =
        intensityLabel && intensityEmoji
          ? `${intensityEmoji} ${intensityLabel}`
          : intensityLabel ?? null;

      return {
        slug,
        id: slug,
        kind: "compound",
        name,
        common: titleCase(name),
        scientific: name,
        description,
        summary: description,
        effects: mechanismOfAction,
        benefits: mechanismOfAction,
        compounds: safeArray(compound?.foundIn),
        intensityLevel: intensityLevel ?? "unknown",
        intensityLabel: intensityLabel ?? null,
        tags: [typeTag, psychoTag].map(cleanTag).filter(Boolean),
        compoundClasses: type ? [titleCase(type)] : [],
        pharmCategories: psychoactivity
          ? [titleCase(psychoactivity)]
          : [],
      } as Herb;
    })
    .filter((compound): compound is Herb => compound !== null)
    .sort((a, b) => safeLower(a.name).localeCompare(safeLower(b.name)));
}

export function getAllCompounds() {
  return decorateCompounds();
}
