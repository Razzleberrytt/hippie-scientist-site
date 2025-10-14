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
  return safeJson<Entity[]>("/data/herbs.json", []);
}

export async function loadCompounds() {
  return safeJson<Entity[]>("/data/compounds.json", []);
}

export async function loadCounts() {
  const [herbs, compounds] = await Promise.all([loadHerbs(), loadCompounds()]);
  return { herbCount: herbs.length, compoundCount: compounds.length };
}
