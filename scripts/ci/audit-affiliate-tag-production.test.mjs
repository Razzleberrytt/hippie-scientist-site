import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { afterEach, describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const auditScript = path.join(repoRoot, 'scripts/ci/audit-affiliate-tag-production.mjs')
const tempDirs = []

function runFixture(hrefs, {
  expectedTag = 'test-tag-20',
  extraEnv = {},
} = {}) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'affiliate-destination-audit-'))
  tempDirs.push(tempDir)
  const outDir = path.join(tempDir, 'out')
  fs.mkdirSync(outDir, { recursive: true })
  const anchors = hrefs.map((href, index) => `<a href="${href}">Link ${index + 1}</a>`).join('\n')
  fs.writeFileSync(path.join(outDir, 'index.html'), `<!doctype html><html><body>${anchors}</body></html>`, 'utf8')

  const result = spawnSync(process.execPath, [auditScript], {
    cwd: tempDir,
    encoding: 'utf8',
    env: {
      ...process.env,
      AMAZON_AFFILIATE_TAG: expectedTag,
      ...extraEnv,
    },
  })
  return result
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

describe('production affiliate destination audit', () => {
  it('passes a valid HTTPS Amazon destination with exactly one configured tag', () => {
    const result = runFixture([
      'https://www.amazon.com/dp/B000TEST?tag=test-tag-20',
    ])

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('every parseable clickable Amazon link has exactly one tag parameter OK')
    expect(result.stdout).toContain('every parseable clickable Amazon link uses the configured production tag OK')
  })

  it('decodes HTML entities before checking the query string', () => {
    const result = runFixture([
      'https://www.amazon.com/s?k=magnesium&amp;tag=test-tag-20',
    ])

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('[affiliate-tag] OK')
  })

  it('fails when an Amazon destination has no Associates tag', () => {
    const result = runFixture([
      'https://www.amazon.com/dp/B000TEST',
    ])

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('have no Associates tag parameter')
  })

  it('fails on the historical development placeholder tag', () => {
    const result = runFixture([
      'https://www.amazon.com/dp/B000TEST?tag=dev-affiliate-00',
    ])

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('dev-affiliate-00')
  })

  it('fails when the rendered tag differs from the configured production tag', () => {
    const result = runFixture([
      'https://www.amazon.com/dp/B000TEST?tag=wrong-tag-20',
    ])

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('do not match the configured production Associates tag')
  })

  it('fails when more than one tag parameter is present, even if values match', () => {
    const result = runFixture([
      'https://www.amazon.com/dp/B000TEST?tag=test-tag-20&tag=test-tag-20',
    ])

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('contain more than one Associates tag parameter')
  })

  it('fails when duplicate tag parameters conflict', () => {
    const result = runFixture([
      'https://www.amazon.com/dp/B000TEST?tag=test-tag-20&tag=wrong-tag-20',
    ])

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('contain more than one Associates tag parameter')
  })

  it('fails closed on an insecure Amazon destination', () => {
    const result = runFixture([
      'http://www.amazon.com/dp/B000TEST?tag=test-tag-20',
    ])

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('do not use HTTPS')
  })

  it('fails closed on a malformed Amazon-looking outbound href', () => {
    const result = runFixture([
      'https://www.amazon.com:bad/dp/B000TEST?tag=test-tag-20',
    ])

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('malformed or unparseable')
  })

  it('does not expand scope to unrelated malformed non-Amazon hrefs', () => {
    const result = runFixture([
      '::::not-a-url::::',
      'https://example.com/path?tag=wrong-tag-20',
    ])

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('0 parseable clickable Amazon links')
  })
})
