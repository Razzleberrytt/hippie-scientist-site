import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { afterEach, describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const SCRIPT = path.join(ROOT, 'scripts', 'ci', 'validate-ai-citation-protected-assets.mjs')
const temporaryDirectories = []

function makeTempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-citation-assets-'))
  temporaryDirectories.push(dir)
  return dir
}

function baseLedger() {
  return {
    schemaVersion: 1,
    snapshotLabel: 'test',
    sourceExport: 'fixture.csv',
    totalCitations: 300,
    policy: {
      minCitations: 250,
      cumulativeCitationShare: 0.75,
      maxAssets: 25,
    },
    protectedCitations: 300,
    protectedCitationShare: 1,
    assets: [
      {
        url: '/guides/test/',
        sourcePath: 'package.json',
        citations: 300,
        share: 1,
        cumulativeShare: 1,
        protectionReason: ['min_citations', 'cumulative_coverage'],
        identity: { status: 'pending_render_fingerprint' },
      },
    ],
  }
}

function runValidator(ledger) {
  const dir = makeTempDir()
  const ledgerPath = path.join(dir, 'ledger.json')
  const redirectsPath = path.join(dir, '_redirects')
  const outDir = path.join(dir, 'out')
  fs.writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`)
  fs.writeFileSync(redirectsPath, '')
  fs.mkdirSync(outDir)

  return spawnSync(
    process.execPath,
    [SCRIPT, `--ledger=${ledgerPath}`, `--redirects=${redirectsPath}`, `--out-dir=${outDir}`],
    { cwd: ROOT, encoding: 'utf8' },
  )
}

afterEach(() => {
  while (temporaryDirectories.length) {
    fs.rmSync(temporaryDirectories.pop(), { recursive: true, force: true })
  }
})

describe('protected AI citation ledger CLI', () => {
  it('accepts a structurally valid pending ledger while rendering a pending warning', () => {
    const result = runValidator(baseLedger())
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('PASS: 1 protected source owner(s) present')
    expect(result.stderr).toContain('await a trusted rendered fingerprint')
  })

  it('rejects duplicate normalized protected URLs', () => {
    const ledger = baseLedger()
    ledger.totalCitations = 600
    ledger.protectedCitations = 600
    ledger.assets.push({
      ...ledger.assets[0],
      url: 'https://www.thehippiescientist.net/guides/test/',
    })

    const result = runValidator(ledger)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('duplicate protected asset URL')
  })

  it('rejects foreign protected URLs', () => {
    const ledger = baseLedger()
    ledger.assets[0].url = 'https://example.com/guides/test/'

    const result = runValidator(ledger)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('not first-party')
  })

  it('rejects unknown identity states instead of treating them as pending', () => {
    const ledger = baseLedger()
    ledger.assets[0].identity = { status: 'maybe_later' }

    const result = runValidator(ledger)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('unknown or missing identity status')
  })

  it('rejects ready identity baselines with a forged fingerprint', () => {
    const ledger = baseLedger()
    ledger.assets[0].identity = {
      status: 'ready',
      routePath: '/guides/test/',
      title: 'Test title',
      h1: 'Test H1',
      canonical: 'https://thehippiescientist.net/guides/test/',
      indexable: true,
      redirectTarget: null,
      fingerprint: '0'.repeat(64),
    }

    const result = runValidator(ledger)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('fingerprint does not match identity fields')
  })
})
