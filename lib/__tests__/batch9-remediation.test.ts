import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { revenueProductSets } from '@/config/revenue-products'
import { productPicks } from '@/data/product-picks'

function safetyNotes(folder: string, slug: string): string {
  const record = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/data', folder, `${slug}.json`), 'utf8'))
  return String(record.safetyNotes || '')
}

describe('Batch 9 safety and catalog remediation', () => {
  it('never offers rejected or unresolved product identities as curated recommendations', () => {
    const products = Object.values(revenueProductSets).flatMap((set) => set.products)
    const titles = products.map((p) => p.title)
    for (const rejected of [
      'Thorne Phytisone (Ginger)', 'Thorne Echinacea',
      'Gaia Herbs Chamomile Liquid Extract', 'Life Extension Hawthorn Extract',
    ]) expect(titles).not.toContain(rejected)
    expect(productPicks.map((p) => p.name)).not.toContain('Thorne Phytisone (Ginger)')
  })

  it('keeps five reviewed primary product identities accurately labeled', () => {
    const titles = Object.values(revenueProductSets).flatMap((set) => set.products.map((p) => p.title))
    for (const title of [
      'Gaia Herbs Hawthorn Supreme', 'Pure Encapsulations Black Cohosh 2.5',
      'Pure Encapsulations Inositol Complex', 'NOW Sports Micronized Creatine Monohydrate Powder',
      'NOW Berberine HCl 500 mg',
    ]) expect(titles).toContain(title)
  })

  it('shows qualified and source-attributed public-facing risk disclosures', () => {
    expect(safetyNotes('herbs-detail', 'ashwagandha')).toMatch(/liver injury|liver injury has been linked/i)
    expect(safetyNotes('herbs-detail', 'turmeric')).toMatch(/liver injury/i)
    expect(safetyNotes('compounds-detail', 'melatonin')).toMatch(/11,000|11,000 US/)
    expect(safetyNotes('compounds-detail', 'probiotics')).toMatch(/preterm infants/i)
    expect(safetyNotes('compounds-detail', 'omega-3')).toMatch(/atrial.fibrillation/i)
    expect(safetyNotes('compounds-detail', 'omega-3')).toMatch(/does not establish equal risk/i)
  })

  it('retains the provisional research queue rather than falsely approving it', () => {
    const queue = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'ops/research-coordinator/review-queues/2026-10-11-batch9-remediation-review.json'), 'utf8'))
    expect(queue.reportedDisposition).toEqual({ confirmed:44, provisional:25, unresolved:4, rejected:2 })
    expect(queue.provisionalSafetyReviewQueue).toHaveLength(20)
    expect(queue.highConfidenceASINsReported).toHaveLength(18)
    expect(queue.asinPolicy).toMatch(/No additional direct ASIN links/i)
  })
})
