import { expect, test } from 'vitest'
import { renderVerticalVideoSceneSvg } from '../render-vertical-video-package.mjs'

const options={
  sourceUrl:'https://thehippiescientist.net/example/',
  contentHash:'a'.repeat(64),
  disclosure:'Educational content — not medical advice.',
}

function scene(overrides={}) {
  return {
    role:'finding',
    beatId:'finding',
    start:0,
    end:4,
    onScreenText:'The result changed the expected pattern.',
    factualAuthority:'canonical-input',
    colorTreatment:'evidence',
    motionType:'reveal',
    motionCueOffset:1.2,
    motionCueMethod:'voice-duration-proportional-text-anchor',
    ...overrides,
  }
}

test('R8.07 composition families render materially different local SVG pixels',()=>{
  const hero=renderVerticalVideoSceneSvg(scene({compositionFamily:'hero-object',motifId:'result-thread'}),options)
  const compare=renderVerticalVideoSceneSvg(scene({compositionFamily:'split-compare'}),options)
  expect(hero.svg).toContain('data-r807-composition="hero-object"')
  expect(hero.svg).toContain('data-r807-motif="result-thread"')
  expect(compare.svg).toContain('data-r807-composition="split-compare"')
  expect(hero.hash).not.toBe(compare.hash)
})

test('R8.07 semantic pattern interrupt renders an explicit visual state',()=>{
  const rendered=renderVerticalVideoSceneSvg(scene({
    role:'limitation',
    beatId:'limitation',
    compositionFamily:'diagram-flow',
    motifId:'result-thread',
    patternInterrupt:true,
    patternInterruptReason:'limitation-pivot',
  }),options)
  expect(rendered.svg).toContain('data-r807-pattern-interrupt="true"')
  expect(rendered.svg).toContain('data-r807-composition="diagram-flow"')
  expect(rendered.svg).toContain('&quot;patternInterrupt&quot;:true')
  expect(rendered.svg).toContain('&quot;patternInterruptReason&quot;:&quot;limitation-pivot&quot;')
})
