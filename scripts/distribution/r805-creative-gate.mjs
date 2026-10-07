import crypto from 'node:crypto'

const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')
const sha256 = (value) => crypto.createHash('sha256').update(String(value ?? '')).digest('hex')

const CUT_REASONS = new Set([
  'phrase-boundary',
  'pause',
  'contrast',
  'reveal',
  'emphasis',
  'end',
])

const ROLES = new Set([
  'hook',
  'finding',
  'evidence',
  'limitation',
  'source',
  'context',
  'cta',
])

function canonicalBeat(beat) {
  return {
    id: clean(beat?.id),
    role: clean(beat?.role),
    narration: clean(beat?.narration),
    onScreenText: clean(beat?.onScreenText),
    visualPurpose: clean(beat?.visualPurpose),
    spokenAnchor: clean(beat?.spokenAnchor),
    visualAction: clean(beat?.visualAction),
    cutReason: clean(beat?.cutReason),
    factualAuthority: clean(beat?.factualAuthority) || 'creative-framing',
    primaryEntities: Array.isArray(beat?.primaryEntities)
      ? beat.primaryEntities.map(clean).filter(Boolean)
      : [],
    comparisonRequired: beat?.comparisonRequired === true,
    pauseAfterSeconds: Number(beat?.pauseAfterSeconds ?? 0.14),
    holdSeconds: beat?.holdSeconds === undefined || beat?.holdSeconds === null
      ? null
      : Number(beat.holdSeconds),
  }
}

export function hashR805BeatPlan(beats) {
  const canonical = (Array.isArray(beats) ? beats : []).map(canonicalBeat)
  return sha256(JSON.stringify(canonical))
}

export function buildR805BeatReceipts(beats) {
  return (Array.isArray(beats) ? beats : []).map((raw) => {
    const beat = canonicalBeat(raw)
    return {
      id: beat.id,
      role: beat.role,
      narrationSha256: sha256(beat.narration),
      onScreenTextSha256: sha256(beat.onScreenText),
      visualPurposeSha256: sha256(beat.visualPurpose),
      spokenAnchorSha256: sha256(beat.spokenAnchor),
      visualActionSha256: sha256(beat.visualAction),
      cutReason: beat.cutReason,
      factualAuthority: beat.factualAuthority,
      primaryEntitiesSha256: sha256(JSON.stringify(beat.primaryEntities)),
      comparisonRequired: beat.comparisonRequired,
    }
  })
}

export function validateR805CreativeBrief(brief) {
  const errors = []
  if (!brief || typeof brief !== 'object' || Array.isArray(brief)) {
    return ['R8.05 creative brief must be an object']
  }

  if (brief.release !== 'R8.05') errors.push('creative brief release must be R8.05')
  if (!clean(brief?.sourceIdentity?.id)) errors.push('sourceIdentity.id is required')
  if (!clean(brief?.sourceIdentity?.sourceUrl)) errors.push('sourceIdentity.sourceUrl is required')

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
  let sourceCount = 0
  for (const [index, raw] of beats.entries()) {
    const beat = canonicalBeat(raw)
    const label = `beat ${index + 1}`
    if (!beat.id) errors.push(`${label} requires an id`)
    else if (ids.has(beat.id)) errors.push(`${label} duplicates id ${beat.id}`)
    else ids.add(beat.id)

    if (!ROLES.has(beat.role)) errors.push(`${label} requires a governed role`)
    if (beat.role === 'source') sourceCount += 1
    if (!beat.onScreenText) errors.push(`${label} requires onScreenText`)
    if (!beat.visualPurpose) errors.push(`${label} requires visualPurpose bound to the narration`)
    if (!beat.visualAction) errors.push(`${label} requires visualAction for internal-motion synchronization`)
    if (beat.narration && !beat.spokenAnchor) errors.push(`${label} requires spokenAnchor when narration is present`)
    if (beat.spokenAnchor && beat.narration && !beat.narration.toLowerCase().includes(beat.spokenAnchor.toLowerCase())) {
      errors.push(`${label} spokenAnchor must occur inside its narration`)
    }
    if (!CUT_REASONS.has(beat.cutReason)) {
      errors.push(`${label} cutReason must be a semantic boundary: ${[...CUT_REASONS].join(', ')}`)
    }

    const maxEntities = beat.comparisonRequired ? 2 : 1
    if (beat.primaryEntities.length > maxEntities) {
      errors.push(`${label} exceeds the cognitive-load ceiling (${beat.primaryEntities.length}/${maxEntities} primary entities)`)
    }
    if (!Number.isFinite(beat.pauseAfterSeconds) || beat.pauseAfterSeconds < 0 || beat.pauseAfterSeconds > 1) {
      errors.push(`${label} pauseAfterSeconds must be between 0 and 1`)
    }
    if (!beat.narration) {
      if (!Number.isFinite(beat.holdSeconds) || beat.holdSeconds <= 0 || beat.holdSeconds > 7) {
        errors.push(`${label} without narration requires holdSeconds > 0 and <= 7`)
      }
    } else if (beat.holdSeconds !== null) {
      errors.push(`${label} may not set holdSeconds when narration is present`)
    }
  }
  if (sourceCount !== 1) errors.push('R8.05 requires exactly one dedicated source beat')
  const sourceBeat = beats.map(canonicalBeat).find((beat) => beat.role === 'source')
  if (sourceBeat && sourceBeat.onScreenText !== clean(brief?.sourceIdentity?.sourceUrl)) {
    errors.push('source beat onScreenText must equal sourceIdentity.sourceUrl exactly')
  }
  if (sourceBeat && Number(sourceBeat.holdSeconds) < 3) {
    errors.push('source beat must remain visible for at least 3 seconds')
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
  const beats = brief.beats.map(canonicalBeat)
  return {
    schemaVersion: 'ths-r805-creative-receipt-v2',
    release: 'R8.05',
    status: 'approved',
    premiseInterestScore: Number(brief.premise.interestScore),
    viewerQuestion: clean(brief.premise.viewerQuestion),
    earlyPayoff: clean(brief.premise.earlyPayoff),
    durationPolicy: 'natural',
    narrationIsTimingMaster: true,
    semanticBeatCount: beats.length,
    semanticBeatMapSha256: hashR805BeatPlan(beats),
    beatReceipts: buildR805BeatReceipts(beats),
    semanticClipOwnership: true,
    cutOnMeaning: true,
    internalMotionSync: true,
    macroRebuildCount: Number(brief.recovery?.macroRebuildCount ?? 0),
  }
}
