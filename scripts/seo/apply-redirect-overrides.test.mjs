import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { afterEach, describe, expect, it } from 'vitest'

const scriptPath = path.resolve('scripts/seo/apply-redirect-overrides.mjs')
const recoveryMapPath = path.resolve('public/redirect-overrides/020-gsc-404-recovery-2026-08-27.txt')
const tempRoots = []

function makeFixture({ redirects, overrides, curatedCompareSlugs = [] }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-redirect-overrides-'))
  tempRoots.push(root)

  fs.mkdirSync(path.join(root, 'out'), { recursive: true })
  fs.mkdirSync(path.join(root, 'public', 'redirect-overrides'), { recursive: true })
  fs.writeFileSync(path.join(root, 'out', '_redirects'), redirects)
  fs.writeFileSync(path.join(root, 'public', 'redirect-overrides', 'fixture.txt'), overrides)

  for (const slug of curatedCompareSlugs) {
    const dir = path.join(root, 'app', 'guides', 'compare', slug)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'page.tsx'), 'export default function Page() { return null }\n')
  }

  return root
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

describe('apply-redirect-overrides', () => {
  it('drops unbuilt comparison hub redirects and repairs curated pairs to exact canonicals', () => {
    const root = makeFixture({
      redirects: [
        '/compare /guides/compare/ 301',
        '/compare/magnesium-vs-zinc /guides/compare/ 301',
        '/compare/magnesium-vs-zinc/ /guides/compare/ 301',
        'https://www.thehippiescientist.net/compare/lions-mane-vs-alpha-gpc https://thehippiescientist.net/guides/compare/ 301',
        '/compare/curated-pair /guides/compare/ 301',
      ].join('\n'),
      overrides: '/legacy /new-home/ 301\n',
      curatedCompareSlugs: ['curated-pair'],
    })

    const result = spawnSync(process.execPath, [scriptPath], {
      cwd: root,
      encoding: 'utf8',
    })

    expect(result.status, result.stderr || result.stdout).toBe(0)

    const merged = fs.readFileSync(path.join(root, 'out', '_redirects'), 'utf8')
    expect(merged).toContain('/compare /guides/compare/ 301')
    expect(merged).not.toContain('/compare/magnesium-vs-zinc')
    expect(merged).not.toContain('/compare/lions-mane-vs-alpha-gpc')
    expect(merged).toContain('/compare/curated-pair /guides/compare/curated-pair/ 301')
    expect(merged).toContain('/legacy /new-home/ 301')
    expect(merged).toContain('/legacy/ /new-home/ 301')
    expect(result.stdout).toContain('pruned 3 unbuilt comparison soft-404 redirects')
    expect(result.stdout).toContain('repaired 1 comparison redirects to curated pages')
  })

  it('keeps the GSC recovery map free of self redirects and the bad English-to-German stress mapping', () => {
    const lines = fs.readFileSync(recoveryMapPath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))

    for (const line of lines) {
      const [source, target] = line.split(/\s+/)
      const normalize = (value) => value.replace(/\/+$/, '') || '/'
      expect(normalize(source)).not.toBe(normalize(target))
    }

    expect(lines.some((line) => line.startsWith('/goals/stress '))).toBe(false)
    expect(lines.some((line) => line.includes('/de/ziele/stress'))).toBe(false)
  })
})
