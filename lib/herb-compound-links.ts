import { promises as fs } from 'node:fs'
import path from 'node:path'
import { cache } from 'react'
import { formatDisplayLabel } from '@/lib/display-utils'
import { getRuntimeVisibility } from './runtime-visibility'
import { getCompoundSummaryIndex, getHerbSummaryIndex } from '../src/lib/runtime-summary-indexes'

/**
 * Renders the curated herb <-> compound relationship graph
 * (`public/data/herb-compound-map.json`, 396 hand-authored edges) into internal
 * links. The file is a flat array of edges; this module builds forward
 * (herb -> active compounds) and reverse (compound -> source herbs) views,
 * resolves display names from the cached summary indexes, and filters out any
 * target whose detail page would not render.
 */

export type RelationshipKind = 'primary' | 'partial' | 'secondary'

export type ProfileLink = {
  slug: string
  name: string
  relationship: RelationshipKind
  href: string
  anchor: string
}

type RelationshipEdge = {
  herb_slug?: unknown
  compound_slug?: unknown
  relationship?: unknown
}

const MAP_PATH = path.join(process.cwd(), 'public', 'data', 'herb-compound-map.json')
const MAX_LINKS = 5
const RELATIONSHIP_PRIORITY: Record<RelationshipKind, number> = { primary: 0, partial: 1, secondary: 2 }

function normalizeRelationship(value: unknown): RelationshipKind {
  const normalized = String(value ?? '').toLowerCase()
  if (normalized === 'primary') return 'primary'
  if (normalized === 'secondary') return 'secondary'
  return 'partial'
}

const loadEdges = cache(async (): Promise<RelationshipEdge[]> => {
  try {
    const raw = await fs.readFile(MAP_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as RelationshipEdge[]) : []
  } catch {
    return []
  }
})

/** slug -> display name for renderable targets of the given entity type. */
const loadRenderableNames = cache(async (kind: 'herb' | 'compound'): Promise<Map<string, string>> => {
  const records = kind === 'herb' ? await getHerbSummaryIndex() : await getCompoundSummaryIndex()
  const names = new Map<string, string>()
  for (const record of records) {
    const slug = typeof record?.slug === 'string' ? record.slug : ''
    if (!slug || names.has(slug)) continue
    if (!getRuntimeVisibility(record).canRender) continue
    names.set(slug, formatDisplayLabel(record.name || slug))
  }
  return names
})

/** Normalized key for collapsing near-duplicate targets (e.g. a canonical slug
 *  and its alias that share a display name like "Garlic" / "Garlic (Allium sativum)"). */
function nameKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim()
}

/** Sort by relationship strength, then drop duplicate display names (keeping the
 *  strongest-relationship entry, which is the canonical one), then cap. */
function finalizeLinks(links: ProfileLink[]): ProfileLink[] {
  const sorted = [...links].sort(
    (a, b) => RELATIONSHIP_PRIORITY[a.relationship] - RELATIONSHIP_PRIORITY[b.relationship],
  )
  const seenNames = new Set<string>()
  const deduped: ProfileLink[] = []
  for (const link of sorted) {
    const key = nameKey(link.name)
    if (seenNames.has(key)) continue
    seenNames.add(key)
    deduped.push(link)
  }
  return deduped.slice(0, MAX_LINKS)
}

/**
 * Active compounds found in a herb. `herbName` (the common display name) is used
 * in anchor text; when omitted it is resolved from the herb summary index.
 */
export async function getHerbCompoundLinks(herbSlug: string, herbName?: string): Promise<ProfileLink[]> {
  const slug = String(herbSlug ?? '').trim()
  if (!slug) return []

  const edges = await loadEdges()
  const matches = edges.filter((edge) => edge.herb_slug === slug)
  if (!matches.length) return []

  const compoundNames = await loadRenderableNames('compound')
  const display =
    herbName?.trim() || (await loadRenderableNames('herb')).get(slug) || formatDisplayLabel(slug)

  const seen = new Set<string>()
  const links: ProfileLink[] = []
  for (const edge of matches) {
    const compoundSlug = typeof edge.compound_slug === 'string' ? edge.compound_slug : ''
    const name = compoundNames.get(compoundSlug)
    if (!compoundSlug || !name || seen.has(compoundSlug)) continue
    seen.add(compoundSlug)

    const relationship = normalizeRelationship(edge.relationship)
    links.push({
      slug: compoundSlug,
      name,
      relationship,
      href: `/compounds/${compoundSlug}`,
      anchor:
        relationship === 'primary'
          ? `${name} — primary active compound in ${display}`
          : `${name} — active compound in ${display}`,
    })
  }

  return finalizeLinks(links)
}

/**
 * Source herbs that contain a compound (reverse lookup). `compoundName` is used
 * in anchor text; when omitted it is resolved from the compound summary index.
 */
export async function getCompoundSourceHerbs(
  compoundSlug: string,
  compoundName?: string,
): Promise<ProfileLink[]> {
  const slug = String(compoundSlug ?? '').trim()
  if (!slug) return []

  const edges = await loadEdges()
  const matches = edges.filter((edge) => edge.compound_slug === slug)
  if (!matches.length) return []

  const herbNames = await loadRenderableNames('herb')
  const display =
    compoundName?.trim() || (await loadRenderableNames('compound')).get(slug) || formatDisplayLabel(slug)

  const seen = new Set<string>()
  const links: ProfileLink[] = []
  for (const edge of matches) {
    const herbSlug = typeof edge.herb_slug === 'string' ? edge.herb_slug : ''
    const name = herbNames.get(herbSlug)
    if (!herbSlug || !name || seen.has(herbSlug)) continue
    seen.add(herbSlug)

    const relationship = normalizeRelationship(edge.relationship)
    links.push({
      slug: herbSlug,
      name,
      relationship,
      href: `/herbs/${herbSlug}`,
      anchor:
        relationship === 'primary'
          ? `${name}, a primary natural source of ${display}`
          : `${name}, a natural source of ${display}`,
    })
  }

  return finalizeLinks(links)
}
