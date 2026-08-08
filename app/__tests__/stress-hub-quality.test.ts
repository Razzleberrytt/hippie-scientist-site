import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(path.join(process.cwd(), 'app/guides/stress/page.tsx'), 'utf8')

describe('stress guide hub quality', () => {
  it('uses the shared decision-first hub components without nesting a main landmark', () => {
    expect(source).toContain('<DecisionRouter items={START_HERE} />')
    expect(source).toContain('<GuideCardGrid cards={BEST_FIRST} />')
    expect(source).toContain('<GuideCardGrid cards={COMPARISONS} />')
    expect(source).not.toMatch(/<main\b/)
  })

  it('connects the discovery hub to depth, evidence, safety, and comparison pages', () => {
    expect(source).toContain('/herbs/ashwagandha/')
    expect(source).toContain('/compounds/l-theanine/')
    expect(source).toContain('/guides/compare/rhodiola-vs-ashwagandha/')
    expect(source).toContain('/learn/evidence-literacy/')
    expect(source).toContain('/info/supplement-safety-checklist/')
    expect(source).toContain('/info/disclaimer/')
  })
})
