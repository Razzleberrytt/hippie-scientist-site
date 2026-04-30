type AnyEntity = {
  id?: string
  latinName?: string
  commonName?: string
  kind?: 'herb' | 'compound'
}

type FrontmatterModule = {
  frontmatter?: {
    id?: string
    latinName?: string
    title?: string
    commonName?: string
  }
}

async function safeGet<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { cache: 'no-store' })
    if (!r.ok) return null
    return (await r.json()) as T
  } catch {
    return null
  }
}

function dedupe(arr: AnyEntity[]) {
  const seen = new Set<string>()
  const out: AnyEntity[] = []
  for (const e of arr) {
    const key =
      (e.id ?? '').toLowerCase() ||
      (e.latinName ?? '').toLowerCase() ||
      (e.commonName ?? '').toLowerCase()
    if (!key) continue
    if (!seen.has(key)) {
      seen.add(key)
      out.push(e)
    }
  }
  return out
}

async function loadHerbCandidates(): Promise<AnyEntity[]> {
  const big = await safeGet<AnyEntity[]>('/data/herbs.json')
  if (big?.length) return big

  const idx =
    (await safeGet<AnyEntity[]>('/data/herbsIndex.json')) ??
    (await safeGet<AnyEntity[]>('/search/herbs.index.json')) ??
    (await safeGet<AnyEntity[]>('/content/herbsIndex.json'))
  if (idx?.length) return idx

  try {
    const files = import.meta.glob('/src/content/herbs/*.mdx', { eager: true }) as Record<
      string,
      FrontmatterModule
    >
    const entries = Object.values(files).map(m => ({
      id: m?.frontmatter?.id,
      latinName: m?.frontmatter?.latinName ?? m?.frontmatter?.title,
      commonName: m?.frontmatter?.commonName,
    }))
    return entries
  } catch {
    return []
  }
}

async function loadCompoundCandidates(): Promise<AnyEntity[]> {
  const big = await safeGet<AnyEntity[]>('/data/compounds.json')
  if (big?.length) return big

  const idx =
    (await safeGet<AnyEntity[]>('/data/compoundsIndex.json')) ??
    (await safeGet<AnyEntity[]>('/search/compounds.index.json')) ??
    (await safeGet<AnyEntity[]>('/content/compoundsIndex.json'))
  if (idx?.length) return idx

  try {
    const files = import.meta.glob('/src/content/compounds/*.mdx', { eager: true }) as Record<
      string,
      FrontmatterModule
    >
    const entries = Object.values(files).map(m => ({
      id: m?.frontmatter?.id,
      latinName: m?.frontmatter?.latinName ?? m?.frontmatter?.title,
      commonName: m?.frontmatter?.commonName,
    }))
    return entries
  } catch {
    return []
  }
}

export async function getFullCounts() {
  const [herbRaw, compRaw] = await Promise.all([loadHerbCandidates(), loadCompoundCandidates()])
  const herbs = dedupe(herbRaw ?? [])
  const compounds = dedupe(compRaw ?? [])
  return { herbCount: herbs.length, compoundCount: compounds.length }
}

export type { AnyEntity }
