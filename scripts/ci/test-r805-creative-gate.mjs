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
  ],
  recovery: { macroRebuildCount: 0 },
}

assert.deepEqual(validateR805CreativeBrief(good), [])
const receipt = buildR805CreativeReceipt(good)
assert.equal(receipt.release, 'R8.05')
assert.equal(receipt.status, 'approved')
assert.match(receipt.semanticBeatMapSha256, /^[a-f0-9]{64}$/)

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
