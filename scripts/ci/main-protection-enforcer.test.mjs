import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const workflow = readFileSync('.github/workflows/enforce-main-protection.yml', 'utf8')
const siteHealthWorkflow = readFileSync('.github/workflows/check.yml', 'utf8')

const requiredChecks = [
  'Validation, tests, and data',
  'Production build, output, and SEO',
  'Site Health Check',
  'Atomic issue and measurement contract',
  'Full release suite for generator changes',
  'production-content-lint',
  'Compare generated quality with base',
]

describe('main protection enforcer contract', () => {
  it('never grants the ordinary GITHUB_TOKEN administrative write permission', () => {
    expect(workflow).toContain('permissions:\n  contents: read')
    expect(workflow).not.toMatch(/administration:\s*write/)
    expect(workflow).not.toMatch(/contents:\s*write/)
  })

  it('requires an explicit owner dispatch and dedicated admin secret', () => {
    expect(workflow).toContain('github.actor == github.repository_owner')
    expect(workflow).toContain('secrets.REPO_ADMIN_TOKEN')
    expect(workflow).toContain('PROTECT MAIN')
    expect(workflow).toContain('if [[ -z "${GH_TOKEN:-}" ]]')
  })

  it('requires real GitHub Actions check contexts instead of workflow display titles', () => {
    expect(workflow).toContain('"contexts": []')
    for (const check of requiredChecks) {
      expect(workflow).toContain(`{"context": "${check}", "app_id": 15368}`)
    }

    for (const staleWorkflowTitle of [
      '"CI",',
      '"Atomic upgrade gate",',
      '"Production Content Lint",',
      '"Build quality regression"',
    ]) {
      expect(workflow).not.toContain(staleWorkflowTitle)
    }
  })

  it('gives Site Health a unique emitted check context', () => {
    expect(siteHealthWorkflow).toMatch(/jobs:\n  check:\n    name: Site Health Check/)
  })

  it('pins every required check to the GitHub Actions app', () => {
    expect(workflow.match(/"app_id": 15368/g)).toHaveLength(requiredChecks.length)
    expect(workflow).toContain('.required_status_checks.checks[]')
    expect(workflow).toContain('.context == $check and .app_id == 15368')
  })

  it('does not statically require path-scoped or non-universal workflows', () => {
    for (const scopedCheck of [
      'Build Check',
      'Lighthouse CI',
      'Schema and Media Governance',
      'Technical SEO Monitor',
      'Crawl Governance',
      'Enrichment Governor',
    ]) {
      expect(workflow).not.toContain(`"${scopedCheck}"`)
    }
  })

  it('requires pull requests and blocks destructive branch mutations', () => {
    expect(workflow).toContain('"required_pull_request_reviews"')
    expect(workflow).toContain('"allow_force_pushes": false')
    expect(workflow).toContain('"allow_deletions": false')
    expect(workflow).toContain('"enforce_admins": true')
  })

  it('verifies live GitHub state after applying protection', () => {
    expect(workflow).toContain('repos/$REPO/branches/main/protection')
    expect(workflow).toContain("jq -e '.protected == true'")
    expect(workflow).toContain("jq -e '.required_status_checks.strict == true'")
    expect(workflow).toContain("jq -e '.enforce_admins.enabled == true'")
    expect(workflow).toContain("jq -e '.required_pull_request_reviews != null'")
  })
})
