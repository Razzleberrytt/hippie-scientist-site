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


test('R8.07 reveal composition respects the voice-derived pre/post motion state',()=>{
  const target=scene({compositionFamily:'hero-object',motifId:'result-thread',motionType:'reveal'})
  const pre=renderVerticalVideoSceneSvg(target,{...options,motionPhase:'pre'})
  const post=renderVerticalVideoSceneSvg(target,{...options,motionPhase:'post'})
  expect(pre.svg).not.toContain('data-r807-composition="hero-object"')
  expect(post.svg).toContain('data-r807-composition="hero-object"')
  expect(pre.hash).not.toBe(post.hash)
})


test('R8.07 reveal compositions stay hidden until the voice-derived post-cue frame',()=>{
  const target=scene({
    role:'hook',
    beatId:'hook',
    compositionFamily:'hero-object',
    motifId:'result-thread',
    motionType:'reveal',
  })
  const pre=renderVerticalVideoSceneSvg(target,{...options,motionPhase:'pre'})
  const post=renderVerticalVideoSceneSvg(target,{...options,motionPhase:'post'})
  expect(pre.svg).not.toContain('data-r807-composition="hero-object"')
  expect(pre.svg).not.toContain('data-r807-motif="result-thread"')
  expect(post.svg).toContain('data-r807-composition="hero-object"')
  expect(post.svg).toContain('data-r807-motif="result-thread"')
  expect(pre.hash).not.toBe(post.hash)
})

test('R8.07 limitation interrupt appears only on the semantic post-cue frame',()=>{
  const target=scene({
    role:'limitation',
    beatId:'limitation',
    compositionFamily:'diagram-flow',
    motifId:'result-thread',
    patternInterrupt:true,
    patternInterruptReason:'limitation-pivot',
    motionType:'highlight',
  })
  const pre=renderVerticalVideoSceneSvg(target,{...options,motionPhase:'pre'})
  const post=renderVerticalVideoSceneSvg(target,{...options,motionPhase:'post'})
  expect(pre.svg).toContain('data-r807-composition="diagram-flow"')
  expect(pre.svg).not.toContain('data-r807-pattern-interrupt="true"')
  expect(pre.svg).not.toContain('data-r807-motif="result-thread"')
  expect(post.svg).toContain('data-r807-pattern-interrupt="true"')
  expect(post.svg).toContain('data-r807-motif="result-thread"')
})
