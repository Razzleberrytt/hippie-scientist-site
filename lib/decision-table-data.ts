import type { EvidenceStrengthData } from './evidence-strength'
import { getEvidenceStrengthData } from './evidence-strength'
import { rankEntitiesForGoal } from './goal-matching-engine'
import { getRevenueProductSet } from '@/config/revenue-products'
import { AFFILIATE_TAGS } from '@/config/affiliate'
import { isRestrictedIngredient } from '../src/lib/restricted-ingredients'

export type PriceTier = 'budget' | 'mid' | 'premium' | 'unknown'

export type WhatToBuyFirstEntry = {
  rank: number
  slug: string
  name: string
  /** Absolute URL to the compound/herb profile page */
  href: string
  entityType: 'herb' | 'compound' | 'stack'
  evidenceData: EvidenceStrengthData
  typicalDose?: string
  priceTier: PriceTier
  affiliateUrl?: string
  /** Short CTA shown on the affiliate button */
  affiliateLabel?: string
  /** One-line context for why this ranks here */
  bestFor?: string
  /** Summary sentence from the runtime record */
  summary?: string
  /** True for rank-1 entry — gets "Start Here" badge */
  isFeatured: boolean
}

function fallbackAmazonUrl(name: string): string {
  if (isRestrictedIngredient(name)) return ''
  return `https://www.amazon.com/s?k=${encodeURIComponent(name + ' supplement')}&tag=${AFFILIATE_TAGS.amazon}`
}

function inferPriceTier(record: Record<string, unknown>): PriceTier {
  const cost = String(record?.cost || record?.price_tier || record?.price || '').toLowerCase()
  if (/budget|cheap|low.cost|\$\s*$|\$[^$]/.test(cost)) return 'budget'
  if (/premium|expensive|high.cost|\$\$\$/.test(cost)) return 'premium'
  if (/mid|moderate|average|\$\$/.test(cost)) return 'mid'
  return 'unknown'
}

function inferDose(record: Record<string, unknown>): string | undefined {
  const dose =
    record?.minimum_effective_dose ||
    record?.typical_dosage ||
    record?.dosage ||
    record?.dose ||
    record?.preparation
  return dose ? String(dose) : undefined
}

type RuntimeRecord = Record<string, unknown>

/**
 * Builds a ranked list of "What to Buy First" entries for a given goal.
 * Designed for use in async Server Components — loads herb/compound records at build time.
 */
export async function buildDecisionTableEntries(
  goalSlug: string,
  limit = 5,
): Promise<WhatToBuyFirstEntry[]> {
  const matches = rankEntitiesForGoal(goalSlug).slice(0, limit)
  if (matches.length === 0) return []

  // Dynamic import of server-only data loaders to keep this file tree-shakeable
  const { getAllHerbs, getAllCompounds } = await import('./server/runtime-data')
  const [herbs, compounds] = await Promise.all([getAllHerbs(), getAllCompounds()])

  const entries: WhatToBuyFirstEntry[] = []

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]

    // Look up the runtime record to get evidence + dose data
    const records: RuntimeRecord[] = match.type === 'compound' ? compounds : herbs
    const record: RuntimeRecord = records.find(
      (r) => String(r?.slug || '') === match.slug,
    ) ?? { slug: match.slug, name: match.name }

    // Build evidence strength from the runtime record
    const evidenceData = getEvidenceStrengthData(record as Parameters<typeof getEvidenceStrengthData>[0])

    // Resolve affiliate URL: curated set takes priority, then Amazon search
    const revSet = getRevenueProductSet(match.slug)
    const overallProduct =
      revSet?.products.find((p) => p.slot === 'overall') ?? revSet?.products[0]
    const affiliateUrl = overallProduct?.affiliateUrl || fallbackAmazonUrl(match.name)

    const href = match.type === 'herb'
      ? `/herbs/${match.slug}`
      : match.type === 'stack'
      ? `/stacks/${match.slug}`
      : `/compounds/${match.slug}`

    const bestFor =
      match.bestFor[0] ||
      (record?.best_for ? String(record.best_for).split(/[,;|]/)[0] : undefined) ||
      goalSlug

    entries.push({
      rank: i + 1,
      slug: match.slug,
      name: match.name,
      href,
      entityType: match.type,
      evidenceData,
      typicalDose: inferDose(record),
      priceTier: inferPriceTier(record),
      affiliateUrl: affiliateUrl || undefined,
      affiliateLabel: overallProduct?.title ? `View ${overallProduct.brand || match.name}` : 'View on Amazon',
      bestFor: bestFor ? String(bestFor) : undefined,
      summary: record?.summary ? String(record.summary) : undefined,
      isFeatured: i === 0,
    })
  }

  return entries
}
