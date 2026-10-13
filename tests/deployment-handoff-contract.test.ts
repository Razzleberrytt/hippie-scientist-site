import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('production deployment handoff contract', () => {
  it('requires a live regional privacy smoke check after the exact deployment receipt', () => {
    const workflow = read('.github/workflows/deploy.yml')
    const receipt = workflow.indexOf('- name: Verify exact production receipt')
    const privacy = workflow.indexOf('- name: Verify live regional privacy controls')
    const indexNow = workflow.indexOf('- name: Notify IndexNow of changed URLs')

    expect(receipt).toBeGreaterThan(-1)
    expect(privacy).toBeGreaterThan(receipt)
    expect(indexNow).toBeGreaterThan(privacy)
    expect(workflow.slice(privacy, indexNow)).toContain('node scripts/ci/verify-production-privacy.mjs')
    expect(workflow.slice(privacy, indexNow)).not.toContain('continue-on-error: true')
  })

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
    expect(workflow).toContain("if: steps.governed-verify.outputs.reusable != 'true'")
  })

  it('reuses only a governed CI export with exact producer, ancestry, hash, and build-state proof', () => {
    const workflow = read('.github/workflows/deploy.yml')
    const ci = read('.github/workflows/ci.yml')

    expect(workflow).toContain('actions: read')
    expect(workflow).toContain('Resolve reusable governed export producer')
    expect(workflow).toContain('VALIDATED_HEAD_SHA: ${{ steps.deploy-auth.outputs.validated_head_sha }}')
    expect(workflow).toContain('select(.name == "CI" and .status == "completed" and .conclusion == "success")')
    expect(workflow).toContain('Download reusable governed export from CI')
    expect(workflow).toContain('name: governed-static-export-${{ steps.governed-producer.outputs.source_sha }}')
    expect(workflow).toContain('run-id: ${{ steps.governed-producer.outputs.run_id }}')
    expect(workflow).toContain('Verify reusable governed export')
    expect(workflow).toContain('producer_run_id')
    expect(workflow).toContain('EXPECTED_PRODUCER_RUN_ID')
    expect(workflow).toContain('EXPECTED_SOURCE_SHA')
    expect(workflow).toContain('[ "$EXPECTED_SOURCE_SHA" != "$VALIDATED_HEAD_SHA" ]')
    expect(workflow).toContain('[ "$TREE_IDENTICAL" != \'true\' ]')
    expect(workflow).toContain('[ "$BASE_IDENTICAL" != \'true\' ]')
    expect(workflow).toContain('merge_parent="$(gh api "repos/$GITHUB_REPOSITORY/git/commits/$DEPLOY_SHA" --jq')
    expect(workflow).toContain('[ "$merge_parent" != "$base_sha" ]')
    expect(workflow).toContain('node scripts/ci/governed-static-export.mjs verify')
    expect(workflow).toContain('--source-sha "$EXPECTED_SOURCE_SHA"')
    expect(workflow).toContain('--base-sha "$base_sha"')
    expect(workflow).toContain('echo "reusable=true" >> "$GITHUB_OUTPUT"')
    expect(workflow).toContain("if: steps.governed-verify.outputs.reusable != 'true' && steps.deploy-auth.outputs.skip_redundant_validation != 'true'")
    expect(workflow).toContain("THS_PUBLISHER_PUBLIC_MEDIA_ROOT: ${{ steps.governed-verify.outputs.reusable == 'true' && 'out/media/distribution/publisher' || 'public/media/distribution/publisher' }}")
    expect(ci).toContain('AMAZON_AFFILIATE_TAG: ${{ vars.AMAZON_AFFILIATE_TAG }}')
  })

  it('rejects otherwise valid CI export reuse when production GA4 is missing or mismatched', () => {
    const workflow = read('.github/workflows/deploy.yml')
    const resolveAt = workflow.indexOf('- name: Resolve GA4 ID for production static build')
    const verifyAt = workflow.indexOf('- name: Verify reusable governed export')
    const buildAt = workflow.indexOf('- name: Build app')
    const finalCheckAt = workflow.indexOf('- name: Verify GA4 present in exported client JavaScript')

    // Production-only NEXT_PUBLIC_* values must exist before making a
    // decision about the browser chunks reused from a separate CI build.
    expect(resolveAt).toBeGreaterThan(-1)
    expect(resolveAt).toBeLessThan(verifyAt)
    expect(verifyAt).toBeLessThan(buildAt)
    expect(buildAt).toBeLessThan(finalCheckAt)

    const reuseStep = workflow.slice(verifyAt, buildAt)
    expect(reuseStep).toContain('continue-on-error: true')
    expect(reuseStep).toContain('! grep -R -F -q --include=\'*.js\' "$NEXT_PUBLIC_GA4_ID" out/_next/static/chunks')
    expect(reuseStep).toContain('! grep -R -F -q --include=\'*.js\' \'googletagmanager.com/gtag/js\' out/_next/static/chunks')
    expect(reuseStep.indexOf('self-build fallback required.')).toBeLessThan(reuseStep.indexOf('echo "reusable=true"'))
    expect(workflow.slice(buildAt, finalCheckAt)).toContain("if: steps.governed-verify.outputs.reusable != 'true'")

    const resolveStep = workflow.slice(resolveAt, verifyAt)
    expect(resolveStep).toContain('[[ ! "$ga_id" =~ ^G-[A-Z0-9]{6,20}$ ]]')
    expect(resolveStep).toContain('::add-mask::$ga_id')
    expect(resolveStep).toContain('echo "NEXT_PUBLIC_GA4_ID=$ga_id" >> "$GITHUB_ENV"')

    const finalCheck = workflow.slice(finalCheckAt, workflow.indexOf('- name: Verify Amazon affiliate tag', finalCheckAt))
    expect(finalCheck).toContain('GA4 measurement ID absent from exported JavaScript. Refusing silent analytics-disabled deployment.')
    expect(finalCheck).toContain('GA4 loader absent from exported JavaScript.')
  })

  it('passes the same Amazon affiliate tag into the production build, output verification, and affiliate audit', () => {
    const workflow = read('.github/workflows/deploy.yml')
    const ci = read('.github/workflows/ci.yml')

    const tagBinding = 'AMAZON_AFFILIATE_TAG: ${{ vars.AMAZON_AFFILIATE_TAG }}'
    expect(workflow.split(tagBinding).length - 1).toBeGreaterThanOrEqual(3)

    const auditStep = workflow.slice(workflow.indexOf('- name: Verify Amazon affiliate tag (production safety)'))
    expect(auditStep).toContain(tagBinding)
    expect(auditStep).toContain('run: npm run audit:affiliate-tag-production')

    expect(ci).toContain('name: Verify Amazon affiliate destination integrity')
    const ciAuditStep = ci.slice(ci.indexOf('- name: Verify Amazon affiliate destination integrity'))
    expect(ciAuditStep).toContain(tagBinding)
    expect(ciAuditStep).toContain('run: npm run audit:affiliate-tag-production')
  })

  it('retries only transient Cloudflare Pages asset-upload 5xx without bypassing the exact deployment receipt', () => {
    const workflow = read('.github/workflows/deploy.yml')
    const start = workflow.indexOf('- name: Deploy to Cloudflare Pages')
    const verify = workflow.indexOf('- name: Verify exact production receipt')
    expect(start).toBeGreaterThan(-1)
    expect(verify).toBeGreaterThan(start)
    const upload = workflow.slice(start, verify)
    expect(upload).not.toContain('continue-on-error: true')
    expect(upload).toContain('max_upload_attempts=3')
    expect(upload).toContain('while [ "$attempt" -le "$max_upload_attempts" ]')
    expect(upload).toContain('wrangler_exit="${PIPESTATUS[0]}"')
    expect(upload).toContain("grep -Eq 'POST /pages/assets/upload -> 5[0-9]{2}'")
    expect(upload).toContain('exit "$wrangler_exit"')
    expect(upload).toContain('sleep "$((attempt * 30))"')
    expect(upload).toContain('--commit-hash "${DEPLOY_SHA:-$GITHUB_SHA}"')
    expect(upload).not.toContain('|| true')
    expect(workflow.slice(verify)).toContain('node scripts/ci/deployment-receipt.mjs verify')
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
