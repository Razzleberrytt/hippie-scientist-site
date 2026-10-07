import { describe, expect, it } from 'vitest'
import { buildR805CreativeReceipt, validateR805CreativeBrief } from '../r805-creative-gate.mjs'

function validBrief() {
  return {
    release: 'R8.05',
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
        narration: 'More ingredients did not clearly mean a better result.',
        visualPurpose: 'Show the combined stack visually failing to exceed the simpler stack.',
        spokenAnchor: 'did not clearly mean a better result',
        visualAction: 'combined stack stops at the same result marker',
        cutReason: 'reveal',
        primaryEntities: ['combined-vs-simple-result'],
        comparisonRequired: false,
      },
      {
        id: 'qualifier',
        narration: 'But the ingredients were not tested one by one.',
        visualPurpose: 'Separate the stack into untested individual ingredient tiles.',
        spokenAnchor: 'not tested one by one',
        visualAction: 'tiles separate and receive question marks',
        cutReason: 'contrast',
        primaryEntities: ['ingredient-level-uncertainty'],
        comparisonRequired: false,
      },
    ],
    recovery: { macroRebuildCount: 0 },
  }
}

describe('R8.05 creative gate', () => {
  it('accepts an attention-first voice-timed concept and emits a receipt', () => {
    const brief = validBrief()
    expect(validateR805CreativeBrief(brief)).toEqual([])
    expect(buildR805CreativeReceipt(brief)).toMatchObject({
      release: 'R8.05',
      premiseInterestScore: 5,
      narrationIsTimingMaster: true,
      semanticClipOwnership: true,
      cutOnMeaning: true,
      internalMotionSync: true,
    })
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
