import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('evidence report study-count semantics', () => {
  it('does not present publication-level record counts as independent trials', () => {
    const root = process.cwd()
    const client = fs.readFileSync(path.join(root, 'app/evidence/evidence-report/EvidenceReportClient.tsx'), 'utf8')
    const page = fs.readFileSync(path.join(root, 'app/evidence/evidence-report/page.tsx'), 'utf8')

    expect(client).toContain('Human trial records indexed')
    expect(client).toContain('not a count of proven-independent underlying trials')
    expect(client).toContain('Human evidence source records')
    expect(client).toContain('Multiple records can originate from the same underlying trial, cohort, or dataset')
    expect(client).toContain('Human trial records</th>')
    expect(client).toContain('category.unassigned')
    expect(page).toContain('human-study record coverage')
  })
})
