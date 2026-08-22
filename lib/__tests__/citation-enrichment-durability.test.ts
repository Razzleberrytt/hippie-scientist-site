import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { isPlaceholderCitationTitle } from '../citation-identifiers.mjs'

/**
 * Enriched citation titles must survive a data rebuild.
 *
 * `fetch-pubmed-metadata.mjs` retrieves real bibliographic titles from NCBI and
 * caches them in `ops/cache/pubmed-metadata.json`; `apply-pubmed-metadata.ts`
 * writes them into the profile payloads. But the apply step was not part of
 * `data:build`, and the payloads it wrote are regenerated from the workbook —
 * so every rebuild replaced 182 real study titles with the workbook's
 * placeholder text, 157 of them with "PubMed PMID <n>. Minimal citation row
 * added from existing workbook PMID; title/year/journal still require PubMed
 * metadata." The enrichment lived only in generated output and was never
 * persisted upstream.
 *
 * `data:build` now runs the apply step from the committed cache, after the
 * canonical citation export that used to revert it. This test is the guard: it
 * fails if the pipeline stops re-applying enrichment, or if the cache that
 * makes the rebuild reproducible is removed.
 */

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')
const CACHE_PATH = path.join(ROOT, 'ops', 'cache', 'pubmed-metadata.json')

type Source = { pmid?: string; pubmedId?: string; title?: string; metadataSource?: string }

function readProfiles() {
  const profiles: { slug: string; sources: Source[] }[] = []
  for (const dir of ['herbs-detail', 'compounds-detail']) {
    const full = path.join(DATA_DIR, dir)
    if (!existsSync(full)) continue
    for (const file of readdirSync(full)) {
      if (!file.endsWith('.json')) continue
      const record = JSON.parse(readFileSync(path.join(full, file), 'utf8'))
      profiles.push({
        slug: String(record.slug ?? file.replace(/\.json$/, '')),
        sources: Array.isArray(record.sources) ? record.sources : [],
      })
    }
  }
  return profiles
}

describe('citation enrichment survives regeneration', () => {
  const profiles = readProfiles()
  const sources = profiles.flatMap((profile) => profile.sources)

  it('inspects a real corpus rather than an empty one', () => {
    // Without this, every assertion below passes vacuously on a checkout whose
    // data has not been built.
    expect(profiles.length).toBeGreaterThan(400)
    expect(sources.length).toBeGreaterThan(800)
  })

  it('keeps the committed PubMed cache that makes the rebuild reproducible', () => {
    expect(existsSync(CACHE_PATH)).toBe(true)
    const cache = JSON.parse(readFileSync(CACHE_PATH, 'utf8'))
    expect(Object.keys(cache.records ?? {}).length).toBeGreaterThan(500)
  })

  it('leaves almost no placeholder titles in the published corpus', () => {
    // `isPlaceholderCitationTitle` treats an empty title as a placeholder, but
    // an empty title is the deliberate outcome for a citation whose title was
    // an internal governance ruling and whose identifier PubMed cannot
    // resolve — better a missing title than a published ruling or a guess.
    // Those are asserted separately below.
    const placeholders = sources.filter(
      (source) => String(source.title ?? '').trim() && isPlaceholderCitationTitle(source.title),
    )
    // One citation (PMID 17127598 on policosanol) is not recognised by PubMed,
    // so it legitimately keeps its placeholder rather than getting a guess.
    expect(placeholders.length).toBeLessThanOrEqual(5)
  })

  it('only leaves a title empty when nothing could legitimately fill it', () => {
    const untitled = sources.filter((source) => !String(source.title ?? '').trim())
    // Every empty title must lack a PMID: with a PMID, the cache would supply
    // the real title, so an empty one would mean the pipeline skipped it.
    expect(untitled.every((source) => !String(source.pmid ?? source.pubmedId ?? '').trim())).toBe(true)
    // These are review candidates, not a growing dumping ground.
    expect(untitled.length).toBeLessThanOrEqual(30)
  })

  it('carries real bibliographic titles for PubMed-sourced citations', () => {
    const enriched = sources.filter((source) => source.metadataSource === 'pubmed')
    expect(enriched.length).toBeGreaterThan(700)

    // A `metadataSource: 'pubmed'` flag on a placeholder title is a lie about
    // provenance: it says PubMed supplied this, while the value is the
    // workbook's note about PubMed *not* having supplied it. The rebuild used
    // to produce exactly that combination.
    const lying = enriched.filter((source) => isPlaceholderCitationTitle(source.title))
    expect(lying).toHaveLength(0)
  })

  it('never leaves a cited PMID without any title at all', () => {
    const untitledWithPmid = sources.filter(
      (source) => String(source.pmid ?? source.pubmedId ?? '').trim() && !String(source.title ?? '').trim(),
    )
    expect(untitledWithPmid).toHaveLength(0)
  })
})
