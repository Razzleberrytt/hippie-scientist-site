import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(
  path.join(process.cwd(), 'app', 'guides', 'other', 'protein-powder-guide', 'page.tsx'),
  'utf8',
)
const shared = fs.readFileSync(path.join(process.cwd(), 'components', 'ResearchNextActions.tsx'), 'utf8')

describe('protein powder post-answer research path', () => {
  it('keeps the next-action path downstream of the evidence and references', () => {
    const safetyBoundary = source.indexOf('Product-quality boundary')
    const references = source.indexOf('<References refs={PROTEIN_REFS} />')
    const nextActions = source.indexOf('<ResearchNextActions')
    const email = source.indexOf('<EmailCapture')

    expect(safetyBoundary).toBeGreaterThan(-1)
    expect(references).toBeGreaterThan(safetyBoundary)
    expect(nextActions).toBeGreaterThan(references)
    expect(email).toBeGreaterThan(nextActions)
  })

  it('uses claim-neutral educational destinations rather than a commercial product path', () => {
    expect(source).toContain('href="/articles/how-to-choose-supplement-quality/"')
    expect(source).not.toContain('href="/info/methodology/"')
    expect(source).toContain('One next step: evaluate the product itself')
    expect(source).toContain('columns={1}')
    expect(source).toContain('The protein answer comes first.')
    expect(source).not.toMatch(/amazon|affiliate|buy now|shop now/i)
  })

  it('reuses the shared accessible post-answer shell', () => {
    expect(source).toContain("from '@/components/ResearchNextActions'")
    expect(source).toContain('headingId="protein-research-next-actions-heading"')
    expect(shared).toContain('aria-labelledby={headingId}')
    expect(shared).toContain('min-h-11')
    expect(shared).toContain('focus-visible:ring-2')
    expect(shared).not.toMatch(/className="[^"]*\b(?:fixed|sticky)\b/)
  })
})
