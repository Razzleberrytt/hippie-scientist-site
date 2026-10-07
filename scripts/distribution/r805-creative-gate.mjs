const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')

const CUT_REASONS = new Set([
  'phrase-boundary',
  'pause',
  'contrast',
  'reveal',
  'emphasis',
  'end',
])

export function validateR805CreativeBrief(brief) {
  const errors = []
  if (!brief || typeof brief !== 'object' || Array.isArray(brief)) {
    return ['R8.05 creative brief must be an object']
  }

  if (brief.release !== 'R8.05') errors.push('creative brief release must be R8.05')

  const premise = brief.premise ?? {}
  const score = Number(premise.interestScore)
  if (!Number.isFinite(score) || score < 4 || score > 5) {
    errors.push('premise interestScore must be 4-5 before production')
  }
  if (!clean(premise.coldViewerWhyCare)) errors.push('coldViewerWhyCare is required')
  if (!clean(premise.viewerQuestion)) errors.push('exactly one viewerQuestion is required')
  if (!clean(premise.earlyPayoff)) errors.push('earlyPayoff is required')
  if (premise.methodologyBeforePayoff === true) errors.push('methodology may not precede the first payoff')
  if (premise.hookMode === 'methodology' && premise.methodIsStory !== true) {
    errors.push('methodology-first hooks are forbidden unless the method itself is the story')
  }
  if (premise.paperSummaryOpening === true) errors.push('paper-summary openings are forbidden')

  const timing = brief.timing ?? {}
  if (timing.durationPolicy !== 'natural') errors.push('durationPolicy must be natural')
  if (timing.targetDurationSeconds !== undefined && timing.targetDurationSeconds !== null) {
    errors.push('fixed targetDurationSeconds is forbidden in R8.05')
  }
  if (timing.narrationIsTimingMaster !== true) errors.push('narration must be the timing master')
  if (timing.voiceFirstBeatMapApproved !== true) errors.push('voice-first semantic beat map must be approved before visual construction')

  const beats = Array.isArray(brief.beats) ? brief.beats : []
  if (!beats.length) errors.push('at least one semantic beat is required')

  const ids = new Set()
  for (const [index, beat] of beats.entries()) {
    const label = `beat ${index + 1}`
    const id = clean(beat?.id)
    if (!id) errors.push(`${label} requires an id`)
    else if (ids.has(id)) errors.push(`${label} duplicates id ${id}`)
    else ids.add(id)

    if (!clean(beat?.narration)) errors.push(`${label} requires narration`)
    if (!clean(beat?.visualPurpose)) errors.push(`${label} requires visualPurpose bound to the narration`)
    if (!clean(beat?.spokenAnchor)) errors.push(`${label} requires spokenAnchor for internal-motion synchronization`)
    if (!clean(beat?.visualAction)) errors.push(`${label} requires visualAction for internal-motion synchronization`)
    if (!CUT_REASONS.has(clean(beat?.cutReason))) {
      errors.push(`${label} cutReason must be a semantic boundary: ${[...CUT_REASONS].join(', ')}`)
    }

    const entities = Array.isArray(beat?.primaryEntities) ? beat.primaryEntities.filter((v) => clean(v)) : []
    const maxEntities = beat?.comparisonRequired === true ? 2 : 1
    if (entities.length > maxEntities) {
      errors.push(`${label} exceeds the cognitive-load ceiling (${entities.length}/${maxEntities} primary entities)`)
    }
  }

  const recovery = brief.recovery ?? {}
  const rebuilds = Number(recovery.macroRebuildCount ?? 0)
  if (!Number.isInteger(rebuilds) || rebuilds < 0) errors.push('macroRebuildCount must be a non-negative integer')
  if (rebuilds > 1) errors.push('R8.05 rescue limit exceeded; retire/reframe the angle instead of rebuilding again')

  return [...new Set(errors)]
}

export function assertR805CreativeBrief(brief) {
  const errors = validateR805CreativeBrief(brief)
  if (errors.length) throw new Error(`R8.05 creative gate failed:\n- ${errors.join('\n- ')}`)
  return brief
}

export function buildR805CreativeReceipt(brief) {
  assertR805CreativeBrief(brief)
  return {
    schemaVersion: 'ths-r805-creative-receipt-v1',
    release: 'R8.05',
    premiseInterestScore: Number(brief.premise.interestScore),
    viewerQuestion: clean(brief.premise.viewerQuestion),
    earlyPayoff: clean(brief.premise.earlyPayoff),
    durationPolicy: 'natural',
    narrationIsTimingMaster: true,
    semanticBeatCount: brief.beats.length,
    semanticClipOwnership: true,
    cutOnMeaning: true,
    internalMotionSync: true,
    macroRebuildCount: Number(brief.recovery?.macroRebuildCount ?? 0),
  }
}
