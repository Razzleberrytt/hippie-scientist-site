import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('production deployment handoff contract', () => {
  it('deploys directly from main pushes without depending on another workflow finishing', () => {
    const workflow = read('.github/workflows/deploy.yml')

    expect(workflow).toContain('push:')
    expect(workflow).toContain('branches:')
    expect(workflow).toContain('- main')
    expect(workflow).toContain('workflow_dispatch:')
    expect(workflow).not.toContain('workflow_run:')
    expect(workflow).not.toContain('github.event.workflow_run')
  })

  it('pins production deployment to the triggering push SHA and branch', () => {
    const workflow = read('.github/workflows/deploy.yml')

    expect(workflow).toContain('DEPLOY_BRANCH: ${{ github.ref_name }}')
    expect(workflow).toContain('DEPLOY_SHA: ${{ github.sha }}')
    expect(workflow).toContain('ref: ${{ github.sha }}')
  })

  it('lets an active production deploy finish but bounds how long it can monopolize the deploy group', () => {
    const workflow = read('.github/workflows/deploy.yml')

    expect(workflow).toContain('concurrency:')
    expect(workflow).toContain('group: deploy-${{ github.ref }}')
    expect(workflow).toContain('cancel-in-progress: false')
    expect(workflow).toContain('timeout-minutes: 60')
  })

  it('validates tests, canonical data, source-of-truth, types, lint, build, and output before publishing', () => {
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
