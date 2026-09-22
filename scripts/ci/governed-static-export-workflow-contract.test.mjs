import fs from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (path) => fs.readFileSync(path, 'utf8')

describe('governed static export workflow topology', () => {
  it('makes CI the PR/main producer and dispatches all heavy consumers only after artifact creation', () => {
    const workflow = read('.github/workflows/ci.yml')
    expect(workflow).toContain('name: CI')
    expect(workflow).toContain('Write governed static export receipt')
    expect(workflow).toContain('Upload governed static export')
    expect(workflow).toContain('governed-static-export-${{ steps.context.outputs.source_sha }}')
    expect(workflow).toContain('Dispatch exact-head governed export consumers')
    expect(workflow).toContain('consumers=(build-check.yml lighthouse.yml production-content-lint.yml)')
    expect(workflow).toContain('for workflow in "${consumers[@]}"')
    expect(workflow).toContain('consumers+=(production-content-invariants.yml)')
    expect(workflow).toContain('consumers+=(crawl-governance.yml)')
    expect(workflow).toContain('consumers+=(schema-media-governance.yml)')
    expect(workflow).toContain('consumers+=(technical-seo-monitor.yml)')
    expect(workflow).toContain('producer_base_sha:$base')
    expect(workflow).toContain('EVENT_BEFORE_SHA: ${{ github.event.before }}')
    expect(workflow).toContain('consumers=(lighthouse.yml production-content-lint.yml)')
  })

  it('fails closed until every dispatched exact-head consumer is visibly registered', () => {
    const workflow = read('.github/workflows/ci.yml')
    expect(workflow).toContain('dispatch_epoch="$(date -u +%s)"')
    expect(workflow).toContain('consumers=(build-check.yml lighthouse.yml production-content-lint.yml)')
    expect(workflow).toContain('actions/workflows/$workflow/runs')
    expect(workflow).toContain('-f event=workflow_dispatch')
    expect(workflow).toContain('-f branch="$HEAD_REF"')
    expect(workflow).toContain('and .head_sha == $sha')
    expect(workflow).toContain('and ((.created_at | fromdateiso8601) >= $since)')
    expect(workflow).toContain('Registered $workflow run $registered_run for exact head $SOURCE_SHA')
    expect(workflow).toContain('Consumer dispatch failed to register within 40 seconds')
    expect(workflow).toContain('exit 1')
    expect(workflow).toContain('the autonomous merge controller then waits for exact-head consumer completion')
  })

  for (const [name, path] of [
    ['Build Check', '.github/workflows/build-check.yml'],
    ['Lighthouse CI', '.github/workflows/lighthouse.yml'],
    ['Production Content Lint', '.github/workflows/production-content-lint.yml'],
    ['Production Content Invariants', '.github/workflows/production-content-invariants.yml'],
    ['Crawl Governance', '.github/workflows/crawl-governance.yml'],
    ['Schema and Media Governance', '.github/workflows/schema-media-governance.yml'],
    ['Technical SEO Monitor', '.github/workflows/technical-seo-monitor.yml'],
  ]) {
    it(`${name} registers on PRs but performs heavy work only in dispatched/fallback runs`, () => {
      const workflow = read(path)
      expect(workflow).toContain('pull_request:')
      expect(workflow).toContain("github.event_name == 'workflow_dispatch'")
      expect(workflow).toContain("github.event_name == 'pull_request'")
      expect(workflow).toContain('Download governed static export')
      expect(workflow).toContain('Verify governed static export receipt')
      expect(workflow).toContain('steps.governed-verify.outcome != \'success\'')
      expect(workflow).toContain('npm run build:deploy')
      expect(workflow).toContain('producer_sha')
      expect(workflow).toContain('producer_base_sha')
    })
  }

  it('keeps full production-output verification in the original artifact consumers', () => {
    for (const path of [
      '.github/workflows/build-check.yml',
      '.github/workflows/lighthouse.yml',
      '.github/workflows/production-content-lint.yml',
    ]) {
      expect(read(path)).toContain('npm run verify:output')
    }
  })

  it('restores governed data before content-invariant validation without a second normal PR build', () => {
    const workflow = read('.github/workflows/production-content-invariants.yml')
    expect(workflow).toContain('Verify governed static export receipt and restore governed data')
    expect(workflow).toContain('validate-production-content-invariants.mjs --data-dir=public/data')
    expect(workflow).toContain('validate-production-indexability-budget.mjs --data-dir=public/data')
    expect(workflow).not.toContain('npm run data:build')
    expect(workflow).not.toContain('node scripts/build-production.mjs')
  })

  it('does not turn producer-dispatched technical SEO audits into live-production probes', () => {
    const workflow = read('.github/workflows/technical-seo-monitor.yml')
    expect(workflow).toContain("github.event_name == 'schedule' || (github.event_name == 'workflow_dispatch' && inputs.producer_run_id == '')")
  })
  it('explicitly wakes the trusted controller from every governed consumer', () => {
    const consumers = [
      '.github/workflows/build-check.yml',
      '.github/workflows/lighthouse.yml',
      '.github/workflows/production-content-lint.yml',
      '.github/workflows/production-content-invariants.yml',
      '.github/workflows/crawl-governance.yml',
      '.github/workflows/schema-media-governance.yml',
      '.github/workflows/technical-seo-monitor.yml',
    ]

    for (const file of consumers) {
      const workflow = fs.readFileSync(path.join(process.cwd(), file), 'utf8')
      expect(workflow).toContain('actions: write')
      expect(workflow).toContain('name: Wake trusted merge controller')
      expect(workflow).toContain("if: always() && github.event_name == 'workflow_dispatch'")
      expect(workflow).toContain("inputs.producer_pr_number != ''")
      expect(workflow).toContain("inputs.producer_sha != ''")
      expect(workflow).toContain('gh workflow run autonomous-merge-controller.yml')
      expect(workflow).toContain('--ref main')
      expect(workflow).toContain('-f "pr_number=$PRODUCER_PR_NUMBER"')
      expect(workflow).toContain('-f "expected_head_sha=$PRODUCER_SHA"')
    }
  })

})
