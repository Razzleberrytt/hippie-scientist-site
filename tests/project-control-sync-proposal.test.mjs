import { describe, expect, it } from 'vitest'
import { buildSyncProposal } from '../scripts/ci/project-control-sync-proposal.mjs'

const doc = (path, { active = [], ready = [] } = {}) => ({ path, active, ready })
const issue = (id, state = 'open') => ({ kind: 'issue', state })

function snapshot(records, revision = 'a'.repeat(40)) {
  return {
    version: 1,
    repository: 'Razzleberrytt/hippie-scientist-site',
    revision,
    records,
    openPulls: [],
    available: true,
  }
}

describe('project-control sync proposals', () => {
  it('proposes retirement in both control documents for a completed queued ticket', () => {
    const ticket = { id: '#5021', refs: [5021], status: 'Ready next' }
    const documents = [
      doc('docs/CURRENT_SPRINT.md', { ready: [ticket] }),
      doc('docs/MASTER_BACKLOG.md', { ready: [ticket] }),
      doc('docs/ROADMAP.md'),
    ]
    const revision = 'a'.repeat(40)
    const result = buildSyncProposal({
      documents,
      snapshot: snapshot({ 5021: issue(5021, 'closed') }, revision),
      repository: 'Razzleberrytt/hippie-scientist-site',
      revision,
    })

    expect(result.state).toBe('PROPOSAL')
    expect(result.admission).toBe('unchanged')
    expect(result.actions).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'retire', document: 'docs/CURRENT_SPRINT.md', ticket: '#5021', section: 'ready' }),
      expect.objectContaining({ type: 'retire', document: 'docs/MASTER_BACKLOG.md', ticket: '#5021', section: 'ready' }),
    ]))
    expect(result.guardrails.autoAdmission).toBe(false)
  })

  it('proposes exact sprint/backlog parity alignment without inventing admission', () => {
    const ticket = { id: '#5031', refs: [5031], status: 'Ready next' }
    const documents = [
      doc('docs/CURRENT_SPRINT.md', { ready: [ticket] }),
      doc('docs/MASTER_BACKLOG.md'),
      doc('docs/ROADMAP.md'),
    ]
    const revision = 'b'.repeat(40)
    const result = buildSyncProposal({
      documents,
      snapshot: snapshot({ 5031: issue(5031, 'open') }, revision),
      repository: 'Razzleberrytt/hippie-scientist-site',
      revision,
    })

    expect(result.actions).toEqual([
      expect.objectContaining({
        type: 'align-parity',
        document: 'docs/MASTER_BACKLOG.md',
        sourceDocument: 'docs/CURRENT_SPRINT.md',
        ticket: '#5031',
        operation: 'add-equivalent-entry',
      }),
    ])
    expect(result.guardrails.wipCapBypass).toBe(false)
  })

  it('fails closed when the snapshot is not bound to the exact revision', () => {
    const revision = 'c'.repeat(40)
    const result = buildSyncProposal({
      documents: [doc('docs/CURRENT_SPRINT.md'), doc('docs/MASTER_BACKLOG.md'), doc('docs/ROADMAP.md')],
      snapshot: snapshot({}, 'd'.repeat(40)),
      repository: 'Razzleberrytt/hippie-scientist-site',
      revision,
    })

    expect(result.state).toBe('UNKNOWN')
    expect(result.actions).toEqual([])
    expect(result.admission).toBe('unchanged')
  })
})
