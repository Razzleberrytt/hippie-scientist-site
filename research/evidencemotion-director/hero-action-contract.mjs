/** EvidenceMotion RESEARCH ONLY: story-relevant physical action, not camera decoration.
 * Negative filter for director proposals. No model calls, publishing or generated science.
 */
const slug = x => typeof x === 'string' && /^[a-zA-Z][\w.-]{1,90}$/.test(x)
const hash = x => typeof x === 'string' && /^[a-f\d]{64}$/i.test(x)
const finite = x => typeof x === 'number' && Number.isFinite(x)
const meaningful = new Set([
  'OPENS_TO_REVEAL', 'FOLDS_TO_REVEAL', 'MOVES_INTO_BOUND_SPACE',
  'ASSEMBLES_FROM_PARTS', 'SEPARATES_INTO_PARTS', 'PHYSICAL_SCALE_REVEAL'
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
