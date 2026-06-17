/**
 * Deterministic content relationship engine.
 *
 * Pure functions — callers supply the data, this module supplies the scoring.
 * No JSON imports here so bundle impact is zero unless the caller imports data too.
 * No AI, embeddings, or ML. Signals: name match, slug token overlap, effect match.
 *
 * Primary consumer: scripts/internal-linking-audit.mjs (audit tool)
 * Future use: page components that want linking recommendations at build time.
 */

// ─── Input types ─────────────────────────────────────────────────────────────

export interface HerbEntry {
  slug: string
  name: string
  effects?: string[]
  primary_effects?: string[]
  sitemap_included: boolean
}

export interface CompoundEntry {
  slug: string
  name: string
  effects?: string[]
  primary_effects?: string[]
  sitemap_included: boolean
}

export interface GuideEntry {
  slug: string
  title: string
}

export interface ComparisonEntry {
  slug: string
  title: string
}

// ─── Output types ─────────────────────────────────────────────────────────────

export interface HerbMatch {
  slug: string
  name: string
  route: string
  matchReason: string
}

export interface CompoundMatch {
  slug: string
  name: string
  route: string
  matchReason: string
}

export interface GuideMatch {
  slug: string
  title: string
  route: string
  matchReason: string
}

export interface ComparisonMatch {
  slug: string
  title: string
  route: string
  matchReason: string
}

export interface RelatedContent {
  herbs: HerbMatch[]
  compounds: CompoundMatch[]
  guides: GuideMatch[]
  comparisons: ComparisonMatch[]
}

// ─── Scoring internals ────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'for', 'and', 'the', 'with', 'a', 'an', 'of', 'in', 'to', 'vs', 'or', 'on',
  'at', 'by', 'is', 'are', 'was', 'be', 'as', 'from', 'that', 'this', 'how',
  'why', 'what', 'when', 'where', 'your', 'you', 'do', 'does', 'can', 'best',
  'top', 'guide', 'natural', 'herb', 'supplement', 'herbs', 'supplements',
  'about', 'more', 'over', 'into', 'vs.', 'between', 'compare',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[-\s_/]+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ''))
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t))
}

interface ScoreResult {
  score: number
  reason: string
}

function scoreMatch(
  entityName: string,
  entitySlug: string,
  entityEffects: string[],
  pageTitle: string,
  pageSlug: string,
): ScoreResult {
  const titleLower = pageTitle.toLowerCase()
  const pageTokens = new Set(tokenize(pageSlug))
  const entityNameLower = entityName.toLowerCase()

  let score = 0
  let reason = ''

  // Exact entity name contained in page title — strongest signal
  if (titleLower.includes(entityNameLower)) {
    score += 3
    reason = 'name in title'
  }

  // Slug token overlap — e.g. "ashwagandha" in page slug
  const entitySlugTokens = tokenize(entitySlug)
  const overlap = entitySlugTokens.filter((t) => pageTokens.has(t))
  if (overlap.length > 0) {
    score += Math.min(overlap.length * 2, 4)
    if (!reason) reason = `slug overlap: ${overlap.join(', ')}`
  }

  // Effect keyword present in title or slug
  for (const effect of entityEffects) {
    const effectNorm = effect.toLowerCase().replace(/_/g, ' ')
    if (titleLower.includes(effectNorm) || pageSlug.includes(effect.toLowerCase())) {
      score += 1
      if (!reason) reason = `effect: ${effect}`
      break
    }
  }

  return { score, reason }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function findRelatedHerbs(
  pageTitle: string,
  pageSlug: string,
  _contentType: string,
  herbs: HerbEntry[],
  topN = 5,
): HerbMatch[] {
  const scored: Array<HerbMatch & { score: number }> = []

  for (const herb of herbs) {
    if (!herb.sitemap_included) continue
    if (herb.slug === pageSlug) continue

    const effects = [...(herb.effects ?? []), ...(herb.primary_effects ?? [])]
    const { score, reason } = scoreMatch(herb.name, herb.slug, effects, pageTitle, pageSlug)

    if (score > 0) {
      scored.push({
        slug: herb.slug,
        name: herb.name,
        route: `/herbs/${herb.slug}`,
        matchReason: reason,
        score,
      })
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(({ score: _s, ...rest }) => rest)
}

export function findRelatedCompounds(
  pageTitle: string,
  pageSlug: string,
  _contentType: string,
  compounds: CompoundEntry[],
  topN = 5,
): CompoundMatch[] {
  const scored: Array<CompoundMatch & { score: number }> = []

  for (const compound of compounds) {
    if (!compound.sitemap_included) continue
    if (compound.slug === pageSlug) continue

    const effects = [...(compound.effects ?? []), ...(compound.primary_effects ?? [])]
    const { score, reason } = scoreMatch(
      compound.name,
      compound.slug,
      effects,
      pageTitle,
      pageSlug,
    )

    if (score > 0) {
      scored.push({
        slug: compound.slug,
        name: compound.name,
        route: `/compounds/${compound.slug}`,
        matchReason: reason,
        score,
      })
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(({ score: _s, ...rest }) => rest)
}

export function findRelatedGuides(
  pageTitle: string,
  pageSlug: string,
  _contentType: string,
  guides: GuideEntry[],
  topN = 5,
): GuideMatch[] {
  const scored: Array<GuideMatch & { score: number }> = []

  for (const guide of guides) {
    if (guide.slug === pageSlug) continue

    const { score, reason } = scoreMatch(guide.title, guide.slug, [], pageTitle, pageSlug)

    if (score > 0) {
      scored.push({
        slug: guide.slug,
        title: guide.title,
        route: `/guides/${guide.slug}`,
        matchReason: reason,
        score,
      })
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(({ score: _s, ...rest }) => rest)
}

export function findRelatedComparisons(
  pageTitle: string,
  pageSlug: string,
  _contentType: string,
  comparisons: ComparisonEntry[],
  topN = 5,
): ComparisonMatch[] {
  const scored: Array<ComparisonMatch & { score: number }> = []

  for (const comparison of comparisons) {
    if (comparison.slug === pageSlug) continue

    const { score, reason } = scoreMatch(
      comparison.title,
      comparison.slug,
      [],
      pageTitle,
      pageSlug,
    )

    if (score > 0) {
      scored.push({
        slug: comparison.slug,
        title: comparison.title,
        route: `/compare/${comparison.slug}`,
        matchReason: reason,
        score,
      })
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(({ score: _s, ...rest }) => rest)
}

/** Convenience wrapper: run all four finders in one call. */
export function findRelatedContent(
  pageTitle: string,
  pageSlug: string,
  contentType: string,
  data: {
    herbs: HerbEntry[]
    compounds: CompoundEntry[]
    guides: GuideEntry[]
    comparisons: ComparisonEntry[]
  },
): RelatedContent {
  return {
    herbs: findRelatedHerbs(pageTitle, pageSlug, contentType, data.herbs),
    compounds: findRelatedCompounds(pageTitle, pageSlug, contentType, data.compounds),
    guides: findRelatedGuides(pageTitle, pageSlug, contentType, data.guides),
    comparisons: findRelatedComparisons(pageTitle, pageSlug, contentType, data.comparisons),
  }
}
