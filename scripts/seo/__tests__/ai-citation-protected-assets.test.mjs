import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { test } from 'vitest'
import { extractIdentity, identityFailures, normalizeUrl, selectProtectedAssets, sourceFileFor } from '../ai-citation-protected-assets-lib.mjs'

const policy = JSON.parse(readFileSync('config/ai-citation-protection-policy.json', 'utf8'))
const ledger = JSON.parse(readFileSync('config/ai-citation-protected-assets.json', 'utf8'))
const manifest = JSON.parse(readFileSync('config/ai-citation-swarm-priorities.json', 'utf8'))
const generator = readFileSync('scripts/seo/ai-citation-protected-assets.mjs', 'utf8')
const root = process.cwd()

test('citation-winner policy has bounded breadth and freshness requirements', () => {
  assert.equal(policy.version, 1)
  assert.ok(policy.minCitations > 0)
  assert.ok(policy.minCitationSharePct > 0 && policy.minCitationSharePct <= 100)
  assert.ok(policy.cumulativeCoveragePct > 0 && policy.cumulativeCoveragePct <= 100)
  assert.ok(policy.minAssets >= 10 && policy.minAssets <= policy.maxAssets)
  assert.ok(policy.staleAfterDays > 0)
})

test('dated verified Bing baseline protects source-owned article and guide winners', () => {
  assert.equal(ledger.status, 'ready')
  assert.equal(ledger.version, 1)
  assert.equal(ledger.snapshotLabel, manifest.snapshotLabel)
  assert.equal(ledger.sourceKind, 'owner-verified-derived-bing-page-stats')
  assert.ok(ledger.assets.length >= policy.minAssets)
  assert.ok(ledger.coveragePct >= policy.cumulativeCoveragePct)
  assert.equal(ledger.totals.citations, manifest.totals.citations)
  assert.equal(ledger.assets[0].url, '/guides/sleep/best-natural-sleep-aids-that-work/')
  assert.ok(ledger.assets.some(a => a.url === '/articles/mitragynine/' && a.sourceFile === 'content/articles/mitragynine.mdx'))
  assert.ok(ledger.assets.some(a => a.url === '/articles/how-to-choose-supplement-quality/' && a.sourceFile.endsWith('.md')))
  for (const a of ledger.assets) {
    assert.match(a.url, /^\/.+\/$/)
    assert.ok(a.identity?.title)
    assert.equal('queries' in a, false)
    assert.ok(a.sourceFile)
  }
  assert.equal(identityFailures(root, ledger).length, 0)
})

test('derived manifest re-generates exactly the committed protection baseline', () => {
  const actual = selectProtectedAssets({ root, manifest, policy })
  assert.deepEqual(actual.assets, ledger.assets)
  assert.deepEqual(actual.unresolvedOwners, ledger.unresolvedOwners)
  assert.equal(actual.coveragePct, ledger.coveragePct)
  assert.equal(actual.citationsCovered, ledger.citationsCovered)
  assert.doesNotMatch(generator, /new Date\s*\(/)
})

test('unresolved aliases are reported, not misattributed to a different canonical article', () => {
  assert.ok(ledger.unresolvedOwners.some(a => a.url === '/articles/2c-b-effects/'))
  assert.ok(ledger.unresolvedOwners.some(a => a.url === '/articles/magnesium-types-for-sleep/'))
  assert.equal(sourceFileFor('/articles/2c-b-effects/', root), null)
  assert.equal(sourceFileFor('/articles/magnesium-types-for-sleep/', root), null)
  assert.equal(sourceFileFor('/articles/how-to-choose-supplement-quality/', root), 'content/articles/how-to-choose-supplement-quality.md')
  assert.equal(normalizeUrl('https://www.thehippiescientist.net/articles/mitragynine?from=bing'), '/articles/mitragynine/')
  assert.equal(normalizeUrl('https://malicious.example/articles/mitragynine/'), null)
})

test('changing protected title, H1, canonical or article slug fails safely', () => {
  const copy = JSON.parse(JSON.stringify(ledger))
  copy.assets[0].identity.title = 'Changed title'
  copy.assets[0].identity.canonical = '/guides/other/wrong/'
  copy.assets[0].identity.h1 = 'Changed H1'
  assert.ok(identityFailures(root, copy).some(x => /protected title changed/.test(x)))
  assert.ok(identityFailures(root, copy).some(x => /protected canonical changed/.test(x)))
  assert.ok(identityFailures(root, copy).some(x => /protected h1 changed/.test(x)))
  const article = JSON.parse(JSON.stringify(ledger))
  const a = article.assets.find(x => x.url === '/articles/mitragynine/')
  a.identity.slug = 'wrong-slug'
  assert.ok(identityFailures(root, article).some(x => /protected slug changed/.test(x)))
  const sample = '---\ntitle: "Mitragynine"\nslug: wrong-slug\n---\n# Data'
  assert.equal(extractIdentity(sample, 'content/articles/mitragynine.mdx', '/articles/mitragynine/'), null)
})

test('missing article title cannot earn a fake protected identity', () => {
  assert.equal(extractIdentity('---\nslug: mitragynine\n---\n# body', 'content/articles/mitragynine.mdx', '/articles/mitragynine/'), null)
})

test('canonical AI citation audit invokes the enforcing protected-asset validator', () => {
  const audit = readFileSync('scripts/ci/audit-ai-citation-readiness.mjs', 'utf8')
  assert.match(audit, /validate-ai-citation-protected-assets\.mjs/)
  const run = spawnSync(process.execPath, ['scripts/ci/validate-ai-citation-protected-assets.mjs'], { encoding: 'utf8' })
  assert.equal(run.status, 0, run.stdout + '\n' + run.stderr)
  assert.match(run.stdout, /PASS.*verified canonical source owners/)
})
