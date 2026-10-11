import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { isBatch7SafetyHold } from '../batch7-safety-holds'
import { canRenderAffiliateLinks } from '../affiliate'
import { canRenderConfiguredRevenueProducts } from '../revenue-product-governance'

const affectedSlugs = [
  'andrographis', 'andrographis-paniculata', 'gotu-kola',
  'motherwort', 'aloe-vera', 'cat-s-claw',
  // These aliases are accepted by the revenue catalog. Each must fail closed
  // even if a caller passes the alias without a runtime record.
  'andrographolide-herb', 'aloe-barbadensis', 'brahmi-gotu-kola',
]
const documentedProfiles: Array<{ directory: string; slug: string; evidenceUrl: string; caution: RegExp }> = [
  { directory: 'herbs-detail', slug: 'andrographis-paniculata', evidenceUrl: 'tga.gov.au', caution: /anaphylaxis/i },
  { directory: 'compounds-detail', slug: 'andrographis', evidenceUrl: 'tga.gov.au', caution: /anaphylaxis/i },
  { directory: 'herbs-detail', slug: 'gotu-kola', evidenceUrl: 'ncbi.nlm.nih.gov/books/NBK603561', caution: /jaundice|liver.injury/i },
  { directory: 'herbs-detail', slug: 'aloe-vera', evidenceUrl: 'mskcc.org', caution: /oral latex|whole.leaf/i },
  { directory: 'herbs-detail', slug: 'cat-s-claw', evidenceUrl: 'nccih.nih.gov', caution: /immunosuppress/i },
]

describe('Batch 7 precautionary safety holds', () => {
  it('fails closed on all investigated ingredient slugs, even when an incoming record is monetizable', () => {
    for (const slug of affectedSlugs) {
      expect(isBatch7SafetyHold(slug)).toBe(true)
      expect(canRenderAffiliateLinks({ slug, governance: { monetizationAllowed: true } })).toBe(false)
      expect(canRenderAffiliateLinks({ slug, monetization_allowed: true })).toBe(false)
      expect(canRenderConfiguredRevenueProducts(slug, { slug, monetization_allowed: true })).toBe(false)
      expect(canRenderConfiguredRevenueProducts(slug)).toBe(false)
    }
    expect(isBatch7SafetyHold('magnesium')).toBe(false)
    expect(canRenderConfiguredRevenueProducts('magnesium')).toBe(true)
  })

  it('retains educational profile content while safety evidence and recommendations remain separately governed', () => {
    for (const target of documentedProfiles) {
      const file = path.join(process.cwd(), 'public', 'data', target.directory, target.slug + '.json')
      const record = JSON.parse(fs.readFileSync(file, 'utf8'))
      expect(record.slug).toBe(target.slug)
      expect(record.safetyNotes).toMatch(target.caution)
      expect(record.governance.monetizationAllowed).toBe(false)
      expect(record.governance.recommendationAllowed).toBe(false)
      expect(record.governance.requiresHumanReview).toBe(true)
      expect(record.sources.some((source: {url?: string}) => source.url?.includes(target.evidenceUrl))).toBe(true)
    }
  })
})
