import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Indexability must have one answer per profile.
 *
 * It used to have four, and they disagreed:
 *
 *   summary-indexes/*-summary.json  `indexability_status`        352 PUBLISH
 *   *-detail/*.json                 `governance.indexingAllowed` 352 true
 *   *-detail/*.json                 `indexability_status`        479 PUBLISH
 *   herbs.json / compounds.json     `indexability_status`        differed on 99
 *
 * The first two agreed corpus-wide and the first is what `app/sitemap.ts` and
 * the profile pages read, so it is the authority. The third was the liar: 127
 * detail records advertised `robots: index,follow` and `sitemap_included: true`
 * while the governance flag on the same record said no. That is what made
 * "taurine is in the sitemap while emitting noindex" both reportable and untrue
 * of the live site — it depended on which copy you read.
 *
 * `scripts/data/sync-detail-indexability.mjs` now copies the detail triple from
 * the summary index rather than letting it be maintained separately. These
 * tests fail if a fifth opinion appears or the copies drift apart again.
 */

const DATA_DIR = path.join(process.cwd(), 'public', 'data')

type Record_ = {
  slug?: string
  indexability_status?: string
  robots?: string
  sitemap_included?: boolean
  governance?: { indexingAllowed?: unknown }
}

function readSummary(file: string): Record_[] {
  const full = path.join(DATA_DIR, 'summary-indexes', file)
  if (!existsSync(full)) return []
  const parsed = JSON.parse(readFileSync(full, 'utf8'))
  if (Array.isArray(parsed)) return parsed
  return (Object.values(parsed).find(Array.isArray) as Record_[]) ?? []
}

function readDetail(dir: string): Record_[] {
  const full = path.join(DATA_DIR, dir)
  if (!existsSync(full)) return []
  return readdirSync(full)
    .filter((name) => name.endsWith('.json'))
    .map((name) => JSON.parse(readFileSync(path.join(full, name), 'utf8')))
}

const publishes = (record: Record_) =>
  String(record.indexability_status ?? '').toUpperCase() === 'PUBLISH'

describe('indexability has a single source of truth', () => {
  const authority = new Map<string, Record_>()
  for (const file of ['herbs-summary.json', 'compounds-summary.json']) {
    for (const record of readSummary(file)) {
      if (record.slug) authority.set(String(record.slug), record)
    }
  }
  const details = [...readDetail('herbs-detail'), ...readDetail('compounds-detail')]

  it('inspects a real corpus', () => {
    // Otherwise every assertion below passes on empty arrays.
    expect(authority.size).toBeGreaterThan(400)
    expect(details.length).toBeGreaterThan(400)
  })

  it('never advertises a profile the authority does not publish', () => {
    // The dangerous direction: a detail payload claiming index,follow /
    // sitemap_included for a profile the site actually noindexes.
    const overclaiming = details
      .filter((record) => {
        const source = authority.get(String(record.slug ?? ''))
        if (!source) return false
        const advertises = publishes(record) || record.sitemap_included === true || /^index/i.test(String(record.robots ?? ''))
        return advertises && !publishes(source)
      })
      .map((record) => record.slug)
    expect(overclaiming).toEqual([])
  })

  it('keeps the detail triple identical to the summary index', () => {
    const drifted = details
      .filter((record) => {
        const source = authority.get(String(record.slug ?? ''))
        if (!source) return false
        return (
          String(record.indexability_status ?? '') !== String(source.indexability_status ?? '') ||
          String(record.robots ?? '') !== String(source.robots ?? '') ||
          record.sitemap_included !== source.sitemap_included
        )
      })
      .map((record) => record.slug)
    expect(drifted).toEqual([])
  })

  it('keeps the governance flag consistent with the published status', () => {
    // `validate-production-content-invariants` counts published profiles from
    // `governance.indexingAllowed`, so a disagreement here moves the published
    // baseline without any status field changing.
    const conflicting = details
      .filter((record) => {
        const allowed = record.governance?.indexingAllowed
        if (typeof allowed !== 'boolean') return false
        return allowed !== publishes(record)
      })
      .map((record) => record.slug)
    expect(conflicting).toEqual([])
  })

  it('still publishes a meaningful share of the corpus', () => {
    // Guards the degenerate way to satisfy every rule above: noindex everything.
    const published = [...authority.values()].filter(publishes)
    expect(published.length).toBeGreaterThan(200)
  })
})
