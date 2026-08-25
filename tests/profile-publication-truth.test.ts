import { describe, expect, it } from 'vitest'
import {
  finalizePublicationRow,
  parseSitemapProfileRoutes,
} from '../scripts/ci/audit-profile-robots.mjs'

const baseRow = {
  kind: 'herb',
  slug: 'ashwagandha',
  route: '/herbs/ashwagandha/',
  robots: 'index,follow',
  emittedNoindex: false,
  status: 'PUBLISH',
  reasons: [],
  canonical: 'https://thehippiescientist.net/herbs/ashwagandha/',
  curated: false,
  redirectSource: false,
}

describe('profile publication truth', () => {
  it('reads only herb and compound profile routes from the final sitemap', () => {
    const routes = parseSitemapProfileRoutes(
      '<urlset><url><loc>https://thehippiescientist.net/herbs/ashwagandha/</loc></url>' +
      '<url><loc>https://thehippiescientist.net/guides/</loc></url>' +
      '<url><loc>https://thehippiescientist.net/compounds/l-theanine/</loc></url></urlset>',
    )

    expect([...routes]).toEqual([
      '/herbs/ashwagandha/',
      '/compounds/l-theanine/',
    ])
  })

  it('marks self-canonical indexable HTML as published only when sitemap includes it', () => {
    const published = finalizePublicationRow(baseRow, new Set([baseRow.route]))
    const missing = finalizePublicationRow(baseRow, new Set())

    expect(published).toMatchObject({
      finalRobots: 'index,follow',
      sitemapEligible: true,
      sitemapIncluded: true,
      publicationReason: 'published',
      parity: true,
    })
    expect(missing).toMatchObject({
      sitemapEligible: true,
      sitemapIncluded: false,
      publicationReason: 'indexable-html-missing-from-sitemap',
      parity: false,
    })
  })

  it('keeps governance reasons on final noindex profiles and rejects sitemap inclusion', () => {
    const row = {
      ...baseRow,
      robots: 'noindex,follow',
      emittedNoindex: true,
      status: 'NOINDEX',
      reasons: ['insufficient-evidence', 'thin-safety-context'],
    }

    const excluded = finalizePublicationRow(row, new Set())
    const advertised = finalizePublicationRow(row, new Set([row.route]))

    expect(excluded).toMatchObject({
      sitemapEligible: false,
      sitemapIncluded: false,
      publicationReason: 'governance:insufficient-evidence | thin-safety-context',
      parity: true,
    })
    expect(advertised.parity).toBe(false)
  })

  it('explains redirects and canonical consolidation before sitemap reconciliation', () => {
    const redirected = finalizePublicationRow(
      { ...baseRow, redirectSource: true },
      new Set(),
    )
    const canonicalized = finalizePublicationRow(
      {
        ...baseRow,
        canonical: 'https://thehippiescientist.net/compounds/ashwagandha/',
      },
      new Set(),
    )

    expect(redirected).toMatchObject({
      sitemapEligible: false,
      publicationReason: 'redirect-source',
      parity: true,
    })
    expect(canonicalized).toMatchObject({
      sitemapEligible: false,
      publicationReason: 'canonicalized-to:/compounds/ashwagandha/',
      parity: true,
    })
  })
})
