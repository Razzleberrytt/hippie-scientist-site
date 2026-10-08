import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { assertValidDistributionPack } from './distribution-pack-contract.mjs'
import { CREATIVE_BRAND_TOKENS, validateCreativeContrast } from './creative-spec.mjs'
import { assertR805CreativeBrief, buildR805CreativeReceipt } from './r805-creative-gate.mjs'
import { buildR806CreativeReceipt } from './r806-creative-gate.mjs'
import { buildR807CreativeReceipt } from './r807-creative-gate.mjs'

const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')
const roundMillis = (value) => Math.round(Number(value) * 1000) / 1000
const roundTenThousandth = (value) => Math.round(Number(value) * 10000) / 10000
const timingMatches = (a, b) => Number.isFinite(Number(a)) && Number.isFinite(Number(b)) && Math.abs(Number(a) - Number(b)) <= 0.0006

function escapeXml(value) {
  return clean(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char])
}

function treatment(name) {
  const token = CREATIVE_BRAND_TOKENS.color.treatments[name]
  if (!token) throw new Error(`unknown color treatment: ${name}`)
  return {
    foreground: CREATIVE_BRAND_TOKENS.color.palette[token.foreground],
    background: CREATIVE_BRAND_TOKENS.color.palette[token.background],
  }
}

function wrapTextLosslessly(value, maxChars = 26, maxLines = 8) {
  const words = clean(value).split(' ').filter(Boolean)
  const lines = []
  let line = ''
  for (const word of words) {
    if (word.length > maxChars) throw new Error(`vertical video renderer cannot losslessly wrap token longer than ${maxChars} characters`)
    const candidate = line ? `${line} ${word}` : word
    if (candidate.length <= maxChars) line = candidate
    else {
      if (line) lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  if (lines.length > maxLines) throw new Error(`vertical video renderer requires upstream lossless pagination for copy exceeding ${maxLines} lines`)
  return lines
}

function wrapSourceUrlLosslessly(value, maxChars = 38, maxLines = 4) {
  const sourceUrl = clean(value)
  const lines = []
  let remaining = sourceUrl
  while (remaining.length > maxChars) {
    let cut = remaining.lastIndexOf('/', maxChars)
    if (cut <= 0) cut = maxChars
    else cut += 1
    lines.push(remaining.slice(0, cut))
    remaining = remaining.slice(cut)
  }
  if (remaining) lines.push(remaining)
  if (lines.length > maxLines) throw new Error(`canonical source URL cannot fit losslessly inside the ${maxLines}-line source-scene contract`)
  if (lines.join('') !== sourceUrl) throw new Error('canonical source URL wrapping must reconstruct exactly')
  return lines
}

function formatSrtTime(seconds) {
  const milliseconds = Math.round(seconds * 1000)
  const hours = Math.floor(milliseconds / 3_600_000)
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000)
  const secs = Math.floor((milliseconds % 60_000) / 1000)
  const millis = milliseconds % 1000
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`
}

function splitCaptionPayloadLosslessly(value) {
  const maxCharsPerLine = CREATIVE_BRAND_TOKENS.typography.captionMaxCharsPerLine
  const maxLines = CREATIVE_BRAND_TOKENS.typography.captionMaxLines
  const lines = wrapTextLosslessly(value, maxCharsPerLine, Number.POSITIVE_INFINITY)
  const chunks = []
  for (let index = 0; index < lines.length; index += maxLines) {
    chunks.push(lines.slice(index, index + maxLines))
  }
  return chunks
}

function buildSrt(scenes) {
  const cues = []
  for (const scene of scenes) {
    const voiceover = clean(scene.voiceover)
    if (!voiceover) continue
    const chunks = splitCaptionPayloadLosslessly(voiceover)
    const sceneDuration = scene.end - scene.start
    chunks.forEach((lines, chunkIndex) => {
      const start = roundMillis(scene.start + (sceneDuration * chunkIndex / chunks.length))
      const end = chunkIndex === chunks.length - 1
        ? scene.end
        : roundMillis(scene.start + (sceneDuration * (chunkIndex + 1) / chunks.length))
      cues.push({ start, end, text: lines.join('\n') })
    })
  }
  const rendered = cues.map((cue, index) => `${index + 1}\n${formatSrtTime(cue.start)} --> ${formatSrtTime(cue.end)}\n${cue.text}`)
  return `${rendered.join('\n\n')}\n`
}

function canonicalLosslessPages(section, name) {
  const pages = section?.pages
  if (!Array.isArray(pages) || pages.length === 0) throw new Error(`creative spec verticalVideo.losslessCopy.${name}.pages is required`)
  const normalized = pages.map((page, index) => {
    const content = clean(page?.content)
    if (!content) throw new Error(`${name} lossless page ${index + 1} is empty`)
    if (page?.truncationAllowed === true || page?.rewriteAllowed === true) throw new Error(`${name} lossless pages may not authorize truncation or rewrite`)
    return {
      content,
      factualAuthority: clean(page?.factualAuthority) || 'canonical-input',
      continuationIndex: Number(page?.index ?? index + 1),
      continuationTotal: Number(page?.total ?? pages.length),
    }
  })
  const reconstructed = clean(normalized.map((page) => page.content).join(' '))
  const source = clean(section?.sourceText ?? section?.original ?? section?.input ?? reconstructed)
  if (source && reconstructed !== source) throw new Error(`${name} lossless pages do not reconstruct their governed source text exactly`)
  return normalized
}

function validateIdentity(mediaPack, creativeSpec) {
  assertValidDistributionPack(mediaPack)
  if (creativeSpec?.claimSafetyStatus !== 'validated-lossless') throw new Error('creative spec must be validated-lossless before video packaging')
  const researchObjectId = clean(mediaPack.researchObjectIds?.[0])
  if (!researchObjectId || clean(creativeSpec?.sourceIdentity?.id) !== researchObjectId) throw new Error('creative spec source identity must match the validated media pack research object')
  if (clean(creativeSpec?.sourceIdentity?.sourceUrl) !== mediaPack.source.url || clean(creativeSpec?.delivery?.landingUrl) !== mediaPack.source.url) {
    throw new Error('creative spec source URL must match the validated media pack canonical source URL')
  }
  if (!clean(creativeSpec?.delivery?.disclosure)) throw new Error('creative spec governed disclosure is required')
  const video = creativeSpec?.verticalVideo
  const release = clean(creativeSpec?.systemRelease) || 'R8.04'
  if (release === 'R8.05') {
    const quality = creativeSpec?.creativeQuality
    if (clean(quality?.schemaVersion) !== 'ths-r805-creative-receipt-v2' || clean(quality?.release) !== 'R8.05' || clean(quality?.status) !== 'approved') {
      throw new Error('R8.05 vertical video requires an approved creative brief before rendering')
    }
    if (quality?.narrationIsTimingMaster !== true || quality?.semanticClipOwnership !== true || quality?.cutOnMeaning !== true
        || quality?.internalMotionPlanRequired !== true || clean(quality?.internalMotionSyncCertifiedAt) !== 'exact-master-qa') {
      throw new Error('R8.05 creative-quality receipt is missing semantic AV-lock planning invariants')
    }
    if (!video || clean(video.format) !== '1080x1920' || clean(video.timingAuthority) !== 'exact-local-narration') {
      throw new Error('R8.05 vertical video must use the exact-local-narration timing authority')
    }
    const methodRelease = clean(creativeSpec?.creativeMethodRelease) || 'R8.05'
    if (!['R8.05', 'R8.06', 'R8.07'].includes(methodRelease)) {
      throw new Error(`unsupported R8.05 creative methodology: ${methodRelease}`)
    }
    if (methodRelease === 'R8.06') {
      const direction = creativeSpec?.creativeDirection
      if (clean(direction?.schemaVersion) !== 'ths-r806-creative-receipt-v1'
          || clean(direction?.release) !== 'R8.06'
          || clean(direction?.runtimeBaseRelease) !== 'R8.05'
          || clean(direction?.status) !== 'approved') {
        throw new Error('R8.06 methodology requires an approved native-attention creative-direction receipt before rendering')
      }
      if (!/^[a-f0-9]{64}$/i.test(clean(direction?.overlaySha256))) {
        throw new Error('R8.06 creative-direction receipt must bind the exact overlay plan')
      }
      if (direction?.openingConvergence !== true
          || direction?.immediateFindingAfterHook !== true
          || clean(direction?.nativeFeelCertifiedAt) !== 'exact-master-qa'
          || direction?.deliveryPolicy?.metricoolOptional !== true
          || direction?.deliveryPolicy?.manualFallbackRequired !== true
          || direction?.deliveryPolicy?.providerMayMutateArtifact !== false) {
        throw new Error('R8.06 creative-direction receipt is missing native-attention/delivery invariants')
      }
    } else if (methodRelease === 'R8.07') {
      const foundation = creativeSpec?.creativeFoundation
      const direction = creativeSpec?.creativeDirection
      if (clean(foundation?.schemaVersion) !== 'ths-r806-creative-receipt-v1'
          || clean(foundation?.release) !== 'R8.06'
          || clean(foundation?.status) !== 'approved') {
        throw new Error('R8.07 methodology requires an approved R8.06 creative foundation')
      }
      if (clean(direction?.schemaVersion) !== 'ths-r807-creative-receipt-v1'
          || clean(direction?.release) !== 'R8.07'
          || clean(direction?.runtimeBaseRelease) !== 'R8.05'
          || clean(direction?.status) !== 'approved'
          || clean(direction?.inheritedR806OverlaySha256) !== clean(foundation?.overlaySha256)
          || !/^[a-f0-9]{64}$/i.test(clean(direction?.overlaySha256))
          || clean(direction?.visualRhythmCertifiedAt) !== 'exact-master-qa') {
        throw new Error('R8.07 methodology requires an artifact-bound visual-rhythm creative-direction receipt')
      }
    }
  } else if (release === 'R8.04') {
    if (!video || Number(video.durationSeconds) !== 30 || clean(video.format) !== '1080x1920') {
      throw new Error('R8.04 vertical video creative spec must define the canonical 30-second 1080x1920 profile')
    }
  } else {
    throw new Error(`unsupported social production release: ${release}`)
  }
  const canvas = video.canvas ?? CREATIVE_BRAND_TOKENS.canvas.vertical
  if (Number(canvas.width) !== 1080 || Number(canvas.height) !== 1920) throw new Error('vertical video canvas must be 1080x1920')

  const sourceLegibility = video.sourceLegibility
  if (!sourceLegibility || clean(sourceLegibility.canonicalUrl) !== mediaPack.source.url) {
    throw new Error('vertical video source-legibility contract must bind the exact canonical source URL')
  }
  if (video.rendererContract?.dedicatedSourceSceneRequired !== true || sourceLegibility.video?.dedicatedSourceSceneRequired !== true) {
    throw new Error('vertical video requires a dedicated source scene')
  }
  if (Number(video.rendererContract?.sourceSceneMinimumVisibleSeconds ?? 0) < 3 || Number(sourceLegibility.video?.minimumVisibleSeconds ?? 0) < 3) {
    throw new Error('vertical video source scene must remain visible for at least three seconds')
  }
  if (Number(sourceLegibility.typography?.minimumPxAt1080 ?? 0) < 32 || sourceLegibility.typography?.ellipsisAllowed !== false || sourceLegibility.typography?.urlRewriteAllowed !== false) {
    throw new Error('vertical video source URL must remain exact, untruncated, and at least 32px at 1080-wide output')
  }
}

function buildTimelineR804(mediaPack, creativeSpec) {
  validateIdentity(mediaPack, creativeSpec)
  const contrastErrors = validateCreativeContrast()
  if (contrastErrors.length) throw new Error(`invalid brand contrast: ${contrastErrors.join('; ')}`)

  const video = creativeSpec.verticalVideo
  const findingPages = canonicalLosslessPages(video.losslessCopy?.finding, 'finding')
  const limitationPages = canonicalLosslessPages(video.losslessCopy?.limitation, 'limitation')
  const evidenceScene = video.scenes?.find((scene) => scene.role === 'evidence')
  const contextScene = video.scenes?.find((scene) => scene.role === 'context')
  const ctaScene = video.scenes?.find((scene) => scene.role === 'cta')
  const hookText = clean(video.firstTwoSecondHook)
  if (!hookText) throw new Error('vertical video firstTwoSecondHook is required')
  if (!clean(evidenceScene?.onScreenText) || !clean(evidenceScene?.voiceover)) throw new Error('governed evidence scene is required')
  if (!clean(contextScene?.onScreenText) || !clean(contextScene?.voiceover)) throw new Error('fixed disclosure context scene is required')
  if (!clean(ctaScene?.onScreenText) || !clean(ctaScene?.voiceover)) throw new Error('fixed CTA scene is required')

  const factual = [
    ...findingPages.map((page) => ({ role: 'finding', onScreenText: page.content, voiceover: page.content, factualAuthority: page.factualAuthority, colorTreatment: 'evidence', continuation: { index: page.continuationIndex, total: page.continuationTotal } })),
    { role: 'evidence', onScreenText: clean(evidenceScene.onScreenText), voiceover: clean(evidenceScene.voiceover), factualAuthority: clean(evidenceScene.factualAuthority) || 'canonical-input', colorTreatment: clean(evidenceScene.colorTreatment) || 'evidence' },
    ...limitationPages.map((page) => ({ role: 'limitation', onScreenText: page.content, voiceover: page.content, factualAuthority: page.factualAuthority, colorTreatment: 'primaryLight', continuation: { index: page.continuationIndex, total: page.continuationTotal } })),
  ]

  // The source-legibility contract reserves three seconds for an independent
  // source scene. Eight factual scenes is therefore the largest lossless plan
  // that can still honor the global 2.5-second minimum for context and CTA.
  if (factual.length < 3 || factual.length > 8) throw new Error('lossless vertical video package supports 3-8 factual scenes with the required dedicated source scene')
  const sourceDuration = Number(video.sourceLegibility.video.minimumVisibleSeconds)
  if (sourceDuration < 3 || sourceDuration > 7) throw new Error('source-scene duration violates canonical timing guardrails')
  const factualBudget = 30 - 2 - sourceDuration - 5
  const factualDuration = factualBudget / factual.length
  if (factualDuration < 2.5 || factualDuration > 7) throw new Error('lossless factual scene count exceeds the canonical timing budget')
  const factualTotal = factualDuration * factual.length
  const outroDuration = (30 - 2 - sourceDuration - factualTotal) / 2
  if (outroDuration < 2.5 || outroDuration > 7) throw new Error('canonical 30-second timing budget cannot satisfy scene-duration guardrails')

  const scenes = [{
    role: 'hook', start: 0, end: 2, onScreenText: hookText, voiceover: hookText,
    factualAuthority: 'canonical-input', colorTreatment: 'primaryDark',
  }]
  let cursor = 2
  for (const scene of factual) {
    const start = roundMillis(cursor)
    cursor += factualDuration
    scenes.push({ ...scene, start, end: roundMillis(cursor) })
  }

  const sourceStart = roundMillis(cursor)
  cursor += sourceDuration
  scenes.push({
    role: 'source', start: sourceStart, end: roundMillis(cursor),
    onScreenText: mediaPack.source.url, voiceover: '',
    factualAuthority: 'canonical-source', colorTreatment: 'source',
    sourceLegibility: video.sourceLegibility,
  })

  const contextStart = roundMillis(cursor)
  cursor += outroDuration
  scenes.push({
    role: 'context', start: contextStart, end: roundMillis(cursor),
    onScreenText: clean(contextScene.onScreenText), voiceover: clean(contextScene.voiceover),
    factualAuthority: clean(contextScene.factualAuthority) || 'fixed-disclosure',
    colorTreatment: clean(contextScene.colorTreatment) || 'disclosure',
  })
  scenes.push({
    role: 'cta', start: roundMillis(cursor), end: 30,
    onScreenText: clean(ctaScene.onScreenText), voiceover: clean(ctaScene.voiceover),
    factualAuthority: clean(ctaScene.factualAuthority) || 'fixed-cta',
    colorTreatment: clean(ctaScene.colorTreatment) || 'primaryDark',
  })

  const minimum = CREATIVE_BRAND_TOKENS.timing.minimumSceneSeconds
  const maximum = CREATIVE_BRAND_TOKENS.timing.maximumSceneSeconds
  for (const scene of scenes) {
    const duration = roundMillis(scene.end - scene.start)
    if (scene.role === 'hook') {
      if (duration !== CREATIVE_BRAND_TOKENS.timing.hookSeconds) throw new Error('hook must occupy exactly the canonical first two seconds')
    } else if (duration < minimum || duration > maximum) {
      throw new Error(`scene ${scene.role} violates canonical scene-duration guardrails`)
    }
  }
  if (scenes[0].start !== 0 || scenes.at(-1).end !== 30) throw new Error('vertical video timeline must cover exactly 30 seconds')
  for (let index = 1; index < scenes.length; index += 1) {
    if (scenes[index - 1].end !== scenes[index].start) throw new Error('vertical video timeline must be contiguous')
  }
  return scenes
}


function readRequiredJson(file, label) {
  if (!fs.existsSync(file)) throw new Error(`R8.05 requires ${label}: ${path.basename(file)}`)
  const bytes = fs.readFileSync(file)
  return { bytes, sha256: sha256(bytes), value: JSON.parse(bytes.toString('utf8')) }
}

function colorTreatmentForRole(role, requested) {
  if (clean(requested)) return clean(requested)
  return ({
    hook: 'primaryDark',
    finding: 'evidence',
    evidence: 'evidence',
    limitation: 'primaryLight',
    source: 'source',
    context: 'disclosure',
    cta: 'primaryDark',
  })[role] || 'primaryLight'
}

function buildTimelineR805(mediaPack, creativeSpec, dir) {
  validateIdentity(mediaPack, creativeSpec)
  const quality = creativeSpec.creativeQuality
  const briefFile = readRequiredJson(path.join(dir, 'r805-creative-brief.json'), 'creative brief')
  const beatTimelineFile = readRequiredJson(path.join(dir, 'semantic-beat-timeline.json'), 'semantic beat timeline')
  const narrationReceiptFile = readRequiredJson(path.join(dir, 'narration.wav.receipt.json'), 'local narration receipt')
  const voiceQaFile = readRequiredJson(path.join(dir, 'voice-qa.receipt.json'), 'exact narration QA receipt')
  const audioFile = path.join(dir, 'narration.wav')
  if (!fs.existsSync(audioFile)) throw new Error('R8.05 requires exact local narration.wav before visual rendering')
  const audioBytes = fs.readFileSync(audioFile)
  const audioSha = sha256(audioBytes)

  const brief = assertR805CreativeBrief(briefFile.value)
  const freshQuality = buildR805CreativeReceipt(brief)
  if (freshQuality.semanticBeatMapSha256 !== quality.semanticBeatMapSha256
      || JSON.stringify(freshQuality.beatReceipts) !== JSON.stringify(quality.beatReceipts)) {
    throw new Error('R8.05 creative-quality receipt does not bind the exact creative brief')
  }
  const methodRelease = clean(creativeSpec?.creativeMethodRelease)
  if (methodRelease === 'R8.06') {
    const freshDirection = buildR806CreativeReceipt(brief)
    const direction = creativeSpec?.creativeDirection
    if (clean(freshDirection.overlaySha256) !== clean(direction?.overlaySha256)
        || clean(freshDirection.selectedConceptId) !== clean(direction?.selectedConceptId)
        || JSON.stringify(freshDirection.earlyVisualTeachingModes) !== JSON.stringify(direction?.earlyVisualTeachingModes)) {
      throw new Error('R8.06 creative-direction receipt does not bind the exact creative brief overlay')
    }
  } else if (methodRelease === 'R8.07') {
    const freshFoundation = buildR806CreativeReceipt(brief)
    const foundation = creativeSpec?.creativeFoundation
    const freshDirection = buildR807CreativeReceipt(brief)
    const direction = creativeSpec?.creativeDirection
    if (clean(freshFoundation.overlaySha256) !== clean(foundation?.overlaySha256)
        || clean(freshDirection.overlaySha256) !== clean(direction?.overlaySha256)
        || clean(freshDirection.inheritedR806OverlaySha256) !== clean(foundation?.overlaySha256)
        || JSON.stringify(freshDirection.compositionFamilies) !== JSON.stringify(direction?.compositionFamilies)
        || clean(freshDirection.patternInterruptBeatId) !== clean(direction?.patternInterruptBeatId)) {
      throw new Error('R8.07 visual-rhythm receipt does not bind the exact creative brief overlay')
    }
  }
  if (clean(brief.sourceIdentity?.id) !== clean(mediaPack.researchObjectIds?.[0])
      || clean(brief.sourceIdentity?.sourceUrl) !== clean(mediaPack.source.url)) {
    throw new Error('R8.05 creative brief source identity does not match the governed media pack')
  }

  const narrationReceipt = narrationReceiptFile.value
  const beatTimeline = beatTimelineFile.value
  const voiceQa = voiceQaFile.value
  if (clean(narrationReceipt.release) !== 'R8.05'
      || clean(narrationReceipt.source?.timingAuthority) !== 'exact-local-narration'
      || clean(narrationReceipt.source?.creativeBriefSha256) !== briefFile.sha256
      || clean(narrationReceipt.source?.beatTimelineSha256) !== beatTimelineFile.sha256
      || clean(narrationReceipt.output?.sha256) !== audioSha) {
    throw new Error('R8.05 narration provenance is not bound to the exact brief/timeline/audio')
  }
  if (clean(beatTimeline.schemaVersion) !== 'ths-r805-semantic-beat-timeline-v1'
      || clean(beatTimeline.release) !== 'R8.05'
      || clean(beatTimeline.timingAuthority) !== 'exact-local-narration'
      || clean(beatTimeline.creativeBriefSha256) !== briefFile.sha256
      || clean(beatTimeline.audioSha256) !== audioSha) {
    throw new Error('R8.05 semantic beat timeline is stale or not voice-authored')
  }
  if (clean(voiceQa.release) !== 'R8.05'
      || clean(voiceQa.artifact?.sha256) !== audioSha
      || clean(voiceQa.narrationReceiptSha256) !== narrationReceiptFile.sha256
      || clean(voiceQa.semanticBeatTimelineSha256) !== beatTimelineFile.sha256
      || clean(voiceQa.creativeBriefSha256) !== briefFile.sha256
      || voiceQa.qa?.exactArtifactReviewed !== true
      || clean(voiceQa.qa?.naturalPresence) !== 'pass'
      || clean(voiceQa.qa?.pronunciation) !== 'pass') {
    throw new Error('R8.05 exact local narration has not passed artifact-bound voice QA')
  }

  const timelineBeats = Array.isArray(beatTimeline.beats) ? beatTimeline.beats : []
  if (timelineBeats.length !== brief.beats.length || quality.beatReceipts.length !== brief.beats.length) {
    throw new Error('R8.05 semantic beat inventory mismatch')
  }

  let expectedStart = 0
  let sourceCount = 0
  const scenes = brief.beats.map((beat, index) => {
    const timed = timelineBeats[index]
    const governed = quality.beatReceipts[index]
    if (clean(timed?.id) !== clean(beat.id) || clean(governed?.id) !== clean(beat.id) || clean(timed?.role) !== clean(beat.role)) {
      throw new Error(`R8.05 beat identity mismatch at index ${index}`)
    }
    for (const [field, actual] of [
      ['narrationSha256', sha256(clean(beat.narration))],
      ['onScreenTextSha256', sha256(clean(beat.onScreenText))],
      ['visualPurposeSha256', sha256(clean(beat.visualPurpose))],
      ['spokenAnchorSha256', sha256(clean(beat.spokenAnchor))],
      ['visualActionSha256', sha256(clean(beat.visualAction))],
    ]) {
      if (clean(timed?.[field]) !== actual || clean(governed?.[field]) !== actual) {
        throw new Error(`R8.05 beat ${beat.id} ${field} does not match exact voice/creative binding`)
      }
    }
    if (clean(timed?.cutReason) !== clean(beat.cutReason) || clean(governed?.cutReason) !== clean(beat.cutReason)) {
      throw new Error(`R8.05 beat ${beat.id} cut reason drifted`)
    }
    const motionType = clean(beat?.motion?.type)
    if (clean(governed?.motionType) !== motionType) throw new Error(`R8.05 beat ${beat.id} motion type drifted`)
    const start = Number(timed.start)
    const end = Number(timed.end)
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || !timingMatches(start, expectedStart)) {
      throw new Error(`R8.05 beat ${beat.id} timing is not contiguous`)
    }
    expectedStart = end
    if (clean(beat.role) === 'source') {
      sourceCount += 1
      if (clean(beat.onScreenText) !== clean(mediaPack.source.url) || end - start < 3) {
        throw new Error('R8.05 source beat must show the exact canonical URL for at least three seconds')
      }
    }
    const speechEnd = Number(timed.speechEnd)
    const anchorCue = timed.anchorCue === null || timed.anchorCue === undefined ? null : Number(timed.anchorCue)
    if (clean(beat.narration)) {
      if (!Number.isFinite(speechEnd) || speechEnd <= start || speechEnd > end) throw new Error(`R8.05 beat ${beat.id} speechEnd is invalid`)
      if (!Number.isFinite(anchorCue) || anchorCue <= start || anchorCue >= speechEnd) throw new Error(`R8.05 beat ${beat.id} anchorCue must fall inside exact spoken audio`)
      if (clean(timed.anchorTimingMethod) !== 'voice-duration-proportional-text-anchor') throw new Error(`R8.05 beat ${beat.id} anchor timing method is not governed`)
    } else if (motionType !== 'hold') {
      throw new Error(`R8.05 silent beat ${beat.id} must use hold motion`)
    }
    return {
      beatId: clean(beat.id),
      role: clean(beat.role),
      start,
      end,
      speechEnd,
      motionType,
      motionCueOffset: anchorCue === null ? null : roundTenThousandth(anchorCue - start),
      motionCueMethod: clean(timed.anchorTimingMethod),
      onScreenText: clean(beat.onScreenText),
      voiceover: clean(beat.narration),
      visualPurpose: clean(beat.visualPurpose),
      spokenAnchor: clean(beat.spokenAnchor),
      visualAction: clean(beat.visualAction),
      cutReason: clean(beat.cutReason),
      factualAuthority: clean(beat.factualAuthority) || 'creative-framing',
      colorTreatment: colorTreatmentForRole(clean(beat.role), beat.colorTreatment),
      visualMode: clean(beat?.r806?.visualMode),
      teachingObject: clean(beat?.r806?.teachingObject),
      compositionFamily: clean(beat?.r807?.compositionFamily),
      rhythmAction: clean(beat?.r807?.rhythmAction),
      motifId: clean(beat?.r807?.motifId),
      patternInterrupt: beat?.r807?.patternInterrupt === true,
      patternInterruptReason: clean(beat?.r807?.patternInterruptReason),
      beatReceiptSha256: sha256(JSON.stringify(governed)),
      sourceLegibility: clean(beat.role) === 'source' ? creativeSpec.verticalVideo.sourceLegibility : undefined,
    }
  })

  const durationSeconds = Number(beatTimeline.durationSeconds)
  if (!Number.isFinite(durationSeconds) || durationSeconds < 5 || durationSeconds > 60 || !timingMatches(expectedStart, durationSeconds)) {
    throw new Error('R8.05 exact narration duration is outside the governed natural-runtime envelope')
  }
  if (Number(narrationReceipt.profile?.durationSeconds) !== durationSeconds) {
    throw new Error('R8.05 narration receipt duration does not match its semantic timeline')
  }
  if (sourceCount !== 1) throw new Error('R8.05 rendered timeline requires exactly one dedicated source beat')

  return {
    scenes,
    durationSeconds,
    bindings: {
      creativeBrief: { file: 'r805-creative-brief.json', sha256: briefFile.sha256 },
      semanticBeatTimeline: { file: 'semantic-beat-timeline.json', sha256: beatTimelineFile.sha256 },
      narrationReceipt: { file: 'narration.wav.receipt.json', sha256: narrationReceiptFile.sha256 },
      voiceQaReceipt: { file: 'voice-qa.receipt.json', sha256: voiceQaFile.sha256 },
      audioSha256: audioSha,
      semanticBeatMapSha256: quality.semanticBeatMapSha256,
    },
  }
}

function verticalPlatformIntersection() {
  const zones = Object.values(CREATIVE_BRAND_TOKENS.platformSafeZones)
    .filter((zone) => zone.format === 'vertical')
  return {
    top: Math.max(...zones.map((zone) => zone.top)),
    bottom: Math.max(...zones.map((zone) => zone.bottom)),
    left: Math.max(...zones.map((zone) => zone.left)),
    right: Math.max(...zones.map((zone) => zone.right)),
  }
}

function renderAuthoredComposition(scene, { x, width, top, bottom, foreground, motionPhase }) {
  const family = clean(scene.compositionFamily)
  if (!family) return ''
  const phase = clean(motionPhase) || 'post'
  const revealHidden = clean(scene.motionType) === 'reveal' && phase === 'pre'
  if (revealHidden) return ''
  const semanticAccentVisible = clean(scene.motionType) === 'hold' || phase === 'post'
  const available = bottom - top
  if (available < 140) throw new Error(`R8.07 composition ${family} lacks vertical space beneath governed copy`)
  const h = Math.min(420, available)
  const y = top + Math.max(0, (available - h) * 0.35)
  const cx = x + (width / 2)
  const cy = y + (h / 2)
  const stroke = `stroke="${foreground}" stroke-width="6"`
  const softStroke = `stroke="${foreground}" stroke-width="4" stroke-opacity="0.62" fill="none"`
  const softFill = `fill="${foreground}" fill-opacity="0.10"`
  let body = ''

  if (family === 'hero-object') {
    body = `<circle cx="${cx}" cy="${cy}" r="${Math.min(120, h * 0.28)}" ${softFill} ${stroke}/><circle cx="${cx - 170}" cy="${cy - 60}" r="24" fill="${foreground}" fill-opacity="0.68"/><circle cx="${cx + 170}" cy="${cy - 70}" r="18" fill="${foreground}" fill-opacity="0.52"/><circle cx="${cx + 140}" cy="${cy + 105}" r="28" fill="${foreground}" fill-opacity="0.78"/><path d="M ${cx - 145} ${cy - 50} L ${cx - 90} ${cy - 25} M ${cx + 145} ${cy - 60} L ${cx + 88} ${cy - 25} M ${cx + 115} ${cy + 90} L ${cx + 78} ${cy + 55}" ${softStroke}/>`
  } else if (family === 'split-compare') {
    const gap = 42
    const boxW = (width - gap) / 2
    body = `<rect x="${x}" y="${y + 45}" width="${boxW}" height="${Math.min(250, h - 90)}" rx="34" ${softFill} ${stroke}/><rect x="${x + boxW + gap}" y="${y + 45}" width="${boxW}" height="${Math.min(250, h - 90)}" rx="34" ${softFill} ${stroke}/><path d="M ${cx - 28} ${cy} L ${cx + 28} ${cy} M ${cx + 10} ${cy - 18} L ${cx + 28} ${cy} L ${cx + 10} ${cy + 18}" ${stroke}/>`
  } else if (family === 'evidence-focus') {
    const cardW = Math.min(520, width * 0.72)
    const cardX = cx - cardW / 2
    body = `<rect x="${cardX}" y="${y + 20}" width="${cardW}" height="${Math.min(320, h - 40)}" rx="28" ${softFill} ${stroke}/><circle cx="${cardX + 54}" cy="${y + 86}" r="14" fill="${foreground}"/><path d="M ${cardX + 92} ${y + 86} H ${cardX + cardW - 48} M ${cardX + 48} ${y + 150} H ${cardX + cardW - 48} M ${cardX + 48} ${y + 214} H ${cardX + cardW - 130}" ${softStroke}/>`
  } else if (family === 'diagram-flow') {
    const left = x + width * 0.18
    const mid = x + width * 0.5
    const right = x + width * 0.82
    body = `<path d="M ${left + 46} ${cy} H ${mid - 46} M ${mid + 46} ${cy} H ${right - 46}" ${softStroke}/><circle cx="${left}" cy="${cy}" r="44" ${softFill} ${stroke}/><circle cx="${mid}" cy="${cy}" r="44" ${softFill} ${stroke}/><circle cx="${right}" cy="${cy}" r="44" ${softFill} ${stroke}/>`
  } else if (family === 'macro-detail') {
    const r = Math.min(120, h * 0.27)
    body = `<circle cx="${cx - 28}" cy="${cy - 20}" r="${r}" ${softFill} ${stroke}/><path d="M ${cx + r * 0.52} ${cy + r * 0.48} L ${cx + r * 1.18} ${cy + r * 1.16}" ${stroke}/><circle cx="${cx - 62}" cy="${cy - 58}" r="18" fill="${foreground}" fill-opacity="0.72"/><circle cx="${cx + 12}" cy="${cy - 8}" r="24" fill="${foreground}" fill-opacity="0.46"/><circle cx="${cx - 42}" cy="${cy + 42}" r="13" fill="${foreground}" fill-opacity="0.56"/>`
  } else if (family === 'process-flow') {
    const segment = width / 3
    body = [0,1,2].map((index) => {
      const bx = x + (segment * index) + 8
      const bw = segment - 28
      return `<rect x="${bx}" y="${cy - 62}" width="${bw}" height="124" rx="28" ${softFill} ${stroke}/>`
    }).join('') + `<path d="M ${x + segment - 12} ${cy} H ${x + segment + 10} M ${x + (segment * 2) - 12} ${cy} H ${x + (segment * 2) + 10}" ${stroke}/>`
  } else if (family === 'kinetic-type') {
    body = `<rect x="${x}" y="${cy - 82}" width="${width}" height="20" rx="10" fill="${foreground}" fill-opacity="0.18"/><rect x="${x}" y="${cy - 22}" width="${width * 0.74}" height="20" rx="10" fill="${foreground}" fill-opacity="0.42"/><rect x="${x}" y="${cy + 38}" width="${width * 0.46}" height="20" rx="10" fill="${foreground}" fill-opacity="0.72"/>`
  }

  const motif = semanticAccentVisible && clean(scene.motifId)
    ? `<g data-r807-motif="${escapeXml(scene.motifId)}"><path d="M ${x + width - 112} ${y + 18} L ${x + width - 72} ${y + 54} L ${x + width - 30} ${y + 18}" ${softStroke}/><circle cx="${x + width - 112}" cy="${y + 18}" r="10" fill="${foreground}"/><circle cx="${x + width - 72}" cy="${y + 54}" r="10" fill="${foreground}"/><circle cx="${x + width - 30}" cy="${y + 18}" r="10" fill="${foreground}"/></g>`
    : ''
  const interrupt = scene.patternInterrupt === true && motionPhase === 'post'
    ? `<rect data-r807-pattern-interrupt="true" x="${x - 16}" y="${y - 18}" width="${width + 32}" height="${h + 36}" rx="42" fill="none" stroke="${foreground}" stroke-width="7" stroke-dasharray="22 16" stroke-opacity="0.82"/>`
    : ''
  return `<g data-r807-composition="${escapeXml(family)}">${interrupt}${body}${motif}</g>`
}

export function renderVerticalVideoSceneSvg(scene, options = {}) {
  const canvas = CREATIVE_BRAND_TOKENS.canvas.vertical
  const motionPhase = clean(options.motionPhase) || 'post'
  const { foreground, background } = treatment(scene.colorTreatment)
  const sourceUrl = clean(options.sourceUrl)
  const contentHash = clean(options.contentHash)
  const disclosure = clean(options.disclosure)
  if (!sourceUrl || !contentHash || !disclosure) throw new Error('sourceUrl, contentHash, and disclosure are required for video scene provenance')

  const sourceScene = scene.role === 'source'
  const sourceLegibility = scene.sourceLegibility ?? options.sourceLegibility
  const fontSize = sourceScene
    ? Math.max(32, Number(sourceLegibility?.typography?.minimumPxAt1080 ?? 0))
    : Math.max(CREATIVE_BRAND_TOKENS.typography.minimumBodyPxAt1080, Number(options.fontSize ?? 44))
  const lines = sourceScene
    ? wrapSourceUrlLosslessly(
      scene.onScreenText,
      options.sourceMaxChars ?? 38,
      Number(sourceLegibility?.typography?.maximumLines ?? 4),
    )
    : wrapTextLosslessly(scene.onScreenText, options.maxChars ?? 26)
  if (sourceScene && lines.join('') !== sourceUrl) throw new Error('dedicated source scene must render the exact canonical URL')

  const safe = verticalPlatformIntersection()
  const x = safe.left
  const safeRight = canvas.width - safe.right
  const safeWidth = safeRight - x
  const contentTop = safe.top + 160
  const lineHeight = Math.ceil(fontSize * 1.42)
  const headlineVisible = !(scene.motionType === 'reveal' && motionPhase === 'pre')
  const headline = headlineVisible
    ? lines.map((line, index) => `<text x="${x}" y="${contentTop + (index * lineHeight)}" font-size="${fontSize}" font-weight="700" fill="${foreground}">${escapeXml(line)}</text>`).join('')
    : ''
  const highlight = scene.motionType === 'highlight' && motionPhase === 'post'
    ? `<rect x="${x}" y="${contentTop + (lines.length * lineHeight) + 16}" width="${Math.min(safeWidth, Math.max(180, safeWidth * 0.62))}" height="8" rx="4" fill="${foreground}"/>`
    : ''
  const disclosureY = canvas.height - safe.bottom - 70
  const compositionTop = contentTop + (lines.length * lineHeight) + 72
  const compositionVisible = !(scene.motionType === 'reveal' && motionPhase === 'pre')
  const composition = compositionVisible
    ? renderAuthoredComposition(scene, {
        x,
        width: safeWidth,
        top: compositionTop,
        bottom: disclosureY - 72,
        foreground,
        motionPhase,
      })
    : ''
  const provenanceY = canvas.height - safe.bottom - 26
  const metadata = JSON.stringify({
    sourceUrl,
    sourceDisplayText: sourceScene ? lines.join('') : null,
    sourceMinimumPxAt1080: sourceScene ? fontSize : null,
    contentHash,
    factualAuthority: scene.factualAuthority,
    renderer: 'vertical-video-package-v1',
    role: scene.role,
    beatId: scene.beatId || null,
    beatReceiptSha256: scene.beatReceiptSha256 || null,
    spokenAnchor: scene.spokenAnchor || null,
    visualAction: scene.visualAction || null,
    cutReason: scene.cutReason || null,
    motionType: scene.motionType || null,
    motionPhase,
    motionCueOffset: scene.motionCueOffset ?? null,
    motionCueMethod: scene.motionCueMethod || null,
    visualMode: scene.visualMode || null,
    teachingObject: scene.teachingObject || null,
    compositionFamily: scene.compositionFamily || null,
    rhythmAction: scene.rhythmAction || null,
    motifId: scene.motifId || null,
    patternInterrupt: scene.patternInterrupt === true,
    patternInterruptReason: scene.patternInterruptReason || null,
    start: scene.start,
    end: scene.end,
    safeArea: { x, right: safeRight, width: safeWidth, top: safe.top, bottom: canvas.height - safe.bottom },
  })
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}" role="img" aria-label="${escapeXml(`${scene.role} scene`)}"><rect width="100%" height="100%" fill="${background}"/><text x="${x}" y="${safe.top + 70}" font-size="32" font-weight="600" fill="${foreground}">The Hippie Scientist</text>${headline}${highlight}${composition}<text x="${x}" y="${disclosureY}" font-size="24" fill="${foreground}" textLength="${safeWidth}" lengthAdjust="spacingAndGlyphs">${escapeXml(disclosure)}</text><text x="${x}" y="${provenanceY}" font-size="22" fill="${foreground}" textLength="${safeWidth}" lengthAdjust="spacingAndGlyphs">${escapeXml(sourceUrl)}</text><metadata>${escapeXml(metadata)}</metadata></svg>`
  return { svg, width: canvas.width, height: canvas.height, hash: sha256(`${svg}\n`) }
}

export function renderVerticalVideoPackage({ mediaPack, creativeSpec, outputDir }) {
  const dir = path.resolve(outputDir)
  fs.mkdirSync(dir, { recursive: true })
  const release = clean(creativeSpec?.systemRelease) || 'R8.04'
  const built = release === 'R8.05'
    ? buildTimelineR805(mediaPack, creativeSpec, dir)
    : { scenes: buildTimelineR804(mediaPack, creativeSpec), durationSeconds: 30, bindings: null }
  const { scenes, durationSeconds, bindings } = built
  const disclosure = clean(creativeSpec.delivery.disclosure)

  const assets = scenes.map((scene, index) => {
    const suffix = String(index + 1).padStart(2, '0')
    const rendered = renderVerticalVideoSceneSvg(scene, {
      sourceUrl: mediaPack.source.url,
      contentHash: mediaPack.source.contentHash,
      disclosure,
      sourceLegibility: creativeSpec.verticalVideo.sourceLegibility,
      motionPhase: 'post',
    })
    const file = `video-scene-${suffix}.svg`
    const bytes = `${rendered.svg}\n`
    fs.writeFileSync(path.join(dir, file), bytes)

    let motion = { type: scene.motionType || 'hold', cueOffset: null, cueMethod: scene.motionCueMethod || 'hold' }
    if (release === 'R8.05' && ['reveal', 'highlight'].includes(scene.motionType)) {
      const cueOffset = roundTenThousandth(scene.motionCueOffset)
      const sceneDuration = roundTenThousandth(scene.end - scene.start)
      if (!(cueOffset > 0 && cueOffset < sceneDuration)) throw new Error(`R8.05 beat ${scene.beatId} has an invalid internal-motion cue`)
      const preRendered = renderVerticalVideoSceneSvg(scene, {
        sourceUrl: mediaPack.source.url,
        contentHash: mediaPack.source.contentHash,
        disclosure,
        sourceLegibility: creativeSpec.verticalVideo.sourceLegibility,
        motionPhase: 'pre',
      })
      const preFile = `video-scene-${suffix}-pre.svg`
      const preBytes = `${preRendered.svg}\n`
      fs.writeFileSync(path.join(dir, preFile), preBytes)
      motion = {
        type: scene.motionType,
        cueOffset,
        cueMethod: scene.motionCueMethod,
        preFile,
        preSha256: sha256(preBytes),
        postFile: file,
        postSha256: sha256(bytes),
      }
    }

    return {
      id: `video-scene-${index + 1}`,
      beatId: scene.beatId || null,
      beatReceiptSha256: scene.beatReceiptSha256 || null,
      cutReason: scene.cutReason || null,
      spoken: Boolean(clean(scene.voiceover)),
      motion,
      type: 'vertical-video-scene',
      format: 'svg',
      file,
      sha256: sha256(bytes),
      width: rendered.width,
      height: rendered.height,
      start: scene.start,
      end: scene.end,
      duration: release === 'R8.05' ? roundTenThousandth(scene.end - scene.start) : roundMillis(scene.end - scene.start),
      role: scene.role,
      factualAuthority: scene.factualAuthority,
      visualMode: scene.visualMode || null,
      teachingObject: scene.teachingObject || null,
      compositionFamily: scene.compositionFamily || null,
      rhythmAction: scene.rhythmAction || null,
      motifId: scene.motifId || null,
      patternInterrupt: scene.patternInterrupt === true,
      patternInterruptReason: scene.patternInterruptReason || null,
      sourceContentHash: mediaPack.source.contentHash,
      sourceUrl: mediaPack.source.url,
    }
  })

  const timeline = {
    schemaVersion: '1.1.0',
    renderer: 'vertical-video-package-v1',
    systemRelease: release,
    creativeMethodRelease: clean(creativeSpec?.creativeMethodRelease) || release,
    timingAuthority: release === 'R8.05' ? 'exact-local-narration' : 'legacy-authored-30s',
    packId: mediaPack.packId,
    sourceContentHash: mediaPack.source.contentHash,
    sourceUrl: mediaPack.source.url,
    width: 1080,
    height: 1920,
    fps: 30,
    durationSeconds,
    semanticBeatMapSha256: bindings?.semanticBeatMapSha256 ?? null,
    scenes: assets.map(({ id, beatId, beatReceiptSha256, cutReason, spoken, motion, file, sha256: hash, start, end, duration, role, factualAuthority, visualMode, teachingObject, compositionFamily, rhythmAction, motifId, patternInterrupt, patternInterruptReason }) => ({
      id, beatId, beatReceiptSha256, cutReason, spoken, motion, file, sha256: hash, start, end, duration, role, factualAuthority,
      visualMode, teachingObject, compositionFamily, rhythmAction, motifId, patternInterrupt, patternInterruptReason,
    })),
  }
  const timelineBytes = `${JSON.stringify(timeline, null, 2)}\n`
  fs.writeFileSync(path.join(dir, 'video-timeline.json'), timelineBytes)

  const captions = buildSrt(scenes)
  fs.writeFileSync(path.join(dir, 'captions.srt'), captions)

  const narrationScript = {
    schemaVersion: 'ths-local-narration-script-v1',
    release,
    timingAuthority: release === 'R8.05' ? 'exact-local-narration' : 'legacy-authored-30s',
    packId: mediaPack.packId,
    sourceContentHash: mediaPack.source.contentHash,
    sourceUrl: mediaPack.source.url,
    durationSeconds,
    sampleRate: 24000,
    scenes: scenes.map((scene) => ({
      beatId: scene.beatId || null,
      role: scene.role,
      start: scene.start,
      end: scene.end,
      text: clean(scene.voiceover),
      factualAuthority: scene.factualAuthority,
    })),
  }
  const narrationScriptBytes = `${JSON.stringify(narrationScript, null, 2)}\n`
  fs.writeFileSync(path.join(dir, 'narration-script.json'), narrationScriptBytes)

  const manifest = {
    schemaVersion: '1.1.0',
    release,
    packId: mediaPack.packId,
    sourceContentHash: mediaPack.source.contentHash,
    sourceUrl: mediaPack.source.url,
    renderer: 'vertical-video-package-v1',
    systemRelease: release,
    creativeMethodRelease: clean(creativeSpec?.creativeMethodRelease) || release,
    creativeQuality: creativeSpec.creativeQuality ?? null,
    creativeFoundation: creativeSpec.creativeFoundation ?? null,
    creativeDirection: creativeSpec.creativeDirection ?? null,
    r805Bindings: bindings,
    durationSeconds,
    timeline: { file: 'video-timeline.json', sha256: sha256(timelineBytes) },
    captions: { file: 'captions.srt', sha256: sha256(captions), format: 'srt', lossless: true },
    narrationScript: {
      file: 'narration-script.json',
      sha256: sha256(narrationScriptBytes),
      schemaVersion: narrationScript.schemaVersion,
      localVoiceRequired: true,
      premiumProviderFallbackAllowed: false,
      timingAuthority: narrationScript.timingAuthority,
    },
    assets,
  }
  fs.writeFileSync(path.join(dir, 'video-asset-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  return manifest
}
