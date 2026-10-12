import { validate7OhRegulatoryStatus } from './r8-7oh-regulatory-freshness.mjs'
import crypto from 'node:crypto'

// R8.19 release contract. Independent scientific and craft decisions are separate.
// A technical test may reject a video, but NEVER grant scientific or craft approval.
const hash = value => /^[a-f0-9]{64}$/.test(String(value ?? ''))
const finite = value => typeof value === 'number' && Number.isFinite(value)
const REJECTION = 'REJECTED_NO_REPAIR_LOOP'

export function assessR819Release({build = {}, science = {}, craft = {}} = {}) {
  const hardKills = []
  const technicalHolds = []
  if (!hash(build.finalMp4Sha256) || !hash(build.sourceSha256) ||
      !hash(build.pinnedArtSha256) || build.pinnedArtVerified !== true)
    technicalHolds.push('Missing exact master, source, or immutable art SHA-256 receipt')
  if (build.fullLayeredCompositor !== true || build.trustTopmostVerified !== true)
    technicalHolds.push('R8.19 native art → mechanism → trust layering not yet independently verified')
  if (build?.video?.width !== 1080 || build?.video?.height !== 1920 || build?.video?.fps !== 30)
    technicalHolds.push('Native 1080 × 1920 at 30fps final decode absent')
  if (!finite(build?.audio?.integratedLufs) || Math.abs(build.audio.integratedLufs + 14) > 1 ||
      !finite(build?.audio?.truePeakDbfs) || build.audio.truePeakDbfs > -1 ||
      build.audio.measuredFromFinal !== true)
    technicalHolds.push('Final MP4 -14 ±1 LUFS and ≤ -1 dBTP must be metered')
  if (build?.audio?.timeStretchApplied === true || build?.audio?.originalDurationPreserved === false)
    hardKills.push('NARRATION_STRETCHED_TO_FIT_VIDEO')
  else if (build?.audio?.timeStretchApplied !== false || build?.audio?.originalDurationPreserved !== true)
    technicalHolds.push('Narration duration and no-time-stretch provenance not established')
  if (build?.hero?.declared === false || build?.hero?.physicallyRendered === false ||
      build?.hero?.artisticallyDistinct === false)
    hardKills.push('NO_CINEMATIC_HERO_VISUAL')
  else if (build?.hero?.declared !== true || build?.hero?.physicallyRendered !== true ||
      build?.hero?.artisticallyDistinct !== true)
    technicalHolds.push('One visually distinctive physical hero beat awaits verification')
  if (!Array.isArray(build?.motion?.perBeat) || !build.motion.perBeat.length ||
      build.motion.compositionSampling !== 'caption-excluded-object-plus-decoded-pixels')
    technicalHolds.push('Native object geometry AND decoded non-caption pixel motion not evidenced')
  else if (build.motion.perBeat.some(beat =>
      !finite(beat.longestCompositionalHoldSeconds) || beat.longestCompositionalHoldSeconds > 6))
    hardKills.push('OVER_SIX_SECONDS_WITHOUT_MEANINGFUL_COMPOSITION_CHANGE')
  if (build?.items?.allNarrationCued !== true)
    technicalHolds.push('Narrated multi-item sequences not verified against the acoustic timeline')
  // A reviewer actually comparing visual craft against a niche shelf owns this.
  // Image-classification heuristics may nominate review; they cannot pass it.
  if (craft?.stockFeel === 'FAIL' || craft?.clipArtFeel === 'FAIL')
    hardKills.push('STOCK_TRANSITION_OR_CLIP_ART_VISUAL')

  const scienceHolds = []
  if (!hash(science.claimLedgerSha256) || !hash(science.alignmentReceiptSha256))
    scienceHolds.push('Canonical claim ledger and genuine word-alignment receipts missing')
  for (const field of ['attributionsChecked', 'denominatorsChecked', 'symbolicLabelsChecked',
    'sourceFootersPixelVerified', 'exactNarrationReviewed']) {
    if (science[field] !== true) scienceHolds.push('Missing science/trust verification: ' + field)
  }
  scienceHolds.push(...validate7OhRegulatoryStatus({
    onScreenText:science.exactOnScreenText,
    narrationText:science.exactNarrationText,
    regulatoryClaimPresent:science.regulatoryClaimPresent===true,
    snapshot:science.regulatoryStatusSnapshot,
    publicationDate:science.publicationDate
  }))
  if (science.reviewVerdict !== 'APPROVE' || !science.reviewAuthor)
    scienceHolds.push('Named independent source/claim reviewer has not approved this exact master')
  const correctness = {verdict:scienceHolds.length ? 'PENDING_INDEPENDENT_REVIEW' : 'PASS',
    blockers:scienceHolds}

  const shelf = craft?.referenceShelf
  const validShelf = craft?.referenceShelfCuratedByOwner === true &&
    Array.isArray(shelf) && shelf.length >= 3 && shelf.length <= 5 &&
    shelf.every(url => typeof url === 'string' && /^https:\/\//.test(url)) &&
    new Set(shelf).size === shelf.length
  const craftHolds = [...technicalHolds]
  if (!validShelf) craftHolds.push('Owner-curated 3–5-video niche reference shelf not supplied')
  if (craft?.independentReviewer !== 'V' || craft?.verdict !== 'APPROVE')
    craftHolds.push('V independent reference-shelf craft approval absent')
  if (craft?.phonePlaybackApproved !== true)
    craftHolds.push('Owner native-phone audiovisual review absent')
  if (craft?.stockFeel !== 'PASS' || craft?.clipArtFeel !== 'PASS')
    craftHolds.push('Visual originality requires explicit external craft clearance')
  const craftVerdict = hardKills.length ? REJECTION : craftHolds.length ? 'HOLD_FOR_CRAFT_REVIEW' : 'PASS'
  const craftResult = {verdict:craftVerdict, hardKills, blockers:craftHolds}
  return {schemaVersion:'ths-r819-two-verdict-release-v1',
    correctness,craft:craftResult,
    publicationVerdict:correctness.verdict === 'PASS' && craftVerdict === 'PASS'
      ? 'ELIGIBLE_FOR_SEPARATE_OWNER_PUBLICATION_APPROVAL' : 'DO_NOT_PUBLISH',
    noRepairLoop:hardKills.length > 0,
    caveat:'Receipt checks cannot certify artistic merit, text visibility, real acoustic timing or visual identity. Actual media + reviewer signoff remain required.'}
}

export function sha256(bytes) {return crypto.createHash('sha256').update(bytes).digest('hex')}
