import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const libraryPage = fs.readFileSync(path.join(root, 'app/guides/page.tsx'), 'utf8')
const callout = fs.readFileSync(path.join(root, 'components/guides/AtlasComparisonCallout.tsx'), 'utf8')

describe('Evidence Library atlas comparison callout', () => {
  it('links visitors to the evidence-sorted Botanical Activity Atlas', () => {
    expect(libraryPage).toContain('/tools/botanical-activity-atlas/?sort=evidence')
    expect(libraryPage).toContain('Compare botanicals across anxiety, sleep, and focus goals')
  })

  it('keeps interaction checking beside the comparison pathway', () => {
    expect(libraryPage).toContain('secondaryHref="/safety-checker/"')
    expect(libraryPage).toContain('secondaryCta="Check interaction risk"')
  })

  it('uses accessible tap targets in the reusable callout', () => {
    expect(callout).toContain('min-h-[44px]')
    expect(callout).toContain("secondaryHref = '/tools/botanical-activity-atlas/'")
  })
})
