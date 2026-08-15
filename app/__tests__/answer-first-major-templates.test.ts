import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function source(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('answer-first major informational templates', () => {
  it('keeps the runtime comparison verdict before the detailed comparison table', () => {
    const text = source('src/components/comparison/RuntimeEvidenceComparison.tsx')
    const answerIndex = text.indexOf('Quick verdict')
    const tableIndex = text.indexOf('<ComparisonTable')

    expect(answerIndex).toBeGreaterThan(-1)
    expect(tableIndex).toBeGreaterThan(-1)
    expect(answerIndex).toBeLessThan(tableIndex)
  })

  it('keeps the ADHD/focus citation-ready answer before the long article body', () => {
    const text = source('components/articles/FocusAdhdArticlePage.tsx')
    const answerIndex = text.indexOf('<CitationReadySummary')
    const bodyIndex = text.indexOf('<MarkdownBody')

    expect(answerIndex).toBeGreaterThan(-1)
    expect(bodyIndex).toBeGreaterThan(-1)
    expect(answerIndex).toBeLessThan(bodyIndex)
  })

  it('keeps the reusable citation summary itself answer-first', () => {
    const text = source('components/seo/CitationReadySummary.tsx')
    const quickAnswerIndex = text.indexOf('Quick answer')
    const bestFitIndex = text.indexOf('Best fit')

    expect(quickAnswerIndex).toBeGreaterThan(-1)
    expect(bestFitIndex).toBeGreaterThan(-1)
    expect(quickAnswerIndex).toBeLessThan(bestFitIndex)
  })
})
