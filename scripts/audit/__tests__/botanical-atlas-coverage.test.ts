import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const script = readFileSync('scripts/audit/botanical-atlas-coverage.mjs', 'utf8')
const workflow = readFileSync('.github/workflows/botanical-atlas-coverage.yml', 'utf8')

describe('Botanical Activity Atlas coverage audit', () => {
  it('audits the fields used by the atlas experience', () => {
    for (const field of ['effects', 'chemistry', 'evidence', 'noticeability', 'safety', 'timing']) {
      expect(script).toContain(`${field}:`)
    }
  })

  it('prioritizes curated indexable profiles and emits reviewable formats', () => {
    expect(script).toContain('CURATED_INDEXABLE_HERB_SLUGS')
    expect(script).toContain('CURATED_INDEXABLE_COMPOUND_SLUGS')
    expect(script).toContain("'coverage.json'")
    expect(script).toContain("'coverage.csv'")
    expect(script).toContain("'coverage.md'")
  })

  it('runs automatically when atlas source data changes', () => {
    expect(workflow).toContain("public/data/herbs.json")
    expect(workflow).toContain("public/data/compounds.json")
    expect(workflow).toContain('actions/upload-artifact@v4')
    expect(workflow).toContain('GITHUB_STEP_SUMMARY')
  })
})
