import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { describe, expect, it } from 'vitest'

/**
 * The funnel report exists because three artifacts disagree about what is
 * published, and the most reachable one is the least accurate. These tests pin
 * the properties that make it worth reading rather than its current numbers,
 * which are expected to move.
 */
function runFunnel() {
  const stdout = execFileSync(process.execPath, ['scripts/ci/report-publication-funnel.mjs', '--json'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  })
  return JSON.parse(stdout)
}

describe('publication funnel report', () => {
  it('reports every stage from authored profile to emitted sitemap', () => {
    const { stages } = runFunnel()
    expect(stages.map((s) => s.label)).toEqual([
      'authored profiles',
      'data says PUBLISH',
      'in route manifest',
      'in emitted sitemap',
    ])
  })

  it('counts more authored profiles than the data marks publishable', () => {
    const { stages } = runFunnel()
    const authored = stages[0].count
    const publish = stages[1].count
    expect(authored).toBeGreaterThan(0)
    expect(publish).toBeGreaterThan(0)
    expect(publish).toBeLessThan(authored)
  })

  it('narrows monotonically, so a stage can never admit more than the one before it', () => {
    // A later stage exceeding an earlier one would mean the funnel is measuring
    // unrelated populations rather than successive filters, and the report
    // would be meaningless rather than merely surprising.
    const counts = runFunnel().stages.map((s) => s.count).filter((c) => c != null)
    for (let i = 1; i < counts.length; i += 1) {
      expect(counts[i]).toBeLessThanOrEqual(counts[i - 1])
    }
  })

  it('measures manifest staleness against the data, not against a sibling artifact', () => {
    // The original guard compared manifest.generatedAt to _meta/build-info.json.
    // The same pipeline step writes both, so they always move together: with the
    // manifest 28 days behind herbs.json it reported a 28 *second* gap and never
    // fired. Recomputing the expected drift here from the data file the manifest
    // describes is what makes this a real check rather than a restatement.
    const { manifestStaleDays } = runFunnel()
    if (manifestStaleDays == null) return

    const manifest = JSON.parse(fs.readFileSync('public/data/publication-manifest.json', 'utf8'))
    const newest = ['public/data/herbs.json', 'public/data/compounds.json']
      .filter((file) => fs.existsSync(file))
      .reduce((max, file) => Math.max(max, fs.statSync(file).mtimeMs), 0)

    const expected = Math.round((newest - Date.parse(manifest.generatedAt)) / 86400000)
    expect(manifestStaleDays).toBe(expected)
  })

  it('reports whether the manifest still describes this corpus', () => {
    // Clock-based staleness dies on a fresh clone, where every mtime is checkout
    // time. Composition does not: a profile marked PUBLISH that the manifest has
    // never heard of means the two describe different corpora regardless of dates.
    const { manifestCoverage } = runFunnel()
    expect(manifestCoverage).not.toBeNull()
    expect(Number.isInteger(manifestCoverage.namedButGone)).toBe(true)
    expect(Number.isInteger(manifestCoverage.publishableButUnknown)).toBe(true)
    expect(manifestCoverage.namedButGone).toBeGreaterThanOrEqual(0)
    expect(manifestCoverage.publishableButUnknown).toBeGreaterThanOrEqual(0)
  })

  it('survives an unbuilt out/ instead of failing', () => {
    // The report has to be runnable before a build, or it cannot be used to
    // decide whether a build is worth doing.
    const { stages } = runFunnel()
    const sitemapStage = stages.find((s) => s.label === 'in emitted sitemap')
    expect(sitemapStage).toBeDefined()
    expect(sitemapStage.count === null || typeof sitemapStage.count === 'number').toBe(true)
  })
})
