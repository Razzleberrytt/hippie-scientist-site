import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { afterEach, describe, expect, it } from 'vitest'

const scriptPath = path.resolve('scripts/seo/canonicalize-internal-redirect-links.mjs')
const tempRoots = []

function makeFixture({ redirects, html }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-canonicalizer-'))
  tempRoots.push(root)
  fs.mkdirSync(path.join(root, 'out'), { recursive: true })
  fs.writeFileSync(path.join(root, 'out', '_redirects'), redirects)
  fs.writeFileSync(path.join(root, 'out', 'index.html'), html)
  return root
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

describe('canonicalize-internal-redirect-links', () => {
  it('rewrites route redirects to canonical trailing-slash targets while preserving suffixes', () => {
    const root = makeFixture({
      redirects: [
        '/compare /guides/compare/ 301',
        '/legacy-compare /compare 301',
        '/atom.xml /feed.xml 301',
      ].join('\n'),
      html: [
        '<a href="/compare">Compare</a>',
        '<a href="/compare?from=home">Compare query</a>',
        '<a href="/legacy-compare#top">Legacy chain</a>',
        '<a href="/atom.xml">Feed</a>',
      ].join('\n'),
    })

    const result = spawnSync(process.execPath, [scriptPath], {
      cwd: root,
      encoding: 'utf8',
    })

    expect(result.status, result.stderr || result.stdout).toBe(0)

    const rewritten = fs.readFileSync(path.join(root, 'out', 'index.html'), 'utf8')
    expect(rewritten).toContain('href="/guides/compare/"')
    expect(rewritten).toContain('href="/guides/compare/?from=home"')
    expect(rewritten).toContain('href="/guides/compare/#top"')
    expect(rewritten).toContain('href="/feed.xml"')
    expect(rewritten).not.toContain('href="/feed.xml/"')
  })
})
