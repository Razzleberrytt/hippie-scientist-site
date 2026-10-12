import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { test } from 'vitest'
import { findCitationOwner, extractCitationIdentity } from '../ai-citation-protection-core.mjs'

const policy = JSON.parse(readFileSync('config/ai-citation-protection-policy.json', 'utf8'))
const ledger = JSON.parse(readFileSync('config/ai-citation-protected-assets.json', 'utf8'))
const audit = readFileSync('scripts/ci/audit-ai-citation-readiness.mjs', 'utf8')
const generator = readFileSync('scripts/seo/ai-citation-protected-assets.mjs', 'utf8')
const validation = readFileSync('scripts/ci/validate-ai-citation-protected-assets.mjs', 'utf8')
const core = readFileSync('scripts/seo/ai-citation-protection-core.mjs', 'utf8')

test('AI citation protection thresholds are configurable and bounded', () => {
  assert.equal(policy.version, 1)
  assert.ok(policy.minCitations > 0)
  assert.ok(policy.minCitationSharePct > 0 && policy.minCitationSharePct <= 100)
  assert.ok(policy.cumulativeCoveragePct > 0 && policy.cumulativeCoveragePct <= 100)
  assert.ok(policy.maxAssets > 0)
  assert.ok(policy.staleAfterDays > 0)
})

test('committed protected ledger is dated, real and does not publish private query exports', () => {
  assert.equal(ledger.version, 1)
  assert.equal(ledger.status, 'ready')
  assert.equal(ledger.sourceKind, 'owner-validated-derived-page-stats')
  assert.match(ledger.snapshotLabel, /^\d{4}-\d{2}-\d{2}$/)
  assert.ok(Array.isArray(ledger.assets) && ledger.assets.length > 0)
  assert.ok(Array.isArray(ledger.exceptions))
  assert.equal(ledger.coverage.selectedUrls, ledger.assets.length + ledger.exceptions.length)
  assert.ok(ledger.coverage.protectedSharePct >= policy.cumulativeCoveragePct)
  for (const asset of ledger.assets) {
    assert.match(asset.url, /^\//)
    assert.ok(asset.sourceFile && asset.identity?.title)
    assert.deepEqual(asset.protectedFields, Object.keys(asset.identity).sort())
    assert.equal('queries' in asset, false)
  }
  for (const exception of ledger.exceptions) {
    assert.ok(exception.url.startsWith('/') && exception.reason)
    assert.equal('queries' in exception, false)
  }
})

test('ledger generation is deterministic for unchanged source report', () => {
  assert.doesNotMatch(generator, /new Date\s*\(/)
  assert.match(generator, /generatedAt:\s*sourceReportGeneratedAt/)
  assert.match(generator, /--from-manifest/)
})

test('canonical AI-search audit invokes protected-asset identity validation', () => {
  assert.match(audit, /validate-ai-citation-protected-assets\.mjs/)
  const run = spawnSync(process.execPath, ['scripts/ci/validate-ai-citation-protected-assets.mjs'], { encoding: 'utf8' })
  assert.equal(run.status, 0, run.stdout + '\n' + run.stderr)
  assert.match(run.stdout, /PASS protected=/)
})

const article = (title, slug) =>
  '---\nslug: ' + slug + '\ntitle: "' + title + '"\n---\n\n# Reference text\n'
const staticPage = (title, canonical) =>
  "export const metadata = { title: '" + title + "', alternates: { canonical: '" + canonical + "' } }\n"

function fixture(sourceType, source, url, identity, mutate) {
  const dir = mkdtempSync(path.join(tmpdir(), 'ths-citation-protection-'))
  const relative = sourceType === 'article-frontmatter'
    ? 'content/articles/sample.md'
    : 'app/guides/sleep/sample/page.tsx'
  const sourceFile = path.join(dir, relative)
  const config = path.join(dir, 'config')
  try {
    mkdirSync(path.dirname(sourceFile), { recursive: true })
    mkdirSync(config, { recursive: true })
    mkdirSync(path.join(dir, 'scripts/ci'), { recursive: true })
    mkdirSync(path.join(dir, 'scripts/seo'), { recursive: true })
    writeFileSync(sourceFile, source)
    writeFileSync(path.join(dir, 'scripts/ci/validate-ai-citation-protected-assets.mjs'), validation)
    writeFileSync(path.join(dir, 'scripts/seo/ai-citation-protection-core.mjs'), core)
    writeFileSync(path.join(config, 'ai-citation-protection-policy.json'), JSON.stringify(policy))
    const asset = {
      url, sourceFile: relative, sourceType, citations: 100,
      identity, protectedFields: Object.keys(identity).sort(),
    }
    writeFileSync(path.join(config, 'ai-citation-protected-assets.json'), JSON.stringify({
      version: 1, status: 'ready', snapshotLabel: '2026-10-12',
      sourceReportGeneratedAt: null, sourceKind: 'owner-validated-derived-page-stats',
      sourcePath: 'config/ai-citation-swarm-priorities.json',
      coverage: { selectedUrls: 1, protectedUrls: 1, exceptionUrls: 0 },
      assets: [asset], exceptions: [],
    }))
    if (mutate != null) {
      if (mutate === 'delete') rmSync(sourceFile)
      else writeFileSync(sourceFile, mutate)
    }
    return spawnSync(process.execPath, ['scripts/ci/validate-ai-citation-protected-assets.mjs'], {
      cwd: dir, encoding: 'utf8',
    })
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

test('exact article .mdx owner requires slug equality and ignores similarly named blog files', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ths-article-citation-'))
  try {
    mkdirSync(path.join(dir, 'content/articles'), { recursive: true })
    mkdirSync(path.join(dir, 'content/blog'), { recursive: true })
    writeFileSync(path.join(dir, 'content/articles/mitragynine.mdx'), article('Verified', 'mitragynine'))
    writeFileSync(path.join(dir, 'content/blog/fake.mdx'), article('Not owned', 'fake'))
    assert.equal(findCitationOwner(dir, '/articles/mitragynine/')?.sourceFile, 'content/articles/mitragynine.mdx')
    assert.equal(findCitationOwner(dir, '/articles/fake/'), null)
    writeFileSync(path.join(dir, 'content/articles/mitragynine.mdx'), article('Verified', 'wrong-slug'))
    assert.equal(findCitationOwner(dir, '/articles/mitragynine/'), null)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('validator allows intact identity and rejects changed title or missing owner', () => {
  const url = '/guides/sleep/sample/'
  const before = staticPage('Original heading', url)
  const identity = extractCitationIdentity(before, 'next-page')
  assert.equal(fixture('next-page', before, url, identity).status, 0)
  const titleChange = fixture('next-page', before, url, identity, staticPage('Altered heading', url))
  assert.equal(titleChange.status, 1)
  assert.match(titleChange.stderr, /protected title changed/)
  const missingOwner = fixture('next-page', before, url, identity, 'delete')
  assert.equal(missingOwner.status, 1)
  assert.match(missingOwner.stderr, /source owner missing/)
})

test('validator rejects mutation of a published article slug', () => {
  const original = article('Sample evidence title', 'sample')
  const identity = extractCitationIdentity(original, 'article-frontmatter')
  const result = fixture('article-frontmatter', original, '/articles/sample/', identity,
    article('Sample evidence title', 'different-slug'))
  assert.equal(result.status, 1)
  assert.match(result.stderr, /source owner missing/)
})

test('citation metadata parser leaves unsupported fields unknown rather than inventing title', () => {
  const unknown = extractCitationIdentity('export default function Page() { return null }', 'next-page')
  assert.deepEqual(unknown, {})
  const titleConstant = [
    "const TITLE = 'Source-owned headline'",
    'export const metadata = buildPageMetadata({ title: compactMetaTitle(TITLE) })',
  ].join('\n')
  assert.equal(extractCitationIdentity(titleConstant, 'next-page').title, 'Source-owned headline')
})

test('stale and future-dated ledgers are citation-neutral, not invented new metrics', () => {
  assert.match(validation, /stale citation snapshot/)
  assert.match(validation, /Date\.now\(\)/)
  assert.match(validation, /sourceReportGeneratedAt \|\| ledger\.snapshotLabel/)
})

test('buildPageMetadata canonical paths are protected, including exact SLUG interpolation', () => {
  const literal = "export const metadata = buildPageMetadata({ title: 'A', path: '/guides/other/protein-powder-guide/' })"
  assert.equal(extractCitationIdentity(literal, 'next-page').canonical, '/guides/other/protein-powder-guide/')

  const tick = String.fromCharCode(96)
  const variable = String.fromCharCode(36, 123) + 'SLUG}'
  const template = [
    "const SLUG = 'sample'",
    "export const metadata = buildPageMetadata({ title: 'A', path: " +
      tick + '/guides/adhd/' + variable + '/' + tick + ' })',
  ].join('\n')
  const before = extractCitationIdentity(template, 'next-page')
  assert.equal(before.canonical, '/guides/adhd/sample/')
  assert.equal(fixture('next-page', template, '/guides/adhd/sample/', before).status, 0)
  const moved = template.replace("'sample'", "'renamed'")
  const mutation = fixture('next-page', template, '/guides/adhd/sample/', before, moved)
  assert.equal(mutation.status, 1)
  assert.match(mutation.stderr, /protected canonical changed/)
})

test('a path-scoped GitHub action enforces the guard for every canonical guide and article change', () => {
  const workflow = readFileSync('.github/workflows/ai-citation-identity-check.yml', 'utf8')
  assert.match(workflow, /pull_request:/)
  assert.match(workflow, /app\/\*\*\/page\.tsx/)
  assert.match(workflow, /content\/articles\/\*\*/)
  assert.match(workflow, /scripts\/ci\/validate-ai-citation-protected-assets\.mjs/)
  assert.match(workflow, /run: node scripts\/ci\/validate-ai-citation-protected-assets\.mjs/)
  assert.match(workflow, /head\.sha \|\| github\.sha/)
})
