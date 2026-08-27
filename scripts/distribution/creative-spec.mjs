export const CREATIVE_BRAND_TOKENS = Object.freeze({
  canvas: {
    vertical: { width: 1080, height: 1920, safeTop: 220, safeBottom: 320, safeSide: 96 },
    portrait: { width: 1080, height: 1350, safeTop: 120, safeBottom: 160, safeSide: 80 },
    square: { width: 1080, height: 1080, safeTop: 96, safeBottom: 120, safeSide: 80 },
    pinterest: { width: 1000, height: 1500, safeTop: 120, safeBottom: 160, safeSide: 72 },
  },
  platformSafeZones: {
    tiktok: { format: 'vertical', top: 220, bottom: 360, left: 96, right: 220 },
    instagramReels: { format: 'vertical', top: 220, bottom: 340, left: 96, right: 180 },
    youtubeShorts: { format: 'vertical', top: 220, bottom: 320, left: 96, right: 180 },
    instagramFeed: { format: 'portrait', top: 120, bottom: 160, left: 80, right: 80 },
    squareSocial: { format: 'square', top: 96, bottom: 120, left: 80, right: 80 },
    pinterest: { format: 'pinterest', top: 120, bottom: 160, left: 72, right: 72 },
  },
  typography: {
    hookMaxChars: 72,
    bodyMaxChars: 150,
    captionMaxCharsPerLine: 42,
    captionMaxLines: 2,
    sourceCardMaxChars: 180,
    altTextMaxChars: 300,
    minimumBodyPxAt1080: 42,
    minimumCaptionPxAt1080: 44,
  },
  color: {
    palette: {
      ink: '#15211B',
      parchment: '#F7F3E8',
      forest: '#1F4A3A',
      cream: '#FFFDF7',
      sageMist: '#EEF3EC',
      charcoal: '#2B2F2C',
      clayMist: '#E8D8C9',
      terracotta: '#C66A3D',
    },
    minimumTextContrast: 4.5,
    preferredBodyContrast: 7,
    treatments: {
      primaryLight: { foreground: 'ink', background: 'parchment' },
      primaryDark: { foreground: 'cream', background: 'forest' },
      evidence: { foreground: 'ink', background: 'sageMist' },
      disclosure: { foreground: 'cream', background: 'charcoal' },
      source: { foreground: 'ink', background: 'clayMist' },
    },
    decorativeOnly: ['terracotta'],
  },
  timing: {
    totalSeconds: 30,
    hookSeconds: 2,
    minimumSceneSeconds: 2.5,
    maximumSceneSeconds: 7,
  },
  treatment: {
    logoPosition: 'top-left-safe-area',
    disclosurePosition: 'bottom-safe-area',
    disclosure: 'Educational content • evidence summary, not medical advice',
    cta: 'Read the evidence',
  },
})

const SITE_ORIGIN = 'https://thehippiescientist.net'
const GOVERNED_EVIDENCE_GRADES = new Set(['A', 'B', 'C', 'D', 'Avoid/Insufficient'])
const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')
const sentence = (value) => {
  const text = clean(value)
  return text && /[.!?]$/.test(text) ? text : text ? `${text}.` : ''
}
const truncate = (value, max) => {
  const text = clean(value)
  if (text.length <= max) return text
  const clipped = text.slice(0, Math.max(1, max - 1)).replace(/\s+\S*$/, '')
  return `${clipped || text.slice(0, max - 1)}…`
}

function hexToRgb(value) {
  const hex = String(value ?? '').replace(/^#/, '')
  if (!/^[0-9a-f]{6}$/i.test(hex)) throw new Error(`Invalid brand color: ${value}`)
  return [0, 2, 4].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255)
}

function relativeLuminance(value) {
  const [red, green, blue] = hexToRgb(value).map((channel) => (
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  ))
  return (0.2126 * red) + (0.7152 * green) + (0.0722 * blue)
}

export function getContrastRatio(foreground, background) {
  const foregroundLuminance = relativeLuminance(foreground)
  const backgroundLuminance = relativeLuminance(background)
  const lighter = Math.max(foregroundLuminance, backgroundLuminance)
  const darker = Math.min(foregroundLuminance, backgroundLuminance)
  return (lighter + 0.05) / (darker + 0.05)
}

export function validateCreativeContrast(tokens = CREATIVE_BRAND_TOKENS.color) {
  const errors = []
  const palette = tokens?.palette ?? {}
  const minimum = Number(tokens?.minimumTextContrast ?? 4.5)
  for (const [name, treatment] of Object.entries(tokens?.treatments ?? {})) {
    const foreground = palette[treatment.foreground]
    const background = palette[treatment.background]
    if (!foreground || !background) {
      errors.push(`${name} references an unknown color token`)
      continue
    }
    const ratio = getContrastRatio(foreground, background)
    if (ratio < minimum) errors.push(`${name} contrast ${ratio.toFixed(2)} is below ${minimum}:1`)
  }
  return errors
}

export function validatePlatformSafeZones(
  zones = CREATIVE_BRAND_TOKENS.platformSafeZones,
  canvases = CREATIVE_BRAND_TOKENS.canvas,
) {
  const errors = []
  for (const [platform, zone] of Object.entries(zones ?? {})) {
    const canvas = canvases?.[zone?.format]
    if (!canvas) {
      errors.push(`${platform} references an unknown canvas format`)
      continue
    }
    for (const edge of ['top', 'bottom', 'left', 'right']) {
      if (!Number.isFinite(zone?.[edge]) || zone[edge] < 0) errors.push(`${platform}.${edge} must be a non-negative number`)
    }
    const horizontal = Number(zone?.left ?? 0) + Number(zone?.right ?? 0)
    const vertical = Number(zone?.top ?? 0) + Number(zone?.bottom ?? 0)
    if (horizontal >= canvas.width) errors.push(`${platform} horizontal safe-zone exclusions consume the canvas`)
    if (vertical >= canvas.height) errors.push(`${platform} vertical safe-zone exclusions consume the canvas`)
    if (zone.top < canvas.safeTop) errors.push(`${platform}.top is smaller than the canonical ${zone.format} safeTop`)
    if (zone.bottom < canvas.safeBottom) errors.push(`${platform}.bottom is smaller than the canonical ${zone.format} safeBottom`)
    if (zone.left < canvas.safeSide || zone.right < canvas.safeSide) {
      errors.push(`${platform} side exclusions are smaller than the canonical ${zone.format} safeSide`)
    }
  }
  return errors
}

function buildPlatformSafeAreas() {
  return Object.fromEntries(Object.entries(CREATIVE_BRAND_TOKENS.platformSafeZones).map(([platform, zone]) => {
    const canvas = CREATIVE_BRAND_TOKENS.canvas[zone.format]
    return [platform, {
      format: zone.format,
      x: zone.left,
      y: zone.top,
      width: canvas.width - zone.left - zone.right,
      height: canvas.height - zone.top - zone.bottom,
      exclusions: { top: zone.top, bottom: zone.bottom, left: zone.left, right: zone.right },
    }]
  }))
}

function isCanonicalEvidencePage(value) {
  try {
    const url = new URL(String(value ?? ''))
    return url.origin === SITE_ORIGIN && url.pathname !== '/' && !url.search && !url.hash
  } catch {
    return false
  }
}

function formatSrtTime(seconds) {
  const milliseconds = Math.round(seconds * 1000)
  const hours = Math.floor(milliseconds / 3_600_000)
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000)
  const secs = Math.floor((milliseconds % 60_000) / 1000)
  const millis = milliseconds % 1000
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`
}

function wrapCaption(value, maxCharsPerLine, maxLines) {
  const words = clean(value).split(' ').filter(Boolean)
  const lines = []
  let line = ''

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (candidate.length <= maxCharsPerLine) {
      line = candidate
      continue
    }
    if (line) lines.push(line)
    line = word.length <= maxCharsPerLine ? word : `${word.slice(0, maxCharsPerLine - 1)}…`
    if (lines.length === maxLines) break
  }
  if (line && lines.length < maxLines) lines.push(line)

  if (lines.length === maxLines) {
    const consumed = lines.join(' ').replace(/…$/, '')
    const original = clean(value)
    if (consumed.length < original.length && !lines.at(-1)?.endsWith('…')) {
      lines[lines.length - 1] = truncate(lines.at(-1), maxCharsPerLine)
    }
  }

  return lines.join('\n')
}

function buildCaptionTrack(scenes) {
  const maxCharsPerLine = CREATIVE_BRAND_TOKENS.typography.captionMaxCharsPerLine
  const maxLines = CREATIVE_BRAND_TOKENS.typography.captionMaxLines
  const cues = scenes.map((scene, index) => ({
    index: index + 1,
    start: scene.start,
    end: scene.end,
    text: wrapCaption(scene.voiceover, maxCharsPerLine, maxLines),
    factualAuthority: scene.factualAuthority,
  }))
  const srt = cues.map((cue) => `${cue.index}\n${formatSrtTime(cue.start)} --> ${formatSrtTime(cue.end)}\n${cue.text}`).join('\n\n')
  return { cues, srt: `${srt}\n` }
}

export function validateCreativeInput(input) {
  const errors = []
  for (const field of ['id', 'title', 'finding', 'evidenceType', 'evidenceGrade', 'limitation', 'sourceUrl']) {
    if (!clean(input?.[field])) errors.push(`${field} is required`)
  }
  if (input?.evidenceGrade && !GOVERNED_EVIDENCE_GRADES.has(clean(input.evidenceGrade))) {
    errors.push('evidenceGrade must use the governed distribution vocabulary')
  }
  if (input?.sourceUrl && !isCanonicalEvidencePage(input.sourceUrl)) {
    errors.push('sourceUrl must be a canonical Hippie Scientist evidence page, never the homepage')
  }
  return errors
}

export function buildCreativeSpec(input) {
  const errors = [
    ...validateCreativeInput(input),
    ...validateCreativeContrast(),
    ...validatePlatformSafeZones(),
  ]
  if (errors.length) throw new Error(`Invalid creative input: ${errors.join('; ')}`)

  const title = truncate(input.title, CREATIVE_BRAND_TOKENS.typography.hookMaxChars)
  const finding = truncate(sentence(input.finding), CREATIVE_BRAND_TOKENS.typography.bodyMaxChars)
  const limitation = truncate(sentence(input.limitation), CREATIVE_BRAND_TOKENS.typography.bodyMaxChars)
  const evidence = truncate(`Evidence: ${clean(input.evidenceType)} · grade ${clean(input.evidenceGrade)}.`, CREATIVE_BRAND_TOKENS.typography.bodyMaxChars)
  const source = clean(input.sourceUrl)
  const disclosure = CREATIVE_BRAND_TOKENS.treatment.disclosure
  const platformSafeAreas = buildPlatformSafeAreas()

  const carousel = {
    format: '1080x1350',
    canvas: CREATIVE_BRAND_TOKENS.canvas.portrait,
    slides: [
      { role: 'hook', eyebrow: 'Evidence snapshot', headline: title, body: null, citationRequired: false, colorTreatment: 'primaryDark' },
      { role: 'finding', eyebrow: 'What the evidence says', headline: finding, body: evidence, citationRequired: true, colorTreatment: 'evidence' },
      { role: 'limitation', eyebrow: 'What to keep in mind', headline: limitation, body: null, citationRequired: true, colorTreatment: 'primaryLight' },
      { role: 'source', eyebrow: 'Source trail', headline: CREATIVE_BRAND_TOKENS.treatment.cta, body: truncate(source, CREATIVE_BRAND_TOKENS.typography.sourceCardMaxChars), citationRequired: true, colorTreatment: 'source' },
    ],
    accessibility: {
      minimumBodyPxAt1080: CREATIVE_BRAND_TOKENS.typography.minimumBodyPxAt1080,
      contrastTarget: 'WCAG AA minimum; prefer AAA for body text',
      minimumContrastRatio: CREATIVE_BRAND_TOKENS.color.minimumTextContrast,
      approvedColorTreatments: Object.keys(CREATIVE_BRAND_TOKENS.color.treatments),
      noTextOverUncontrolledImagery: true,
      preserveSafeArea: true,
      platformSafeArea: platformSafeAreas.instagramFeed,
      altText: truncate(`Evidence snapshot: ${title}. Finding: ${finding} Limitation: ${limitation} Source: ${source}`, CREATIVE_BRAND_TOKENS.typography.altTextMaxChars),
    },
  }

  const scenes = [
    { start: 0, end: 2, role: 'hook', onScreenText: title, voiceover: title, factualAuthority: 'canonical-input', colorTreatment: 'primaryDark' },
    { start: 2, end: 9, role: 'finding', onScreenText: finding, voiceover: finding, factualAuthority: 'canonical-input', colorTreatment: 'evidence' },
    { start: 9, end: 15, role: 'evidence', onScreenText: evidence, voiceover: evidence, factualAuthority: 'canonical-input', colorTreatment: 'evidence' },
    { start: 15, end: 22, role: 'limitation', onScreenText: limitation, voiceover: limitation, factualAuthority: 'canonical-input', colorTreatment: 'primaryLight' },
    { start: 22, end: 27, role: 'context', onScreenText: disclosure, voiceover: 'Context matters, and this is an evidence summary rather than personal medical advice.', factualAuthority: 'fixed-disclosure', colorTreatment: 'disclosure' },
    { start: 27, end: 30, role: 'cta', onScreenText: CREATIVE_BRAND_TOKENS.treatment.cta, voiceover: 'Read the full evidence and source trail.', factualAuthority: 'fixed-cta', colorTreatment: 'primaryDark' },
  ]
  const captionTrack = buildCaptionTrack(scenes)

  return {
    version: 4,
    sourceIdentity: { id: clean(input.id), sourceUrl: source },
    brandTokens: CREATIVE_BRAND_TOKENS,
    delivery: {
      landingUrl: source,
      disclosure,
      cta: CREATIVE_BRAND_TOKENS.treatment.cta,
      exportProfiles: [
        { id: 'vertical-video', width: 1080, height: 1920, purpose: 'short-form-video', preserveSafeArea: true },
        { id: 'portrait-carousel', width: 1080, height: 1350, purpose: 'feed-carousel', preserveSafeArea: true },
        { id: 'square-social', width: 1080, height: 1080, purpose: 'social-card', preserveSafeArea: true },
        { id: 'pinterest', width: 1000, height: 1500, purpose: 'pinterest-pin', preserveSafeArea: true },
      ],
      platformSafeAreas,
      safeAreaPolicy: 'All factual text, captions, citations, disclosures, logos, and CTAs must remain fully inside the selected platform safe area. Decorative media may bleed outside it.',
      colorPolicy: {
        approvedTreatments: Object.keys(CREATIVE_BRAND_TOKENS.color.treatments),
        decorativeOnlyTokens: CREATIVE_BRAND_TOKENS.color.decorativeOnly,
        minimumTextContrast: CREATIVE_BRAND_TOKENS.color.minimumTextContrast,
        rendererMustUseApprovedTreatment: true,
      },
      factualTextPolicy: 'Use generated strings verbatim for factual text. Visual treatments may vary, but claims, grades, limitations, disclosure, CTA destination, and citations are not creative-edit fields.',
    },
    carousel,
    verticalVideo: {
      format: '1080x1920',
      canvas: CREATIVE_BRAND_TOKENS.canvas.vertical,
      durationSeconds: 30,
      firstTwoSecondHook: title,
      platformSafeAreas: {
        tiktok: platformSafeAreas.tiktok,
        instagramReels: platformSafeAreas.instagramReels,
        youtubeShorts: platformSafeAreas.youtubeShorts,
      },
      scenes,
      captions: {
        maxCharsPerLine: CREATIVE_BRAND_TOKENS.typography.captionMaxCharsPerLine,
        maxLines: CREATIVE_BRAND_TOKENS.typography.captionMaxLines,
        minimumPxAt1080: CREATIVE_BRAND_TOKENS.typography.minimumCaptionPxAt1080,
        position: 'lower-middle-safe-area',
        colorTreatment: 'disclosure',
        mustFitPlatformSafeArea: true,
        cues: captionTrack.cues,
        srt: captionTrack.srt,
      },
      accessibility: {
        captionsRequired: true,
        noAutoGeneratedCaptionsAsSoleDelivery: true,
        minimumContrastRatio: CREATIVE_BRAND_TOKENS.color.minimumTextContrast,
        transcript: scenes.map((scene) => scene.voiceover).join(' '),
      },
      bRollPolicy: 'Generative imagery/video may illustrate mood or context only. It must not add factual text, numbers, charts, labels, or implied clinical outcomes.',
    },
    thumbnailVariants: [
      { id: 'evidence-snapshot', text: title, badge: `Grade ${clean(input.evidenceGrade)}`, landingUrl: source, colorTreatment: 'primaryDark' },
      { id: 'caveat-led', text: truncate(`The evidence — and the catch: ${input.title}`, CREATIVE_BRAND_TOKENS.typography.hookMaxChars), badge: 'Evidence + limitation', landingUrl: source, colorTreatment: 'primaryLight' },
    ],
    experimentContract: {
      mutableFields: ['background-treatment', 'b-roll', 'transition-style', 'hook-layout', 'thumbnail-layout'],
      immutableFields: ['factual-text', 'evidence-grade', 'limitation', 'source-url', 'disclosure', 'cta-destination', 'caption-meaning', 'minimum-contrast-threshold', 'platform-safe-area'],
      primaryMetric: 'qualified-social-to-site-clickthrough',
      guardrailMetrics: ['source-card-legibility', 'caption-completion', 'disclosure-visibility', 'creative-safe-area-pass-rate', 'creative-contrast-pass-rate'],
      attributionRisk: 'Platform distribution and audience mix can dominate creative-level differences; compare variants within the same platform and similar publication windows.',
    },
    guardrails: {
      deterministicFactualText: true,
      deterministicAccessibleColorSystem: true,
      deterministicPlatformSafeAreas: true,
      generativeMediaIsNeverFactualAuthority: true,
      citationsOnFindingEvidenceLimitationAndSourceCards: true,
      noUnsupportedRankingLanguage: true,
      noHiddenDisclosure: true,
      noDeceptiveUrgency: true,
      captionMeaningMustMatchVoiceover: true,
      socialClickDestinationMustMatchCanonicalSource: true,
      allTextTreatmentsMeetWcagAaContrast: true,
      factualUiMustStayInsidePlatformSafeArea: true,
    },
  }
}
