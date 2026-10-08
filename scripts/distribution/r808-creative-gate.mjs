import crypto from 'node:crypto'
import { assertR807CreativeBrief, buildR807CreativeReceipt } from './r807-creative-gate.mjs'

const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')
const sha256 = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const SILENT_ROLES = Object.freeze({hook:'promise', finding:'answer', evidence:'support', limitation:'boundary'})
const CORE_ROLES = Object.keys(SILENT_ROLES)
const words = (text) => clean(text).split(/\s+/).filter(Boolean).length

// An objective pre-render comprehension gate. Semantic adequacy still requires a
// human exact-MP4 review; this function never claims to machine-verify meaning.
export function validateR808CreativeBrief(brief) {
  const errors = []
  try { assertR807CreativeBrief(brief) } catch (error) { errors.push(String(error.message || error)) }
  const layer = brief?.r808
  if (!layer || typeof layer !== 'object' || Array.isArray(layer)) {
    return [...new Set([...errors, 'R8.08 requires an r808 silent-comprehension overlay'])]
  }
  if (clean(layer.viewerTakeaway) !== clean(brief?.premise?.earlyPayoff)) {
    errors.push('R8.08 viewerTakeaway must match the evidence-safe early payoff')
  }
  if (layer.mobileSafeArea !== 'platform-intersection') errors.push('R8.08 requires the platform-intersection safe area')
  if (layer.hookVisibleAtFrameZero !== true) errors.push('R8.08 requires a readable first-frame hook')
  if (layer.exactMasterSilentReview !== 'required') errors.push('R8.08 requires exact-master silent comprehension review')
  if (layer.maxCoreWords !== 14 || layer.maxCoreChars !== 96 || layer.minReadableSeconds !== 0.85) {
    errors.push('R8.08 must preserve the 14-word/96-character and 0.85-second legibility budgets')
  }

  const beats = Array.isArray(brief?.beats) ? brief.beats : []
  for (const role of CORE_ROLES) {
    const matches = beats.filter(beat => clean(beat?.role) === role)
    if (matches.length !== 1) {
      errors.push(`R8.08 requires exactly one ${role} beat for audio-off comprehension`)
      continue
    }
    const beat = matches[0]
    const text = clean(beat.onScreenText)
    if (!text || words(text) < 2 || words(text) > 14 || text.length > 96) {
      errors.push(`R8.08 ${role} onScreenText exceeds silent-viewing reading budget or is uninformative`)
    }
    if (clean(beat?.r808?.silentRole) !== SILENT_ROLES[role]) {
      errors.push(`R8.08 ${role} silentRole must be ${SILENT_ROLES[role]}`)
    }
    if (clean(beat?.r808?.silentMeaning) !== text) {
      errors.push(`R8.08 ${role} silentMeaning must equal the exact rendered onScreenText`)
    }
    if (role === 'hook' && clean(beat?.motion?.type) !== 'highlight') {
      errors.push('R8.08 hook must use highlight so the promise exists on frame zero')
    }
    if (beat?.r808?.safeArea !== 'platform-intersection') {
      errors.push(`R8.08 ${role} must use the platform-intersection safe area`)
    }
  }
  const source = beats.find(beat=>clean(beat?.role)==='source')
  if (source && clean(source.onScreenText) !== clean(brief?.sourceIdentity?.sourceUrl)) {
    errors.push('R8.08 source must show the exact canonical source URL')
  }
  return [...new Set(errors)]
}

export function assertR808CreativeBrief(brief) {
  const errors = validateR808CreativeBrief(brief)
  if (errors.length) throw new Error(`R8.08 silent comprehension gate failed:\n- ${errors.join('\n- ')}`)
  return brief
}

export function buildR808CreativeReceipt(brief) {
  assertR808CreativeBrief(brief)
  const foundation = buildR807CreativeReceipt(brief)
  const overlayIdentity = {
    viewerTakeaway: clean(brief.r808.viewerTakeaway),
    mobileSafeArea: brief.r808.mobileSafeArea,
    hookVisibleAtFrameZero: brief.r808.hookVisibleAtFrameZero,
    exactMasterSilentReview: brief.r808.exactMasterSilentReview,
    maxCoreWords: brief.r808.maxCoreWords,
    maxCoreChars: brief.r808.maxCoreChars,
    minReadableSeconds: brief.r808.minReadableSeconds,
    core: brief.beats.filter(beat=>CORE_ROLES.includes(clean(beat?.role))).map(beat=>({
      id:clean(beat.id),role:clean(beat.role),motion:clean(beat?.motion?.type),
      onScreenText:clean(beat.onScreenText),silentRole:clean(beat?.r808?.silentRole),
      silentMeaning:clean(beat?.r808?.silentMeaning),safeArea:clean(beat?.r808?.safeArea),
    })),
  }
  return {
    schemaVersion:'ths-r808-creative-receipt-v1',release:'R8.08',runtimeBaseRelease:'R8.05',
    inheritedR807OverlaySha256:foundation.overlaySha256,status:'approved',
    overlaySha256:sha256(overlayIdentity),viewerTakeaway:clean(brief.r808.viewerTakeaway),
    minReadableSeconds:0.85,maxCoreWords:14,maxCoreChars:96,
    silentComprehensionCertifiedAt:'exact-master-qa',
  }
}
