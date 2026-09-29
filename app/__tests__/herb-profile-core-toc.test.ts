import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function source(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('herb profile core TOC contract', () => {
  const herb = source('app/herbs/[slug]/page.tsx')
  const profileToc = source('components/ui/ProfileTOC.tsx')
  const editorialSurfaces = source('styles/editorial-content-surfaces.css')
  const tocStart = herb.indexOf('const tocItems = [')
  const tocEnd = herb.indexOf('\n  ]', tocStart)
  const toc = herb.slice(tocStart, tocEnd + 4)

  it('keeps the primary navigation focused on core decisions', () => {
    expect(tocStart).toBeGreaterThan(-1)
    expect(tocEnd).toBeGreaterThan(tocStart)
    expect(toc).toContain("{ id: 'overview', label: 'Overview' }")
    expect(toc).toContain("{ id: 'safety', label: 'Safety' }")
    expect(toc).toContain("{ id: 'evidence', label: 'Evidence' }")
    expect(toc).toContain("{ id: 'dosing', label: 'Dosing & timing' }")
    expect(toc).toContain("{ id: 'related', label: 'Related paths' }")
    expect(toc).toContain("{ id: 'compare', label: 'Compare & sourcing' }")
    const promotedIds = Array.from(toc.matchAll(/id: '([^']+)'/g), (match) => match[1])
    expect(promotedIds).toEqual(['overview', 'safety', 'evidence', 'dosing', 'related', 'compare'])
    expect(promotedIds).toHaveLength(6)
  })

  it('does not promote deep-detail sections into the primary TOC', () => {
    for (const label of [
      'Editorial review',
      'Interactions',
      'Pathway',
      'Mechanisms',
      'Compounds',
      'Goal guides',
      'Condition guides',
    ]) {
      expect(toc).not.toContain(label)
    }
  })

  it('keeps the empty tracking-alias default stable across client renders', () => {
    expect(profileToc).toContain('const EMPTY_TRACKING_ALIASES: TrackingAliases = {}')
    expect(profileToc).toContain('trackingAliases = EMPTY_TRACKING_ALIASES')
  })

  it('labels the curated herb navigation as core sections without changing shared defaults', () => {
    expect(herb).toContain('navigationLabel="Core page sections"')
    expect(herb).toContain('menuLabel="Core sections"')
    expect(profileToc).toContain("navigationLabel = 'Page sections'")
    expect(profileToc).toContain("menuLabel = 'All sections'")
    expect(profileToc).toContain('aria-label={navigationLabel}')
    expect(profileToc).toContain('{menuLabel}')
  })

  it('keeps profile TOC styling on a stable hook instead of the accessible name', () => {
    expect((profileToc.match(/data-profile-toc='true'/g) || []).length).toBe(2)
    expect(editorialSurfaces).toContain('nav[data-profile-toc="true"]')
    expect(editorialSurfaces).not.toContain('nav[aria-label="Page sections"]')
  })

  it('maps omitted deep anchors back to visible core navigation state', () => {
    expect(herb).toContain("const tocTrackingAliases = {")
    expect(herb).toContain("'editorial-review': 'overview'")
    expect(herb).toContain("interactions: 'safety'")
    expect(herb).toContain("pathway: 'evidence'")
    expect(herb).toContain("mechanisms: 'evidence'")
    expect(herb).toContain("compounds: 'related'")
    expect(herb).toContain("goals: 'related'")
    expect(herb).toContain("conditions: 'related'")
    expect(herb).toContain('trackingAliases={tocTrackingAliases}')
  })

  it('preserves the deep sections themselves and their anchors', () => {
    for (const anchor of [
      'id="editorial-review"',
      'id="interactions"',
      'id="pathway"',
      'id="mechanisms"',
      'id="compounds"',
      'id="goals"',
      'id="conditions"',
    ]) {
      expect(herb).toContain(anchor)
    }
  })
})
