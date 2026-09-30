import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const guidesPage = fs.readFileSync(path.join(root, 'app/guides/page.tsx'), 'utf8')
const callout = fs.readFileSync(path.join(root, 'components/guides/AtlasComparisonCallout.tsx'), 'utf8')

describe('Atlas comparison callout ownership', () => {
  it('keeps the main Guides hub focused on guide-owned discovery', () => {
    expect(guidesPage).not.toContain('AtlasComparisonCallout')
    expect(guidesPage).toContain("href: '/research/'")
    expect(guidesPage).toContain("href: '/safety-checker/'")
    expect(guidesPage).toContain('Verify the research')
    expect(guidesPage).toContain('Check safety')
  })

  it('keeps the reusable comparison callout accessible where deeper routers use it', () => {
    expect(callout).toContain('min-h-[44px]')
    expect(callout).toContain("secondaryHref = '/tools/botanical-activity-atlas/'")
  })
})
