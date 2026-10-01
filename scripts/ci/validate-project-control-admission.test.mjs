// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { scoreAdmission, validateAdmissionTransaction, validateExistingOwnerReconciliation } from './validate-project-control-admission.mjs'

const base = 'a'.repeat(40)
const title = 'Audit Kava post-answer journey for one evidence-first next action'
const manifest = {
  version: 1,
  ticket: 5753,
  lane: 'R',
  title,
  priority: 'P1/P2',
  base_revision: base,
  last_verified: '2026-09-21',
  score_inputs: { businessImpact: 3, userValue: 4, trafficPotential: 3, strategicLeverage: 3, confidence: 0.75, effort: 2 },
  score: 40.5,
}
const milestones = '| M0 | In progress |\n| M1 | In progress |\n| M2 | Blocked |\n| M3 | Not started |\n| M4 | Not started |\n| M5 | Not started |\n| M6 | Not started |'
const chain = '**Control dependencies:** #4412 <- #4411; #4406 <- #4388, #4401, #4405; #4407 <- #4406'
const sprintBase = `**WIP cap:** 3
${milestones}
${chain}
## Active / in review — implementation WIP 1/3
| Lane | Ticket | Title | Status | Priority | Score | Freshness |
|---|---|---|---|---|---:|---|
| A | #5703 | Cobalamin | In Progress | P1 | — | verified 2026-09-20 |
## Ready next — strict dependency order
### #5753 candidate`
const backlogBase = `**WIP cap:** 3
${milestones}
${chain}
## Now — active exact work
| Ticket | Title | Lane | Status | Priority | BI/UV/TP/SL/C/E | Score | Freshness |
|---|---|---|---|---|---|---:|---|
| #5703 | Cobalamin | A | In Progress | P1 | — | — | verified 2026-09-20 |
## Next — ordered dependency queue
| #5753 | Candidate | R | Ready | P1/P2 | — | — | exact-main |`
const sprintHead = sprintBase.replace(
  '| A | #5703 | Cobalamin | In Progress | P1 | — | verified 2026-09-20 |',
  '| A | #5703 | Cobalamin | In Progress | P1 | — | verified 2026-09-20 |\n| R | #5753 | ' + title + ' | Admitted | P1/P2 | 40.5 | last_verified 2026-09-21 |'
)
const backlogHead = backlogBase.replace(
  '| #5703 | Cobalamin | A | In Progress | P1 | — | — | verified 2026-09-20 |',
  '| #5703 | Cobalamin | A | In Progress | P1 | — | — | verified 2026-09-20 |\n| #5753 | ' + title + ' | R | Admitted | P1/P2 | 3/4/3/3/0.75/2 | 40.5 | last_verified 2026-09-21 |'
)
const candidate = { number: 5753, state: 'open', labels: [{ name: 'ready-next' }], body: 'Revalidated against exact MAIN ' + base }

const input = () => ({
  baseSprint: sprintBase, baseBacklog: backlogBase, headSprint: sprintHead, headBacklog: backlogHead,
  manifest: structuredClone(manifest), baseRevision: base, now: '2026-09-22T12:00:00Z',
  candidate: structuredClone(candidate), openPulls: [],
})

describe('project-control admission transaction', () => {
  it('uses the single master score formula', () => {
    expect(scoreAdmission(manifest.score_inputs)).toBe(40.5)
    expect(() => scoreAdmission({ ...manifest.score_inputs, effort: 0 })).toThrow()
    expect(() => scoreAdmission({ ...manifest.score_inputs, confidence: 0.9 })).toThrow()
  })
  it('admits exactly one fresh ready-next candidate into a free lane under cap', () => {
    const report = validateAdmissionTransaction(input())
    expect(report.state).toBe('PASS')
    expect(report.wip).toBe(2)
    expect(report.score).toBe('40.5')
  })
  it('fails closed on occupied lane or cap overflow', () => {
    const occupied = input()
    occupied.baseSprint = occupied.baseSprint.replace('| A | #5703', '| R | #5703')
    occupied.headSprint = occupied.headSprint.replace('| A | #5703', '| R | #5703')
    expect(validateAdmissionTransaction(occupied).errors.join(' ')).toContain('lane is already occupied')

    const capped = input()
    const extraS = '\n| D | #5800 | D task | In Progress | P1 | 1.0 | verified 2026-09-21 |\n| R | #5801 | R task | In Progress | P1 | 1.0 | verified 2026-09-21 |'
    const extraB = '\n| #5800 | D task | D | In Progress | P1 | 1/1/1/1/1/1 | 1.0 | verified 2026-09-21 |\n| #5801 | R task | R | In Progress | P1 | 1/1/1/1/1/1 | 1.0 | verified 2026-09-21 |'
    capped.baseSprint = capped.baseSprint.replace('## Ready next', extraS + '\n## Ready next')
    capped.baseBacklog = capped.baseBacklog.replace('## Next', extraB + '\n## Next')
    capped.headSprint = capped.headSprint.replace('## Ready next', extraS + '\n## Ready next')
    capped.headBacklog = capped.headBacklog.replace('## Next', extraB + '\n## Next')
    expect(validateAdmissionTransaction(capped).errors.join(' ')).toContain('WIP cap')
  })
  it('rejects stale, non-ready, mismatched-base, and already-owned candidates', () => {
    for (const mutate of [
      (x) => { x.now = '2026-10-01T00:00:00Z' },
      (x) => { x.candidate.labels = [] },
      (x) => { x.candidate.body = 'old revision' },
      (x) => { x.openPulls = [{ number: 99, closes: [5753] }] },
      (x) => { x.manifest.base_revision = 'b'.repeat(40) },
    ]) {
      const x = input(); mutate(x)
      expect(validateAdmissionTransaction(x).state).toBe('BLOCKED')
    }
  })
  it('rejects score tampering and unrelated active ownership changes', () => {
    const score = input()
    score.manifest.score = 999
    expect(validateAdmissionTransaction(score).errors.join(' ')).toContain('single master formula')

    const altered = input()
    altered.headSprint = altered.headSprint.replace('#5703', '#5704')
    altered.headBacklog = altered.headBacklog.replace('#5703', '#5704')
    expect(validateAdmissionTransaction(altered).errors.join(' ')).toContain('add exactly the candidate')
  })
})

const reconciliationInput = () => ({
  baseSprint: '**WIP cap:** 3\n## Active\n', baseBacklog: '**WIP cap:** 3\n## Now\n',
  headSprint: '**WIP cap:** 3\n## Active\n| D | #5758 / PR #6126 | Sleep | In review |\n| A | #6115 / PR #6116 | Cluster | In review |',
  headBacklog: '**WIP cap:** 3\n## Now\n| #5758 / PR #6126 | Sleep | D | In review |\n| #6115 / PR #6116 | Cluster | A | In review |',
  baseRevision: base, baseCommittedAt: '2026-10-01T11:08:24Z', now: '2026-10-01T13:00:00Z',
  manifest: { mode: 'existing-owner-reconciliation', base_revision: base, last_verified: '2026-10-01T12:00:00Z', owners: [{ ticket:5758, pr:6126, lane:'D' }, { ticket:6115, pr:6116, lane:'A' }] },
  issues: [{number:5758,state:'open'}, {number:6115,state:'open'}],
  associations: [{ticket:5758,pr:6126,createdAt:'2026-09-30T12:00:00Z'}, {ticket:6115,pr:6116,createdAt:'2026-09-30T12:00:00Z'}],
  openPulls: [{number:6126,state:'open',created_at:'2026-09-30T12:00:00Z',closes:[5758]}, {number:6116,state:'open',created_at:'2026-09-30T12:00:00Z',closes:[6115]}],
});
describe('existing owner reconciliation', () => {
  it('reconciles both already-open owners without admitting new work', () => { expect(validateExistingOwnerReconciliation(reconciliationInput())).toMatchObject({state:'PASS',wip:2}); });
  it('fails closed for stale, future, absent, closed or duplicate ownership and changed caps', () => {
    for (const mutate of [
      x=>{x.manifest.base_revision='b'.repeat(40)}, x=>{x.manifest.last_verified='2026-09-01'},
      x=>{x.manifest.last_verified='2026-10-02'}, x=>{x.baseCommittedAt='invalid'},
      x=>{x.openPulls[0].created_at='2026-10-01T12:00:00Z'}, x=>{x.openPulls[0].state='closed'},
      x=>{x.openPulls[0].closes=[]}, x=>{x.issues[0].state='closed'},
      x=>{x.openPulls.push({...x.openPulls[0],number:999})}, x=>{x.manifest.owners.pop()},
      x=>{x.headSprint=x.headSprint.replace('| A |','| D |')},
      x=>{x.headBacklog=x.headBacklog.replace('| A |','| R |')},
      x=>{x.headSprint=x.headSprint.replace('cap:** 3','cap:** 4')},
    ]) {const x=reconciliationInput();mutate(x);expect(validateExistingOwnerReconciliation(x).state).toBe('BLOCKED');}
  });
  it('preserves every base owner and rejects undeclared row identities', () => {
    const x=reconciliationInput();x.baseSprint+='| R | #99 | Existing | In review |';x.baseBacklog+='| #99 | Existing | R | In review |';
    expect(validateExistingOwnerReconciliation(x).state).toBe('BLOCKED');
    const y=reconciliationInput();y.headSprint=y.headSprint.replace('PR #6126','PR #9000');expect(validateExistingOwnerReconciliation(y).state).toBe('BLOCKED');
  });
});

it('rejects PR objects posing as owner issues', () => { const x=reconciliationInput();x.issues[0].pull_request={url:'https://api.github.com/repos/example/pulls/5758'};expect(validateExistingOwnerReconciliation(x).state).toBe('BLOCKED'); });
it('preserves base owner PR references in both tables', () => { const x=reconciliationInput();const a='| R | #99 / PR #100 | Existing | In review |';const b='| #99 / PR #100 | Existing | R | In review |';x.baseSprint+=a;x.baseBacklog+=b;x.headSprint+='\n'+a;x.headBacklog+='\n'+b.replace('PR #100','PR #101');expect(validateExistingOwnerReconciliation(x).state).toBe('BLOCKED'); });

it('rejects old PRs without a pre-base issue association', () => {for(const mutate of [x=>{x.associations=[]},x=>{x.associations[0].createdAt='2026-10-01T12:00:00Z'},x=>{x.associations[0].pr=99}]){const x=reconciliationInput();mutate(x);expect(validateExistingOwnerReconciliation(x).state).toBe('BLOCKED');}});
