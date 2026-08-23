import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { classifyReleaseImpact, isDocsOnlyPath, isReleaseSensitivePath } from './classify-release-impact.mjs'

describe('release impact classification', () => {
  it.each([
    'scripts/data/build-runtime-from-workbook.mjs',
    'scripts/ci/validate-route-seo.mjs',
    'scripts/build-deploy.mjs',
    'app/page.tsx',
    'app/layout.tsx',
    'app/not-found.tsx',
    'app/global-error.tsx',
    'app/guides/example/page.tsx',
    'app/guides/example/layout.tsx',
    'app/(marketing)/loading.tsx',
    'app/@modal/default.tsx',
    'app/api/search/route.ts',
    'app/route.ts',
    'app/sitemap.ts',
    'app/blog/sitemap.ts',
    'app/robots.ts',
    'app/manifest.ts',
    'app/feed.ts',
    'app/favicon.ico',
    'app/icon.tsx',
    'app/icon2.png',
    'app/apple-icon.tsx',
    'app/opengraph-image.tsx',
    'app/products/opengraph-image.tsx',
    'app/twitter-image.jpg',
    'app/guides/generateStaticParams.ts',
    'app/generateStaticParams.mjs',
    'lib/seo/canonical.ts',
    'lib/semantic-schema-graph.ts',
    'src/lib/seo.ts',
    'src/lib/goal-seo.ts',
    'src/lib/schema-graph.ts',
    'src/lib/schema-injector.ts',
    'src/lib/runtime-data.ts',
    'public/data/herbs.json',
    'public/_redirects',
    'public/_headers',
    'next.config.mjs',
    'package.json',
    'package-lock.json',
  ])('classifies %s as release-sensitive', (file) => {
    expect(isReleaseSensitivePath(file)).toBe(true)
  })

  it.each([
    'app/guides/example/GuideClient.tsx',
    'app/guides/example/components/DecisionTable.tsx',
    'app/lib/client-state.ts',
    'components/Header.tsx',
    'src/lib/react-cache.ts',
    'docs/build-and-verification.md',
    'styles/globals.css',
    '.github/workflows/lighthouse.yml',
    'public/hero-illustration.jpg',
  ])('classifies %s as standard-CI-only', (file) => {
    expect(isReleaseSensitivePath(file)).toBe(false)
  })

  it('normalizes, deduplicates, and reports the sensitive subset', () => {
    expect(classifyReleaseImpact([
      ' components/Header.tsx ',
      'public\\data\\herbs.json',
      'public/data/herbs.json',
      '',
    ])).toEqual({
      releaseSensitive: true,
      sensitiveFiles: ['public/data/herbs.json'],
      docsOnly: false,
      files: ['components/Header.tsx', 'public/data/herbs.json'],
    })
  })
})

describe('workflow release-impact contract', () => {
  const classifierCommand = 'node scripts/ci/classify-release-impact.mjs --github-output="$GITHUB_OUTPUT"'

  it.each([
    '.github/workflows/check.yml',
    '.github/workflows/atomic-upgrade-gate.yml',
  ])('%s consumes the shared classifier', (workflow) => {
    const yaml = fs.readFileSync(path.join(process.cwd(), workflow), 'utf8')
    expect(yaml).toContain(classifierCommand)
    expect(yaml).toContain('steps.impact.outputs.release_sensitive')
  })

  it.each([
    ['.github/workflows/ci.yml', 'npm run build:deploy'],
    ['.github/workflows/production-content-lint.yml', 'npm run build:deploy'],
    ['.github/workflows/production-content-invariants.yml', 'node scripts/build-production.mjs'],
  ])('%s skips its production build on docs-only PRs', (workflow, heavyCommand) => {
    // Nine workflows each ran their own `build:deploy`. A PR that changed only
    // prose still paid for every one of them, which is what made docs-only PRs
    // take ~25 minutes.
    const yaml = fs.readFileSync(path.join(process.cwd(), workflow), 'utf8')
    expect(yaml).toContain(classifierCommand)
    expect(yaml).toContain(heavyCommand)
    expect(yaml).toContain("steps.impact.outputs.docs_only != 'true'")
  })

  it('gives the classifier the history it needs to diff against the base ref', () => {
    // `git diff origin/$BASE_REF...HEAD` returns nothing useful on a shallow
    // clone, and an empty diff classifies as not-docs-only — so a missing
    // fetch-depth degrades to running everything rather than skipping wrongly,
    // but it also silently defeats the optimization.
    for (const workflow of [
      '.github/workflows/ci.yml',
      '.github/workflows/production-content-lint.yml',
      '.github/workflows/production-content-invariants.yml',
      '.github/workflows/check.yml',
    ]) {
      const yaml = fs.readFileSync(path.join(process.cwd(), workflow), 'utf8')
      expect(yaml, workflow).toContain('fetch-depth: 0')
    }
  })
})

describe('docs-only classification', () => {
  it.each([
    'docs/audits/enrichment-datasets-2026-08-23.md',
    'ops/reports/citation-review-candidates.json',
    'data-sources/workbook-patches/enrichment-2026-08-23-grounded-summaries.json',
    'data-sources/workbook-patches/README.md',
    'README.md',
    'LICENSE',
  ])('treats %s as unable to change built output', (file) => {
    expect(isDocsOnlyPath(file)).toBe(true)
  })

  it.each([
    'components/Navigation.tsx',
    'app/page.tsx',
    'lib/runtime-visibility.ts',
    'public/data/herbs.json',
    'data-sources/herb_monograph_master.xlsx',
    'package.json',
  ])('does not treat %s as docs-only', (file) => {
    expect(isDocsOnlyPath(file)).toBe(false)
  })

  it('is docs-only when every changed file is documentation', () => {
    const result = classifyReleaseImpact([
      'docs/audits/x.md',
      'data-sources/workbook-patches/y.json',
    ])
    expect(result.docsOnly).toBe(true)
    expect(result.releaseSensitive).toBe(false)
  })

  it('is not docs-only when a single source file rides along', () => {
    // The whole point: one component change must still run the full suite,
    // even though `components/` is not release-sensitive.
    const result = classifyReleaseImpact(['docs/a.md', 'components/Navigation.tsx'])
    expect(result.docsOnly).toBe(false)
  })

  it('is not docs-only for an empty diff', () => {
    // With nothing to inspect the safe answer is to run everything.
    expect(classifyReleaseImpact([]).docsOnly).toBe(false)
  })
})

describe('CLI writes both signals to $GITHUB_OUTPUT', () => {
  // The workflow guards read `steps.impact.outputs.docs_only`. An unwritten
  // output reads as empty, which passes `!= 'true'` and silently runs
  // everything -- safe, but it would defeat the optimization without failing
  // anything, so it has to be asserted rather than assumed.
  function run(files) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-impact-'))
    const outputPath = path.join(dir, 'github-output')
    fs.writeFileSync(outputPath, '')
    execFileSync(
      process.execPath,
      ['scripts/ci/classify-release-impact.mjs', `--github-output=${outputPath}`],
      { input: `${files.join('\n')}\n`, cwd: process.cwd(), stdio: ['pipe', 'ignore', 'pipe'] },
    )
    const written = fs.readFileSync(outputPath, 'utf8')
    fs.rmSync(dir, { recursive: true, force: true })
    return Object.fromEntries(
      written.split('\n').filter(Boolean).map((line) => line.split('=')),
    )
  }

  it('reports docs_only=true for a documentation-only diff', () => {
    expect(run(['docs/a.md', 'ops/reports/b.json'])).toEqual({
      release_sensitive: 'false',
      docs_only: 'true',
    })
  })

  it('reports docs_only=false as soon as source rides along', () => {
    expect(run(['docs/a.md', 'components/Navigation.tsx'])).toEqual({
      release_sensitive: 'false',
      docs_only: 'false',
    })
  })

  it('reports release_sensitive=true for generated runtime data', () => {
    expect(run(['public/data/herbs.json'])).toEqual({
      release_sensitive: 'true',
      docs_only: 'false',
    })
  })
})

describe('workbook patch proposals stay validated', () => {
  it('never gates the patch validator on docs_only', () => {
    // `data-sources/workbook-patches/*.json` is classified docs-only, which is
    // safe only because the patch schema is still enforced. If that gate ever
    // learned to skip, proposals would merge unvalidated.
    const workflows = fs
      .readdirSync(path.join(process.cwd(), '.github', 'workflows'))
      .filter((name) => name.endsWith('.yml'))
      .map((name) => ({
        name,
        yaml: fs.readFileSync(path.join(process.cwd(), '.github', 'workflows', name), 'utf8'),
      }))

    const validators = workflows.filter(({ yaml }) =>
      yaml.includes('Validate patch proposals against current workbook'),
    )
    expect(validators.map((w) => w.name)).toContain('workbook-patch-check.yml')
    for (const { name, yaml } of validators) {
      expect(yaml, name).not.toContain('docs_only')
    }
  })
})
