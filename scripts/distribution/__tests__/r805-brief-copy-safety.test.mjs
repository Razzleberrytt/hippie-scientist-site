import { describe, expect, it } from 'vitest'
import { validateR805BriefCopyAgainstCanonical } from '../build-bounded-pilot.mjs'

const canonicalSpec = {
  sourceIdentity: { sourceUrl: 'https://thehippiescientist.net/herbs/example/' },
  verticalVideo: {
    firstTwoSecondHook: 'What the evidence actually says',
    losslessCopy: {
      finding: { sourceText: 'The canonical finding.' },
      limitation: { sourceText: 'The canonical limitation.' },
    },
    scenes: [
      { role: 'evidence', voiceover: 'Evidence: randomized human trial.', onScreenText: 'Evidence: randomized human trial.' },
      { role: 'context', voiceover: 'Educational, not medical advice.', onScreenText: 'Educational, not medical advice.' },
      { role: 'cta', voiceover: 'Read the full evidence page.', onScreenText: 'Read the full evidence page.' },
    ],
  },
}

function safeBrief() {
  return {
    beats: [
      { role: 'hook', narration: 'What the evidence actually says', onScreenText: 'What the evidence actually says', factualAuthority: 'creative-framing' },
      { role: 'finding', narration: 'The canonical finding.', onScreenText: 'The canonical finding.', factualAuthority: 'canonical-input' },
      { role: 'evidence', narration: 'Evidence: randomized human trial.', onScreenText: 'Evidence: randomized human trial.', factualAuthority: 'canonical-input' },
      { role: 'limitation', narration: 'The canonical limitation.', onScreenText: 'The canonical limitation.', factualAuthority: 'canonical-input' },
      { role: 'source', narration: '', onScreenText: 'https://thehippiescientist.net/herbs/example/', factualAuthority: 'canonical-source' },
      { role: 'context', narration: 'Educational, not medical advice.', onScreenText: 'Educational, not medical advice.', factualAuthority: 'canonical-input' },
      { role: 'cta', narration: 'Read the full evidence page.', onScreenText: 'Read the full evidence page.', factualAuthority: 'canonical-input' },
    ],
  }
}

describe('R8.05 exact-copy safety gate', () => {
  it('accepts exact canonical factual copy', () => {
    expect(validateR805BriefCopyAgainstCanonical(safeBrief(), canonicalSpec)).toBe('validated-lossless')
  })

  it('rejects omission of governed evidence/disclosure/CTA beats', () => {
    const brief = safeBrief()
    brief.beats = brief.beats.filter((beat) => beat.role !== 'context')
    expect(() => validateR805BriefCopyAgainstCanonical(brief, canonicalSpec)).toThrow(/exactly one governed context beat/i)
  })

  it('rejects an overclaim instead of inheriting an unrelated safety receipt', () => {
    const brief = safeBrief()
    brief.beats[1].narration = 'This definitely cures the condition.'
    brief.beats[1].onScreenText = 'THIS CURES IT'
    expect(() => validateR805BriefCopyAgainstCanonical(brief, canonicalSpec)).toThrow(/finding .*reconstruct.*exactly/i)
  })
})
