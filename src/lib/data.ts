export type Intensity = "MILD" | "MODERATE" | "STRONG";
export type Entity = {
  id: string;
  kind: "herb" | "compound";
  commonName?: string;
  latinName: string;
  summary?: string;
  description?: string;
  tags?: string[];
  intensity?: Intensity;
  regions?: string[];
  sources?: { title: string; url: string }[];
};

function decodeTag(tag: unknown): string {
  if (typeof tag !== "string") return String(tag ?? "");
  if (/\\u[0-9a-fA-F]{4}/.test(tag)) {
    try {
      return JSON.parse(`"${tag.replace(/"/g, "\\\"")}"`);
    } catch {
      return tag;
    }
  }
  return tag;
}

function normalizeEntities(entities: Entity[]): Entity[] {
  return entities.map((entity) => ({
    ...entity,
    tags: Array.isArray(entity.tags) ? entity.tags.map((tag) => decodeTag(tag).trim()) : [],
  }));
}

async function safeJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function loadHerbs() {
  const data = await safeJson<Entity[]>("/data/herbs.json", []);
  return normalizeEntities(data);
}

export async function loadCompounds() {
  const data = await safeJson<Entity[]>("/data/compounds.json", []);
  return normalizeEntities(data);
}

export async function loadCounts() {
  const [herbs, compounds] = await Promise.all([loadHerbs(), loadCompounds()]);
  return { herbCount: herbs.length, compoundCount: compounds.length };
}
