import { AFFILIATE_TAGS } from '@/config/affiliate'
import { list, text, unique } from '@/lib/display-utils'
import { buildMonetizationOpportunity } from '@/lib/monetization-intelligence-layer'
import {
  type AffiliateProduct,
  getProductsBySlug,
} from './affiliate-registry'

// --- LEGACY/SEMANTIC ROUTING DECISIONS (Merged from root lib) ---

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

// --- NEW YIELD-AWARE PRODUCT ROUTING ---

export type RoutingSortPreference = 'cost' | 'potency' | 'certification'

export interface ResolvedProductRoute {
  product: AffiliateProduct
  targetDoseMg: number
  capsulesNeeded: number
  actualYieldMg: number
  activeYieldMg: number // actual active compound yield in mg (e.g. withanolides)
  costPerDoseUsd: number
  affiliateUrl: string
}

export function calculateProductRoute(
  product: AffiliateProduct,
  targetDoseMg: number
): ResolvedProductRoute {
  // Use the primary active ingredient (first one) for routing calculations
  const primaryIng = product.activeIngredients[0] || {
    name: product.name,
    amountMg: 100,
    activeCompound: 'unknown',
    activeYieldPercent: 100,
  }

  // Calculate capsules needed to meet or exceed target dose
  const rawAmtPerCapsule = primaryIng.amountMg / product.servingSize
  const capsulesNeeded = Math.max(1, Math.ceil(targetDoseMg / rawAmtPerCapsule))

  const actualYieldMg = rawAmtPerCapsule * capsulesNeeded

  // Calculate active compounds delivered
  const activePerCapsule = rawAmtPerCapsule * (primaryIng.activeYieldPercent / 100)
  const activeYieldMg = activePerCapsule * capsulesNeeded

  // Calculate cost per dose
  const costPerCapsule = product.priceUsd / product.capsulesPerContainer
  const costPerDoseUsd = costPerCapsule * capsulesNeeded

  // Build compliant Amazon affiliate link using the centralized tag config
  const affiliateUrl = `https://www.amazon.com/dp/${product.amazonAsin}?tag=${AFFILIATE_TAGS.amazon}`

  return {
    product,
    targetDoseMg,
    capsulesNeeded,
    actualYieldMg,
    activeYieldMg,
    costPerDoseUsd,
    affiliateUrl,
  }
}

export function resolveAllProductsForSlug(
  slug: string,
  targetDoseMg: number,
  preference: RoutingSortPreference = 'cost'
): ResolvedProductRoute[] {
  const products = getProductsBySlug(slug)
  if (!products.length) return []

  const routes = products.map(p => calculateProductRoute(p, targetDoseMg))

  // Sort according to preference
  routes.sort((a, b) => {
    if (preference === 'potency') {
      return b.activeYieldMg - a.activeYieldMg
    }
    if (preference === 'certification') {
      return b.product.certifications.length - a.product.certifications.length
    }
    return a.costPerDoseUsd - b.costPerDoseUsd
  })

  return routes
}

export function resolveBestProduct(
  slug: string,
  targetDoseMg: number,
  preference: RoutingSortPreference = 'cost'
): ResolvedProductRoute | null {
  const allResolved = resolveAllProductsForSlug(slug, targetDoseMg, preference)
  return allResolved[0] || null
}
