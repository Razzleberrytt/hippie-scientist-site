/** EvidenceMotion RESEARCH ONLY: story-relevant physical action, not camera decoration.
 * Negative filter for director proposals. No model calls, publishing or generated science.
 */
const slug = x => typeof x === 'string' && /^[a-zA-Z][\w.-]{1,90}$/.test(x)
const hash = x => typeof x === 'string' && /^[a-f\d]{64}$/i.test(x)
const finite = x => typeof x === 'number' && Number.isFinite(x)
const meaningful = new Set([
  'OPENS_TO_REVEAL', 'FOLDS_TO_REVEAL', 'MOVES_INTO_BOUND_SPACE',
  'ASSEMBLES_FROM_PARTS', 'SEPARATES_INTO_PARTS', 'PHYSICAL_SCALE_REVEAL',
  'REVEAL', 'TRACE', 'COMPARE_ACTIVE', 'FOCUS_TO_NEW_EVIDENCE', 'TRANSFORM_SOURCE_BOUND'
])
const merelyDecorative = new Set([
  'CAMERA_ONLY', 'COLOR_WIPE', 'PARTICLES_ONLY', 'TEXT_SWAP',
  'LIGHT_FLASH', 'ROTATING_FLAT_CARD'
])
export function inspectHeroAction(plan) {
  const reasons = []
  if (!plan || typeof plan !== 'object') return {status:'HOLD',reasons:['MISSING_ACTION_PLAN'],releaseApproved:false}
  if (!slug(plan.beatId) || !slug(plan.heroObjectId) || !hash(plan.lockedHeroArtSha256))
    reasons.push('UNBOUND_RECOGNIZABLE_HERO')
  if (!finite(plan.startSec) || !finite(plan.endSec) || plan.startSec < 0 || plan.endSec <= plan.startSec ||
    !finite(plan.narrationCueSec) || plan.narrationCueSec < plan.startSec || plan.narrationCueSec > plan.endSec)
    reasons.push('ACTION_NOT_BOUND_TO_LOCKED_AUDIO')
  if (!meaningful.has(plan.physicalVerb)) reasons.push(merelyDecorative.has(plan.physicalVerb) ?
    'DECORATION_IS_NOT_HERO_ACTION' : 'UNKNOWN_PHYSICAL_ACTION')
  if (!slug(plan.beforeStateId) || !slug(plan.afterStateId) || plan.beforeStateId === plan.afterStateId)
    reasons.push('HERO_STATE_DOES_NOT_CHANGE')
  if (!Array.isArray(plan.visibleObjectIds) || !plan.visibleObjectIds.includes(plan.heroObjectId) ||
      new Set(plan.visibleObjectIds).size !== plan.visibleObjectIds.length)
    reasons.push('HERO_NOT_TRACKABLE_IN_SCENE')
  if (plan.cameraMoveCount !== 1) reasons.push('MORE_THAN_ONE_CAMERA_MOVE')
  if (plan.effectOnly === true || plan.movingParticlesOnly === true || plan.flatSlideOverlay === true)
    reasons.push('VISUAL_EFFECT_SUBSTITUTED_FOR_ACTION')
  if (plan.scientificMeaningClaimed === true && (!hash(plan.sourceManifestSha256) ||
      !hash(plan.reviewedGeometrySha256) || plan.symbolicLimitLabeled !== true))
    reasons.push('FALSIFIABLE_SCIENCE_REQUIREMENTS_MISSING')
  if (plan.photorealSyntheticFootage === true && plan.syntheticMediaDisclosure !== true)
    reasons.push('UNDISCLOSED_SYNTHETIC_FOOTAGE')
  return {status:reasons.length ? 'HOLD' : 'READY_FOR_PHYSICAL_PREVIZ_AND_HUMAN_CRAFT_VETO',
    reasons,releaseApproved:false,craftCertified:false,productionEligible:false,
    note:'A valid physical action is not proof of realistic materials, recognizability, source accuracy or cinematic taste.'}
}


/**
 * Research pre-render integration of the existing hero-action checker.
 * This DOES NOT authenticate a render. Actual decoded pixels, word alignment,
 * source approval, independent craft review, and publishing remain separate.
 */
const hasIds = items => Array.isArray(items) && items.length > 0 &&
  items.every(slug) && new Set(items).size === items.length
const VISUAL_VERBS = new Set([
  ...meaningful, 'REVEAL', 'TRACE', 'COMPARE_ACTIVE',
  'FOCUS_TO_NEW_EVIDENCE', 'TRANSFORM_SOURCE_BOUND'
])
const HERO_ROI = b => b && typeof b === 'object' &&
  ['x1','y1','x2','y2'].every(k => finite(b[k])) &&
  b.x1 >= 0.04 && b.x2 <= 0.82 && b.y1 >= 0.11 && b.y2 <= 0.78 &&
  b.x2 - b.x1 >= 0.1 && b.y2 - b.y1 >= 0.1
const MAX_ACTION_GAP_SEC = 3
const MAX_SOURCE_HOLD_SEC = 3.2
const TIME_EPS = 0.005

export function inspectSceneVisualVerbPlan(plan) {
  const reasons = []
  const add = code => { if (!reasons.includes(code)) reasons.push(code) }
  const unavailable = () => ({
    status:'HOLD', reasons, physicalFrameReviewRequired:true,
    craftCertified:false, mayPublish:false, productionEligible:false
  })
  if (!plan || !hash(plan.sourceManifestSha256) ||
      !hash(plan.lockedNarrationWavSha256) ||
      !finite(plan.durationSec) || plan.durationSec <= 0 ||
      !Array.isArray(plan.scenes) || plan.scenes.length === 0) {
    add('SOURCE_LOCKED_SCENE_SEQUENCE_REQUIRED')
    return unavailable()
  }
  const eventTimes = [], holds = [], families = new Set(), sceneIds = new Set()
  let previousEnd = 0, instructionalCount = 0
  for (const scene of plan.scenes) {
    if (!scene || !slug(scene.beatId) || sceneIds.has(scene.beatId) ||
        !finite(scene.startSec) || !finite(scene.endSec) ||
        scene.endSec <= scene.startSec ||
        Math.abs(scene.startSec - previousEnd) > TIME_EPS ||
        scene.endSec > plan.durationSec + TIME_EPS) {
      add('BROKEN_OR_DUPLICATED_SCENE_TIMELINE')
      continue
    }
    previousEnd = scene.endSec
    sceneIds.add(scene.beatId)
    if (!slug(scene.compositionFamily) ||
        !hasIds(scene.sourceClaimIds) || !hasIds(scene.sourceAssetIds) ||
        scene.lockedNarrationWavSha256 !== plan.lockedNarrationWavSha256) {
      add('SCENE_SOURCE_OR_VOICE_IDENTITY_MISSING')
      continue
    }
    // The decoder needs a bounded, source-authored hero ROI instead of a
    // guess that all teaching objects are exactly screen-centered.
    if (!HERO_ROI(scene.heroBox)) add('MISSING_OR_UNSAFE_SCENE_HERO_ROI')
    if (scene.staticHold) {
      const h=scene.staticHold
      if (scene.actions?.length || h.kind !== 'SOURCE_EVIDENCE_READ' ||
          !slug(h.sourceId) || !scene.sourceAssetIds.includes(h.sourceId) ||
          typeof h.reason !== 'string' || h.reason.trim().length < 12 ||
          scene.endSec - scene.startSec > MAX_SOURCE_HOLD_SEC + TIME_EPS)
        add('UNJUSTIFIED_OR_TOO_LONG_STATIC_HOLD')
      else holds.push({start:scene.startSec,end:scene.endSec})
      continue
    }
    instructionalCount++
    families.add(scene.compositionFamily)
    if (!Array.isArray(scene.actions) || scene.actions.length === 0) {
      add('INSTRUCTIONAL_SCENE_MISSING_VISUAL_VERB')
      continue
    }
    let lastAction = scene.startSec - TIME_EPS
    // Source-declared pacing cannot be padded by replaying the same unchanged
    // teaching-object transition. Reset at scene cuts, which may intentionally
    // revisit an object for a different lesson.
    const priorHeroTransitions = new Map()
    for (const event of scene.actions) {
      if (!event || !finite(event.atSec) ||
          event.atSec < scene.startSec - TIME_EPS ||
          event.atSec > scene.endSec + TIME_EPS ||
          event.atSec <= lastAction + TIME_EPS ||
          !VISUAL_VERBS.has(event.visualVerb)) {
        add('INVALID_VISUAL_VERB_OR_AUDIO_ANCHOR')
        continue
      }
      lastAction = event.atSec
      if (slug(event.heroObjectId) && hash(event.lockedHeroArtSha256) &&
          slug(event.beforeStateId) && slug(event.afterStateId)) {
        const heroKey = `${event.heroObjectId}:${event.lockedHeroArtSha256}`
        const prior = priorHeroTransitions.get(heroKey)
        if (prior && prior.before === event.beforeStateId &&
            prior.after === event.afterStateId)
          add('REPLAYED_HERO_TRANSITION_NOT_NEW_TEACHING_ACTION')
        priorHeroTransitions.set(heroKey, {
          before:event.beforeStateId, after:event.afterStateId
        })
      }
      // A visual verb cannot borrow a different claim or unreviewed asset from the scene.
      // This is an identity guard, not verification that the depicted science is correct.
      if (!slug(event.sourceClaimId) || !scene.sourceClaimIds.includes(event.sourceClaimId) ||
          !slug(event.sourceAssetId) || !scene.sourceAssetIds.includes(event.sourceAssetId))
        add('UNBOUND_ACTION_SOURCE_OR_CLAIM')
      const physical = inspectHeroAction({
        beatId:scene.beatId, heroObjectId:event.heroObjectId,
        lockedHeroArtSha256:event.lockedHeroArtSha256,
        startSec:scene.startSec, endSec:scene.endSec,
        narrationCueSec:event.atSec, physicalVerb:event.visualVerb,
        beforeStateId:event.beforeStateId, afterStateId:event.afterStateId,
        visibleObjectIds:event.visibleObjectIds,
        cameraMoveCount:event.cameraMoveCount,
        effectOnly:event.effectOnly, movingParticlesOnly:event.movingParticlesOnly,
        flatSlideOverlay:event.flatSlideOverlay,
        scientificMeaningClaimed:event.scientificMeaningClaimed,
        sourceManifestSha256:plan.sourceManifestSha256,
        reviewedGeometrySha256:event.reviewedGeometrySha256,
        symbolicLimitLabeled:event.symbolicLimitLabeled,
        photorealSyntheticFootage:event.photorealSyntheticFootage,
        syntheticMediaDisclosure:event.syntheticMediaDisclosure
      })
      for (const reason of physical.reasons) add(reason)
      // A source-aligned declared action is not evidence it actually happened.
      eventTimes.push(event.atSec)
    }
  }
  if (Math.abs(previousEnd - plan.durationSec) > TIME_EPS)
    add('SCENE_SEQUENCE_DOES_NOT_COVER_NARRATION')
  if (instructionalCount > 1 && families.size < 2)
    add('NO_MEANINGFUL_COMPOSITION_FAMILY_CONTRAST')
  const changePoints=[0,...eventTimes.sort((a,b)=>a-b),plan.durationSec]
  for (let i=1;i<changePoints.length;i++) {
    const a=changePoints[i-1], b=changePoints[i]
    if (b-a <= MAX_ACTION_GAP_SEC + TIME_EPS) continue
    // A verified, short source-card reading interval does not force fake motion.
    // Only the time actually inside an authorized hold is discounted.
    const holdSeconds=holds.reduce((total,h)=>
      total+Math.max(0,Math.min(b,h.end)-Math.max(a,h.start)),0)
    if (b-a-holdSeconds > MAX_ACTION_GAP_SEC + TIME_EPS)
      add('PLANNED_TEACHING_ACTION_GAP_EXCEEDS_3_SECONDS')
  }
  // Pairwise checks miss three or more small adjacent source cards.
  // Count the entire unbroken source-reading run, not just neighboring pairs.
  let runStart = null, runEnd = null
  for (const h of holds) {
    if (runEnd === null || h.start - runEnd > TIME_EPS)
      runStart = h.start
    runEnd = h.end
    if (runEnd - runStart > MAX_SOURCE_HOLD_SEC + TIME_EPS) {
      add('CONSECUTIVE_STATIC_HOLDS_HIDE_STAGNATION')
      break
    }
  }
  // A whole film of source cards does not establish instructional movement.
  if (eventTimes.length === 0)
    add('SOURCE_CARDS_ALONE_DO_NOT_PROVE_VISUAL_STORY')
  return {
    status:reasons.length?'HOLD':'PLAN_READY_FOR_ACTUAL_DECODED_CRAFT_REVIEW',
    reasons, declaredActionCount:eventTimes.length,
    physicalFrameReviewRequired:true, creativeVerdict:'CRAFT_HOLD',
    craftCertified:false, mayPublish:false, productionEligible:false,
    note:'Planned actions and times are untrusted until independent actual-H264 decoded-frame verification; no artistic PASS.'
  }
}

const IMPROVEMENT_METRICS = Object.freeze({
  HOOK:'first_meaningful_subject_action_sec',
  SEMANTIC_MOTION:'longest_stagnant_teaching_subject_sec',
  COMPOSITION:'repeated_teaching_layout_fraction',
  PACING:'longest_unmotivated_hold_sec'
})

/** Pre-encode goal is fixed: it is NOT the film's final creative score. */
export function inspectImprovementPrecommit(record) {
  const reasons=[]
  const add=code=>{if(!reasons.includes(code)) reasons.push(code)}
  if (!record || !Object.hasOwn(IMPROVEMENT_METRICS,record.dimension) ||
      record.metricId !== IMPROVEMENT_METRICS[record.dimension])
    add('EXACTLY_ONE_KNOWN_IMPROVEMENT_DIMENSION_REQUIRED')
  if (!record || !slug(record.videoId) ||
      !hash(record.referenceMp4Sha256) ||
      !hash(record.sourceManifestSha256) ||
      !hash(record.lockedNarrationWavSha256) ||
      !hash(record.immutableBriefSha256))
    add('MISSING_PRE_RENDER_REFERENCE_OR_SOURCE_PIN')
  if (!record || !finite(record.referenceWeaknessSec) ||
      record.referenceWeaknessSec < 0 ||
      !finite(record.baselineMetricValue) ||
      record.baselineMetricValue <= 0 ||
      !finite(record.targetMaximumValue) ||
      record.targetMaximumValue < 0 ||
      record.targetMaximumValue >= record.baselineMetricValue)
    add('BASELINE_AND_STRICT_TARGET_REQUIRED')
  if (!record || typeof record.expectedVisualChange !== 'string' ||
      record.expectedVisualChange.trim().length < 15 ||
      typeof record.comparabilityLimit !== 'string' ||
      record.comparabilityLimit.trim().length < 15)
    add('MEASURABLE_CHANGE_AND_COMPARABILITY_BOUNDARY_REQUIRED')
  return {
    status:reasons.length?'HOLD':'PRECOMMIT_STRUCTURALLY_READY',
    reasons, registeredBeforeRenderVerified:false,
    referenceFilmIndependentlyDecoded:false,
    improvementObserved:false, craftCertified:false,
    mayPublish:false, productionEligible:false,
    note:'A supplied timestamp/brief SHA does not independently establish precommit order; a trusted immutable registry and exact-media comparison must verify this.'
  }
}
