import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

describe('Lighthouse PR matrix dedupe contract', () => {
  it('keeps every PR route archetype while removing duplicate dedicated a11y runs', () => {
    const perf = readJson('.lighthouserc.pr.json')
    const a11y = readJson('.lighthouserc.a11y.pr.json')
    const perfUrls = perf.ci.collect.url
    const a11yUrls = a11y.ci.collect.url

    expect(perfUrls).toEqual([
      'http://localhost:3000/',
      'http://localhost:3000/herbs/ashwagandha/',
      'http://localhost:3000/compounds/l-theanine/',
    ])
    expect(a11yUrls).toEqual([
      'http://localhost:3000/guides/compare/',
      'http://localhost:3000/safety-checker/',
      'http://localhost:3000/tools/botanical-activity-atlas/',
    ])
    expect(a11yUrls.filter((url) => perfUrls.includes(url))).toEqual([])
    expect(new Set([...perfUrls, ...a11yUrls]).size).toBe(6)
  })

  it('moves all hard accessibility assertions onto the three mobile performance routes', () => {
    const perf = readJson('.lighthouserc.pr.json')
    const assertions = perf.ci.assert.assertions
    for (const key of [
      'button-name',
      'link-name',
      'image-alt',
      'label',
      'color-contrast',
      'heading-order',
      'html-has-lang',
    ]) {
      expect(assertions[key]).toEqual(['error', { minScore: 1 }])
    }
    expect(assertions['categories:accessibility']).toEqual(['error', { minScore: 0.9 }])
  })

  it('keeps the full main/scheduled Lighthouse matrices unchanged in scope', () => {
    const fullPerf = readJson('.lighthouserc.json')
    const fullA11y = readJson('.lighthouserc.a11y.json')
    expect(fullPerf.ci.collect.url).toHaveLength(3)
    expect(fullPerf.ci.collect.numberOfRuns).toBe(3)
    expect(fullA11y.ci.collect.url).toHaveLength(9)
  })

  it('documents the reduced PR browser-audit count', () => {
    const workflow = read('.github/workflows/lighthouse.yml')
    expect(workflow).toContain('PR representative matrix (6 browser audits + 3 desktop performance audits)')
    expect(workflow).toContain(
      'hard-gates accessibility inside homepage/herb/compound mobile performance audits',
    )
  })
})
