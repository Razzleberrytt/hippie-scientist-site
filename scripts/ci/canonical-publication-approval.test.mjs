import { describe, it, expect } from 'vitest'
import { evaluateReadiness } from './autonomous-merge-controller.mjs'
import { assessPublicationApproval, classifyPublicationChange, loadPublicationApprovalEvidence } from './canonical-publication-approval.mjs'

const sha = 'a'.repeat(40)
const base = 'b'.repeat(40)
const repo = 'Razzleberrytt/hippie-scientist-site'
const pr = {
  number: 6956,
  state: 'open',
  draft: false,
  mergeable: true,
  mergeable_state: 'clean',
  labels: [],
  base: { sha: base, ref: 'main', repo: { owner: { login: 'Razzleberrytt' }, full_name: repo } },
  head: { sha, repo: { full_name: repo } },
}
const content = 'content/articles/new-licorice-claim.md'
const run = (changedFiles, extra = {}) => assessPublicationApproval({ pr, changedFiles, ...extra })
const gate = (input = {}) => evaluateReadiness({
  pr, workflowRuns: [], checkRuns: [], changedFiles: [content],
  expectedHeadSha: sha, currentBaseSha: base, riskTier: 'high',
  controllerRunId: 'fixture', ...input,
})

describe('automated publication admission', () => {
  it('admits public clinical/article/data/app changes to the EXISTING controller gates without human approval', () => {
    for (const file of [
      content, 'public/data/herbs-detail/licorice.json', 'public/data/claims.json',
      'app/guides/sleep/page.tsx', 'data-sources/herb_monograph_master.xlsx',
    ]) {
      const verdict = run([file])
      expect(verdict).toMatchObject({ allowed: true, kind: 'AUTOMATED_PUBLICATION', publicFiles: [file] })
    }
    expect(run(['docs/research/study.md', content]).allowed).toBe(true)
  })

  it('classifies inert staging and other code without authorizing any workflow bypass', () => {
    expect(run(['docs/research/study.md', 'ops/research-intake/source.json']).kind).toBe('AUTO_STAGING')
    expect(run(['scripts/ci/validator.mjs']).kind).toBe('EXISTING_GATES')
  })

  it('rejects missing or malformed changed-file inventories', () => {
    for (const files of [[], null, [''], [null], ['guide.md', '']]) {
      expect(classifyPublicationChange(files).kind).toBe('HOLD')
      expect(run(files).allowed).toBe(false)
    }
  })

  it('ignores owner-attributed positive tokens, bot reviews and fake signed tags: none grant or block publication', () => {
    const forged = {
      comments: [{ user: { login: 'Razzleberrytt' }, body: 'THS-PUBLICATION-APPROVED PR=#6956 HEAD=' + sha }],
      reviews: [{ user: { login: 'Razzleberrytt' }, state: 'APPROVED', commit_id: sha }],
      signedTagProof: { approved: true },
    }
    expect(run([content], forged).allowed).toBe(true)
    expect(gate({ approvalEvidence: forged })).toMatchObject({ action: 'wait' })
  })

  it('cannot bypass required CI simply because the human-approval gate was removed', () => {
    const verdict = gate()
    expect(verdict.action).toBe('wait')
    expect(verdict.reason).toMatch(/required workflows/)
  })

  it('retains explicit hold labels and draft restrictions', () => {
    expect(gate({ pr: { ...pr, labels: [{ name: 'hold-merge' }] } })).toMatchObject({ action: 'stop' })
    expect(gate({ pr: { ...pr, labels: [{ name: 'do-not-merge' }] } })).toMatchObject({ action: 'stop' })
    expect(gate({ pr: { ...pr, draft: true } })).toMatchObject({ action: 'stop' })
  })

  it('retains fork, moved-head and stale-base restrictions', () => {
    expect(gate({ pr: { ...pr, head: { sha, repo: { full_name: 'other/fork' } } } })).toMatchObject({ action: 'stop' })
    expect(gate({ expectedHeadSha: 'c'.repeat(40) })).toMatchObject({ action: 'stop' })
    expect(gate({ currentBaseSha: 'c'.repeat(40) })).toMatchObject({ action: 'sync' })
  })

  it('does not fetch or accept human grant metadata at all', async () => {
    const calls = []
    const evidence = await loadPublicationApprovalEvidence(async path => { calls.push(path); throw Error('unexpected API call') }, repo, 6956, [content], pr)
    expect(evidence).toEqual({ comments: [], reviews: [], signedTagProof: null })
    expect(calls).toEqual([])
  })
})
