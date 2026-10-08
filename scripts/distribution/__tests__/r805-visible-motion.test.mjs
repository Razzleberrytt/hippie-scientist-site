import { describe, expect, it } from 'vitest'
import { renderVerticalVideoSceneSvg } from '../render-vertical-video-package.mjs'

const common = {
  sourceUrl: 'https://thehippiescientist.net/herbs/example/',
  contentHash: 'abc123',
  disclosure: 'Educational, not medical advice.',
}

function scene(motionType) {
  return {
    beatId: 'beat-1',
    beatReceiptSha256: 'a'.repeat(64),
    role: 'finding',
    start: 0,
    end: 2.5,
    onScreenText: 'The canonical finding.',
    factualAuthority: 'canonical-input',
    colorTreatment: 'evidence',
    spokenAnchor: 'canonical',
    visualAction: motionType === 'reveal' ? 'reveal the finding' : 'highlight the finding',
    cutReason: 'reveal',
    motionType,
    motionCueOffset: 1.2,
    motionCueMethod: 'voice-duration-proportional-text-anchor',
  }
}

describe('R8.05 visible internal motion states', () => {
  it('reveal has a genuinely different pre-anchor visible state', () => {
    const pre = renderVerticalVideoSceneSvg(scene('reveal'), { ...common, motionPhase: 'pre' }).svg
    const post = renderVerticalVideoSceneSvg(scene('reveal'), { ...common, motionPhase: 'post' }).svg
    expect(pre).not.toContain('The canonical finding.')
    expect(post).toContain('The canonical finding.')
    expect(pre).not.toBe(post)
  })

  it('highlight adds a visible emphasis only after the anchor cue', () => {
    const pre = renderVerticalVideoSceneSvg(scene('highlight'), { ...common, motionPhase: 'pre' }).svg
    const post = renderVerticalVideoSceneSvg(scene('highlight'), { ...common, motionPhase: 'post' }).svg
    expect(pre).toContain('The canonical finding.')
    expect(post).toContain('The canonical finding.')
    expect(pre).not.toContain('height="8" rx="4"')
    expect(post).toContain('height="8" rx="4"')
  })
})
