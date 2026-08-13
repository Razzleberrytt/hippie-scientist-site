import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (relativePath: string) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')

describe('Evidence Report data integrity', () => {
  it('derives report counts from runtime records instead of hard-coded study statistics', () => {
    const page = read('app/evidence/evidence-report/page.tsx')
    const client = read('app/evidence/evidence-report/EvidenceReportClient.tsx')
    const combined = `${page}\n${client}`

    expect(page).toContain('getHerbs()')
    expect(page).toContain('getCompounds()')
    expect(page).toContain('getRuntimeVisibility(record).canRender')
    expect(page).toContain('record.evidence_grade')
    expect(combined).not.toContain('816 peer-reviewed studies')
    expect(combined).not.toContain("pct: 15")
    expect(combined).not.toContain("pct: 25")
    expect(combined).not.toContain("pct: 30")
    expect(combined).not.toContain('557 compounds')
  })

  it('labels the distribution as profile-level rather than study-level', () => {
    const client = read('app/evidence/evidence-report/EvidenceReportClient.tsx')

    expect(client).toContain('It is a profile-level distribution, not a count or grading of individual studies.')
    expect(client).toContain('A profile grade is not a study count')
    expect(client).toContain('Unclassified does not mean ineffective')
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
