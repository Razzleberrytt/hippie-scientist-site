import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('production deployment handoff contract', () => {
  it('uses successful main CI completion as the normal deploy handoff with workflow_dispatch fallback', () => {
    const workflow = read('.github/workflows/deploy.yml')

    expect(workflow).toContain('workflow_run:')
    expect(workflow).toContain('workflows: [CI]')
    expect(workflow).toContain('types: [completed]')
    expect(workflow).toContain('branches: [main]')
    expect(workflow).toContain('workflow_dispatch:')
    expect(workflow).not.toContain('  push:')
    expect(workflow).toContain("github.event.workflow_run.conclusion == 'success'")
  })

  it('pins production deployment to the exact CI head SHA or explicit fallback SHA', () => {
    const workflow = read('.github/workflows/deploy.yml')

    expect(workflow).toContain('DEPLOY_BRANCH: ${{ github.event.workflow_run.head_branch || github.ref_name }}')
    expect(workflow).toContain('DEPLOY_SHA: ${{ github.event.workflow_run.head_sha || github.sha }}')
    expect(workflow).toContain("CI_PRODUCER_RUN_ID: ${{ github.event.workflow_run.id || '' }}")
    expect(workflow).toContain('ref: ${{ env.DEPLOY_SHA }}')
  })

  it('lets an active production deploy finish but bounds how long it can monopolize the deploy group', () => {
    const workflow = read('.github/workflows/deploy.yml')

    expect(workflow).toContain('concurrency:')
    expect(workflow).toContain('group: deploy-${{ github.ref }}')
    expect(workflow).toContain('cancel-in-progress: false')
    expect(workflow).toContain('timeout-minutes: 60')
  })

  it('retains complete validation and self-build commands as the artifact fallback', () => {
    const workflow = read('.github/workflows/deploy.yml')

    for (const command of [
      'npm run test',
      'npm run data:ci',
      'npm run validate:workbook-source',
      'npm run validate:static-export',
      'npm run lint',
      'npm run typecheck',
      'npm run guard:source-of-truth',
      'npm run build:deploy',
      'npm run verify:output',
      'npm run audit:affiliate-tag-production',
    ]) {
      expect(workflow).toContain(command)
    }
    expect(workflow).toContain("if: steps.governed-verify.outcome != 'success'")
  })

  it('reuses only an exact-main CI governed export with producer, ancestry, hash, and build-state proof', () => {
    const workflow = read('.github/workflows/deploy.yml')
    const ci = read('.github/workflows/ci.yml')

    expect(workflow).toContain('actions: read')
    expect(workflow).toContain('Download exact-main governed export from CI')
    expect(workflow).toContain('name: governed-static-export-${{ env.DEPLOY_SHA }}')
    expect(workflow).toContain('run-id: ${{ env.CI_PRODUCER_RUN_ID }}')
    expect(workflow).toContain('Verify exact-main governed export')
    expect(workflow).toContain('producer_run_id')
    expect(workflow).toContain('EXPECTED_PRODUCER_RUN_ID')
    expect(workflow).toContain('git merge-base --is-ancestor "$base_sha" "$DEPLOY_SHA"')
    expect(workflow).toContain('node scripts/ci/governed-static-export.mjs verify')
    expect(workflow).toContain('--source-sha "$DEPLOY_SHA"')
    expect(workflow).toContain('--base-sha "$base_sha"')
    expect(workflow).toContain("if: steps.governed-verify.outcome != 'success' && steps.deploy-auth.outputs.skip_redundant_validation != 'true'")
    expect(workflow).toContain("METRICOOL_PUBLIC_MEDIA_ROOT: ${{ steps.governed-verify.outcome == 'success' && 'out/media/distribution/metricool' || 'public/media/distribution/metricool' }}")
    expect(ci).toContain('AMAZON_AFFILIATE_TAG: ${{ vars.AMAZON_AFFILIATE_TAG }}')
  })

  it('publishes and verifies an exact-SHA production receipt before deploy success', () => {
    const workflow = read('.github/workflows/deploy.yml')
    const verifier = read('scripts/ci/deployment-receipt.mjs')

    expect(workflow).toContain('Write exact deployment receipt')
    expect(workflow).toContain('DEPLOY_RECEIPT_PATH: ${{ env.STATIC_OUTPUT_DIR }}/.well-known/deployment.json')
    expect(workflow).toContain('node scripts/ci/deployment-receipt.mjs write')
    expect(workflow).toContain('Deploy to Cloudflare Pages')
    expect(workflow).toContain('Verify exact production receipt')
    expect(workflow).toContain('PRODUCTION_ORIGIN: https://thehippiescientist.net')
    expect(workflow).toContain('node scripts/ci/deployment-receipt.mjs verify')

    expect(verifier).toContain('receipt.commit === expectedCommit')
    expect(verifier).toContain('/.well-known/deployment.json')
    expect(verifier).toContain("cache: 'no-store'")
    expect(verifier).toContain('throw new Error(`Production did not expose exact deploy receipt')
  })
})
