import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { afterEach, describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const SCRIPT = path.join(ROOT, 'scripts', 'seo', 'refresh-ai-citation-protected-assets.mjs')
const temporaryDirectories = []

function makeTempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-citation-refresh-'))
  temporaryDirectories.push(dir)
  return dir
}

function runRefresh(inputFiles, extraArgs = []) {
  const dir = makeTempDir()
  const inputDir = path.join(dir, 'input')
  const outDir = path.join(dir, 'out')
  const ledgerPath = path.join(dir, 'ledger.json')
  const redirectsPath = path.join(dir, '_redirects')
  fs.mkdirSync(inputDir)
  fs.mkdirSync(outDir)
  fs.writeFileSync(redirectsPath, '')
  for (const [name, content] of Object.entries(inputFiles)) {
    fs.writeFileSync(path.join(inputDir, name), content)
  }

  const result = spawnSync(
    process.execPath,
    [
      SCRIPT,
      `--dir=${inputDir}`,
      `--out-dir=${outDir}`,
      `--ledger=${ledgerPath}`,
      `--redirects=${redirectsPath}`,
      ...extraArgs,
    ],
    { cwd: ROOT, encoding: 'utf8' },
  )

  return {
    result,
    ledger: fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) : null,
  }
}

afterEach(() => {
  while (temporaryDirectories.length) {
    fs.rmSync(temporaryDirectories.pop(), { recursive: true, force: true })
  }
})

describe('protected AI citation asset refresh', () => {
  it('prefers the named page-stats export when other Bing exports coexist', () => {
    const { result, ledger } = runRefresh({
      'thehippiescientist.net_AISearchQueriesReport_8_28_2026.csv':
        '"Grounding Query","Intent","Topic","Citations","Citation Share"\n"sleep aids","Commercial","Sleep","9999","50%"\n',
      'thehippiescientist.net_AIPerformanceOverviewStats_8_28_2026.csv':
        '"Date","Citations","Cited Pages"\n"8/28/2026","9999","10"\n',
      'thehippiescientist.net_AIPageStatsReport_8_28_2026.csv':
        '"Page","Citations"\n"https://thehippiescientist.net/guides/sleep/best-natural-sleep-aids-that-work/","300"\n',
    })

    expect(result.status).toBe(0)
    expect(ledger.sourceExport).toBe('thehippiescientist.net_AIPageStatsReport_8_28_2026.csv')
    expect(ledger.totalCitations).toBe(300)
    expect(ledger.assets.map((asset) => asset.url)).toEqual([
      '/guides/sleep/best-natural-sleep-aids-that-work/',
    ])
    expect(ledger.assets[0].identity.status).toBe('pending_render_fingerprint')
  })

  it('fails closed when multiple unnamed Page/Citations exports are ambiguous', () => {
    const row = '"Page","Citations"\n"https://thehippiescientist.net/guides/sleep/best-natural-sleep-aids-that-work/","300"\n'
    const { result, ledger } = runRefresh({ 'first.csv': row, 'second.csv': row })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Ambiguous page-stats exports')
    expect(ledger).toBeNull()
  })

  it('fails closed rather than protecting foreign URLs from a named page-stats export', () => {
    const { result, ledger } = runRefresh({
      'AIPageStatsReport_8_28_2026.csv':
        '"Page","Citations"\n"https://example.com/not-ours/","9000"\n',
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('produced no valid first-party protected assets')
    expect(ledger).toBeNull()
  })

  it('honors an explicit page-stats file override', () => {
    const dir = makeTempDir()
    const explicit = path.join(dir, 'custom.csv')
    fs.writeFileSync(
      explicit,
      '"Page","Citations"\n"https://thehippiescientist.net/guides/sleep/best-natural-sleep-aids-that-work/","300"\n',
    )

    const { result, ledger } = runRefresh(
      {
        'AIPageStatsReport_8_28_2026.csv':
          '"Page","Citations"\n"https://thehippiescientist.net/guides/anxiety/best-herbs-for-anxiety/","999"\n',
      },
      [`--page-stats-file=${explicit}`],
    )

    expect(result.status).toBe(0)
    expect(ledger.sourceExport).toBe('custom.csv')
    expect(ledger.assets[0].url).toBe('/guides/sleep/best-natural-sleep-aids-that-work/')
  })
})
