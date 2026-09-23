import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { classifyReleaseImpact, isDocsOnlyPath, isLeafPagePath, isReleaseSensitivePath, isValidationOnlyPath } from './classify-release-impact.mjs'

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
    'lib/seo.ts',
    'lib/goal-seo.ts',
    'lib/schema-graph.ts',
    'lib/schema-injector.ts',
    'lib/runtime-data.ts',
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
    'lib/react-cache.ts',
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
      validationOnly: false,
      leafPageOnly: false,
      files: ['components/Header.tsx', 'public/data/herbs.json'],
    })
  })
})

describe('leaf-page-only classification', () => {
  it.each([
    'app/guides/adhd/saffron-for-adhd/page.tsx',
    'app/articles/example/page.ts',
    'app/(research)/sleep/melatonin/page.mdx',
  ])('treats %s as a leaf page', (file) => {
    expect(isLeafPagePath(file)).toBe(true)
  })

  it.each([
    'app/page.tsx',
    'app/(marketing)/page.tsx',
    'app/guides/page.tsx',
    'app/articles/[slug]/page.tsx',
    'app/articles/[...slug]/page.tsx',
    'app/articles/[[...slug]]/page.tsx',
    'app/@modal/example/page.tsx',
    'app/(.)preview/page.tsx',
    'app/_private/example/page.tsx',
    'app/guides/adhd/layout.tsx',
    'app/guides/adhd/route.ts',
    'app/guides/adhd/generateStaticParams.ts',
    'components/articles/ArticleLayout.tsx',
    'lib/seo.ts',
    'public/data/herbs.json',
    'package-lock.json',
  ])('does not treat %s as a leaf page', (file) => {
    expect(isLeafPagePath(file)).toBe(false)
  })

  it('is true only when every changed file is a deep static page leaf', () => {
    expect(classifyReleaseImpact([
      'app/guides/adhd/saffron-for-adhd/page.tsx',
      'app/guides/sleep/l-theanine/page.tsx',
    ]).leafPageOnly).toBe(true)
    expect(classifyReleaseImpact([
      'app/guides/adhd/saffron-for-adhd/page.tsx',
      'components/articles/ArticleLayout.tsx',
    ]).leafPageOnly).toBe(false)
    expect(classifyReleaseImpact([
      'app/guides/adhd/saffron-for-adhd/page.tsx',
      'app/articles/[slug]/page.tsx',
    ]).leafPageOnly).toBe(false)
  })

  it('fails closed for an empty diff', () => {
    expect(classifyReleaseImpact([]).leafPageOnly).toBe(false)
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

  it('skips the authoritative CI production build on docs-only PRs', () => {
    const yaml = fs.readFileSync(path.join(process.cwd(), '.github/workflows/ci.yml'), 'utf8')
    expect(yaml).toContain(classifierCommand)
    expect(yaml).toContain('npm run build:deploy')
    expect(yaml).toContain("steps.impact.outputs.docs_only != 'true'")
  })

  it('keeps production-content-invariants as an exact-artifact consumer with a fail-closed fallback', () => {
    const yaml = fs.readFileSync(path.join(process.cwd(), '.github/workflows/production-content-invariants.yml'), 'utf8')
    expect(yaml).toContain('Download governed static export')
    expect(yaml).toContain('Verify governed static export receipt and restore governed data')
    expect(yaml).toContain("if: steps.governed-verify.outcome != 'success'")
    expect(yaml).toContain('npm run build:deploy')
    expect(yaml).toContain("github.event.pull_request.head.repo.full_name != github.repository")
  })

  it('skips exhaustive CI validation only when the shared classifier proves docs-only', () => {
    const yaml = fs.readFileSync(path.join(process.cwd(), '.github/workflows/ci.yml'), 'utf8')

    expect(yaml).toContain('name: Classify validation impact')
    expect(yaml).toContain("if: github.event_name == 'pull_request'")
    expect(yaml).toContain("if: steps.impact.outputs.docs_only == 'true'")
    for (const command of [
      'npm ci --no-audit --fund=false',
      'npm run lint',
      'npm run typecheck',
      'npm run test 2>&1 | tee vitest.log',
      'npm run test:node',
      'npm run data:ci',
      'npm run guard:source-of-truth',
      'npm run audit:cluster-member-trust:strict',
      'npm run audit:high',
    ]) {
      const index = yaml.indexOf(command)
      expect(index, command).toBeGreaterThan(-1)
      const window = yaml.slice(Math.max(0, index - 240), index)
      expect(window, command).toContain("steps.impact.outputs.docs_only != 'true'")
    }
    expect(yaml).toContain('dedicated path-scoped governance checks remain authoritative')
  })

  it('keeps production-content-lint as a governed artifact consumer with a full self-build fallback', () => {
    const yaml = fs.readFileSync(path.join(process.cwd(), '.github/workflows/production-content-lint.yml'), 'utf8')
    expect(yaml).toContain('governed-static-export-${{ inputs.producer_sha }}')
    expect(yaml).toContain("if: steps.governed-verify.outcome != 'success'")
    expect(yaml).toContain('npm run build:deploy')
    expect(yaml).toContain("github.event.pull_request.head.repo.full_name != github.repository")
    expect(yaml).toContain("github.actor == 'dependabot[bot]'")
  })

  it('gives each classifier the exact base history it needs', () => {
    const ci = fs.readFileSync(path.join(process.cwd(), '.github/workflows/ci.yml'), 'utf8')
    expect(ci).toContain('fetch-depth: 1')
    expect(ci).toContain('BASE_SHA: ${{ github.event.pull_request.base.sha }}')
    expect(ci).toContain('BASE_SHA: ${{ steps.context.outputs.base_sha }}')
    expect(ci.match(/git fetch --no-tags --depth=1 origin "\$BASE_SHA"/g)?.length).toBeGreaterThanOrEqual(2)
    expect(ci.match(/git diff --name-only "\$BASE_SHA" HEAD/g)?.length).toBeGreaterThanOrEqual(2)

    const siteHealth = fs.readFileSync(path.join(process.cwd(), '.github/workflows/check.yml'), 'utf8')
    expect(siteHealth).toContain('fetch-depth: 0')

    const invariants = fs.readFileSync(path.join(process.cwd(), '.github/workflows/production-content-invariants.yml'), 'utf8')
    expect(invariants).toContain('fetch-depth: 1')
    expect(invariants).toContain('ref: ${{ inputs.producer_sha || github.sha }}')
    expect(invariants).toContain('Reject stale producer dispatch')
  })

  it('uses validation-only only for build-output-neutral control/security changes', () => {
    const ci = fs.readFileSync(path.join(process.cwd(), '.github/workflows/ci.yml'), 'utf8')
    const siteHealth = fs.readFileSync(path.join(process.cwd(), '.github/workflows/check.yml'), 'utf8')
    const atomic = fs.readFileSync(path.join(process.cwd(), '.github/workflows/atomic-upgrade-gate.yml'), 'utf8')

    expect(ci).toContain("if: steps.impact.outputs.validation_only == 'true'")
    expect(ci).toContain('Run focused control-plane tests')
    expect(ci).toContain('scripts/ci/autonomous-merge-refresh-safety.test.mjs')
    expect(ci).toContain('scripts/ci/autonomous-merge-authorization.test.mjs')
    expect(ci).toContain('scripts/ci/verify-deploy-authorization.test.mjs')
    expect(ci).toContain('tests/autonomous-merge-controller-contract.test.ts')
    expect(ci).toContain('tests/deployment-handoff-contract.test.ts')
    expect(ci).toContain('npm run audit:high')
    expect(ci).toContain("if: steps.impact.outputs.docs_only != 'true' && steps.impact.outputs.validation_only != 'true'")
    expect(siteHealth).toContain('Delegate scoped exact-head validation to standard CI')
    expect(siteHealth).not.toContain("steps.impact.outputs.validation_only != 'true'")
    expect(atomic).toContain('name: Validation-only fast path')
    expect(atomic).toContain("steps.impact.outputs.validation_only != 'true'")
  })

  it('uses the leaf-page fast path only to remove duplicate exhaustive suites', () => {
    const siteHealth = fs.readFileSync(path.join(process.cwd(), '.github/workflows/check.yml'), 'utf8')
    const atomic = fs.readFileSync(path.join(process.cwd(), '.github/workflows/atomic-upgrade-gate.yml'), 'utf8')
    const invariants = fs.readFileSync(path.join(process.cwd(), '.github/workflows/production-content-invariants.yml'), 'utf8')

    expect(siteHealth).toContain('Delegate scoped exact-head validation to standard CI')
    expect(siteHealth).toContain('Leaf-page-only change; CI production build/output/SEO remains authoritative')
    expect(atomic).toContain("steps.impact.outputs.leaf_page_only != 'true'")
    expect(atomic).toContain('Leaf-page-only change; skip duplicate full release suite')
    expect(invariants).toContain('Download governed static export')
    expect(invariants).toContain('Same-repository PRs reuse the exact governed CI export instead of rebuilding the site.')
  })

  it('uses dependency-related Vitest selection only for proven leaf-page-only diffs', () => {
    const ci = fs.readFileSync(path.join(process.cwd(), '.github/workflows/ci.yml'), 'utf8')

    expect(ci).toContain('Run related tests for leaf pages (vitest + explicit a11y gate)')
    expect(ci).toContain("steps.impact.outputs.leaf_page_only == 'true'")
    expect(ci).toContain('npx vitest related "${changed_files[@]}" --run --passWithNoTests')
    expect(ci).toContain('npx vitest run app/__tests__/a11y.test.tsx')
    expect(ci).toContain('Run full tests (vitest + a11y gate)')
    expect(ci).toContain("steps.impact.outputs.leaf_page_only != 'true'")
    expect(ci).toContain('npm run test 2>&1 | tee vitest.log')
    expect(ci).toContain('npm run test:node')
    expect(ci).toContain('npm run data:ci')
    expect(ci).toContain('npm run audit:high')
    expect(ci).toContain('production build/output/SEO remains authoritative')
  })
})

describe('validation-only classification', () => {
  it.each([
    'docs/CURRENT_SPRINT.md',
    'docs/MASTER_BACKLOG.md',
    'docs/ROADMAP.md',
    'docs/ops/project-control-reconciliation.md',
    'ops/project-control/admission-transaction.json',
    'scripts/ci/reconcile-project-control.mjs',
    'scripts/ci/reconcile-project-control.test.mjs',
    'scripts/ci/validate-project-control-admission.mjs',
    'scripts/ci/validate-project-control-admission.test.mjs',
    '.github/workflows/project-control-reconciliation.yml',
    '.github/workflows/autonomous-merge-controller.yml',
    'scripts/ci/autonomous-merge-controller.mjs',
    'scripts/ci/autonomous-merge-refresh-safety.test.mjs',
    'scripts/ci/autonomous-merge-authorization.test.mjs',
    'scripts/ci/verify-deploy-authorization.mjs',
    'scripts/ci/verify-deploy-authorization.test.mjs',
    'tests/autonomous-merge-controller-contract.test.ts',
    'tests/deployment-handoff-contract.test.ts',
    'security/audit-allowlist.json',
    'security/audit-allowlist.d/mdx.json',
    'ops/enrichment-governor/work-queue.json',
    'ops/enrichment-governor/quarantine.json',
    'ops/enrichment-governor/ledger.jsonl',
    'ops/enrichment-governor/transactions/35635724269-1-acquire-lease.json',
  ])('treats %s as unable to change public build output', (file) => {
    expect(isValidationOnlyPath(file)).toBe(true)
  })

  it.each([
    '.github/workflows/ci.yml',
    'scripts/enrichment-governor/control.mjs',
    'scripts/enrichment-governor/lease-transaction.mjs',
    'ops/enrichment-governor/README.md',
    'scripts/ci/validate-route-seo.mjs',
    'scripts/build-deploy.mjs',
    'next.config.mjs',
    'package.json',
    'app/page.tsx',
    'components/Header.tsx',
    'public/data/herbs.json',
  ])('fails %s closed to normal validation/build', (file) => {
    expect(isValidationOnlyPath(file)).toBe(false)
  })

  it('permits mixed control docs and exact validation-only control surfaces', () => {
    const result = classifyReleaseImpact([
      'docs/CURRENT_SPRINT.md',
      'scripts/ci/validate-project-control-admission.mjs',
      'security/audit-allowlist.json',
    ])
    expect(result.validationOnly).toBe(true)
    expect(result.docsOnly).toBe(false)
  })

  it('fails closed when any build-affecting source rides along', () => {
    expect(classifyReleaseImpact([
      'docs/CURRENT_SPRINT.md',
      'scripts/ci/validate-project-control-admission.mjs',
      'components/Header.tsx',
    ]).validationOnly).toBe(false)
  })

  it('fails closed for an empty diff', () => {
    expect(classifyReleaseImpact([]).validationOnly).toBe(false)
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
    expect(result.validationOnly).toBe(false)
    expect(result.releaseSensitive).toBe(false)
    expect(result.leafPageOnly).toBe(false)
  })

  it('is not docs-only when a single source file rides along', () => {
    const result = classifyReleaseImpact(['docs/a.md', 'components/Navigation.tsx'])
    expect(result.docsOnly).toBe(false)
  })

  it('is not docs-only for an empty diff', () => {
    expect(classifyReleaseImpact([]).docsOnly).toBe(false)
  })
})

describe('CLI writes all signals to $GITHUB_OUTPUT', () => {
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
      validation_only: 'false',
      leaf_page_only: 'false',
    })
  })

  it('reports docs_only=false as soon as source rides along', () => {
    expect(run(['docs/a.md', 'components/Navigation.tsx'])).toEqual({
      release_sensitive: 'false',
      docs_only: 'false',
      validation_only: 'false',
      leaf_page_only: 'false',
    })
  })

  it('reports validation_only=true only for the narrow control/security surface', () => {
    expect(run([
      'docs/CURRENT_SPRINT.md',
      'scripts/ci/validate-project-control-admission.mjs',
      'security/audit-allowlist.json',
    ])).toEqual({
      release_sensitive: 'true',
      docs_only: 'false',
      validation_only: 'true',
      leaf_page_only: 'false',
    })
  })

  it('reports release_sensitive=true for generated runtime data', () => {
    expect(run(['public/data/herbs.json'])).toEqual({
      release_sensitive: 'true',
      docs_only: 'false',
      validation_only: 'false',
      leaf_page_only: 'false',
    })
  })

  it('reports leaf_page_only=true for an isolated research page', () => {
    expect(run(['app/guides/adhd/saffron-for-adhd/page.tsx'])).toEqual({
      release_sensitive: 'true',
      docs_only: 'false',
      validation_only: 'false',
      leaf_page_only: 'true',
    })
  })
})

describe('workbook patch proposals stay validated', () => {
  it('never gates the patch validator on docs_only', () => {
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
