import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * A URL must not be advertised in the sitemap and told not to be indexed.
 *
 * `app/sitemap.ts` and the profile pages both resolve their decision from the
 * summary indexes, so that layer is the authority and it is coherent — this
 * test locks that in.
 *
 * The detail payloads carry a *second* copy of the same three fields, and it
 * disagrees: taurine reads `PUBLISH / index,follow / sitemap_included: true` in
 * the summary index and `NEEDS_REVIEW / noindex,follow / sitemap_included:
 * false` in `compounds-detail/taurine.json`. Across the corpus the two layers
 * report 240 vs 20 indexable herbs and 112 vs 459 indexable compounds.
 *
 * That divergence is what makes "taurine is in the sitemap while emitting
 * noindex" both reportable and untrue: it depends entirely on which copy is
 * read, and the copy the site actually uses says index. The duplicate is
 * reported by `scripts/ci/report-indexability-divergence.mjs` rather than
 * asserted here, because reconciling it is a governance decision — the detail
 * copy also feeds `canRender`, so changing it changes which pages exist.
 * See docs/audits/indexability-governance-2026-08-21.md.
 */

const DATA_DIR = path.join(process.cwd(), 'public', 'data')

type Record_ = {
  slug?: string
  indexability_status?: string
  robots?: string
  sitemap_included?: boolean
}

function readSummary(file: string): Record_[] {
  const full = path.join(DATA_DIR, 'summary-indexes', file)
  if (!existsSync(full)) return []
  const parsed = JSON.parse(readFileSync(full, 'utf8'))
  if (Array.isArray(parsed)) return parsed
  const nested = Object.values(parsed).find(Array.isArray)
  return (nested as Record_[]) ?? []
}

const isIndexable = (record: Record_) =>
  String(record.indexability_status ?? '').toUpperCase() === 'PUBLISH' &&
  !/noindex/i.test(String(record.robots ?? ''))

describe('sitemap and indexability agree in the layer the site reads', () => {
  const herbs = readSummary('herbs-summary.json')
  const compounds = readSummary('compounds-summary.json')
  const all = [...herbs, ...compounds]

  it('inspects a real corpus', () => {
    // Otherwise every assertion below passes on an empty array.
    expect(herbs.length).toBeGreaterThan(200)
    expect(compounds.length).toBeGreaterThan(400)
  })

  it('never advertises a noindexed URL in the sitemap', () => {
    const advertisedButBlocked = all
      .filter((record) => record.sitemap_included === true && !isIndexable(record))
      .map((record) => record.slug)
    expect(advertisedButBlocked).toEqual([])
  })

  it('never omits an indexable profile from the sitemap', () => {
    const indexableButHidden = all
      .filter((record) => isIndexable(record) && record.sitemap_included !== true)
      .map((record) => record.slug)
    expect(indexableButHidden).toEqual([])
  })

  it('keeps a meaningful number of profiles indexable', () => {
    // Guards the opposite failure: satisfying the two rules above by
    // noindexing everything.
    expect(all.filter(isIndexable).length).toBeGreaterThan(100)
  })

  it('declares an explicit indexability status on every profile', () => {
    const missing = all.filter((record) => !String(record.indexability_status ?? '').trim()).map((r) => r.slug)
    expect(missing).toEqual([])
  })
})

describe('every profile the sitemap layer publishes has a detail payload', () => {
  it('resolves each indexable slug to a file', () => {
    const pairs: [string, Record_[]][] = [
      ['herbs-detail', readSummary('herbs-summary.json')],
      ['compounds-detail', readSummary('compounds-summary.json')],
    ]
    const orphans: string[] = []
    for (const [dir, records] of pairs) {
      const full = path.join(DATA_DIR, dir)
      if (!existsSync(full)) continue
      const present = new Set(readdirSync(full).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')))
      for (const record of records) {
        if (!isIndexable(record)) continue
        const slug = String(record.slug ?? '')
        if (slug && !present.has(slug)) orphans.push(`${dir}/${slug}`)
      }
    }
    expect(orphans).toEqual([])
  })
})
