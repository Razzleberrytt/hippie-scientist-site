import { describe, expect, it } from 'vitest'
import { getAtlasProfileLinks } from '@/lib/atlas-profile-links'
import type { RuntimeRecord } from '@/types/content'

const record = (overrides: Partial<RuntimeRecord>): RuntimeRecord => ({
  slug: 'example-herb',
  name: 'Example Herb',
  ...overrides,
} as RuntimeRecord)

describe('getAtlasProfileLinks', () => {
  it('routes alkaloid chemistry to the alkaloid guide', () => {
    const links = getAtlasProfileLinks(record({ compoundClasses: ['Isoquinoline alkaloids'] }))
    expect(links.map((link) => link.href)).toContain('/tools/botanical-activity-atlas/alkaloid-botanicals/')
  })

  it('routes stimulant effects to the natural stimulant guide', () => {
    const links = getAtlasProfileLinks(record({ primary_effects: ['Alertness and energy'] }))
    expect(links.map((link) => link.href)).toContain('/tools/botanical-activity-atlas/natural-stimulants/')
  })

  it('routes calming and sleep effects to the calming guide', () => {
    const links = getAtlasProfileLinks(record({ effects: ['Anxiolytic', 'Sleep support'] }))
    expect(links.map((link) => link.href)).toContain('/tools/botanical-activity-atlas/calming-botanicals/')
  })

  it('routes perception effects to the dream guide', () => {
    const links = getAtlasProfileLinks(record({ primaryActions: ['Dream enhancement'] }))
    expect(links.map((link) => link.href)).toContain('/tools/botanical-activity-atlas/dream-and-perception-herbs/')
  })

  it('routes serotonergic safety signals to the interaction-risk guide', () => {
    const links = getAtlasProfileLinks(record({ safety_flags: ['Potential SSRI interaction'] }))
    expect(links.map((link) => link.href)).toContain('/tools/botanical-activity-atlas/serotonergic-interaction-risk/')
  })

  it('always provides the full atlas and limits profile links to three', () => {
    const links = getAtlasProfileLinks(record({
      primary_effects: ['Energy', 'Calming', 'Dream enhancement'],
      compoundClasses: ['Alkaloids'],
      safety_flags: ['Serotonergic interaction'],
    }))
    expect(links).toHaveLength(3)
    expect(links.some((link) => link.href === '/tools/botanical-activity-atlas/')).toBe(true)
  })
})
