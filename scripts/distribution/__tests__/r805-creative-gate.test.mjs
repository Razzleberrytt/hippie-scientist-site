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
        id: 'finding',
        role: 'finding',
        narration: 'The combined stack did not clearly outperform the simpler arm.',
        onScreenText: 'NO CLEAR ADVANTAGE',
        visualPurpose: 'Deliver the concrete result before evidence details.',
        spokenAnchor: 'did not clearly outperform',
        visualAction: 'result statement receives a visible emphasis',
        motion: { type: 'highlight' },
        cutReason: 'emphasis',
        factualAuthority: 'canonical-input',
        primaryEntities: ['result'],
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
        id: 'context',
        role: 'context',
        narration: 'Educational, not medical advice.',
        onScreenText: 'Educational, not medical advice.',
        visualPurpose: 'Keep the disclosure legible.',
        spokenAnchor: 'Educational',
        visualAction: 'disclosure receives a visible emphasis',
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
        visualPurpose: 'End with the governed evidence CTA.',
        spokenAnchor: 'Read the full evidence page',
        visualAction: 'CTA is revealed',
        motion: { type: 'reveal' },
        cutReason: 'end',
        factualAuthority: 'canonical-input',
        primaryEntities: ['cta'],
        comparisonRequired: false,
        pauseAfterSeconds: 0.1,
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
      semanticBeatCount: 7,
    })
    expect(buildR805CreativeReceipt(brief).semanticBeatMapSha256).toMatch(/^[a-f0-9]{64}$/)
    expect(buildR805CreativeReceipt(brief).beatReceipts).toHaveLength(7)
  })

  it('rejects self-reported payoff metadata when the rendered order starts with evidence', () => {
    const brief = validBrief()
    const hook = brief.beats.shift()
    brief.beats.splice(2, 0, hook)
    const errors = validateR805CreativeBrief(brief).join('\n')
    expect(errors).toMatch(/hook to be the first rendered beat/i)
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
