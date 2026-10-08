import crypto from 'node:crypto'
import { assertR806CreativeBrief, buildR806CreativeReceipt } from './r806-creative-gate.mjs'

const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')
const sha256 = (value) => crypto.createHash('sha256').update(String(value ?? '')).digest('hex')

const COMPOSITION_FAMILIES = new Set([
  'hero-object',
  'split-compare',
  'evidence-focus',
  'diagram-flow',
  'macro-detail',
  'process-flow',
  'kinetic-type',
])

const RHYTHM_ACTIONS = new Set(['orient', 'confirm', 'prove', 'pivot', 'resolve'])

function coreBeats(brief) {
  return (Array.isArray(brief?.beats) ? brief.beats : [])
    .filter((beat) => ['hook', 'finding', 'evidence', 'limitation'].includes(clean(beat?.role)))
}

function longestRun(values) {
  let max = 0
  let current = 0
  let previous = null
  for (const value of values) {
    if (value && value === previous) current += 1
    else current = value ? 1 : 0
    previous = value
    max = Math.max(max, current)
  }
  return max
}

export function validateR807CreativeBrief(brief) {
  const errors = []
  try { assertR806CreativeBrief(brief) } catch (error) { errors.push(String(error.message || error)) }

  const layer = brief?.r807
  if (!layer || typeof layer !== 'object' || Array.isArray(layer)) {
    return [...new Set([...errors, 'R8.07 creative brief requires an r807 overlay object'])]
  }

  if (!clean(layer.visualThesis)) errors.push('R8.07 requires one visualThesis for the whole video')

  const motif = layer.motif ?? {}
  const motifId = clean(motif.id)
  if (!motifId) errors.push('R8.07 recurring motif requires id')
  if (!clean(motif.purpose)) errors.push('R8.07 recurring motif requires semantic purpose')

  const beats = Array.isArray(brief?.beats) ? brief.beats : []
  const core = coreBeats(brief)
  if (core.length < 4) errors.push('R8.07 requires hook/finding/evidence/limitation core beats')

  const compositionFamilies = []
  const visualModes = []
  const motifBeatIds = []
  const interruptBeats = []
  for (const [index, beat] of core.entries()) {
    const label = `R8.07 core beat ${index + 1}`
    const compositionFamily = clean(beat?.r807?.compositionFamily)
    const rhythmAction = clean(beat?.r807?.rhythmAction)
    if (!COMPOSITION_FAMILIES.has(compositionFamily)) {
      errors.push(`${label} compositionFamily must be one of: ${[...COMPOSITION_FAMILIES].join(', ')}`)
    }
    if (!RHYTHM_ACTIONS.has(rhythmAction)) {
      errors.push(`${label} rhythmAction must be one of: ${[...RHYTHM_ACTIONS].join(', ')}`)
    }
    compositionFamilies.push(compositionFamily)
    visualModes.push(clean(beat?.r806?.visualMode))

    if (clean(beat?.r807?.motifId)) {
      if (clean(beat.r807.motifId) !== motifId) errors.push(`${label} motifId must equal the canonical recurring motif id`)
      motifBeatIds.push(clean(beat.id))
    }
    if (beat?.r807?.patternInterrupt === true) interruptBeats.push(beat)
  }

  if (new Set(compositionFamilies.filter(Boolean)).size < 3) {
    errors.push('R8.07 core story requires at least three distinct composition families')
  }
  if (longestRun(compositionFamilies) > 2) {
    errors.push('R8.07 repetition debt forbids more than two consecutive identical composition families')
  }
  if (longestRun(visualModes) > 2) {
    errors.push('R8.07 repetition debt forbids more than two consecutive identical R8.06 visual modes')
  }

  const hook = core.find((beat) => clean(beat.role) === 'hook')
  const limitation = core.find((beat) => clean(beat.role) === 'limitation')
  if (hook && !motifBeatIds.includes(clean(hook.id))) errors.push('R8.07 motif must appear in the hook')
  if (limitation && !motifBeatIds.includes(clean(limitation.id))) errors.push('R8.07 motif must return at the limitation pivot')
  if (motifBeatIds.length < 2 || motifBeatIds.length > 3) {
    errors.push('R8.07 recurring motif must appear on 2-3 core beats')
  }

  if (interruptBeats.length !== 1) errors.push('R8.07 requires exactly one semantic pattern interrupt in the core story')
  const interrupt = interruptBeats[0]
  if (interrupt && clean(interrupt.role) !== 'limitation') {
    errors.push('R8.07 pattern interrupt must be earned by the limitation pivot')
  }
  if (interrupt && limitation && clean(interrupt.id) !== clean(limitation.id)) {
    errors.push('R8.07 pattern interrupt must occur on the first limitation pivot')
  }
  if (interrupt && clean(interrupt?.r807?.patternInterruptReason) !== 'limitation-pivot') {
    errors.push('R8.07 pattern interrupt reason must be limitation-pivot')
  }
  if (limitation) {
    const limitationIndex = core.indexOf(limitation)
    const previous = limitationIndex > 0 ? core[limitationIndex - 1] : null
    if (previous && clean(previous?.r807?.compositionFamily) === clean(limitation?.r807?.compositionFamily)) {
      errors.push('R8.07 limitation pattern interrupt must change composition family')
    }
  }

  const expectedActions = { hook: 'orient', finding: 'confirm', evidence: 'prove', limitation: 'pivot' }
  for (const beat of core) {
    const expected = expectedActions[clean(beat.role)]
    if (expected && clean(beat?.r807?.rhythmAction) !== expected) {
      errors.push(`R8.07 ${clean(beat.role)} beat must use rhythmAction=${expected}`)
    }
  }

  const rhythm = layer.rhythm ?? {}
  if (rhythm.semanticPatternInterruptRequired !== true) errors.push('R8.07 rhythm contract must require semantic pattern interruption')
  if (rhythm.maxConsecutiveCompositionFamily !== 2) errors.push('R8.07 rhythm contract maxConsecutiveCompositionFamily must be 2')
  if (rhythm.maxConsecutiveVisualMode !== 2) errors.push('R8.07 rhythm contract maxConsecutiveVisualMode must be 2')
  if (rhythm.exactMasterCertification !== 'required') errors.push('R8.07 visual rhythm requires exact-master certification')

  return [...new Set(errors)]
}

export function assertR807CreativeBrief(brief) {
  const errors = validateR807CreativeBrief(brief)
  if (errors.length) throw new Error(`R8.07 creative gate failed:\n- ${errors.join('\n- ')}`)
  return brief
}

export function buildR807CreativeReceipt(brief) {
  assertR807CreativeBrief(brief)
  const inherited = buildR806CreativeReceipt(brief)
  const core = coreBeats(brief)
  const overlayIdentity = {
    visualThesis: clean(brief.r807.visualThesis),
    motif: brief.r807.motif,
    rhythm: brief.r807.rhythm,
    corePlan: core.map((beat) => ({
      id: clean(beat.id),
      role: clean(beat.role),
      visualMode: clean(beat?.r806?.visualMode),
      compositionFamily: clean(beat?.r807?.compositionFamily),
      rhythmAction: clean(beat?.r807?.rhythmAction),
      motifId: clean(beat?.r807?.motifId),
      patternInterrupt: beat?.r807?.patternInterrupt === true,
      patternInterruptReason: clean(beat?.r807?.patternInterruptReason),
    })),
  }
  const motifBeatIds = core.filter((beat) => clean(beat?.r807?.motifId)).map((beat) => clean(beat.id))
  const interrupt = core.find((beat) => beat?.r807?.patternInterrupt === true)
  const compositionFamilies = core.map((beat) => clean(beat?.r807?.compositionFamily))
  return {
    schemaVersion: 'ths-r807-creative-receipt-v1',
    release: 'R8.07',
    runtimeBaseRelease: 'R8.05',
    inheritedR806OverlaySha256: inherited.overlaySha256,
    status: 'approved',
    overlaySha256: sha256(JSON.stringify(overlayIdentity)),
    visualThesis: clean(brief.r807.visualThesis),
    motifId: clean(brief.r807.motif.id),
    motifBeatIds,
    patternInterruptBeatId: clean(interrupt?.id),
    patternInterruptReason: clean(interrupt?.r807?.patternInterruptReason),
    compositionFamilies,
    maxCompositionRun: longestRun(compositionFamilies),
    maxVisualModeRun: longestRun(core.map((beat) => clean(beat?.r806?.visualMode))),
    visualRhythmCertifiedAt: 'exact-master-qa',
  }
}
