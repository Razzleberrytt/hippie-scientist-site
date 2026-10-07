import assert from 'node:assert/strict'
import { buildR805CreativeReceipt, validateR805CreativeBrief } from '../distribution/r805-creative-gate.mjs'

const good = {
  release: 'R8.05',
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
  beats: [{
    id: 'payoff',
    narration: 'More did not clearly mean better.',
    visualPurpose: 'Show the complex option failing to exceed the simple option.',
    spokenAnchor: 'did not clearly mean better',
    visualAction: 'result markers settle at the same level',
    cutReason: 'reveal',
    primaryEntities: ['result-contrast'],
    comparisonRequired: false,
  }],
  recovery: { macroRebuildCount: 0 },
}

assert.deepEqual(validateR805CreativeBrief(good), [])
assert.equal(buildR805CreativeReceipt(good).release, 'R8.05')

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

console.log('[r805-creative-gate] PASS — good brief accepted, known failure modes rejected')
