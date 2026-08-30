const clean = (value) => String(value ?? '').trim()

export const VERTICAL_VIDEO_MOTION_TOKENS = Object.freeze({
  schemaVersion: '1.0.0',
  allowedTransitions: ['cut', 'crossfade'],
  defaultTransition: 'crossfade',
  defaultDurationMs: 180,
  maximumDurationMs: 300,
  reducedMotion: {
    transition: 'cut',
    durationMs: 0,
  },
  prohibitedEffects: ['flash', 'strobe', 'rapid-zoom', 'spin', 'shake'],
})

function assertFiniteTime(value, label) {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be a non-negative finite number`)
}

export function assertValidVerticalVideoTimeline(timeline) {
  if (!timeline || Number(timeline.width) !== 1080 || Number(timeline.height) !== 1920) {
    throw new Error('motion contract requires the canonical 1080x1920 vertical-video timeline')
  }
  if (Number(timeline.durationSeconds) !== 30) throw new Error('motion contract requires the canonical 30-second timeline')
  if (!Array.isArray(timeline.scenes) || timeline.scenes.length < 2) throw new Error('motion contract requires at least two governed scenes')

  for (let index = 0; index < timeline.scenes.length; index += 1) {
    const scene = timeline.scenes[index]
    assertFiniteTime(Number(scene.start), `scene ${index + 1} start`)
    assertFiniteTime(Number(scene.end), `scene ${index + 1} end`)
    if (Number(scene.end) <= Number(scene.start)) throw new Error(`scene ${index + 1} must have positive duration`)
    if (!clean(scene.id) || !clean(scene.role)) throw new Error(`scene ${index + 1} requires id and role`)
    if (index === 0 && Number(scene.start) !== 0) throw new Error('first governed scene must start at zero')
    if (index > 0 && Number(timeline.scenes[index - 1].end) !== Number(scene.start)) {
      throw new Error('governed vertical-video scenes must remain contiguous')
    }
  }
  if (Number(timeline.scenes.at(-1).end) !== 30) throw new Error('last governed scene must end at 30 seconds')
  return timeline
}

export function validateVerticalVideoMotionPlan(plan, tokens = VERTICAL_VIDEO_MOTION_TOKENS) {
  const errors = []
  const allowed = new Set(tokens.allowedTransitions)
  const prohibited = new Set(tokens.prohibitedEffects)

  if (clean(plan?.schemaVersion) !== tokens.schemaVersion) errors.push('motion-plan schemaVersion is not canonical')
  if (!Array.isArray(plan?.transitions)) errors.push('motion-plan transitions are required')

  for (const [index, transition] of (plan?.transitions ?? []).entries()) {
    const prefix = `transition ${index + 1}`
    if (!clean(transition.fromSceneId) || !clean(transition.toSceneId)) errors.push(`${prefix} requires scene identities`)
    if (!allowed.has(clean(transition.type))) errors.push(`${prefix} uses an unknown transition primitive`)
    if (!Number.isFinite(transition.durationMs) || transition.durationMs < 0 || transition.durationMs > tokens.maximumDurationMs) {
      errors.push(`${prefix} duration exceeds the accessible motion budget`)
    }
    for (const effect of transition.effects ?? []) {
      if (prohibited.has(clean(effect))) errors.push(`${prefix} uses prohibited effect ${clean(effect)}`)
    }
    if (clean(transition.reducedMotion?.type) !== tokens.reducedMotion.transition || Number(transition.reducedMotion?.durationMs) !== tokens.reducedMotion.durationMs) {
      errors.push(`${prefix} requires an explicit zero-motion reduced-motion fallback`)
    }
  }

  if (plan?.flashingAllowed !== false) errors.push('flashing must be explicitly prohibited')
  if (plan?.factualCopyMutable !== false) errors.push('motion plan may not mutate factual copy')
  return errors
}

export function buildVerticalVideoMotionPlan(timeline, tokens = VERTICAL_VIDEO_MOTION_TOKENS) {
  assertValidVerticalVideoTimeline(timeline)
  const transitions = timeline.scenes.slice(1).map((scene, index) => ({
    id: `transition-${String(index + 1).padStart(2, '0')}`,
    fromSceneId: timeline.scenes[index].id,
    toSceneId: scene.id,
    atSeconds: Number(scene.start),
    type: tokens.defaultTransition,
    durationMs: tokens.defaultDurationMs,
    effects: [],
    reducedMotion: {
      type: tokens.reducedMotion.transition,
      durationMs: tokens.reducedMotion.durationMs,
    },
  }))

  const plan = {
    schemaVersion: tokens.schemaVersion,
    contract: 'vertical-video-motion-v1',
    sourceTimelineRenderer: clean(timeline.renderer),
    sourceContentHash: clean(timeline.sourceContentHash),
    durationSeconds: 30,
    flashingAllowed: false,
    factualCopyMutable: false,
    transitions,
  }
  const errors = validateVerticalVideoMotionPlan(plan, tokens)
  if (errors.length) throw new Error(`invalid vertical-video motion plan: ${errors.join('; ')}`)
  return plan
}
