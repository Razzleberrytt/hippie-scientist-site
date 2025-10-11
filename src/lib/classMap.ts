export const CLASS_MAP = {
  psychoactive: "from-green-400 via-cyan-400 to-blue-500",
  adaptogen: "from-amber-400 via-orange-400 to-orange-500",
  stimulant: "from-pink-400 via-fuchsia-500 to-rose-500",
  sedative: "from-cyan-400 via-sky-400 to-indigo-500",
  blog: "from-violet-400 via-purple-500 to-indigo-500",
  default: "from-violet-400 via-purple-500 to-indigo-500",
} as const;

export type ClassMapKey = keyof typeof CLASS_MAP;

const KEYWORD_PATTERNS: Array<{ pattern: RegExp; key: ClassMapKey }> = [
  { pattern: /psyched|vision|entheo|hallucin|tryptamine|neuroplastic/i, key: "psychoactive" },
  { pattern: /adaptogen|tonic|stress|balance|homeostat|immun|resilien/i, key: "adaptogen" },
  { pattern: /stimul|energy|focus|alert|wake|nootrop|caffein|dopamine/i, key: "stimulant" },
  { pattern: /sedat|calm|sleep|soothe|relax|dream|anxiolytic|gaba/i, key: "sedative" },
];

const DIRECT_ALIASES: Record<string, ClassMapKey> = {
  psychedelic: "psychoactive",
  psychoactive: "psychoactive",
  entheogen: "psychoactive",
  visionary: "psychoactive",
  adaptogen: "adaptogen",
  tonic: "adaptogen",
  restorative: "adaptogen",
  stimulant: "stimulant",
  energizing: "stimulant",
  nootropic: "stimulant",
  sedative: "sedative",
  calming: "sedative",
  sleep: "sedative",
  dream: "sedative",
  blog: "blog",
  article: "blog",
  default: "default",
};

export function resolveClassKey(
  value?: string | null,
  fallback: ClassMapKey = "default",
): ClassMapKey {
  if (!value) return fallback;
  const normalized = value.toString().toLowerCase().trim();
  if (!normalized) return fallback;

  if (normalized in DIRECT_ALIASES) {
    return DIRECT_ALIASES[normalized];
  }

  const matchingAlias = DIRECT_ALIASES[normalized.replace(/[^a-z]/g, "")];
  if (matchingAlias) return matchingAlias;

  for (const { pattern, key } of KEYWORD_PATTERNS) {
    if (pattern.test(normalized)) return key;
  }

  const parts = normalized.split(/[\s,/|]+/);
  for (const part of parts) {
    const alias = DIRECT_ALIASES[part];
    if (alias) return alias;
  }

  return fallback;
}

export function gradientClassName(
  value?: string | null,
  fallback: ClassMapKey = "default",
): string {
  const key = resolveClassKey(value, fallback);
  return `bg-gradient-to-br ${CLASS_MAP[key]}`;
}

export function gradientTokens(
  value?: string | null,
  fallback: ClassMapKey = "default",
): string[] {
  const key = resolveClassKey(value, fallback);
  return CLASS_MAP[key].split(/\s+/).filter(Boolean);
}

export function gradientKeyForTag(tag?: string | null): ClassMapKey {
  return resolveClassKey(tag, "blog");
}

export function gradientKeyForCategory(category?: string | null): ClassMapKey {
  return resolveClassKey(category, "psychoactive");
}

export function gradientKeyForCompound(type?: string | null): ClassMapKey {
  return resolveClassKey(type, "stimulant");
}
