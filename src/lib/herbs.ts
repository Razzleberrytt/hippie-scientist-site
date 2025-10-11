import type { Herb } from "../types";

const CLASS_MAP: Record<string, string> = {
  phenethylamine: "Phenethylamine",
  tryptamine: "Tryptamine",
  tropane: "Tropane",
  benzodiazepine: "Benzodiazepine",
  alkaloid: "Alkaloid",
  terpenoid: "Terpenoid",
  saponin: "Saponin",
};

const PHARM_MAP = [
  "anxiolytic",
  "stimulant",
  "sedative",
  "antidepressant",
  "adaptogen",
  "nootropic",
  "analgesic",
  "psychedelic",
  "dissociative",
  "empathogen",
] as const;

type ListLike = string | string[] | null | undefined;

function normList(value?: ListLike): string[] {
  const source = Array.isArray(value) ? value.join(",") : value ?? "";
  return source
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9,; /+-]/g, " ")
    .split(/[;,]/)
    .map(entry => entry.trim())
    .filter(Boolean);
}

export function deriveCompoundClasses(herb: Herb): string[] {
  const haystack = [
    ...normList(herb.active_compounds ?? herb.compounds),
    ...normList(herb.tags),
    herb.description?.toLowerCase() ?? "",
  ].join(" ");

  const matches = new Set<string>();
  Object.entries(CLASS_MAP).forEach(([needle, label]) => {
    if (needle && haystack.includes(needle)) {
      matches.add(label);
    }
  });

  return Array.from(matches);
}

export function derivePharmCategories(herb: Herb): string[] {
  const haystack = [
    herb.effects?.toLowerCase() ?? "",
    ...(herb.tags ?? []).map(tag => tag.toLowerCase()),
    herb.description?.toLowerCase() ?? "",
  ].join(" ");

  const matches = new Set<string>();
  PHARM_MAP.forEach(needle => {
    if (haystack.includes(needle)) {
      matches.add(needle.charAt(0).toUpperCase() + needle.slice(1));
    }
  });

  return Array.from(matches);
}

export function decorateHerbs<T extends Herb>(herbs: T[]): T[] {
  return herbs.map(herb => ({
    ...herb,
    compoundClasses:
      Array.isArray(herb.compoundClasses) && herb.compoundClasses.length > 0
        ? herb.compoundClasses
        : deriveCompoundClasses(herb),
    pharmCategories:
      Array.isArray(herb.pharmCategories) && herb.pharmCategories.length > 0
        ? herb.pharmCategories
        : derivePharmCategories(herb),
  }));
}
