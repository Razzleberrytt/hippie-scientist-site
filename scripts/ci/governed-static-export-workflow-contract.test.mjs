import fs from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (path) => fs.readFileSync(path, 'utf8')

describe('governed static export workflow topology', () => {
  it('makes CI the PR producer and dispatches all heavy consumers only after artifact creation', () => {
    const workflow = read('.github/workflows/ci.yml')
    expect(workflow).toContain('name: CI')
    expect(workflow).toContain('Write governed static export receipt')
    expect(workflow).toContain('Upload governed static export')
    expect(workflow).toContain('governed-static-export-${{ steps.context.outputs.source_sha }}')
    expect(workflow).toContain('Dispatch exact-head governed export consumers')
    expect(workflow).toContain('build-check.yml lighthouse.yml')
    expect(workflow).toContain('production-content-lint.yml/dispatches')
    expect(workflow).toContain('producer_base_sha:$base')
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
  ]) {
    it(`${name} registers on PRs but performs heavy work only in dispatched/fallback runs`, () => {
      const workflow = read(path)
      expect(workflow).toContain('pull_request:')
      expect(workflow).toContain("github.event_name != 'pull_request'")
      expect(workflow).toContain("(inputs.producer_sha == '' || github.sha == inputs.producer_sha)")
      expect(workflow).toContain('Reject stale producer dispatch')
      expect(workflow).toContain('Producer dispatch is stale: workflow head=$GITHUB_SHA producer=$PRODUCER_SHA')
      expect(workflow).toContain('Download governed static export')
      expect(workflow).toContain('Verify governed static export receipt')
      expect(workflow).toContain('steps.governed-verify.outcome != \'success\'')
      expect(workflow).toContain('npm run build:deploy')
      expect(workflow).toContain('npm run verify:output')
      expect(workflow).toContain('producer_sha')
      expect(workflow).toContain('producer_base_sha')
    })
  }
})
