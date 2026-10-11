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
      'Pure Encapsulations Inositol Complex', 'NOW Sports Micronized Creatine Monohydrate Powder, 21.2 oz',
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

  it('does not erase existing safety warnings when adding Batch 9 evidence', () => {
    for (const [folder, slug, terms] of [
      ['compounds-detail', 'melatonin', ['drowsiness', 'headache', 'dizziness', 'long-term']],
      ['compounds-detail', 'omega-3', ['fish allergy', 'bleeding-risk', 'formulation']],
      ['compounds-detail', 'probiotics', ['postoperative', 'hospitalized', 'immunocompromised']],
      ['herbs-detail', 'ashwagandha', ['GI upset', 'thyroid stimulation']],
      ['herbs-detail', 'turmeric', ['antiplatelets', 'before surgery', 'breastfeeding']],
    ] as const) {
      const notes = safetyNotes(folder, slug)
      for (const term of terms) expect(notes.toLowerCase()).toContain(term.toLowerCase())
    }
  })

  it('links new safety evidence through structured sources with review still pending', () => {
    const expected = [
      ['compounds-detail', 'melatonin', ['35653284', '38451863']],
      ['compounds-detail', 'omega-3', ['34612056']],
      ['compounds-detail', 'probiotics', ['www.fda.gov/safety/medical-product-safety-information/risk-invasive-disease']],
      ['herbs-detail', 'ashwagandha', ['31991029', 'www.nccih.nih.gov/health/ashwagandha']],
      ['herbs-detail', 'turmeric', ['www.ncbi.nlm.nih.gov/books/NBK548561']],
    ] as const
    for (const [folder, slug, identifiers] of expected) {
      const record = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/data', folder, slug + '.json'), 'utf8'))
      for (const id of identifiers) {
        const source = record.sources.find((entry: {pmid?: string;url?: string}) => String(entry.pmid || '') === id || String(entry.url || '').includes(id))
        expect(source).toBeDefined()
        expect(source.reviewStatus).toBe('pending')
        expect(source.url).toMatch(/^https:\/\//)
      }
    }
  })

  it('matches Inositol Complex to its capsule formulation and search terms', () => {
    const complex = Object.values(revenueProductSets).flatMap(set => set.products)
      .find(p => p.title === 'Pure Encapsulations Inositol Complex')
    expect(complex).toBeDefined()
    expect(complex?.rationale).toMatch(/myo-inositol.*D-chiro-inositol.*capsules/i)
    expect(complex?.affiliateUrl).toContain('Inositol%20Complex')
    expect(complex?.rationale).not.toContain('hypoallergenic inositol powder')
  })

  it('retains the provisional research queue rather than falsely approving it', () => {
    const queue = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'ops/research-coordinator/review-queues/2026-10-11-batch9-remediation-review.json'), 'utf8'))
    expect(queue.reportedDisposition).toEqual({ confirmed:44, provisional:25, unresolved:4, rejected:2 })
    expect(queue.provisionalSafetyReviewQueue).toHaveLength(20)
    expect(queue.highConfidenceASINsReported).toHaveLength(18)
    expect(queue.asinPolicy).toMatch(/No additional direct ASIN links/i)
  })
})
