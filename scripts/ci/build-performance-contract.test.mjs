import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')

describe('CI build performance contracts', () => {
  it('delegates PR and main-push Site Health validation to authoritative CI while retaining manual full defense', () => {
    const workflow = read('.github/workflows/check.yml')
    const fullCheckIndex = workflow.indexOf('run: npm run check:full')
    const fullCheckWindow = workflow.slice(Math.max(0, fullCheckIndex - 500), fullCheckIndex)

    expect(workflow).toContain(
      "if: github.event_name == 'pull_request' || (github.event_name == 'workflow_dispatch' && inputs.recovery_pr_number != '')",
    )
    expect(workflow).toContain('Delegate scoped exact-head validation to standard CI')
    expect(workflow).toContain('Delegate exact-main validation to standard CI')
    expect(fullCheckWindow).not.toContain("github.event_name == 'push'")
    expect(fullCheckWindow).toContain("github.event_name == 'workflow_dispatch' && inputs.recovery_pr_number == ''")
    expect(fullCheckWindow).not.toContain('steps.impact.outputs.release_sensitive')
  })

  it('moves unique release validators into CI and removes Atomic duplicate full builds', () => {
    const ci = read('.github/workflows/ci.yml')
    const atomic = read('.github/workflows/atomic-upgrade-gate.yml')

    for (const command of [
      'validate-indexability-metadata.mjs',
      'validate:evidence-language',
      'validate:profile-verdicts',
      'validate:claim-discipline',
      'validate:safety-visibility',
      'audit:data-governance:strict',
    ]) {
      expect(ci, command).toContain(command)
    }
    expect(ci).toContain('Run supplemental release-quality validators')
    const verifyIndex = ci.indexOf('name: Verify build output')
    const supplementalIndex = ci.indexOf('name: Run supplemental release-quality validators')
    expect(verifyIndex).toBeGreaterThan(-1)
    expect(supplementalIndex).toBeGreaterThan(verifyIndex)
    expect(atomic).toContain('Delegate release-quality suite to authoritative CI')
    expect(atomic).not.toContain('npm run validate:release')
    expect(atomic).not.toContain('npm ci --no-audit --fund=false')
  })

  it('reuses the governed main CI artifact instead of letting push consumers rebuild', () => {
    const ci = read('.github/workflows/ci.yml')
    expect(ci).toContain('EVENT_BEFORE_SHA: ${{ github.event.before }}')
    expect(ci).toContain('consumers=(lighthouse.yml production-content-lint.yml)')
    expect(ci).toContain('git fetch --no-tags --depth=1 origin "$BASE_SHA"')
    expect(ci).toContain("github.event_name == 'push' || steps.context.outputs.pr_number != ''")

    for (const path of [
      '.github/workflows/lighthouse.yml',
      '.github/workflows/production-content-lint.yml',
      '.github/workflows/production-content-invariants.yml',
      '.github/workflows/crawl-governance.yml',
      '.github/workflows/schema-media-governance.yml',
      '.github/workflows/technical-seo-monitor.yml',
    ]) {
      const workflow = read(path)
      const jobIf = workflow.split('\n').find((line) => line.trimStart().startsWith('if: github.event_name'))
      expect(jobIf, path).not.toContain("github.event_name != 'pull_request'")
      expect(jobIf, path).toContain("github.event_name == 'workflow_dispatch'")
    }
  })

  it('reuses controller-validated exact-tree PR evidence on main while failing closed for every other merge', () => {
    const workflow = read('.github/workflows/ci.yml')

    expect(workflow).toContain('statuses: read')
    expect(workflow).toContain('Resolve exact-tree main validation reuse')
    expect(workflow).toContain("if: github.event_name == 'push' && github.ref == 'refs/heads/main'")
    expect(workflow).toContain('continue-on-error: true')
    expect(workflow).toContain("DEPLOY_AUTH_ATTEMPTS: '1'")
    expect(workflow).toContain("DEPLOY_AUTH_INTERVAL_MS: '0'")
    expect(workflow).toContain('node scripts/ci/verify-deploy-authorization.mjs')
    expect(workflow).toContain("if: steps.merge-proof.outputs.skip_redundant_validation == 'true'")
    expect(workflow).toContain("steps.merge-proof.outputs.skip_redundant_validation != 'true' && steps.impact.outputs.docs_only != 'true'")
    expect(workflow).toContain('Reused exact-tree main validation')
    expect(workflow).toContain('exact merge-SHA production build authoritative')
    expect(workflow).toContain('Run related tests for leaf pages (vitest + explicit a11y gate)')
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
    expect(config).toContain("skipNextBuildTypecheck = process.env.SKIP_NEXT_BUILD_TYPECHECK === '1'")
    expect(config).toContain('ignoreBuildErrors: skipNextBuildTypecheck')
    expect(workflow).toContain("SKIP_NEXT_BUILD_TYPECHECK: '1'")
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

  it('indexes redirect-source lookups instead of rescanning every redirect for every link', () => {
    const audit = read('scripts/ci/audit-internal-links.mjs')

    expect(audit).toContain('const exactRedirectSources = new Set()')
    expect(audit).toContain('const redirectSourcePrefixes = []')
    expect(audit).toContain('exactRedirectSources.has(normalizedRoute)')
    expect(audit).not.toContain('redirectSourcePatterns.some((source)')
    expect(audit).toContain("process.env.VERBOSE_INTERNAL_LINK_AUDIT === '1'")
  })

  it('favors governed-artifact upload latency over default compression', () => {
    const workflow = read('.github/workflows/ci.yml')

    expect(workflow).toContain('compression-level: 1')
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
