import { getHomepageData } from '@/lib/homepage-data'

export type ContentSnippet = {
  kind: 'herb' | 'compound'
  slug: string
  title: string
  hook: string
  explanation: string
  safetyNote: string
  ctaPath: string
}

function toSnippet(item: ReturnType<typeof getHomepageData>['featured'][number]): ContentSnippet {
  const evidenceHook = item.governedSummary?.title
    ? `${item.governedSummary.title}.`
    : 'Evidence context is still developing.'

  return {
    kind: item.kind,
    slug: item.slug,
    title: item.name,
    hook: evidenceHook,
    explanation: item.blurb,
    safetyNote: item.governedSummary?.safetyCautionsPresent
      ? 'Safety cautions are present in governed review; check interactions and contraindications before use.'
      : 'Safety profile may be partial; review contraindications and interactions before use.',
    ctaPath: item.kind === 'herb' ? `/herbs/${item.slug}` : `/compounds/${item.slug}`,
  }
}

export function getSnippet(kind: 'herb' | 'compound', slug: string) {
  const homepageData = getHomepageData()
  const item = [...homepageData.governedHighlights, ...homepageData.featured].find(
    candidate => candidate.kind === kind && candidate.slug === slug,
  )
  return item ? toSnippet(item) : null
}

export function getDailyDiscoverySnippet(date = new Date()) {
  const homepageData = getHomepageData()
  const pool = homepageData.governedHighlights.length ? homepageData.governedHighlights : homepageData.featured
  if (!pool.length) return null
  const seed = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`
  const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return toSnippet(pool[hash % pool.length])
}
