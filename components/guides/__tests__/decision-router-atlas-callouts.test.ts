import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = readFileSync(resolve(process.cwd(), 'components/guides/DecisionRouter.tsx'), 'utf8')

describe('DecisionRouter atlas callouts', () => {
  it('provides evidence-sorted calming, sleep, and focus comparison states', () => {
    expect(source).toContain('/tools/botanical-activity-atlas/calming-botanicals/?effect=Calming&sort=evidence')
    expect(source).toContain('/tools/botanical-activity-atlas/calming-botanicals/?effect=Sedating%20%2F%20sleep&sort=evidence')
    expect(source).toContain('/tools/botanical-activity-atlas/?effect=Cognition%20%2F%20focus&sort=evidence')
  })

  it('infers hub context from guide routes and keeps full-atlas access', () => {
    expect(source).toContain("item.href.startsWith('/guides/anxiety/')")
    expect(source).toContain("item.href.startsWith('/guides/sleep/')")
    expect(source).toContain("item.href.startsWith('/guides/focus/')")
    expect(source).toContain("secondaryHref: '/tools/botanical-activity-atlas/'")
  })

  it('reuses the accessible shared callout component', () => {
    expect(source).toContain("import { AtlasComparisonCallout }")
    expect(source).toContain('<AtlasComparisonCallout {...atlasCallout} />')
  })
})
