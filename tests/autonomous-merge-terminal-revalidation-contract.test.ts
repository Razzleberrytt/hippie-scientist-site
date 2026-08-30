import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function readController() {
  return fs.readFileSync(path.join(process.cwd(), 'scripts/ci/autonomous-merge-controller.mjs'), 'utf8')
}

function terminalMergeFunction(controller: string) {
  return controller.match(/async function mergeIfStillCurrent\([\s\S]*?\n}\n\nasync function followOnePr/)?.[0] || ''
}

describe('terminal autonomous merge revalidation', () => {
  it('re-reads exact head and base immediately before the merge mutation', () => {
    const fn = terminalMergeFunction(readController())

    expect(fn).toContain('const pr = await getPr(repo, number)')
    expect(fn).toContain('pr.head?.sha !== headSha')
    expect(fn).toContain('getBranchSha(repo, pr.base.ref)')
    expect(fn).toContain('latestBaseSha !== validatedBaseSha')
    expect(fn).toContain('headContainsBase(repo, latestBaseSha, headSha)')
    expect(fn).toContain('const finalPr = await getPr(repo, number)')
    expect(fn).toContain('finalBaseSha !== latestBaseSha')
    expect(fn).toContain('finalBaseSha !== validatedBaseSha')
    expect(fn.indexOf('finalBaseSha !== validatedBaseSha')).toBeLessThan(fn.indexOf('await mergePr(repo, number, headSha)'))
  })

  it('re-reads workflow/check state and refuses merge unless the fresh terminal verdict is merge', () => {
    const fn = terminalMergeFunction(readController())

    expect(fn).toContain('getWorkflowRuns(repo, headSha)')
    expect(fn).toContain('getCheckRuns(repo, headSha)')
    expect(fn).toContain('const terminalVerdict = evaluateReadiness')
    expect(fn).toContain("terminalVerdict.action !== 'merge'")
    expect(fn).toContain('Terminal merge revalidation blocked')
    expect(fn.indexOf("terminalVerdict.action !== 'merge'")).toBeLessThan(fn.indexOf('await mergePr(repo, number, headSha)'))
  })

  it('passes controller identity into the terminal readiness check in both merge paths', () => {
    const controller = readController()
    const fn = terminalMergeFunction(controller)

    expect(fn).toContain('controllerRunId')
    expect(controller).toContain('validatedBaseSha: verdict.baseSha, controllerRunId')
    expect(controller.match(/validatedBaseSha: verdict\.baseSha, controllerRunId/g)?.length).toBe(2)
  })
})
