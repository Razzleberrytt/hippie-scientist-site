import { cache } from './react-cache'
import { getSearchSummaryIndex } from '@/lib/runtime-summary-indexes'
import { getRuntimeMapEntries } from '@/lib/runtime-related-maps'
import { getValidComparisonSlug } from '@/lib/comparison-utils'
import { getStacks } from '@/lib/runtime-data'
import { mergeStackEcosystems } from '@/lib/stack-ecosystems'

function normalizeSlug(value: unknown) {
  return typeof value === 'string'
    ? value.trim().toLowerCase()
    : ''
}

function scoreSort(a: any, b: any) {
  const scoreDelta = Number(b?.relatedScore || b?.score || 0) - Number(a?.relatedScore || a?.score || 0)
  if (scoreDelta !== 0) return scoreDelta

  return String(a?.name || a?.slug || '').localeCompare(String(b?.name || b?.slug || ''))
}

export const getAuthorityIndex = cache(async () => {
  const rows = await getSearchSummaryIndex()
  const bySlug = new Map<string, any>()

  for (const row of rows) {
    const slug = normalizeSlug(row?.slug)
    if (!slug || bySlug.has(slug)) continue
    bySlug.set(slug, row)
  }

  return { rows, bySlug }
})

async function hydrateEntries(entries: any[], limit: number) {
  const { bySlug } = await getAuthorityIndex()

  return entries
    .map((entry: any) => {
      const record = bySlug.get(normalizeSlug(entry?.slug))
      if (!record) return null

      return {
        ...record,
        relatedScore: entry?.score || 0,
        relationshipKinds: entry?.relationshipKinds || [],
        relatedOverlap: entry?.overlapLabels || [],
      }
    })
    .filter(Boolean)
    .sort(scoreSort)
    .slice(0, limit)
}

export async function getAuthorityHubRecords(slug: string, limit = 12) {
  const entries = await getRuntimeMapEntries('ecosystem', normalizeSlug(slug))
  return hydrateEntries(entries, limit)
}

export async function getAuthorityComparisons(slug: string, limit = 8) {
  const normalized = normalizeSlug(slug)
  const entries = await getRuntimeMapEntries('comparison', normalized)
  const hydrated = await hydrateEntries(entries, limit)
  
  return hydrated
    .map((comparison: any) => {
      const compSlug = getValidComparisonSlug(normalized, comparison.slug)
      if (!compSlug) return null
      
      const parts = compSlug.split('-vs-')
      const formatPart = (p: string) => p.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      const name = `${formatPart(parts[0])} vs ${formatPart(parts[1])}`
      
      return {
        ...comparison,
        slug: compSlug,
        name,
      }
    })
    .filter((item): item is any => item !== null)
}

export async function getAuthorityStacks(slug: string, limit = 8) {
  const normalized = normalizeSlug(slug)
  const rawStacks = await getStacks()
  const allStacks = mergeStackEcosystems(rawStacks)
  
  const matchingStacks = allStacks.filter(stack => {
    const compounds = stack.compounds || stack.stack || []
    return compounds.some((c: any) => {
      const cSlug = normalizeSlug(c.compound_slug || c.compound || c.slug)
      return cSlug === normalized
    })
  })
  
  return matchingStacks.slice(0, limit).map(stack => ({
    slug: stack.slug,
    name: stack.title || stack.slug,
  }))
}

export async function getBestForRankings(slug: string, limit = 24) {
  const normalized = normalizeSlug(slug)
  const { rows } = await getAuthorityIndex()

  return rows
    .map((row: any) => {
      const haystack = [
        row?.slug,
        row?.name,
        row?.summary,
        row?.primary_effects,
        row?.effects,
        row?.mechanisms,
        row?.pathways,
      ]
        .flat()
        .join(' ')
        .toLowerCase()

      let score = 0
      if (haystack.includes(normalized)) score += 6
      if (/strong|human|clinical|moderate/.test(haystack)) score += 4
      if (/complete|high|ready/.test(haystack)) score += 3

      return {
        ...row,
        rankingScore: score,
      }
    })
    .filter((row: any) => row.rankingScore > 0)
    .sort((a: any, b: any) => {
      const scoreDelta = Number(b.rankingScore || 0) - Number(a.rankingScore || 0)
      if (scoreDelta !== 0) return scoreDelta
      return String(a?.name || a?.slug || '').localeCompare(String(b?.name || b?.slug || ''))
    })
    .slice(0, limit)
}
