import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), 'utf8')
const article = read('content/articles/sr-15099.mdx')
const profile = read('novel-psychoactive-substances/sr-15099.mdx')
const hub = read('novel-psychoactive-substances/index.mdx')

describe('SR-15099 compound coverage and research integrity', () => {
  it('publishes a separate research article and substance profile', () => {
    expect(article).toContain('slug: "sr-15099"')
    expect(profile).toContain('section: "novel-psychoactive-substances"')
    expect(hub).toContain('/articles/sr-15099/')
    expect(hub).toContain('/novel-psychoactive-substances/sr-15099/')
    expect(profile).toContain('/articles/sr-15099/')
    expect(article).toContain('/novel-psychoactive-substances/sr-15099/')
  })

  it('keeps mouse findings about SR-17018 separate from SR-15099', () => {
    for (const page of [article, profile]) {
      expect(page).toContain('SR-17018')
      expect(page).toContain('31443104')
      expect(page).toContain('33345829')
      expect(page).toMatch(/no direct controlled human evidence|did not establish that SR-15099/i)
      expect(page).toMatch(/both groups|also regained morphine sensitivity/i)
      expect(page).toMatch(/withdrawal/i)
    }
  })

  it('includes primary SR-15099 evidence and respiratory-safety limitations', () => {
    for (const page of [article, profile]) {
      expect(page).toContain('29149605')
      expect(page).toContain('34819362')
      expect(page).toContain('34002697')
      expect(page).toMatch(/breath(?:ing)?|respiratory/i)
      expect(page).toMatch(/not (?:proof|an overdose-safety guarantee)|cannot establish that it is safe/i)
    }
  })

  it('provides no unvalidated research-opioid dosing protocol', () => {
    for (const page of [article, profile]) {
      expect(page.replace(/\*\*/g, '')).toMatch(/no (?:established|validated) human dose/i)
      expect(page).not.toMatch(/\b(?:take|use|start with)\s+\d+(?:\.\d+)?\s*(?:mg|mcg|µg)\b/i)
    }
  })
})
