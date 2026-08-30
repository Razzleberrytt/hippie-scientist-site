const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')

function formatSrtTime(seconds) {
  const milliseconds = Math.round(Number(seconds) * 1000)
  const hours = Math.floor(milliseconds / 3_600_000)
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000)
  const secs = Math.floor((milliseconds % 60_000) / 1000)
  const millis = milliseconds % 1000
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`
}

function wrapLosslessly(text, maxCharsPerLine, maxLines) {
  const words = clean(text).split(' ').filter(Boolean)
  if (!words.length) return []
  if (words.some((word) => word.length > maxCharsPerLine)) {
    throw new Error('Caption contains an indivisible word longer than the line budget')
  }

  const cues = []
  let lines = []
  let line = ''

  const flushLine = () => {
    if (!line) return
    lines.push(line)
    line = ''
  }
  const flushCue = () => {
    flushLine()
    if (!lines.length) return
    cues.push(lines.join('\n'))
    lines = []
  }

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (candidate.length <= maxCharsPerLine) {
      line = candidate
      continue
    }

    flushLine()
    if (lines.length >= maxLines) flushCue()
    line = word
  }
  flushCue()
  return cues
}

function cueText(cue) {
  return clean(String(cue?.text ?? '').replace(/\n/g, ' '))
}

function normalizeSafeArea(area, platform) {
  const normalized = {
    x: Number(area?.x),
    y: Number(area?.y),
    width: Number(area?.width),
    height: Number(area?.height),
  }
  if (![normalized.x, normalized.y, normalized.width, normalized.height].every(Number.isFinite)) {
    throw new Error(`Caption safe area for ${platform} must use finite geometry`)
  }
  if (normalized.width <= 0 || normalized.height <= 0) {
    throw new Error(`Caption safe area for ${platform} must have positive dimensions`)
  }
  return normalized
}

function buildCaptionRegion(platformSafeAreas, {
  maxLines,
  minimumPxAt1080,
  horizontalPadding = 24,
  verticalPadding = 24,
  lineHeightRatio = 1.3,
} = {}) {
  const entries = Object.entries(platformSafeAreas ?? {})
  if (!entries.length) throw new Error('Caption contract requires platform safe areas')
  const areas = entries.map(([platform, area]) => [platform, normalizeSafeArea(area, platform)])

  const left = Math.max(...areas.map(([, area]) => area.x))
  const top = Math.max(...areas.map(([, area]) => area.y))
  const right = Math.min(...areas.map(([, area]) => area.x + area.width))
  const bottom = Math.min(...areas.map(([, area]) => area.y + area.height))
  if (!(right > left && bottom > top)) throw new Error('Vertical platforms do not share a usable caption-safe intersection')

  const lineHeightPx = Math.ceil(Number(minimumPxAt1080) * Number(lineHeightRatio))
  const requiredTextHeight = lineHeightPx * Number(maxLines)
  const height = requiredTextHeight + (2 * Number(verticalPadding))
  const width = (right - left) - (2 * Number(horizontalPadding))
  if (!(width > 0) || height > (bottom - top)) {
    throw new Error('Shared platform safe area cannot fit the configured caption block')
  }

  return {
    x: left + Number(horizontalPadding),
    y: bottom - height,
    width,
    height,
    horizontalPadding: Number(horizontalPadding),
    verticalPadding: Number(verticalPadding),
    lineHeightPx,
    maxLines: Number(maxLines),
    minimumPxAt1080: Number(minimumPxAt1080),
    anchor: 'lower-middle-safe-intersection',
  }
}

export function buildLosslessCaptionContract({
  scenes,
  platformSafeAreas,
  maxCharsPerLine = 42,
  maxLines = 2,
  minimumPxAt1080 = 44,
  minimumCueSeconds = 1,
} = {}) {
  if (!Array.isArray(scenes) || !scenes.length) throw new Error('Caption contract requires at least one scene')
  if (!platformSafeAreas || !Object.keys(platformSafeAreas).length) throw new Error('Caption contract requires platform safe areas')

  const captionRegion = buildCaptionRegion(platformSafeAreas, { maxLines, minimumPxAt1080 })
  const cues = []
  for (const [sceneIndex, scene] of scenes.entries()) {
    const voiceover = clean(scene?.voiceover)
    const start = Number(scene?.start)
    const end = Number(scene?.end)
    if (!voiceover) throw new Error(`Scene ${sceneIndex + 1} requires voiceover for deterministic captions`)
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      throw new Error(`Scene ${sceneIndex + 1} has invalid caption timing`)
    }

    const parts = wrapLosslessly(voiceover, maxCharsPerLine, maxLines)
    const duration = end - start
    const cueDuration = duration / parts.length
    if (cueDuration < minimumCueSeconds) {
      throw new Error(`Scene ${sceneIndex + 1} cannot fit lossless captions within the timing budget`)
    }

    parts.forEach((text, partIndex) => {
      const cueStart = start + (partIndex * cueDuration)
      const cueEnd = partIndex === parts.length - 1 ? end : start + ((partIndex + 1) * cueDuration)
      cues.push({
        index: cues.length + 1,
        sceneIndex: sceneIndex + 1,
        role: scene.role,
        start: Number(cueStart.toFixed(3)),
        end: Number(cueEnd.toFixed(3)),
        text,
        factualAuthority: scene.factualAuthority,
        sourceVoiceover: voiceover,
      })
    })
  }

  const srt = `${cues.map((cue) => `${cue.index}\n${formatSrtTime(cue.start)} --> ${formatSrtTime(cue.end)}\n${cue.text}`).join('\n\n')}\n`

  return {
    version: 2,
    maxCharsPerLine,
    maxLines,
    minimumPxAt1080,
    minimumCueSeconds,
    position: 'lower-middle-safe-area',
    captionRegion,
    colorTreatment: 'disclosure',
    platformSafeAreas,
    mustFitPlatformSafeArea: true,
    ellipsisAllowed: false,
    truncationAllowed: false,
    cues,
    srt,
  }
}

export function validateLosslessCaptionContract(contract, scenes) {
  const errors = []
  const cues = Array.isArray(contract?.cues) ? contract.cues : []
  const sourceScenes = Array.isArray(scenes) ? scenes : []
  const region = contract?.captionRegion

  if (Number(contract?.minimumPxAt1080) < 44) errors.push('caption typography must be at least 44px at 1080-wide output')
  if (contract?.ellipsisAllowed !== false || contract?.truncationAllowed !== false) errors.push('caption truncation and presentation-added ellipses must be forbidden')
  if (!contract?.mustFitPlatformSafeArea || !contract?.platformSafeAreas) errors.push('captions must be bound to platform safe areas')
  if (!region || region.anchor !== 'lower-middle-safe-intersection') errors.push('captions require a deterministic lower-middle shared-safe-area region')
  if (!cues.length) errors.push('caption cues are required')

  if (region) {
    const requiredTextHeight = Number(region.lineHeightPx) * Number(contract?.maxLines ?? 0)
    const innerHeight = Number(region.height) - (2 * Number(region.verticalPadding ?? 0))
    if (Number(region.minimumPxAt1080) !== Number(contract?.minimumPxAt1080)) errors.push('caption region typography must match the caption contract')
    if (Number(region.maxLines) !== Number(contract?.maxLines)) errors.push('caption region line count must match the caption contract')
    if (innerHeight + 1e-9 < requiredTextHeight) errors.push('caption region is too short for the configured caption block')
    if (!(Number(region.width) > 0 && Number(region.height) > 0)) errors.push('caption region must have positive dimensions')

    for (const [platform, rawArea] of Object.entries(contract?.platformSafeAreas ?? {})) {
      try {
        const area = normalizeSafeArea(rawArea, platform)
        const regionRight = Number(region.x) + Number(region.width)
        const regionBottom = Number(region.y) + Number(region.height)
        if (
          Number(region.x) < area.x - 1e-9 ||
          Number(region.y) < area.y - 1e-9 ||
          regionRight > area.x + area.width + 1e-9 ||
          regionBottom > area.y + area.height + 1e-9
        ) {
          errors.push(`caption region leaves the ${platform} safe area`)
        }
      } catch (error) {
        errors.push(error.message)
      }
    }
  }

  for (const cue of cues) {
    const lines = String(cue?.text ?? '').split('\n')
    if (lines.length > Number(contract?.maxLines ?? 0)) errors.push(`cue ${cue.index} exceeds the line-count budget`)
    if (lines.some((line) => line.length > Number(contract?.maxCharsPerLine ?? 0))) errors.push(`cue ${cue.index} exceeds the line-length budget`)
    if (!(Number(cue?.end) > Number(cue?.start))) errors.push(`cue ${cue.index} has invalid timing`)
    if ((Number(cue?.end) - Number(cue?.start)) + 1e-9 < Number(contract?.minimumCueSeconds ?? 0)) errors.push(`cue ${cue.index} is too brief`)
  }

  for (const [sceneIndex, scene] of sourceScenes.entries()) {
    const sceneCues = cues.filter((cue) => cue.sceneIndex === sceneIndex + 1)
    const reconstructed = clean(sceneCues.map(cueText).join(' '))
    const sourceVoiceover = clean(scene?.voiceover)
    if (reconstructed !== sourceVoiceover) errors.push(`scene ${sceneIndex + 1} caption text does not reconstruct voiceover exactly`)
    if (sceneCues.some((cue) => clean(cue?.sourceVoiceover) !== sourceVoiceover)) errors.push(`scene ${sceneIndex + 1} caption source voiceover drifted`)
    if (sceneCues.length && Number(sceneCues[0].start) !== Number(scene.start)) errors.push(`scene ${sceneIndex + 1} captions do not start with the scene`)
    if (sceneCues.length && Number(sceneCues.at(-1).end) !== Number(scene.end)) errors.push(`scene ${sceneIndex + 1} captions do not end with the scene`)
  }

  for (let index = 1; index < cues.length; index += 1) {
    if (Number(cues[index].start) < Number(cues[index - 1].end) - 1e-9) errors.push(`cue ${cues[index].index} overlaps the previous cue`)
  }

  return [...new Set(errors)]
}
