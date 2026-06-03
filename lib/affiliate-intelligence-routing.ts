import { list, text, unique } from '@/lib/display-utils'
import { buildMonetizationOpportunity } from '@/lib/monetization-intelligence-layer'

export type AffiliateRoutingDecision = {
  title: string
  readiness: 'ready' | 'review' | 'blocked'
  rationale: string[]
  productSignals: string[]
}

function normalize(value: unknown) {
  return text(value).toLowerCase().trim()
}

export function buildAffiliateRoutingDecision(record: any): AffiliateRoutingDecision {
  const monetization = buildMonetizationOpportunity(record)

  const productSignals = unique([
    ...list(record?.affiliate_links),
    ...list(record?.product_links),
    ...list(record?.stack_with),
    ...list(record?.synergies),
    ...list(record?.best_for),
  ].map(text).filter(Boolean)).slice(0, 8)

  const blocked = /avoid|unsafe|danger|contraindicated/.test(normalize(record?.safety_level || record?.warnings))

  const readiness: AffiliateRoutingDecision['readiness'] =
    blocked
      ? 'blocked'
      : monetization.affiliateReady && monetization.confidence !== 'exploratory'
        ? 'ready'
        : 'review'

  return {
    title: text(record?.displayName || record?.name || record?.slug),
    readiness,
    rationale: monetization.rationale,
    productSignals,
  }
}
