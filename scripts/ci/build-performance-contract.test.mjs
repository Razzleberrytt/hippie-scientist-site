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
