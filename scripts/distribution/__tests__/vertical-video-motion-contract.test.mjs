import { expect, test } from 'vitest'
import {
  VERTICAL_VIDEO_MOTION_TOKENS,
  assertValidVerticalVideoTimeline,
  buildVerticalVideoMotionPlan,
  validateVerticalVideoMotionPlan,
} from '../vertical-video-motion-contract.mjs'

const timeline = {
  schemaVersion: '1.0.0',
  renderer: 'vertical-video-package-v1',
  sourceContentHash: 'abc123',
  width: 1080,
  height: 1920,
  durationSeconds: 30,
  scenes: [
    { id: 'video-scene-1', role: 'hook', start: 0, end: 2 },
    { id: 'video-scene-2', role: 'finding', start: 2, end: 8 },
    { id: 'video-scene-3', role: 'limitation', start: 8, end: 15 },
    { id: 'video-scene-4', role: 'source', start: 15, end: 20 },
    { id: 'video-scene-5', role: 'context', start: 20, end: 25 },
    { id: 'video-scene-6', role: 'cta', start: 25, end: 30 },
  ],
}

test('builds a deterministic calm transition plan with an explicit zero-motion fallback', () => {
  const first = buildVerticalVideoMotionPlan(timeline)
  const second = buildVerticalVideoMotionPlan(structuredClone(timeline))
  expect(first).toEqual(second)
  expect(first.contract).toBe('vertical-video-motion-v1')
  expect(first.flashingAllowed).toBe(false)
  expect(first.factualCopyMutable).toBe(false)
  expect(first.transitions).toHaveLength(timeline.scenes.length - 1)
  expect(validateVerticalVideoMotionPlan(first)).toEqual([])

  for (const transition of first.transitions) {
    expect(VERTICAL_VIDEO_MOTION_TOKENS.allowedTransitions).toContain(transition.type)
    expect(transition.durationMs).toBeLessThanOrEqual(VERTICAL_VIDEO_MOTION_TOKENS.maximumDurationMs)
    expect(transition.effects).toEqual([])
    expect(transition.reducedMotion).toEqual({ type: 'cut', durationMs: 0 })
  }
})

test('fails closed on flashing, rapid zoom, excessive duration, unknown primitives, or missing reduced-motion fallback', () => {
  const plan = buildVerticalVideoMotionPlan(timeline)
  const unsafe = structuredClone(plan)
  unsafe.transitions[0] = {
    ...unsafe.transitions[0],
    type: 'whip-pan',
    durationMs: 900,
    effects: ['flash', 'rapid-zoom'],
    reducedMotion: { type: 'crossfade', durationMs: 180 },
  }
  unsafe.flashingAllowed = true

  const errors = validateVerticalVideoMotionPlan(unsafe)
  expect(errors.join('\n')).toMatch(/unknown transition primitive/)
  expect(errors.join('\n')).toMatch(/accessible motion budget/)
  expect(errors.join('\n')).toMatch(/prohibited effect flash/)
  expect(errors.join('\n')).toMatch(/prohibited effect rapid-zoom/)
  expect(errors.join('\n')).toMatch(/zero-motion reduced-motion fallback/)
  expect(errors.join('\n')).toMatch(/flashing must be explicitly prohibited/)
})

test('rejects noncanonical, discontinuous, or incomplete timelines before motion planning', () => {
  expect(() => assertValidVerticalVideoTimeline({ ...timeline, width: 720 })).toThrow(/1080x1920/)
  expect(() => assertValidVerticalVideoTimeline({ ...timeline, durationSeconds: 29 })).toThrow(/30-second/)
  expect(() => assertValidVerticalVideoTimeline({
    ...timeline,
    scenes: timeline.scenes.map((scene, index) => index === 2 ? { ...scene, start: 9 } : scene),
  })).toThrow(/contiguous/)
  expect(() => assertValidVerticalVideoTimeline({
    ...timeline,
    scenes: timeline.scenes.map((scene, index) => index === timeline.scenes.length - 1 ? { ...scene, end: 29 } : scene),
  })).toThrow(/end at 30 seconds/)
})
