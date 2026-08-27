export const CREATIVE_BRAND_TOKENS = Object.freeze({
  canvas: {
    vertical: { width: 1080, height: 1920, safeTop: 220, safeBottom: 320, safeSide: 96 },
    portrait: { width: 1080, height: 1350, safeTop: 120, safeBottom: 160, safeSide: 80 },
    square: { width: 1080, height: 1080, safeTop: 96, safeBottom: 120, safeSide: 80 },
    pinterest: { width: 1000, height: 1500, safeTop: 120, safeBottom: 160, safeSide: 72 },
  },
  typography: {
    hookMaxChars: 72,
    bodyMaxChars: 150,
    captionMaxCharsPerLine: 42,
    captionMaxLines: 2,
    sourceCardMaxChars: 180,
    minimumBodyPxAt1080: 42,
    minimumCaptionPxAt1080: 44,
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

function isCanonicalEvidencePage(value) {
  try {
    const url = new URL(String(value ?? ''))
    return url.origin === SITE_ORIGIN && url.pathname !== '/' && !url.search && !url.hash
  } catch {
    return false
  }
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
  const errors = validateCreativeInput(input)
  if (errors.length) throw new Error(`Invalid creative input: ${errors.join('; ')}`)

  const title = truncate(input.title, CREATIVE_BRAND_TOKENS.typography.hookMaxChars)
  const finding = truncate(sentence(input.finding), CREATIVE_BRAND_TOKENS.typography.bodyMaxChars)
  const limitation = truncate(sentence(input.limitation), CREATIVE_BRAND_TOKENS.typography.bodyMaxChars)
  const evidence = truncate(`Evidence: ${clean(input.evidenceType)} · grade ${clean(input.evidenceGrade)}.`, CREATIVE_BRAND_TOKENS.typography.bodyMaxChars)
  const source = clean(input.sourceUrl)
  const disclosure = CREATIVE_BRAND_TOKENS.treatment.disclosure

  const carousel = {
    format: '1080x1350',
    canvas: CREATIVE_BRAND_TOKENS.canvas.portrait,
    slides: [
      { role: 'hook', eyebrow: 'Evidence snapshot', headline: title, body: null, citationRequired: false },
      { role: 'finding', eyebrow: 'What the evidence says', headline: finding, body: evidence, citationRequired: true },
      { role: 'limitation', eyebrow: 'What to keep in mind', headline: limitation, body: null, citationRequired: true },
      { role: 'source', eyebrow: 'Source trail', headline: CREATIVE_BRAND_TOKENS.treatment.cta, body: truncate(source, CREATIVE_BRAND_TOKENS.typography.sourceCardMaxChars), citationRequired: true },
    ],
    accessibility: {
      minimumBodyPxAt1080: CREATIVE_BRAND_TOKENS.typography.minimumBodyPxAt1080,
      contrastTarget: 'WCAG AA minimum; prefer AAA for body text',
      noTextOverUncontrolledImagery: true,
      preserveSafeArea: true,
    },
  }

  const scenes = [
    { start: 0, end: 2, role: 'hook', onScreenText: title, voiceover: title, factualAuthority: 'canonical-input' },
    { start: 2, end: 9, role: 'finding', onScreenText: finding, voiceover: finding, factualAuthority: 'canonical-input' },
    { start: 9, end: 15, role: 'evidence', onScreenText: evidence, voiceover: evidence, factualAuthority: 'canonical-input' },
    { start: 15, end: 22, role: 'limitation', onScreenText: limitation, voiceover: limitation, factualAuthority: 'canonical-input' },
    { start: 22, end: 27, role: 'context', onScreenText: disclosure, voiceover: 'Context matters, and this is an evidence summary rather than personal medical advice.', factualAuthority: 'fixed-disclosure' },
    { start: 27, end: 30, role: 'cta', onScreenText: CREATIVE_BRAND_TOKENS.treatment.cta, voiceover: 'Read the full evidence and source trail.', factualAuthority: 'fixed-cta' },
  ]

  return {
    version: 1,
    sourceIdentity: { id: clean(input.id), sourceUrl: source },
    brandTokens: CREATIVE_BRAND_TOKENS,
    carousel,
    verticalVideo: {
      format: '1080x1920',
      canvas: CREATIVE_BRAND_TOKENS.canvas.vertical,
      durationSeconds: 30,
      firstTwoSecondHook: title,
      scenes,
      captions: {
        maxCharsPerLine: CREATIVE_BRAND_TOKENS.typography.captionMaxCharsPerLine,
        maxLines: CREATIVE_BRAND_TOKENS.typography.captionMaxLines,
        minimumPxAt1080: CREATIVE_BRAND_TOKENS.typography.minimumCaptionPxAt1080,
        position: 'lower-middle-safe-area',
      },
      bRollPolicy: 'Generative imagery/video may illustrate mood or context only. It must not add factual text, numbers, charts, labels, or implied clinical outcomes.',
    },
    thumbnailVariants: [
      { id: 'evidence-snapshot', text: title, badge: `Grade ${clean(input.evidenceGrade)}` },
      { id: 'caveat-led', text: truncate(`The evidence — and the catch: ${input.title}`, CREATIVE_BRAND_TOKENS.typography.hookMaxChars), badge: 'Evidence + limitation' },
    ],
    guardrails: {
      deterministicFactualText: true,
      generativeMediaIsNeverFactualAuthority: true,
      citationsOnFindingEvidenceLimitationAndSourceCards: true,
      noUnsupportedRankingLanguage: true,
      noHiddenDisclosure: true,
      noDeceptiveUrgency: true,
    },
  }
}
