import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { test } from 'vitest'
import { extractCitationIdentity, normalizeCitationUrl, selectProtectedAssets, sourceOwner, protectedSourceOwner } from '../ai-citation-protection-core.mjs'

const root = process.cwd()
const readJson = file => JSON.parse(readFileSync(file, 'utf8'))
const policy = readJson('config/ai-citation-protection-policy.json')
const ledger = readJson('config/ai-citation-protected-assets.json')
const signal = readJson('config/ai-citation-swarm-priorities.json')
const audit = readFileSync('scripts/ci/audit-ai-citation-readiness.mjs', 'utf8')
const generator = readFileSync('scripts/seo/ai-citation-protected-assets.mjs', 'utf8')

test('P0 citation winner policy uses the existing bounded selection contract', () => {
  assert.equal(policy.version, 1)
  assert.ok(policy.minCitations > 0)
  assert.ok(policy.minCitationSharePct > 0 && policy.minCitationSharePct <= 100)
  assert.ok(policy.cumulativeCoveragePct > 0 && policy.cumulativeCoveragePct <= 100)
  assert.ok(policy.maxAssets > 0 && policy.staleAfterDays > 0)
})

test('dated source snapshot protects real citation winners, not invented page/query joins', () => {
  assert.equal(ledger.version, 2)
  assert.equal(ledger.status, 'ready')
  assert.equal(ledger.snapshotLabel, '2026-10-12')
  assert.equal(ledger.sourceManifest, 'config/ai-citation-swarm-priorities.json')
  assert.ok(ledger.assets.length > 0 && ledger.assets.length <= policy.maxAssets)
  assert.equal(ledger.assets.length, 25)
  assert.ok(ledger.coveragePct >= 60)
  const urls = new Set()
  for (const a of ledger.assets) {
    assert.match(a.url, /^\//)
    assert.equal('queries' in a, false)
    assert.ok(a.identity.title && a.sourceFile)
    assert.equal(urls.has(a.url), false)
    urls.add(a.url)
  }
  assert.ok(urls.has('/articles/mitragynine/'))
  assert.ok(urls.has('/articles/how-to-choose-supplement-quality/'))
  assert.ok(urls.has('/articles/2c-b-effects/'))
  assert.equal(ledger.coveredCitations, 41118)
  assert.equal(ledger.coveragePct, 83.61)
  assert.ok(ledger.assets.some(x => x.url === '/articles/magnesium-types-for-sleep/' && x.redirect?.to === '/guides/sleep/magnesium-types-for-sleep/'))
  assert.equal(ledger.unresolved.length, 0)
})

test('checked-in ledger is reproducible from the dated public derived signal and canonical sources', () => {
  const selected = selectProtectedAssets(root, signal, policy)
  for (const key of ['assets', 'unresolved', 'coveredCitations', 'coveragePct']) {
    assert.deepEqual(ledger[key], selected[key], key)
  }
  assert.doesNotMatch(generator, /new Date\s*\(/)
  assert.match(generator, /generatedAt:\s*null/)
})

test('canonical AI citation audit runs a real protected-source identity gate', () => {
  assert.match(audit, /validate-ai-citation-protected-assets\.mjs/)
  const run = spawnSync(process.execPath, ['scripts/ci/validate-ai-citation-protected-assets.mjs'], { encoding: 'utf8' })
  assert.equal(run.status, 0, run.stdout + '\n' + run.stderr)
  const ageDays = (Date.now() - Date.parse(ledger.snapshotLabel + 'T00:00:00Z')) / 86400000
  const fresh = Number.isFinite(ageDays) && ageDays >= -1 && ageDays <= policy.staleAfterDays &&
    ledger.snapshotLabel === signal.snapshotLabel
  assert.match(run.stdout, fresh ? /PASS protected page owners=25/ : /citation-neutral advisory/)
})

test('source lookup distinguishes published TSX guides, article MDX and blog MDX', () => {
  const fixtures = mkdtempSync(path.join(os.tmpdir(), 'citation-protection-'))
  const add = (file, content) => {
    mkdirSync(path.dirname(path.join(fixtures, file)), { recursive: true })
    writeFileSync(path.join(fixtures, file), content)
  }
  try {
    add('app/guides/sleep/example/page.tsx', "const SLUG = 'example'\nconst TITLE = 'Example Sleep Guide'\nexport const metadata = buildPageMetadata({title: compactMetaTitle(TITLE), path: '/guides/sleep/example/'})")
    add('content/articles/mitragynine.mdx', '---\nslug: mitragynine\ntitle: "Mitragynine: Human Evidence"\n---\nContent')
    add('content/blog/2c-b-effects.mdx', '---\nslug: 2c-b-effects\ntitle: "2C-B Effects"\n---\nContent')
    assert.equal(sourceOwner(fixtures, '/guides/sleep/example/'), 'app/guides/sleep/example/page.tsx')
    assert.equal(sourceOwner(fixtures, '/articles/mitragynine/'), 'content/articles/mitragynine.mdx')
    assert.equal(sourceOwner(fixtures, '/articles/2c-b-effects/'), 'content/blog/2c-b-effects.mdx')
    assert.equal(sourceOwner(fixtures, '/articles/nonexistent/'), null)
    add('app/guides/sleep/magnesium-types-for-sleep/page.tsx', "const TITLE = 'Magnesium Types for Sleep'\nexport const metadata = { title: TITLE, alternates: { canonical: '/guides/sleep/magnesium-types-for-sleep/' } }")
    add('public/_redirects', '/articles/magnesium-types-for-sleep /guides/sleep/magnesium-types-for-sleep/ 301\n/articles/magnesium-types-for-sleep/ /guides/sleep/magnesium-types-for-sleep/ 301\n')
    assert.equal(sourceOwner(fixtures, '/articles/magnesium-types-for-sleep/'), null)
    const redirected = protectedSourceOwner(fixtures, '/articles/magnesium-types-for-sleep/')
    assert.deepEqual(redirected, { sourceFile: 'app/guides/sleep/magnesium-types-for-sleep/page.tsx', redirect: {
      to: '/guides/sleep/magnesium-types-for-sleep/', status: 301, rulesFile: 'public/_redirects',
    } })
    add('public/_redirects', '/articles/magnesium-types-for-sleep/ /guides/sleep/magnesium-types-for-sleep/ 302\n')
    assert.equal(protectedSourceOwner(fixtures, '/articles/magnesium-types-for-sleep/'), null)
    assert.equal(normalizeCitationUrl('https://www.thehippiescientist.net/articles/mitragynine/'), '/articles/mitragynine/')
    assert.equal(normalizeCitationUrl('https://another-site.test/articles/mitragynine/'), null)
    assert.equal(normalizeCitationUrl('/articles/../../etc/passwd'), null)
    const mock = { snapshotLabel: '2026-10-12', totals: { citations: 100 }, defendUrls: [
      { url: '/articles/mitragynine/', citations: 70 },
      { url: '/articles/unknown/', citations: 20 },
      { url: '/articles/2c-b-effects/', citations: 10 },
    ] }
    const selection = selectProtectedAssets(fixtures, mock, { ...policy, maxAssets: 2 })
    assert.deepEqual(selection.assets.map(x => x.url), ['/articles/mitragynine/', '/articles/2c-b-effects/'])
    assert.equal(selection.unresolved[0].url, '/articles/unknown/')
    assert.equal(selection.assets[0].identity.title, 'Mitragynine: Human Evidence')
    add('content/articles/mitragynine.md', '---\nslug: mitragynine\ntitle: "Duplicate owner"\n---\n')
    assert.equal(sourceOwner(fixtures, '/articles/mitragynine/'), null)
  } finally { rmSync(fixtures, { recursive: true, force: true }) }
})

test('source identity parsing records actual declared fields; no invented rendered H1', () => {
  const markdown = extractCitationIdentity('---\nslug: kava\ntitle: "Kava: Evidence & Safety"\n---\n# A heading', 'content/articles/kava.md')
  assert.deepEqual(markdown, { sourceType: 'markdown-frontmatter', title: 'Kava: Evidence & Safety', slug: 'kava', canonical: null })
  const tsx = extractCitationIdentity("const SLUG = 'example'\nconst TITLE = 'Example'\nconst CANONICAL_PATH = '/guides/example/'\nexport const metadata = { title: TITLE, alternates: { canonical: CANONICAL_PATH } }", 'app/guides/example/page.tsx')
  assert.deepEqual(tsx, { sourceType: 'tsx-static-declaration', title: 'Example', slug: null, canonical: '/guides/example/' })
  const unknowable = extractCitationIdentity("export const metadata = buildPageMetadata({ title: makeTitle(), path: getCanonical() })", 'app/guides/dynamic/page.tsx')
  assert.equal(unknowable.title, null)
  assert.equal(unknowable.canonical, null)
})
