import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), 'utf8')
const article = read('content/articles/sr-15099.mdx')
const profile = read('novel-psychoactive-substances/sr-15099.mdx')
const hub = read('novel-psychoactive-substances/index.mdx')

describe('SR-15099 compound coverage and research integrity', () => {
  it('publishes separate evidence-focused article and NPS substance profile', () => {
    expect(article).toContain('slug: "sr-15099"')
    expect(profile).toContain('section: "novel-psychoactive-substances"')
    expect(hub).toContain('/articles/sr-15099/')
    expect(hub).toContain('/novel-psychoactive-substances/sr-15099/')
    expect(profile).toContain('/articles/sr-15099/')
    expect(article).toContain('/novel-psychoactive-substances/sr-15099/')
  })

  it('does not transfer SR-17018 mouse tolerance findings to SR-15099 humans', () => {
    for (const page of [article, profile]) {
      expect(page).toContain('SR-17018')
      expect(page).toContain('PMID 31443104')
      expect(page).toContain('PMID 33345829')
      expect(page).toMatch(/SR-15099[^\n]{0,120}(?:not established|no direct|no controlled human|not a proven)|no controlled human[^\n]{0,140}SR-15099/i)
      expect(page).toMatch(/both groups/i)
      expect(page).toMatch(/withdrawal/i)
      expect(page).not.toMatch(/SR-15099 (?:reverses|resets|prevents) (?:opioid |morphine )?(?:tolerance|withdrawal)/i)
    }
  })

  it('keeps direct pharmacology and respiratory safety boundary source-linked', () => {
    for (const page of [article, profile]) {
      expect(page).toContain('29149605')
      expect(page).toContain('34819362')
      expect(page).toContain('34002697')
      expect(page).toMatch(/breath(?:ing)?|respiratory/i)
      expect(page).toMatch(/not (?:proof|a human safety|an overdose-safety guarantee)|cannot establish that it is safe/i)
    }
  })

  it('does not include a research-opioid self-dosing protocol', () => {
    for (const page of [article, profile]) {
      expect(page).toMatch(/no (?:established|validated) human dose/i)
      expect(page).not.toMatch(/\b(?:take|use|start with)\s+\d+(?:\.\d+)?\s*(?:mg|mcg|µg)\b/i)
    }
  })
})
