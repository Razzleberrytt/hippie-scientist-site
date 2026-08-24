import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8')

describe('profile study summaries server boundary', () => {
  it('keeps citation normalization and evidence rows server-rendered', () => {
    const studies = read('components/ui/ShowMeTheStudies.tsx')

    expect(studies).not.toMatch(/^['"]use client['"]/)
    expect(studies).not.toContain('useMemo')
    expect(studies).not.toContain('useState')
    expect(studies).not.toContain('filterEvidenceStudiesByClass')
    expect(studies).toContain('summarizeEvidenceStudies(studies)')
    expect(studies).toContain('data-study-class={study.evidenceClass}')
    expect(studies).toContain('StudyClassFilterControls')
    expect(studies).toContain('<noscript>')
  })

  it('keeps the client island payload limited to class metadata and DOM filtering', () => {
    const controls = read('components/ui/StudyClassFilterControls.tsx')

    expect(controls).toMatch(/^['"]use client['"]/)
    expect(controls).toContain("querySelectorAll<HTMLTableRowElement>('tr[data-study-class]')")
    expect(controls).toContain("closest<HTMLDetailsElement>('details[data-study-summaries-root]')")
    expect(controls).not.toContain('Citation')
    expect(controls).not.toContain('EvidenceStudyRecord')
    expect(controls).not.toContain("@/lib/evidence-study")
  })
})
