import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (relativePath: string) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')

describe('Evidence Report data integrity', () => {
  it('derives report counts from canonical runtime records instead of hard-coded study statistics', () => {
    const page = read('app/evidence/evidence-report/page.tsx')
    const client = read('app/evidence/evidence-report/EvidenceReportClient.tsx')
    const dataset = read('lib/public-evidence-dataset.ts')
    const combined = `${page}\n${client}\n${dataset}`

    expect(page).toContain('getPublicEvidenceDataset()')
    expect(dataset).toContain('getHerbs()')
    expect(dataset).toContain('getCompounds()')
    expect(dataset).toContain('getRuntimeVisibility(record).canIndex')
    expect(dataset).toContain('getEvidenceLetterGrade(record)')
    expect(combined).not.toContain('816 peer-reviewed studies')
    expect(combined).not.toContain("pct: 15")
    expect(combined).not.toContain("pct: 25")
    expect(combined).not.toContain("pct: 30")
    expect(combined).not.toContain('557 compounds')
  })

  it('labels the grade distribution as profile-level and keeps study counts distinct', () => {
    const client = read('app/evidence/evidence-report/EvidenceReportClient.tsx')

    expect(client).toContain('{item.grade} · {item.count} profiles')
    expect(client).toContain('C, D, or Avoid/Insufficient profiles remain visibly separate from stronger evidence.')
    expect(client).toContain('Across {metrics.studyCount.toLocaleString()} deduplicated structured study entities.')
    expect(client).toContain('this is a screening statistic, not a risk rate.')
  })

  it('keeps the linked annual article aligned with the generated report', () => {
    const article = read('content/articles/state-of-supplement-evidence-2026.md')

    expect(article).toContain('the distribution of evidence-grade labels across the herb and compound records currently rendered by the site')
    expect(article).toContain('[Supplement Evidence Report](/evidence/evidence-report/)')
    expect(article).not.toContain('816 peer-reviewed')
    expect(article).not.toContain('Of 816')
    expect(article).not.toContain('557 compounds')
    expect(article).not.toContain('~15%')
    expect(article).not.toContain('Typical Dose')
    expect(article).not.toContain('all statistics are sourced from our public database')
  })
})
