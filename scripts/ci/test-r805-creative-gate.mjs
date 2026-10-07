import assert from 'node:assert/strict'
import { buildR805CreativeReceipt, validateR805CreativeBrief } from '../distribution/r805-creative-gate.mjs'

const good = {
  release: 'R8.05',
  sourceIdentity: {
    id: 'ashwagandha-stress-evidence',
    sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
  },
  premise: {
    interestScore: 5,
    coldViewerWhyCare: 'The result breaks a common assumption in a way that matters immediately.',
    viewerQuestion: 'What did the simpler result reveal?',
    earlyPayoff: 'The more complicated option did not clearly win.',
    methodologyBeforePayoff: false,
    hookMode: 'consequence',
    methodIsStory: false,
    paperSummaryOpening: false,
  },
  timing: {
    durationPolicy: 'natural',
    narrationIsTimingMaster: true,
    voiceFirstBeatMapApproved: true,
  },
  beats: [
    {
      id: 'payoff',
      role: 'hook',
      narration: 'More did not clearly mean better.',
      onScreenText: 'MORE ≠ BETTER',
      visualPurpose: 'Show the complex option failing to exceed the simple option.',
      spokenAnchor: 'did not clearly mean better',
      visualAction: 'result statement is revealed on the spoken anchor',
      motion: { type: 'reveal' },
      cutReason: 'reveal',
      factualAuthority: 'creative-framing',
      primaryEntities: ['result-contrast'],
      comparisonRequired: false,
      pauseAfterSeconds: 0.14,
    },
    {
      id: 'finding',
      role: 'finding',
      narration: 'The more complicated option did not clearly win.',
      onScreenText: 'NO CLEAR WIN',
      visualPurpose: 'Deliver the payoff before evidence details.',
      spokenAnchor: 'did not clearly win',
      visualAction: 'finding receives visible emphasis',
      motion: { type: 'highlight' },
      cutReason: 'emphasis',
      factualAuthority: 'canonical-input',
      primaryEntities: ['finding'],
      comparisonRequired: false,
      pauseAfterSeconds: 0.12,
    },
    {
      id: 'evidence',
      role: 'evidence',
      narration: 'The result came from randomized human evidence.',
      onScreenText: 'RANDOMIZED HUMAN EVIDENCE',
      visualPurpose: 'Show the evidence class after the payoff.',
      spokenAnchor: 'randomized human evidence',
      visualAction: 'evidence label is revealed',
      motion: { type: 'reveal' },
      cutReason: 'reveal',
      factualAuthority: 'canonical-input',
      primaryEntities: ['evidence-class'],
      comparisonRequired: false,
      pauseAfterSeconds: 0.12,
    },
    {
      id: 'limitation',
      role: 'limitation',
      narration: 'The ingredients were not tested one by one.',
      onScreenText: 'INGREDIENTS NOT TESTED ALONE',
      visualPurpose: 'Show the key interpretation limit.',
      spokenAnchor: 'not tested one by one',
      visualAction: 'limitation receives visible emphasis',
      motion: { type: 'highlight' },
      cutReason: 'contrast',
      factualAuthority: 'canonical-input',
      primaryEntities: ['limitation'],
      comparisonRequired: false,
      pauseAfterSeconds: 0.12,
    },
    {
      id: 'source',
      role: 'source',
      narration: '',
      onScreenText: 'https://thehippiescientist.net/herbs/ashwagandha/',
      visualPurpose: 'Hold exact canonical source.',
      spokenAnchor: '',
      visualAction: 'source remains static',
      motion: { type: 'hold' },
      cutReason: 'end',
      factualAuthority: 'canonical-source',
      primaryEntities: ['source'],
      comparisonRequired: false,
      holdSeconds: 3,
      pauseAfterSeconds: 0,
    },
    {
      id: 'context',
      role: 'context',
      narration: 'Educational, not medical advice.',
      onScreenText: 'Educational, not medical advice.',
      visualPurpose: 'Keep disclosure visible.',
      spokenAnchor: 'Educational',
      visualAction: 'disclosure receives visible emphasis',
      motion: { type: 'highlight' },
      cutReason: 'pause',
      factualAuthority: 'canonical-input',
      primaryEntities: ['disclosure'],
      comparisonRequired: false,
      pauseAfterSeconds: 0.1,
    },
    {
      id: 'cta',
      role: 'cta',
      narration: 'Read the full evidence page.',
      onScreenText: 'Read the full evidence page.',
      visualPurpose: 'Close with the governed CTA.',
      spokenAnchor: 'Read the full evidence page',
      visualAction: 'CTA is revealed',
      motion: { type: 'reveal' },
      cutReason: 'end',
      factualAuthority: 'canonical-input',
      primaryEntities: ['cta'],
      comparisonRequired: false,
      pauseAfterSeconds: 0.1,
    },
  ],
  recovery: { macroRebuildCount: 0 },
}

assert.deepEqual(validateR805CreativeBrief(good), [])
const receipt = buildR805CreativeReceipt(good)
assert.equal(receipt.release, 'R8.05')
assert.equal(receipt.status, 'approved')
assert.match(receipt.semanticBeatMapSha256, /^[a-f0-9]{64}$/)

const wrongOrder = structuredClone(good)
const hookBeat = wrongOrder.beats.shift()
wrongOrder.beats.splice(2, 0, hookBeat)
assert.match(validateR805CreativeBrief(wrongOrder).join('\n'), /hook to be the first rendered beat/i)

const bad = structuredClone(good)
bad.premise.interestScore = 3
bad.premise.methodologyBeforePayoff = true
bad.timing.targetDurationSeconds = 30
bad.beats[0].primaryEntities = ['a', 'b', 'c']
bad.recovery.macroRebuildCount = 2
const failures = validateR805CreativeBrief(bad).join('\n')
assert.match(failures, /interestScore/)
assert.match(failures, /methodology/)
assert.match(failures, /targetDurationSeconds/)
assert.match(failures, /cognitive-load/)
assert.match(failures, /rescue limit/)

console.log('[r805-creative-gate] PASS — beat-bound good brief accepted, known failure modes rejected')
