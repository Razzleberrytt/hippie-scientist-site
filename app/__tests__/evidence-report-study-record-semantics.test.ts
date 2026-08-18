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
    // Now stated as 'Multiple publication records can still originate from the
    // same underlying trial, cohort, or dataset' - the caveat that stops a record
    // count reading as a count of independent trials.
    expect(client).toMatch(/Multiple[^.]{0,40}records can[^.]{0,20}originate from the same underlying trial, cohort, or dataset/i)
    expect(client).toContain('Human trial records</th>')
    expect(client).toContain('category.unassigned')
    // The page is now a thin wrapper; the record-coverage framing lives in the
    // client it renders, so check it there and check the page still renders it.
    expect(client).toMatch(/record coverage/i)
    expect(page).toMatch(/EvidenceReportClient|UnderlyingStudyIndependencePanel/)
  })
})
