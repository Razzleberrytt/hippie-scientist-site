import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const script = readFileSync('scripts/audit-related-botanicals.ts', 'utf8')
const workflow = readFileSync('.github/workflows/related-botanicals-audit.yml', 'utf8')

describe('related botanicals quality audit', () => {
  it('runs the real atlas records through the recommendation engine', () => {
    expect(script).toContain('getBotanicalAtlasRecords()')
    expect(script).toContain('getRelatedBotanicals(source, records, topN)')
  })

  it('reports explainability and suspicious recommendation signals', () => {
    expect(script).toContain('botanicalsWithoutMatches')
    expect(script).toContain('lowConfidenceMatches')
    expect(script).toContain('safetyDominatedMatches')
    expect(script).toContain('reason.values')
  })

  it('publishes both human-readable and machine-readable artifacts', () => {
    expect(script).toContain('related-botanicals-audit.md')
    expect(script).toContain('related-botanicals-audit.json')
    expect(workflow).toContain('actions/upload-artifact@v4')
    expect(workflow).toContain('GITHUB_STEP_SUMMARY')
  })
})
