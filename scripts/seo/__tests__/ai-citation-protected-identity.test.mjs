import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { test } from 'vitest'
import { extractCitationIdentity, findCitationOwner, normalizeCitationPath } from '../ai-citation-protected-identity.mjs'

const withFixture = (fn) => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'ths-citation-protection-'))
  const write = (relative, value) => {
    const target = path.join(root, relative)
    mkdirSync(path.dirname(target), { recursive: true })
    writeFileSync(target, value)
  }
  try { fn({ root, write }) } finally { rmSync(root, { recursive: true, force: true }) }
}

test('static guides require stable metadata title, resolved canonical and canonical owner', () => withFixture(({root, write}) => {
  const file = 'app/guides/sleep/sample/page.tsx'
  const fixture = "const SLUG = 'sample'\nconst TITLE = 'Guide Title'\nexport const metadata = buildPageMetadata({title: TITLE, path: '/guides/sleep/' + SLUG})\n<h1>{TITLE}</h1>\n"
  write(file, fixture)
  // Unresolvable dynamic concatenation is not silently considered protected.
  assert.equal(findCitationOwner(root, '/guides/sleep/sample/').identity, null)
  const fixed = fixture.replace("path: '/guides/sleep/' + SLUG", "path: '/guides/sleep/sample/'")
  write(file, fixed)
  assert.deepEqual(findCitationOwner(root, '/guides/sleep/sample/').identity, {
    kind: 'tsx', title: 'Guide Title', h1: 'Guide Title', slug: 'sample', canonical: '/guides/sleep/sample/',
  })
  write(file, fixed.replace("'/guides/sleep/sample/'", "'/guides/sleep/other/'"))
  assert.equal(findCitationOwner(root, '/guides/sleep/sample/').identity, null)
}))

test('article frontmatter resolves both markdown and blog MDX and rejects slug drift', () => withFixture(({root, write}) => {
  const md = 'content/articles/example.md'
  write(md, '---\nslug: example\ntitle: "Evidence Guide"\n---\n\nEdited scientific discussion.')
  const identity = findCitationOwner(root, '/articles/example/')
  assert.equal(identity.sourceFile, md)
  assert.equal(identity.identity.title, 'Evidence Guide')
  assert.equal(identity.identity.h1, null) // runtime renders page.title; not parsed as literal markdown H1
  write(md, '---\nslug: other\ntitle: "Evidence Guide"\n---\nBody')
  assert.equal(findCitationOwner(root, '/articles/example/').identity, null)
  write('content/blog/2c-b-example.mdx', '---\nslug: "2c-b-example"\ntitle: "2C-B: Verified Facts"\n---\nBody')
  const blog = findCitationOwner(root, '/articles/2c-b-example/')
  assert.equal(blog.sourceFile, 'content/blog/2c-b-example.mdx')
  assert.equal(blog.identity.kind, 'blog-mdx')
}))

test('old article URL records a literal 301 to its actual canonical owner', () => withFixture(({root, write}) => {
  write('public/_redirects', [
    '/articles/magnesium-sleep /guides/sleep/magnesium-sleep/ 301',
    '/articles/magnesium-sleep/ /guides/sleep/magnesium-sleep/ 301',
  ].join('\n'))
  const owner = findCitationOwner(root, '/articles/magnesium-sleep/')
  assert.equal(owner.sourceFile, 'public/_redirects')
  assert.equal(owner.identity.canonical, '/guides/sleep/magnesium-sleep/')
  write('public/_redirects', '/articles/magnesium-sleep /guides/other/magnesium/ 301')
  assert.equal(findCitationOwner(root, '/articles/magnesium-sleep/').identity.canonical, '/guides/other/magnesium/')
}))

test('canonical inputs reject unexpected domains, query strings and unsafe paths', () => {
  assert.equal(normalizeCitationPath('https://www.thehippiescientist.net/articles/example'), '/articles/example/')
  for (const url of ['https://unrelated.test/articles/a/', '/articles/a/?id=2', '//bad.test/path', '/articles/../a']) {
    assert.throws(() => normalizeCitationPath(url))
  }
})

test('ready ledger protects actual static and Markdown sources without raw Bing query exports', () => {
  const ledger = JSON.parse(readFileSync('config/ai-citation-protected-assets.json', 'utf8'))
  assert.equal(ledger.status, 'ready')
  assert.equal(ledger.snapshotLabel, '2026-10-12')
  assert.equal(ledger.assets.length, 25)
  assert.equal(new Set(ledger.assets.map(asset => asset.url)).size, 25)
  assert.equal(ledger.assets.find(asset => asset.url === '/articles/2c-b-effects/').sourceFile, 'content/blog/2c-b-effects.mdx')
  assert.equal(ledger.assets.find(asset => asset.url === '/articles/magnesium-types-for-sleep/').identity.kind, 'redirect')
  for (const item of ledger.assets) {
    assert.ok(existsSync(item.sourceFile), 'missing source: ' + item.sourceFile)
    assert.ok(item.identity.kind && item.identity.slug && item.identity.canonical, 'incomplete identity: ' + item.url)
    assert.ok(item.identity.kind === 'redirect' || item.identity.title, 'missing title: ' + item.url)
    assert.ok(item.fingerprints && item.fingerprints.slug, 'missing digest: ' + item.url)
    assert.equal('queries' in item, false)
  }
  const run = spawnSync(process.execPath, ['scripts/ci/validate-ai-citation-protected-assets.mjs'], { encoding: 'utf8' })
  assert.equal(run.status, 0, run.stdout + '\n' + run.stderr)
})

test('source identity ignores body revisions but detects actual title and canonical drift', () => {
  const before = "---\nslug: foo\ntitle: 'Original source title'\n---\nScientific observation A"
  const after = before.replace('Scientific observation A', 'Scientific observation B')
  assert.deepEqual(extractCitationIdentity(before, 'content/articles/foo.md', '/articles/foo/'), extractCitationIdentity(after, 'content/articles/foo.md', '/articles/foo/'))
  assert.notDeepEqual(extractCitationIdentity(before, 'content/articles/foo.md', '/articles/foo/'), extractCitationIdentity(before.replace('Original source title', 'Retitled without migration'), 'content/articles/foo.md', '/articles/foo/'))
})


test('delegated stress H1 is fingerprinted from its actual shared renderer', () => withFixture(({root, write}) => {
  write('app/guides/best/supplements-for-stress/page.tsx',
    "import BestSupplementsForStressPage from '../../anxiety/best-supplements-for-stress/page'\nconst CANONICAL_PATH = '/guides/best/supplements-for-stress/'\nexport const metadata = { title: 'Best Stress Guide', alternates: { canonical: CANONICAL_PATH } }\nexport default BestSupplementsForStressPage")
  const delegate = 'app/guides/anxiety/best-supplements-for-stress/page.tsx'
  write(delegate, '<h1 className="title">Actual stress heading</h1>')
  const before = findCitationOwner(root, '/guides/best/supplements-for-stress/')
  assert.equal(before.identity.h1, 'Actual stress heading')
  assert.equal(before.identity.headingSourceFile, delegate)
  write(delegate, '<h1 className="title">Unexpected changed heading</h1>')
  assert.equal(findCitationOwner(root, '/guides/best/supplements-for-stress/').identity.h1, 'Unexpected changed heading')
}))

test('ADHD H1 follows exact article title and verifies the binding to its renderer', () => withFixture(({root, write}) => {
  write('app/guides/adhd/l-theanine-for-adhd/page.tsx', [
    "const SLUG = 'l-theanine-for-adhd'",
    "export const metadata = buildPageMetadata({title: 'L-Theanine for ADHD', path: '/guides/adhd/l-theanine-for-adhd/'})",
    'return <FocusAdhdArticlePage slug={SLUG} />',
  ].join('\n'))
  write('components/articles/FocusAdhdArticlePage.tsx', '<h1 className="title">{article.title}</h1>')
  const model = 'lib/focus-adhd-articles.ts'
  write(model, "export const articles = [{slug: 'l-theanine-for-adhd', title: 'Real article title'}]")
  const initial = findCitationOwner(root, '/guides/adhd/l-theanine-for-adhd/')
  assert.equal(initial.identity.h1, 'Real article title')
  assert.equal(initial.identity.headingSourceFile, model)
  write(model, "export const articles = [{slug: 'l-theanine-for-adhd', title: 'Different article title'}]")
  assert.equal(findCitationOwner(root, '/guides/adhd/l-theanine-for-adhd/').identity.h1, 'Different article title')
  write('components/articles/FocusAdhdArticlePage.tsx', '<h1 className="title">Hardcoded alternative</h1>')
  assert.equal(findCitationOwner(root, '/guides/adhd/l-theanine-for-adhd/').identity, null)
}))
