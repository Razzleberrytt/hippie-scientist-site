import { describe, it, expect } from 'vitest'
import { buildEntityMetadata } from '../../../lib/metadata-engine'

describe('buildEntityMetadata', () => {
  it('builds a herb title with the "Herb Guide" suffix and a canonical URL from the path', () => {
    const meta = buildEntityMetadata(
      { slug: 'ashwagandha', name: 'Ashwagandha', summary: 'An adaptogenic herb.' },
      { kind: 'herb', path: '/herbs/ashwagandha/', canIndex: true },
    )

    expect(meta.title).toBe('Ashwagandha Herb Guide')
    expect(meta.alternates?.canonical).toBe('https://thehippiescientist.net/herbs/ashwagandha/')
    expect(meta.robots).toEqual({ index: true, follow: true })
  })

  it('builds a compound title with the "Compound Guide" suffix', () => {
    const meta = buildEntityMetadata(
      { slug: 'curcumin', name: 'Curcumin' },
      { kind: 'compound', path: '/compounds/curcumin/', canIndex: true },
    )

    expect(meta.title).toBe('Curcumin Compound Guide')
  })

  it('sets noindex robots metadata when canIndex is false', () => {
    const meta = buildEntityMetadata(
      { slug: 'sparse-herb', name: 'Sparse Herb' },
      { kind: 'herb', path: '/herbs/sparse-herb/', canIndex: false },
    )

    expect(meta.robots).toEqual({ index: false, follow: true })
  })

  it('truncates long entity names so the title stays within the length budget', () => {
    const longName = 'A'.repeat(80)
    const meta = buildEntityMetadata({ slug: 'long', name: longName }, { kind: 'herb', path: '/herbs/long/', canIndex: true })

    expect((meta.title as string).length).toBeLessThanOrEqual(60)
    expect(meta.title).toMatch(/…\s*Herb Guide$/)
  })

  it('falls back to a generic description when no summary/description text exists', () => {
    const meta = buildEntityMetadata({ slug: 'bare', name: 'Bare Herb' }, { kind: 'herb', path: '/herbs/bare/', canIndex: true })

    expect(meta.description).toBe('Bare Herb reference profile.')
  })

  it('joins available snippet fields into the description, capped at 158 characters', () => {
    const meta = buildEntityMetadata(
      {
        slug: 'joined',
        name: 'Joined Herb',
        summary: 'A'.repeat(200),
      },
      { kind: 'herb', path: '/herbs/joined/', canIndex: true },
    )

    expect((meta.description as string).length).toBeLessThanOrEqual(158)
  })
})
