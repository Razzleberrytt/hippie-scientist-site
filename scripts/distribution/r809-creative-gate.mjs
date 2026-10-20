import { validate7OhRegulatoryStatus } from './r8-7oh-regulatory-freshness.mjs'
import crypto from 'node:crypto'
import { assertR808CreativeBrief, buildR808CreativeReceipt } from './r808-creative-gate.mjs'
import { R809_VISUAL_STAGES } from './r809-visual-actors.mjs'

const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')
const digest = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const CANONICAL_STYLE = '2p5d-science-explainer-v1'

// R8.09 cannot independently paraphrase evidence-authorized findings.
// It verifies a *proposed* public-language script already approved upstream.
export function validateR809CreativeBrief(brief) {
  const errors = []
  try { assertR808CreativeBrief(brief) } catch (error) { errors.push(String(error.message || error)) }
  const layer = brief?.r809
  if (!layer || typeof layer !== 'object' || Array.isArray(layer)) {
    return [...new Set([...errors, 'R8.09 requires r809 public-explainer overlay'])]
  }
  if (layer.targetAudience !== 'general-public' || layer.assumedPriorKnowledge !== 'none') {
    errors.push('R8.09 must be understandable without prior scientific knowledge')
  }
  if (layer.languagePolicy !== 'plain-english-first') errors.push('R8.09 requires plain-English-first scripting')
  if (layer.claimAuthority !== 'EvidenceBridge') errors.push('R8.09 may not independently rewrite governed evidence')
  if (layer.narrationCaptionSource !== 'exact-governed-voice-script'
      || layer.burnInNarrationCaptions !== true
      || layer.captionSync !== 'voice-derived-phrase-cues'
      || layer.captionMaxWords !== 7
      || layer.captionMaxLines !== 2) {
    errors.push('R8.09 requires short burned-in narration captions from the exact governed voice script')
  }
  if (layer.canonicalStyle !== CANONICAL_STYLE || layer.noPremiumCredits !== true
      || layer.animationMustTeach !== true || layer.platformSafeArea !== 'platform-intersection'
      || layer.decorativeProgressHudAllowed !== false) {
    errors.push('R8.09 requires the local animated 2.5D teaching style without decorative HUD')
  }
  if (layer.publicClarityReview !== 'required' || layer.exactMasterCaptionReview !== 'required') {
    errors.push('R8.09 requires exact-master caption legibility and beginner-comprehension review')
  }

  const beats = Array.isArray(brief?.beats) ? brief.beats : []
  const stages = new Set(R809_VISUAL_STAGES)
  for (const beat of beats.filter((b) => clean(b.narration))) {
    if (!stages.has(clean(beat?.r809?.visualScene))) {
      errors.push(`R8.09 beat ${clean(beat.id)} must select a real cartoon teaching scene: ${R809_VISUAL_STAGES.join(', ')}`)
    }
    if (clean(beat?.r809?.visualReason).split(/\s+/).filter(Boolean).length < 6) {
      errors.push(`R8.09 beat ${clean(beat.id)} must explain how the illustration teaches its narrated meaning`)
    }
  }
  const terms = Array.isArray(layer.technicalTerms) ? layer.technicalTerms : []
  // High-frequency scientific jargon must be recognized, not merely declared
  // "reviewed" with an empty glossary. This list is intentionally bounded:
  // a human editor must still catch other field-specific language.
  const frequentlyUnexplained = ['receptor', 'alkaloid', 'agonist', 'antagonist',
    'metabolite', 'bioavailability', 'randomized', 'placebo', 'assay',
    'clinical trial', 'statistically significant', 'binding affinity']
  const narrationText = (' ' + beats.map((b) => clean(b.narration)).join(' ').toLowerCase().replace(/[^a-z0-9]+/g, ' ') + ' ')
  for (const word of frequentlyUnexplained) {
    if (narrationText.includes(' ' + word + ' ')
        && !terms.some((entry) => clean(entry?.term).toLowerCase() === word)) {
      errors.push(`R8.09 technical term ${word} was spoken without an explanatory glossary entry`)
    }
  }
  const seen = new Set()
  for (const entry of terms) {
    const term = clean(entry?.term)
    if (!term || seen.has(term.toLowerCase())) {
      errors.push('R8.09 glossary terms must be distinct and non-empty')
      continue
    }
    seen.add(term.toLowerCase())
    if (clean(entry.plainMeaning).split(/\s+/).filter(Boolean).length < 3) {
      errors.push(`R8.09 ${term} needs an actual plain-language explanation`)
    }
    const index = beats.findIndex((b) => clean(b.id) === clean(entry.firstUseBeatId))
    const explanationIndex = beats.findIndex((b) => clean(b.id) === clean(entry.explanationBeatId))
    if (index < 0 || explanationIndex < index || explanationIndex > index + 1) {
      errors.push(`R8.09 ${term} must be explained in its first beat or the immediately following beat`)
      continue
    }
    const line = clean(beats[index].narration)
    const explanation = clean(beats[explanationIndex].narration)
    if (!line.toLowerCase().includes(term.toLowerCase())) {
      errors.push(`R8.09 glossary firstUseBeatId does not actually speak ${term}`)
    }
    // The explanation must actually be voiced; decorative glossary text does not count.
    if (!explanation.toLowerCase().includes(clean(entry.plainMeaning).toLowerCase())) {
      errors.push(`R8.09 spoken narration must contain the plain meaning of ${term}`)
    }
  }
  if (layer.glossaryCoverageReviewed !== true) {
    errors.push('R8.09 requires an explicit technical-term coverage review, not invented automatic simplification')
  }
  if (!beats.some((b) => clean(b.narration))) errors.push('R8.09 requires an actual spoken narration script')
  const regulatory=brief?.regulatoryStatus??{}
  errors.push(...validate7OhRegulatoryStatus({
    onScreenText:[regulatory.onScreenText,...beats.map(b=>JSON.stringify(b.r809??{}))].join(' '),
    narrationText:beats.map(b=>clean(b.narration)).join(' '),
    regulatoryClaimPresent:regulatory.claimPresent===true,
    snapshot:regulatory.snapshot,publicationDate:brief?.publicationDate
  }))
  return [...new Set(errors)]
}

export function assertR809CreativeBrief(brief) {
  const errors = validateR809CreativeBrief(brief)
  if (errors.length) throw new Error(`R8.09 public-explainer gate failed:\n- ${errors.join('\n- ')}`)
  return brief
}

export function buildR809CreativeReceipt(brief) {
  assertR809CreativeBrief(brief)
  const inherited = buildR808CreativeReceipt(brief)
  const layer = brief.r809
  return {
    schemaVersion: 'ths-r809-creative-receipt-v1',
    release: 'R8.09',
    runtimeBaseRelease: 'R8.05',
    status: 'approved',
    inheritedR808OverlaySha256: inherited.overlaySha256,
    overlaySha256: digest({
      r809: layer,
      narration: brief.beats.map((b) => ({ id: clean(b.id), role: clean(b.role), text: clean(b.narration), visualScene: clean(b?.r809?.visualScene), visualReason: clean(b?.r809?.visualReason) })),
      inheritedR808OverlaySha256: inherited.overlaySha256,
    }),
    canonicalStyle: CANONICAL_STYLE,
    captionSource: layer.narrationCaptionSource,
    publicClarityCertifiedAt: 'exact-master-qa',
    burnInNarrationCaptions: true,
  }
}
