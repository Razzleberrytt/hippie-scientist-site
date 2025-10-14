import { compounds } from "@/data/compounds/compounds";
import type { Herb } from "@/types";
import { titleCase } from "@/lib/text";
import { slugify } from "@/lib/slug";

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

export function decorateCompounds(): Herb[] {
  return compounds.map((compound) => {
    const slug = slugify(compound.name);
    const intensityKey = compound.psychoactivity?.toLowerCase();
    const intensityLevel = intensityKey && INTENSITY_MAP[intensityKey];
    const intensityLabel = intensityKey && INTENSITY_LABELS[intensityKey];
    const intensityEmoji = intensityKey && INTENSITY_EMOJI[intensityKey];

    const typeTag = compound.type ? `🧪 ${titleCase(compound.type)}` : null;
    const psychoTag =
      intensityLabel && intensityEmoji
        ? `${intensityEmoji} ${intensityLabel}`
        : intensityLabel ?? null;

    return {
      slug,
      id: slug,
      kind: "compound",
      name: compound.name,
      common: titleCase(compound.name),
      scientific: compound.name,
      description: compound.description,
      summary: compound.description,
      effects: compound.mechanismOfAction,
      benefits: compound.mechanismOfAction,
      compounds: compound.foundIn,
      intensityLevel: intensityLevel ?? "unknown",
      intensityLabel: intensityLabel ?? null,
      tags: [typeTag, psychoTag].filter(Boolean) as string[],
      compoundClasses: compound.type ? [titleCase(compound.type)] : [],
      pharmCategories: compound.psychoactivity
        ? [titleCase(compound.psychoactivity)]
        : [],
    } as Herb;
  });
}

export function getAllCompounds() {
  return decorateCompounds();
}
