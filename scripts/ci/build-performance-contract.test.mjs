import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')

describe('CI build performance contracts', () => {
  it('classifies recovery-dispatched Site Health runs before choosing the full release path', () => {
    const workflow = read('.github/workflows/check.yml')

    expect(workflow).toContain(
      "if: github.event_name == 'pull_request' || (github.event_name == 'workflow_dispatch' && inputs.recovery_pr_number != '')",
    )
    expect(workflow).toContain("BASE_REF: ${{ github.base_ref || 'main' }}")
    expect(workflow).toContain(
      "github.event_name == 'workflow_dispatch' && inputs.recovery_pr_number == ''",
    )
    expect(workflow).toContain('Delegate scoped exact-head validation to standard CI')
  })

  it('uses the full public GitHub runner only inside GitHub Actions', () => {
    const config = read('next.config.mjs')

    expect(config).toContain("process.env.GITHUB_ACTIONS === 'true' ? 4 : 2")
    expect(config).toContain('cpus: staticGenerationCpus')
  })

  it('uses exact-base shallow checkout instead of fetching every repository branch', () => {
    const workflow = read('.github/workflows/ci.yml')

    expect(workflow).not.toContain('fetch-depth: 0')
    expect(workflow.match(/fetch-depth: 1/g)?.length).toBeGreaterThanOrEqual(2)
    expect(workflow).toContain('git fetch --no-tags --depth=1 origin "$BASE_SHA"')
    expect(workflow).toContain('git diff --name-only "$BASE_SHA" HEAD')
    expect(workflow).not.toContain('git diff --name-only "origin/$BASE_REF"...HEAD')
  })

  it('does not re-encode responsive images after build-deploy has integrity-checked them', () => {
    const deploy = read('scripts/build-deploy.mjs')
    const production = read('scripts/build-production.mjs')

    expect(deploy).toContain("if (step.name === 'optimize-images') responsiveImagesReady = true")
    expect(deploy).toContain("RESPONSIVE_IMAGES_READY: '1'")
    expect(production).toContain("process.env.RESPONSIVE_IMAGES_READY === '1'")
    expect(production).toContain("execSync('node scripts/optimize-images.mjs'")
  })

  it('bounds higher static-page concurrency to GitHub Actions only', () => {
    const config = read('next.config.mjs')

    expect(config).toContain("staticGenerationMaxConcurrency = process.env.GITHUB_ACTIONS === 'true' ? 12 : 8")
    expect(config).toContain('staticGenerationMaxConcurrency,')
  })

  it('does not duplicate the dedicated CI typecheck inside the GitHub Next build', () => {
    const config = read('next.config.mjs')
    const workflow = read('.github/workflows/ci.yml')

    expect(workflow).toContain('Run typecheck')
    expect(workflow).toContain('npm run typecheck')
    expect(config).toContain("skipNextBuildTypecheck = process.env.GITHUB_ACTIONS === 'true'")
    expect(config).toContain('ignoreBuildErrors: skipNextBuildTypecheck')
  })

  it('parallelizes output verification without removing any acceptance check', () => {
    const pkg = JSON.parse(read('package.json'))
    const verifier = read('scripts/ci/verify-output-parallel.mjs')

    expect(pkg.scripts['verify:output']).toBe('node scripts/ci/verify-output-parallel.mjs')
    for (const fragment of [
      'validate:static-export',
      'validate-public-json-imports.mjs',
      'validate-quarantine-imports.mjs',
      'validate-direct-dependencies.mjs',
      'validate-xlsx-boundary.mjs',
      'validate-security-headers.mjs',
      'verify-generated-data.mjs',
      'validate-guide-related.mjs',
      'validate-route-seo.mjs',
      'validate-canonical-host.mjs',
      'validate-route-governance.mjs',
      'validate-dangerously-set-inner-html.mjs',
      'verify-core-routes.mjs',
      'verify-redirects.mjs',
      'audit-profile-robots.mjs',
      'validate-deploy-readiness.mjs',
      'validate-build-seo-metadata.mjs',
      'audit-metadata-duplicates.mjs',
      'audit-internal-links.mjs',
      'validate-internal-links.mjs',
      'validate-hub-child-coverage.mjs',
      'audit-structured-data.mjs',
      'audit-seo-routes.mjs',
      'validate-guide-faqs.mjs',
      'validate-sitemap.mjs --require-built',
      'validate-sitemap-completeness.mjs --require-built',
      'validate-robots.mjs --require-built',
      'validate-feed-output.mjs',
      'audit:sitemap-affiliate',
      'validate:pagefind-body',
      'validate:cluster-member-export',
      'report-performance-budget.mjs',
    ]) {
      expect(verifier, fragment).toContain(fragment)
    }
    expect(verifier).toContain("runPhase('prebuild', PREBUILD_GROUPS)")
    expect(verifier).toContain("runPhase('postbuild', POSTBUILD_GROUPS)")
    expect(verifier).toContain('await Promise.all([\n    runPhase')
    expect(verifier).toContain('Promise.all(groups.map')
  })

  it('persists only integrity-checked build intermediates on the production build lane', () => {
    const workflow = read('.github/workflows/ci.yml')
    const manager = read('scripts/cache/build-cache-manager.mjs')
    const deploy = read('scripts/build-deploy.mjs')

    expect(workflow).toContain('Restore deterministic build intermediates')
    expect(workflow).toContain('.build-cache')
    expect(workflow).toContain('public/images/optimized')
    expect(workflow).toContain('build-deploy-intermediates-v1')

    expect(manager).toContain(
      'async shouldRunStep(stepName, inputPatterns = [], outputPatterns = [], config = {})',
    )
    expect(manager).toContain('currentOutputHash !== cached.outputHash')
    expect(deploy).toContain(
      'cache.shouldRunStep(step.name, step.inputs || [], step.outputs || [])',
    )
    expect(deploy).not.toContain('outputPatternsPresent(')
  })
})
