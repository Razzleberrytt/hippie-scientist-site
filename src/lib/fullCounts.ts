import { recordDevMessage } from "../utils/devMessages";

type AnyEntity = {
  id?: string;
  latinName?: string;
  commonName?: string;
  kind?: "herb" | "compound";
};

async function safeGet<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

function dedupe(arr: AnyEntity[]) {
  const seen = new Set<string>();
  const out: AnyEntity[] = [];
  for (const e of arr) {
    const key =
      (e.id ?? "").toLowerCase() ||
      (e.latinName ?? "").toLowerCase() ||
      (e.commonName ?? "").toLowerCase();
    if (!key) continue;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(e);
    }
  }
  return out;
}

async function loadHerbCandidates(): Promise<AnyEntity[]> {
  const big = await safeGet<AnyEntity[]>("/data/herbs.json");
  if (big?.length) return big;

  const manifest = await safeGet<string[]>("/data/herbs/manifest.json");
  if (Array.isArray(manifest) && manifest.length) {
    const parts = await Promise.all(
      manifest.map((p) => safeGet<AnyEntity[]>(`/data/herbs/${p}`))
    );
    return parts.flatMap((part) => (Array.isArray(part) ? part : []));
  }

  const idx =
    (await safeGet<AnyEntity[]>("/data/herbsIndex.json")) ??
    (await safeGet<AnyEntity[]>("/search/herbs.index.json")) ??
    (await safeGet<AnyEntity[]>("/content/herbsIndex.json"));
  if (idx?.length) return idx;

  try {
    // @ts-ignore – Vite glob
    const files = import.meta.glob("/src/content/herbs/*.mdx", { eager: true }) as Record<string, any>;
    const entries = Object.values(files).map((m: any) => ({
      id: m?.frontmatter?.id,
      latinName: m?.frontmatter?.latinName ?? m?.frontmatter?.title,
      commonName: m?.frontmatter?.commonName,
    }));
    return entries;
  } catch {
    return [];
  }
}

async function loadCompoundCandidates(): Promise<AnyEntity[]> {
  const big = await safeGet<AnyEntity[]>("/data/compounds.json");
  if (big?.length) return big;

  const manifest = await safeGet<string[]>("/data/compounds/manifest.json");
  if (Array.isArray(manifest) && manifest.length) {
    const parts = await Promise.all(
      manifest.map((p) => safeGet<AnyEntity[]>(`/data/compounds/${p}`))
    );
    return parts.flatMap((part) => (Array.isArray(part) ? part : []));
  }

  const idx =
    (await safeGet<AnyEntity[]>("/data/compoundsIndex.json")) ??
    (await safeGet<AnyEntity[]>("/search/compounds.index.json")) ??
    (await safeGet<AnyEntity[]>("/content/compoundsIndex.json"));
  if (idx?.length) return idx;

  try {
    // @ts-ignore – Vite glob
    const files = import.meta.glob("/src/content/compounds/*.mdx", { eager: true }) as Record<string, any>;
    const entries = Object.values(files).map((m: any) => ({
      id: m?.frontmatter?.id,
      latinName: m?.frontmatter?.latinName ?? m?.frontmatter?.title,
      commonName: m?.frontmatter?.commonName,
    }));
    return entries;
  } catch {
    return [];
  }
}

export async function getFullCounts() {
  const [herbRaw, compRaw] = await Promise.all([loadHerbCandidates(), loadCompoundCandidates()]);
  const herbs = dedupe(herbRaw ?? []);
  const compounds = dedupe(compRaw ?? []);
  if (herbs.length < 100) {
    recordDevMessage(
      "warning",
      `[THS] Herb count seems low (${herbs.length}). Check data source paths. Tried multiple locations.`
    );
  }
  return { herbCount: herbs.length, compoundCount: compounds.length };
}

export type { AnyEntity };
