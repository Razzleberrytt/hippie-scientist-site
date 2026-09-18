import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')

const protein = read('app/guides/other/protein-powder-guide/page.tsx')
const shell = read('components/ResearchNextActions.tsx')

describe('protein guide post-answer next action', () => {
  it('keeps the next action downstream of answer, evidence, safety, and references', () => {
    const quickAnswer = protein.indexOf('<LegacyGuideQuickAnswer')
    const decisionTable = protein.indexOf('protein-powder-decision-table')
    const safetyBoundary = protein.indexOf('Product-quality boundary')
    const references = protein.indexOf('<References refs={PROTEIN_REFS}')
    const nextAction = protein.indexOf('<ResearchNextActions')

    expect(quickAnswer).toBeGreaterThan(-1)
    expect(decisionTable).toBeGreaterThan(quickAnswer)
    expect(safetyBoundary).toBeGreaterThan(decisionTable)
    expect(references).toBeGreaterThan(safetyBoundary)
    expect(nextAction).toBeGreaterThan(references)
  })

  it('uses the shared research-next-action architecture with one newsletter capture', () => {
    expect(protein).toContain("import ResearchNextActions from '@/components/ResearchNextActions'")
    expect(protein).toContain('headingId="protein-research-next-action-heading"')
    expect(protein.match(/<EmailCapture\b/g)).toHaveLength(1)
    expect(protein).toContain('location="guide-protein"')
  })

  it('does not turn the post-answer path into a commercial recommendation block', () => {
    expect(protein).not.toContain('RecommendationSection')
    expect(protein).not.toContain('amazon.com')
    expect(protein).not.toContain('affiliate')
  })

  it('does not misuse sleep-only next-action analytics for the protein guide', () => {
    expect(protein).not.toContain('SleepResearchNextActionLink')
    expect(protein).not.toContain('trackSleepNextActionClick')
  })

  it('inherits labelled, mobile-safe, dark-mode-safe section semantics', () => {
    expect(shell).toContain('aria-labelledby={headingId}')
    expect(shell).toContain('id={headingId}')
    expect(shell).toContain('sm:grid-cols-2')
    expect(shell).toContain('dark:text-[var(--text-primary)]')
    expect(shell).not.toMatch(/className="[^"]*\b(?:fixed|sticky)\b/)
  })
})
