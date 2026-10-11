/**
 * Read-only diagnosis of configured product eligibility on priority profiles.
 *
 * Run: npx tsx scripts/audit/monetization-eligibility.ts
 *
 * This does NOT grant affiliate approval, edit workbook data, publish products,
 * validate marketplace listings, or change any monetization/safety gate.
 * The diagnostic is intentionally separate from clinical/editorial approval.
 */
import { getHerbs, getCompounds } from '../../lib/runtime-data'
import { getRuntimeVisibility } from '../../lib/runtime-visibility'
import { canRenderAffiliateLinks, canShowAffiliateModule } from '../../lib/affiliate'
import { canRenderConfiguredRevenueProducts } from '../../lib/revenue-product-governance'
import { getRevenueProductSet } from '../../config/revenue-products'
import { isRestrictedIngredient, isRestrictedRecord } from '../../lib/restricted-ingredients'
import { hasExplicitResearchMaturitySignal, policyForResearchRecord } from '../../lib/research-maturity'

type Target = { slug: string; kind: 'herb' | 'compound' }
type RecordData = Record<string, unknown>

const TARGETS: Target[] = [
  { slug: 'ashwagandha', kind: 'herb' },
  { slug: 'turmeric', kind: 'herb' },
  { slug: 'magnesium', kind: 'compound' },
  { slug: 'creatine', kind: 'compound' },
  { slug: 'omega-3', kind: 'compound' },
  { slug: 'cannabidiol', kind: 'compound' },
  { slug: 'methyl-eugenol', kind: 'compound' },
  { slug: 'kava', kind: 'herb' },
]

function safetyHoldOnProfile(record: RecordData): boolean {
  // Mirrors the high-caution / needs-review branch on the profile templates.
  // Additional legal-status suppression in the compound template is separate.
  const safetyText = String(
    record.safety || record.safetyNotes || record.safety_level || record.safety_rating || '',
  ).toLowerCase()
  return ['high caution', 'needs-review', 'needs review', 'severe'].some((phrase) =>
    safetyText.includes(phrase),
  )
}

function getPolicyFlag(record: RecordData, key: string): unknown {
  const governance = record.governance
  return governance && typeof governance === 'object' && !Array.isArray(governance)
    ? (governance as RecordData)[key] ?? null
    : null
}

function isConfiguredLink(value: unknown): boolean {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim())
}

function inspect(target: Target, record: RecordData | null) {
  const productSet = getRevenueProductSet(target.slug)
  const configuredProducts = productSet?.products ?? []
  const explicitRestriction = isRestrictedIngredient(target.slug)
  const recordRestriction = record ? isRestrictedRecord(record) : null
  const runtimeVisibility = record ? getRuntimeVisibility(record) : null
  const maturity = record && hasExplicitResearchMaturitySignal(record)
    ? policyForResearchRecord(record)
    : null
  const centrallyAllowed = record ? canRenderAffiliateLinks(record) : false
  const curatedAllowed = record && productSet
    ? canRenderConfiguredRevenueProducts(target.slug, record)
    : false
  const profileSafetyHold = record ? safetyHoldOnProfile(record) : null
  const genericSearchModuleAllowed = record ? canShowAffiliateModule(record) : false
  const blockedReasons: string[] = []

  if (!record) blockedReasons.push('runtime_record_missing')
  if (explicitRestriction) blockedReasons.push('restricted_ingredient')
  if (recordRestriction) blockedReasons.push('restricted_runtime_record')
  if (record?.monetization_allowed === false || record?.monetization_allowed === 'false') {
    blockedReasons.push('explicit_monetization_denial')
  }
  if (runtimeVisibility && !runtimeVisibility.canMonetize) blockedReasons.push('runtime_visibility_denied')
  if (maturity && !maturity.purchaseIntentAllowed) blockedReasons.push('research_maturity_denied')
  if (profileSafetyHold) blockedReasons.push('profile_high_caution_hold')
  if (!productSet) blockedReasons.push('no_configured_product_set')
  if (!centrallyAllowed && blockedReasons.length === 0) blockedReasons.push('other_central_gate_denied')

  return {
    slug: target.slug,
    kind: target.kind,
    recordFound: Boolean(record),
    metadata: {
      affiliate_ready: record?.affiliate_ready ?? null,
      monetization_allowed: record?.monetization_allowed ?? null,
      governanceMonetizationAllowed: record ? getPolicyFlag(record, 'monetizationAllowed') : null,
      profile_status: record?.profile_status ?? null,
      evidence_tier: record?.evidence_tier ?? null,
      indexability_status: record?.indexability_status ?? null,
      safety_rating: record?.safety_rating ?? null,
    },
    gates: {
      runtimeCanMonetize: runtimeVisibility?.canMonetize ?? false,
      maturity: maturity?.maturity ?? 'not_explicit',
      centrallyAllowed,
      curatedProductGateAllowed: Boolean(curatedAllowed),
      genericSearchModuleAllowed,
      profileHighCautionHold: profileSafetyHold,
      // A true result here is only a technical eligibility observation.
      // Human editorial review and destination validation remain separate gates.
      technicallyRenderableInProfile: Boolean(curatedAllowed && !profileSafetyHold),
    },
    productInventory: {
      configured: configuredProducts.length,
      withHttpUrl: configuredProducts.filter((product) => isConfiguredLink(product.affiliateUrl)).length,
      withAsin: configuredProducts.filter((product) => Boolean(product.asin)).length,
      destinationAndQualityReview: 'unverified',
      requiredIndependentEditorialReview: true,
    },
    blockedReasons,
  }
}

async function main() {
  const [herbs, compounds] = await Promise.all([getHerbs(), getCompounds()])
  const byHerb = new Map(herbs.map((record) => [String(record.slug || ''), record as RecordData]))
  const byCompound = new Map(compounds.map((record) => [String(record.slug || ''), record as RecordData]))
  const rows = TARGETS.map((target) => inspect(
    target,
    (target.kind === 'herb' ? byHerb : byCompound).get(target.slug) ?? null,
  ))
  console.log(JSON.stringify({
    audit: 'priority-affiliate-eligibility',
    mode: 'read_only',
    interpretation: 'Technical eligibility is not human editorial approval or an Amazon listing validation.',
    rows,
  }, null, 2))
}

main().catch((error) => {
  console.error('Affiliate eligibility audit could not load runtime data:', error)
  process.exitCode = 1
})
