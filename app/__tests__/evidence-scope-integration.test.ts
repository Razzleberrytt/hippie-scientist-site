import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

describe('consumer evidence-scope integrity', () => {
  it('shows a shared scope legend in existing herb profiles and public evidence report', () => {
    const herb = read('app/herbs/[slug]/page.tsx')
    const report = read('app/evidence/evidence-report/EvidenceReportClient.tsx')
    expect(herb).toContain('<EvidenceScopeGuide context="profile" />')
    expect(report).toContain('<EvidenceScopeGuide context="report" />')
    expect(herb).toContain('<EvidenceScoreBadge record={herbRecord} />')
    expect(herb).toContain('<ProfileSafetyLine tone={safetyTone} summary={safetySummary} />')
    expect(report).toContain('{metrics.ingredientCount} indexable ingredients')
  })

  it('preserves distinct canonical count sources and discloses their noncomparable denominators', () => {
    const home = read('components/homepage-v2.tsx')
    const source = read('lib/public-site-metrics.ts')
    expect(home).toContain('What these counts include:')
    expect(home).toContain('Compounds tracked includes canonical research records')
    expect(home).toContain('Structured studies counts deduplicated study/source records, not independently confirmed clinical trials')
    expect(home).toContain("href='/evidence/evidence-report/'")
    expect(home).toContain('research-only identities, not an additional count of graded clinical studies')
    expect(source).toContain('totalCompounds: canonicalCompounds.length')
    expect(source).toContain('structuredStudies: dataset.metrics.studyCount')
    expect(source).toContain('publishedHerbs: herbs.length')
  })

  it('does not change the original claim-level ashwagandha grade or safety authority', () => {
    const claim = read('app/herbs/[slug]/AshwagandhaStressClaim.tsx')
    const badge = read('components/ui/EvidenceScoreBadge.tsx')
    const legend = read('components/ui/EvidenceScopeGuide.tsx')
    expect(claim).toContain("evidenceLabel: 'Moderate'")
    expect(claim).toContain("safetyModifier: 'Moderate caution'")
    expect(badge).toContain('data-evidence-scope="profile-wide"')
    expect(legend).toContain('This never grades a substance')
    expect(legend).toContain('An evidence grade does not confer approval.')
  })
})
