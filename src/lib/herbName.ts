export type AnyHerb = Record<string, any>;

const normalize = (value: string): string => {
  return value
    .replace(/[\s\u00A0]+/g, " ")
    .replace(/([,;|/\-])\1+/g, "$1")
    .replace(/\s*([,;|/\-])\s*/g, "$1 ")
    .trim();
};

const titleCase = (value: string): string => {
  const normalized = normalize(value);
  if (!normalized) return "";
  return normalized
    .toLowerCase()
    .replace(/\b([a-z])/g, (_, c: string) => c.toUpperCase());
};

export function getCommonName(h: AnyHerb): string | undefined {
  const candidates: unknown[] = [
    h.commonName,
    h.common_name,
    h.displayName,
    h.display_name,
    h.commonNames,
    h.common_names,
    h.aliases,
    h.aka,
    h.common,
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (typeof candidate === "string") {
      const normalized = titleCase(candidate);
      if (normalized) return normalized;
    }
    if (Array.isArray(candidate)) {
      const first = candidate.find((value) => typeof value === "string" && value.trim());
      if (typeof first === "string") {
        const normalized = titleCase(first);
        if (normalized) return normalized;
      }
    }
  }

  return undefined;
}
