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
