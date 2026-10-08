import crypto from 'node:crypto'
import { assertR805CreativeBrief, buildR805CreativeReceipt } from './r805-creative-gate.mjs'

const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')
const sha256 = (value) => crypto.createHash('sha256').update(String(value ?? '')).digest('hex')
const ANGLES = new Set(['contradiction','consequence','mechanism','myth-break','comparison','risk','utility','mystery'])
const VISUAL_MODES = new Set(['kinetic-type','comparison','diagram','object','process','source-evidence'])

export function validateR806CreativeBrief(brief) {
  const errors = []
  try { assertR805CreativeBrief(brief) } catch (error) { errors.push(String(error.message || error)) }

  const layer = brief?.r806
  if (!layer || typeof layer !== 'object' || Array.isArray(layer)) {
    return [...new Set([...errors, 'R8.06 creative brief requires an r806 overlay object'])]
  }

  const candidates = Array.isArray(layer.conceptLab?.candidates) ? layer.conceptLab.candidates : []
  if (candidates.length !== 3) errors.push('R8.06 concept lab requires exactly three candidates')
  const ids = new Set()
  const angles = new Set()
  for (const [index, candidate] of candidates.entries()) {
    const label = `concept candidate ${index + 1}`
    const id = clean(candidate?.id)
    const angle = clean(candidate?.angle)
    if (!id) errors.push(`${label} requires id`)
    else if (ids.has(id)) errors.push(`${label} duplicates id ${id}`)
    else ids.add(id)
    if (!ANGLES.has(angle)) errors.push(`${label} angle must be one of: ${[...ANGLES].join(', ')}`)
    else angles.add(angle)
    if (!clean(candidate?.whyCare)) errors.push(`${label} requires whyCare`)
    if (!clean(candidate?.visualPromise)) errors.push(`${label} requires visualPromise`)
    if (!clean(candidate?.mentalJob)) errors.push(`${label} requires mentalJob`)
    for (const [field,min,max] of [['interestScore',1,5],['visualPotentialScore',1,5],['confusionScore',1,5]]) {
      const n=Number(candidate?.[field])
      if (!Number.isFinite(n) || n<min || n>max) errors.push(`${label} ${field} must be 1-5`)
    }
  }
  if (angles.size < 3) errors.push('R8.06 concept lab requires three materially different angle types')

  const selectedId = clean(layer.conceptLab?.selectedId)
  const selected = candidates.find((candidate) => clean(candidate?.id) === selectedId)
  if (!selected) errors.push('R8.06 concept lab selectedId must reference one candidate')
  else {
    if (Number(selected.interestScore) < 4) errors.push('R8.06 selected concept requires interestScore >= 4')
    if (Number(selected.visualPotentialScore) < 4) errors.push('R8.06 selected concept requires visualPotentialScore >= 4')
    if (Number(selected.confusionScore) > 2) errors.push('R8.06 selected concept requires confusionScore <= 2')
    if (clean(selected.mentalJob) !== clean(brief?.premise?.viewerQuestion)) {
      errors.push('R8.06 selected concept mentalJob must equal the one viewerQuestion')
    }
  }

  const beats = Array.isArray(brief?.beats) ? brief.beats : []
  const hook = beats[0]
  const finding = beats[1]
  const evidence = beats[2]
  if (clean(hook?.role) !== 'hook') errors.push('R8.06 opening beat 1 must be hook')
  if (clean(finding?.role) !== 'finding') errors.push('R8.06 opening beat 2 must be the finding/payoff')
  if (clean(evidence?.role) !== 'evidence') errors.push('R8.06 opening beat 3 must be evidence/method after payoff')

  const opening = layer.opening ?? {}
  if (clean(opening.coverText) !== clean(hook?.onScreenText)) errors.push('R8.06 coverText must converge exactly with hook on-screen text')
  if (clean(opening.firstFrameText) !== clean(hook?.onScreenText)) errors.push('R8.06 firstFrameText must converge exactly with hook on-screen text')
  if (clean(opening.firstLine) !== clean(hook?.narration)) errors.push('R8.06 firstLine must converge exactly with hook narration')
  if (!clean(opening.audioOffPromise)) errors.push('R8.06 opening requires an audioOffPromise')

  const firstThree = beats.slice(0,3)
  const modes = firstThree.map((beat) => clean(beat?.r806?.visualMode))
  for (const [index, mode] of modes.entries()) {
    if (!VISUAL_MODES.has(mode)) errors.push(`R8.06 opening beat ${index + 1} visualMode must be one of: ${[...VISUAL_MODES].join(', ')}`)
  }
  if (modes[0] === 'kinetic-type' && modes[1] === 'kinetic-type' && modes[2] === 'kinetic-type') {
    errors.push('R8.06 opening may not be three consecutive kinetic-type/text-led beats')
  }
  if (new Set(modes.filter(Boolean)).size < 2) errors.push('R8.06 opening requires at least two distinct visual teaching modes')
  for (const [index, beat] of firstThree.entries()) {
    if (!clean(beat?.r806?.teachingObject)) errors.push(`R8.06 opening beat ${index + 1} requires a teachingObject`)
  }

  const delivery = layer.delivery ?? {}
  if (delivery.metricoolOptional !== true) errors.push('R8.06 delivery must treat Metricool as optional')
  if (delivery.manualFallbackRequired !== true) errors.push('R8.06 delivery must require manual native fallback')
  if (delivery.providerMayMutateArtifact !== false) errors.push('R8.06 providers may not mutate the approved artifact')

  return [...new Set(errors)]
}

export function assertR806CreativeBrief(brief) {
  const errors = validateR806CreativeBrief(brief)
  if (errors.length) throw new Error(`R8.06 creative gate failed:\n- ${errors.join('\n- ')}`)
  return brief
}

export function buildR806CreativeReceipt(brief) {
  assertR806CreativeBrief(brief)
  const inherited = buildR805CreativeReceipt(brief)
  const selected = brief.r806.conceptLab.candidates.find((candidate) => clean(candidate.id) === clean(brief.r806.conceptLab.selectedId))
  const overlayIdentity = {
    conceptLab: brief.r806.conceptLab,
    opening: brief.r806.opening,
    earlyTeachingPlan: brief.beats.slice(0,3).map((beat) => ({
      id: clean(beat.id),
      visualMode: clean(beat?.r806?.visualMode),
      teachingObject: clean(beat?.r806?.teachingObject),
    })),
    delivery: brief.r806.delivery,
  }
  return {
    schemaVersion: 'ths-r806-creative-receipt-v1',
    release: 'R8.06',
    runtimeBaseRelease: 'R8.05',
    status: 'approved',
    inheritedR805SemanticBeatMapSha256: inherited.semanticBeatMapSha256,
    overlaySha256: sha256(JSON.stringify(overlayIdentity)),
    selectedConceptId: clean(selected.id),
    selectedAngle: clean(selected.angle),
    interestScore: Number(selected.interestScore),
    visualPotentialScore: Number(selected.visualPotentialScore),
    confusionScore: Number(selected.confusionScore),
    openingConvergence: true,
    immediateFindingAfterHook: true,
    earlyVisualTeachingModes: brief.beats.slice(0,3).map((beat) => clean(beat?.r806?.visualMode)),
    nativeFeelCertifiedAt: 'exact-master-qa',
    deliveryPolicy: {
      metricoolOptional: true,
      manualFallbackRequired: true,
      providerMayMutateArtifact: false,
    },
  }
}
