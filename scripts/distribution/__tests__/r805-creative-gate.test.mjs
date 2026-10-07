import { describe, expect, it } from 'vitest'
import { buildR805CreativeReceipt, validateR805CreativeBrief } from '../r805-creative-gate.mjs'

function validBrief() {
  return {
    release: 'R8.05',
    sourceIdentity: {
      id: 'ashwagandha-stress-evidence',
      sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
    },
    premise: {
      interestScore: 5,
      coldViewerWhyCare: 'The popular assumption hides a surprising limitation that changes how the result should be interpreted.',
      viewerQuestion: 'What is the one thing this result actually changes?',
      earlyPayoff: 'The combined stack did not clearly outperform the simpler arm.',
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
        id: 'hook',
        role: 'hook',
        narration: 'More ingredients did not clearly mean a better result.',
        onScreenText: 'MORE ≠ BETTER',
        visualPurpose: 'Show the combined stack visually failing to exceed the simpler stack.',
        spokenAnchor: 'did not clearly mean a better result',
        visualAction: 'combined stack stops at the same result marker',
        motion: { type: 'reveal' },
        cutReason: 'reveal',
        factualAuthority: 'creative-framing',
        primaryEntities: ['combined-vs-simple-result'],
        comparisonRequired: false,
        pauseAfterSeconds: 0.16,
      },
      {
        id: 'qualifier',
        role: 'limitation',
        narration: 'But the ingredients were not tested one by one.',
        onScreenText: 'INGREDIENTS NOT TESTED ALONE',
        visualPurpose: 'Separate the stack into untested individual ingredient tiles.',
        spokenAnchor: 'not tested one by one',
        visualAction: 'evidence qualifier receives a visible emphasis',
        motion: { type: 'highlight' },
        cutReason: 'contrast',
        factualAuthority: 'canonical-input',
        primaryEntities: ['ingredient-level-uncertainty'],
        comparisonRequired: false,
        pauseAfterSeconds: 0.14,
      },
      {
        id: 'source',
        role: 'source',
        narration: '',
        onScreenText: 'https://thehippiescientist.net/herbs/ashwagandha/',
        visualPurpose: 'Hold the exact canonical evidence URL long enough to read.',
        spokenAnchor: '',
        visualAction: 'source remains static and unobstructed',
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
}

describe('R8.05 creative gate', () => {
  it('accepts an attention-first voice-timed concept and emits beat-bound receipts', () => {
    const brief = validBrief()
    expect(validateR805CreativeBrief(brief)).toEqual([])
    expect(buildR805CreativeReceipt(brief)).toMatchObject({
      schemaVersion: 'ths-r805-creative-receipt-v2',
      release: 'R8.05',
      status: 'approved',
      premiseInterestScore: 5,
      narrationIsTimingMaster: true,
      semanticClipOwnership: true,
      cutOnMeaning: true,
      internalMotionPlanRequired: true,
      internalMotionSyncCertifiedAt: 'exact-master-qa',
      semanticBeatCount: 3,
    })
    expect(buildR805CreativeReceipt(brief).semanticBeatMapSha256).toMatch(/^[a-f0-9]{64}$/)
    expect(buildR805CreativeReceipt(brief).beatReceipts).toHaveLength(3)
  })

  it('rejects methodology-first, fixed-duration, overloaded or repeatedly rescued work', () => {
    const brief = validBrief()
    brief.premise.interestScore = 3
    brief.premise.methodologyBeforePayoff = true
    brief.premise.hookMode = 'methodology'
    brief.timing.targetDurationSeconds = 30
    brief.beats[0].primaryEntities = ['a', 'b', 'c']
    brief.recovery.macroRebuildCount = 2
    const errors = validateR805CreativeBrief(brief)
    expect(errors.join('\n')).toMatch(/interestScore/)
    expect(errors.join('\n')).toMatch(/methodology/)
    expect(errors.join('\n')).toMatch(/targetDurationSeconds/)
    expect(errors.join('\n')).toMatch(/cognitive-load/)
    expect(errors.join('\n')).toMatch(/rescue limit/)
  })
})
