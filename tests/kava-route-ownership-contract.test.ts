import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { afterAll, describe, expect, it } from 'vitest'
import { SITE_URL } from '../lib/site'

const read = (...parts: string[]) => fs.readFileSync(path.join(process.cwd(), ...parts), 'utf8')

const article = read('content', 'articles', 'kava.md')
const guide = read('app', 'guides', 'herbs', 'kava', 'page.tsx')
const redirects = read('public', '_redirects')

const tempRoots: string[] = []
afterAll(() => {
  for (const root of tempRoots) fs.rmSync(root, { recursive: true, force: true })
})

describe('Kava route ownership contract', () => {
  it('keeps three distinct live reader jobs instead of consolidating the citation winner', () => {
    expect(article).toContain('Kava for Anxiety: Does It Work for Social Anxiety?')
    expect(article).toContain('social anxiety and kava drinks versus studied extracts')
    expect(article).toContain('[Kava evidence and safety guide](/guides/herbs/kava/)')
    expect(article).toContain('[Kava monograph](/herbs/kava/)')

    expect(guide).toContain("const ROUTE = `/guides/herbs/${SLUG}`")
    expect(guide).toContain('This page is the broad clinical-evidence and liver-risk guide.')
    expect(guide).toContain('href="/articles/kava/"')
    expect(guide).toContain('href="/herbs/kava/"')
  })

  it('generates a self-canonical Kava monograph from the alias-backed source record', async () => {
    const { generateMetadata } = await import('../app/herbs/[slug]/page')
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'kava' }) })

    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/herbs/kava/`)
    expect(metadata.robots).not.toMatchObject({ index: false })
  })

  it('emits the exact canonical Kava monograph in the sitemap', async () => {
    const sitemap = (await import('../app/sitemap')).default
    const entries = await sitemap()
    const urls = entries.map((entry) => entry.url)

    expect(urls).toContain(`${SITE_URL}/herbs/kava/`)
    expect(urls).not.toContain(`${SITE_URL}/herbs/piper-methysticum/`)
  })

  it('preserves the legacy guide redirect without redirecting either live Kava surface', () => {
    expect(redirects).toContain('/guides/kava /guides/herbs/kava/ 301')
    expect(redirects).toContain('/guides/kava/ /guides/herbs/kava/ 301')
    expect(redirects).not.toMatch(/^\/articles\/kava\/?\s+/m)
    expect(redirects).not.toMatch(/^\/herbs\/kava\/?\s+/m)
  })

  it('generates a Kava monograph link-map record that routes to the broad guide', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kava-link-map-'))
    tempRoots.push(root)
    const dataDir = path.join(root, 'data')
    const docsDir = path.join(root, 'docs')
    fs.mkdirSync(path.join(dataDir, 'runtime-maps'), { recursive: true })

    fs.writeFileSync(
      path.join(dataDir, 'herbs-summary.json'),
      JSON.stringify([
        {
          slug: 'piper-methysticum',
          name: 'Kava',
          indexability_status: 'PUBLISH',
          primary_effects: ['anxiety'],
          summary: 'Kava evidence and safety context.',
        },
      ]),
    )
    fs.writeFileSync(path.join(dataDir, 'compounds-summary.json'), '[]')
    fs.writeFileSync(
      path.join(dataDir, 'runtime-maps', 'entity-to-conditions.json'),
      JSON.stringify({
        'piper-methysticum': [{ slug: 'anxiety', label: 'Anxiety' }],
      }),
    )

    const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
    execFileSync(
      npx,
      [
        'tsx',
        'scripts/data/build-internal-link-engine.mjs',
        `--data-dir=${dataDir}`,
        `--docs-dir=${docsDir}`,
      ],
      { cwd: process.cwd(), stdio: 'pipe' },
    )

    const map = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'runtime-maps', 'internal-link-map.json'), 'utf8'),
    )
    const kava = map['/herbs/kava']
    expect(kava).toBeTruthy()

    const hrefs = kava.groups.flatMap((group: { links: Array<{ href: string }> }) =>
      group.links.map((link) => link.href),
    )
    expect(hrefs).toContain('/guides/herbs/kava')
    expect(map['/herbs/piper-methysticum']).toBeUndefined()
  })

  it('does not rewrite the evidence or safety conclusion as part of discovery maintenance', () => {
    expect(article).toContain('There is not strong direct clinical evidence that kava drinks treat social anxiety disorder.')
    expect(guide).toContain('Limited and mixed. Some earlier trials were positive; the largest later GAD trial was negative.')
    expect(guide).toContain('rare but sometimes severe liver injury')
  })
})
