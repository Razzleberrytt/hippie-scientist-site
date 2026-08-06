import { describe, expect, it } from 'vitest'
import { getAtlasProfileLinks } from '@/lib/atlas-profile-links'
import type { RuntimeRecord } from '@/types/content'

const record = (overrides: Partial<RuntimeRecord>): RuntimeRecord => ({
  slug: 'example-herb',
  name: 'Example Herb',
  ...overrides,
} as RuntimeRecord)

const findLink = (links: ReturnType<typeof getAtlasProfileLinks>, path: string) =>
  links.find((link) => link.href.startsWith(path))

describe('getAtlasProfileLinks', () => {
  it('routes alkaloid chemistry to a prefiltered alkaloid comparison', () => {
    const links = getAtlasProfileLinks(record({ compoundClasses: ['Isoquinoline alkaloids'] }))
    const link = findLink(links, '/tools/botanical-activity-atlas/alkaloid-botanicals/')
    expect(link?.href).toContain('chemistry=Alkaloids')
  })

  it('keeps methylxanthines in their more specific chemistry bucket', () => {
    const links = getAtlasProfileLinks(record({ compoundClasses: ['Methylxanthines', 'Alkaloids'] }))
    const link = findLink(links, '/tools/botanical-activity-atlas/alkaloid-botanicals/')
    expect(link?.href).toContain('chemistry=Methylxanthines')
    expect(link?.label).toContain('methylxanthine')
  })

  it('routes stimulant effects to a prefiltered stimulant comparison', () => {
    const links = getAtlasProfileLinks(record({ primary_effects: ['Alertness and energy'] }))
    const link = findLink(links, '/tools/botanical-activity-atlas/natural-stimulants/')
    expect(link?.href).toContain('effect=Stimulating+%2F+energy')
  })

  it('routes calming and sleep effects to the matching prefiltered guide', () => {
    const calming = getAtlasProfileLinks(record({ effects: ['Anxiolytic'] }))
    expect(findLink(calming, '/tools/botanical-activity-atlas/calming-botanicals/')?.href).toContain('effect=Calming')

    const sleep = getAtlasProfileLinks(record({ effects: ['Sleep support'] }))
    expect(findLink(sleep, '/tools/botanical-activity-atlas/calming-botanicals/')?.href).toContain('effect=Sedating+%2F+sleep')
  })

  it('routes perception effects to a prefiltered dream guide', () => {
    const links = getAtlasProfileLinks(record({ primaryActions: ['Dream enhancement'] }))
    const link = findLink(links, '/tools/botanical-activity-atlas/dream-and-perception-herbs/')
    expect(link?.href).toContain('effect=Dream+%2F+perception')
  })

  it('reads narrative safety fields and prefilters serotonergic risk', () => {
    const links = getAtlasProfileLinks(record({ safety: 'Potential interaction with SSRIs' }))
    const link = findLink(links, '/tools/botanical-activity-atlas/serotonergic-interaction-risk/')
    expect(link?.href).toContain('safety=Serotonergic')
  })

  it('always provides the unfiltered full atlas and limits profile links to three', () => {
    const links = getAtlasProfileLinks(record({
      primary_effects: ['Energy', 'Calming', 'Dream enhancement'],
      compoundClasses: ['Alkaloids'],
      safety_flags: ['Serotonergic interaction'],
    }))
    expect(links).toHaveLength(3)
    expect(links.some((link) => link.href === '/tools/botanical-activity-atlas/')).toBe(true)
  })
})
