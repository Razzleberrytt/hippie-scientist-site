import { buildCreativeSpec, CREATIVE_BRAND_TOKENS } from './creative-spec.mjs'
import { buildLosslessCreativeCopyPlan } from './creative-copy-pagination.mjs'
import { buildSourceLegibilityContract, validateSourceLegibilityContract } from './creative-source-legibility.mjs'
import { buildHookContract, validateHookContract } from './creative-hook-contract.mjs'
import { buildCtaContract, validateCtaContract } from './creative-cta-contract.mjs'
import { buildLosslessCaptionContract, validateLosslessCaptionContract } from './creative-caption-contract.mjs'
import { buildThumbnailContract, validateThumbnailContract } from './creative-thumbnail-contract.mjs'
import { buildLosslessAccessibilityDescriptionContract, validateLosslessAccessibilityDescriptionContract } from './creative-accessibility-description-contract.mjs'
import { buildCreativeVisualRegressionContract, validateCreativeVisualRegressionContract } from './creative-visual-regression-contract.mjs'
import { buildCreativeHook } from './social-post-copy.mjs'

const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')
const sentence = (value) => {
  const text = clean(value)
  return text && /[.!?]$/.test(text) ? text : text ? `${text}.` : ''
}

function continuationSlides(role, eyebrow, plan, { body = null, colorTreatment }) {
  return plan.pages.map((page) => ({
    role,
    eyebrow: page.continuation ? `${eyebrow} · continued` : eyebrow,
    headline: page.content,
    body: page.index === 1 ? body : null,
    citationRequired: true,
    colorTreatment,
    continuation: {
      index: page.index,
      total: page.total,
      isContinuation: page.continuation,
      continues: page.continues,
      indicatorRequired: page.total > 1,
    },
    factualAuthority: page.factualAuthority,
    rewriteAllowed: false,
    truncationAllowed: false,
  }))
}

export function buildLosslessCreativeSpec(input) {
  const base = buildCreativeSpec(input)
  const creativeHook = buildCreativeHook(input)
  const maxChars = CREATIVE_BRAND_TOKENS.typography.bodyMaxChars
  const copyPlan = buildLosslessCreativeCopyPlan({
    finding: sentence(input.finding),
    limitation: sentence(input.limitation),
  }, { maxChars })

  const evidenceSlide = base.carousel.slides.find((slide) => slide.role === 'finding')
  const baseHookSlide = base.carousel.slides.find((slide) => slide.role === 'hook')
  const hookSlide = baseHookSlide
    ? { ...baseHookSlide, eyebrow: 'Human evidence', headline: creativeHook }
    : null
  const sourceSlide = base.carousel.slides.find((slide) => slide.role === 'source')
  const videoScenes = base.verticalVideo.scenes.map((scene, index) => (
    index === 0
      ? { ...scene, onScreenText: creativeHook, voiceover: creativeHook, factualAuthority: 'creative-framing' }
      : scene
  ))

  const findingSlides = continuationSlides(
    'finding',
    'What the evidence says',
    copyPlan.finding,
    { body: evidenceSlide?.body ?? null, colorTreatment: 'evidence' },
  )
  const limitationSlides = continuationSlides(
    'limitation',
    'What to keep in mind',
    copyPlan.limitation,
    { colorTreatment: 'primaryLight' },
  )

  const sourceLegibility = buildSourceLegibilityContract({
    sourceUrl: base.sourceIdentity.sourceUrl,
    sourceSlide,
    platformSafeArea: base.carousel.accessibility.platformSafeArea,
  })
  const sourceLegibilityErrors = validateSourceLegibilityContract(sourceLegibility)
  if (sourceLegibilityErrors.length) {
    throw new Error(`Invalid source-card legibility contract: ${sourceLegibilityErrors.join('; ')}`)
  }

  const hook = buildHookContract({
    hookText: hookSlide?.headline,
    platformSafeArea: base.verticalVideo.platformSafeAreas,
  })
  const hookErrors = validateHookContract(hook)
  if (hookErrors.length) {
    throw new Error(`Invalid first-two-second hook contract: ${hookErrors.join('; ')}`)
  }

  const cta = buildCtaContract({
    ctaText: base.delivery.cta,
    landingUrl: base.delivery.landingUrl,
    sourceUrl: base.sourceIdentity.sourceUrl,
    platformSafeArea: base.verticalVideo.platformSafeAreas,
  })
  const ctaErrors = validateCtaContract(cta)
  if (ctaErrors.length) {
    throw new Error(`Invalid CTA presentation contract: ${ctaErrors.join('; ')}`)
  }

  const captions = buildLosslessCaptionContract({
    scenes: videoScenes,
    platformSafeAreas: base.verticalVideo.platformSafeAreas,
    maxCharsPerLine: CREATIVE_BRAND_TOKENS.typography.captionMaxCharsPerLine,
    maxLines: CREATIVE_BRAND_TOKENS.typography.captionMaxLines,
    minimumPxAt1080: CREATIVE_BRAND_TOKENS.typography.minimumCaptionPxAt1080,
  })
  const captionErrors = validateLosslessCaptionContract(captions, videoScenes)
  if (captionErrors.length) {
    throw new Error(`Invalid lossless caption contract: ${captionErrors.join('; ')}`)
  }

  const thumbnails = buildThumbnailContract({
    hookText: hook.text,
    platformSafeAreas: base.delivery.platformSafeAreas,
  })
  const thumbnailErrors = validateThumbnailContract(thumbnails, hook.text)
  if (thumbnailErrors.length) {
    throw new Error(`Invalid thumbnail presentation contract: ${thumbnailErrors.join('; ')}`)
  }

  const accessibilityDescription = buildLosslessAccessibilityDescriptionContract(input, {
    maxSegmentChars: CREATIVE_BRAND_TOKENS.typography.altTextMaxChars,
  })
  const accessibilityDescriptionErrors = validateLosslessAccessibilityDescriptionContract(accessibilityDescription, input)
  if (accessibilityDescriptionErrors.length) {
    throw new Error(`Invalid lossless accessibility-description contract: ${accessibilityDescriptionErrors.join('; ')}`)
  }

  const carousel = {
    ...base.carousel,
    slides: [hookSlide, ...findingSlides, ...limitationSlides, sourceSlide].filter(Boolean),
    losslessCopy: copyPlan,
    sourceLegibility,
    cta,
    accessibility: {
      ...base.carousel.accessibility,
      altText: accessibilityDescription.fullText,
      accessibilityDescription,
      truncatedAltTextForbidden: true,
      platformTruncationMustFailClosed: true,
    },
    rendererContract: {
      ...copyPlan.rendererContract,
      everyContinuationSlideRequiresCitation: true,
      everyContinuationSlideMustUseApprovedColorTreatment: true,
      everyContinuationSlideMustStayInsidePlatformSafeArea: true,
      sourceCardMustSatisfyLegibilityContract: true,
      sourceUrlMustRenderExactly: true,
      ctaMustSatisfyTrustContract: true,
      ctaDestinationMustEqualCanonicalEvidenceUrl: true,
      accessibilityDescriptionMustReconstructGovernedContentExactly: true,
      accessibilityDescriptionMayNotTruncateOrParaphrase: true,
    },
  }

  const verticalVideo = {
    ...base.verticalVideo,
    firstTwoSecondHook: creativeHook,
    scenes: videoScenes,
    captions,
    losslessCopy: copyPlan,
    sourceLegibility,
    hook,
    cta,
    thumbnails,
    accessibilityDescription,
    accessibility: {
      ...base.verticalVideo.accessibility,
      transcript: videoScenes.map((scene) => scene.voiceover).join(' '),
      losslessDeterministicCaptionsRequired: true,
      captionVoiceoverReconstructionRequired: true,
      cropResilientThumbnailHeadlineRequired: true,
      deterministicVisualRegressionFingerprintRequired: true,
      losslessAccessibilityDescriptionRequired: true,
    },
    rendererContract: {
      ...copyPlan.rendererContract,
      factualScenesMustBeDerivedFromLosslessCopyPlan: true,
      legacyTruncatedFactualScenesMayNotBePublishedWhenContinuationIsRequired: true,
      dedicatedSourceSceneRequired: true,
      sourceSceneMinimumVisibleSeconds: sourceLegibility.video.minimumVisibleSeconds,
      sourceUrlMustRenderExactly: true,
      firstTwoSecondsMustSatisfyHookContract: true,
      ctaMayNotCompeteWithOpeningHook: true,
      finalThreeSecondsMustSatisfyCtaContract: true,
      ctaDestinationMustEqualCanonicalEvidenceUrl: true,
      ctaMayNotCoverSourceOrDisclosure: true,
      captionsMustSatisfyLosslessContract: true,
      captionsMayNotTruncateOrAddEllipses: true,
      captionCuesMustReconstructSceneVoiceoverExactly: true,
      thumbnailsMustSatisfyTrustContract: true,
      thumbnailVariantsMustPreserveExactHookText: true,
      thumbnailVariantsMayVaryCompositionOnly: true,
      accessibilityDescriptionMustReconstructGovernedContentExactly: true,
      accessibilityDescriptionMayNotTruncateOrParaphrase: true,
      visualRegressionFingerprintMustMatchValidatedPresentationContract: true,
    },
  }

  const delivery = {
    ...base.delivery,
    ctaContract: cta,
    captionContract: captions,
    thumbnailContract: thumbnails,
    accessibilityDescriptionContract: accessibilityDescription,
    factualTextPolicy: 'Finding and limitation copy must be rendered from losslessCopy pages verbatim and in order. Continuation pages/scenes may expand presentation length/count but may never truncate, paraphrase, or drop governed factual text.',
    sourcePresentationPolicy: 'The canonical source URL must remain fully legible, untruncated, inside the platform safe area, and visible on a dedicated video source scene for at least three seconds. A CTA or disclosure may never replace or cover the source.',
    hookPresentationPolicy: 'The opening hook should be curiosity-first and question-led, occupy the first two seconds, remain readable inside the vertical safe area, avoid unsupported certainty or ranking language, and may not compete with a CTA.',
    ctaPresentationPolicy: 'The CTA must use the fixed evidence-first wording, link exactly to the canonical evidence page, remain readable inside the platform safe area during the final three seconds, preserve source/disclosure visibility, and never use urgency or scarcity pressure.',
    captionPresentationPolicy: 'Captions must preserve scene voiceover exactly after whitespace normalization, split only at word boundaries, stay within the two-line readability budget and platform safe areas, and fail closed rather than truncate or add ellipses.',
    thumbnailPresentationPolicy: 'Thumbnail experiments must preserve the exact governed hook text across every stable variant, keep the headline/logo/disclosure crop-safe for 9:16, 4:5, and 1:1 surfaces, use at least 64px headline typography at 1080-wide output, contain no CTA, and vary composition only.',
    accessibilityDescriptionPolicy: 'Accessibility descriptions must preserve the governed finding, evidence grade, limitation, and canonical source losslessly. Platform character limits may be satisfied by deterministic word-boundary segmentation only; truncation, ellipsis insertion, paraphrase, or silent omission must fail closed.',
    visualRegressionPolicy: 'Deterministic layout-critical presentation fields must produce a stable SHA-256 fingerprint. Fingerprint drift requires explicit review; generated imagery or B-roll is never treated as factual authority.',
  }

  const visualRegression = buildCreativeVisualRegressionContract({
    carousel,
    verticalVideo,
    thumbnails,
    delivery,
  })
  const visualRegressionErrors = validateCreativeVisualRegressionContract(visualRegression)
  if (visualRegressionErrors.length) {
    throw new Error(`Invalid creative visual-regression contract: ${visualRegressionErrors.join('; ')}`)
  }

  return {
    ...base,
    version: 13,
    thumbnails,
    accessibilityDescription,
    visualRegression,
    carousel: {
      ...carousel,
      visualRegressionFingerprint: visualRegression.fingerprint,
    },
    verticalVideo: {
      ...verticalVideo,
      visualRegressionFingerprint: visualRegression.fingerprint,
    },
    delivery: {
      ...delivery,
      visualRegressionContract: visualRegression,
    },
    guardrails: {
      ...base.guardrails,
      curiosityFirstHookRequired: true,
      losslessGovernedCopyRequired: true,
      continuationPagesMayNotBeDropped: true,
      governedCopyReconstructionMustMatchExactly: true,
      sourceCardLegibilityRequired: true,
      sourceUrlMayNotBeTruncatedOrRewritten: true,
      dedicatedVideoSourceSceneRequired: true,
      firstTwoSecondHookContractRequired: true,
      unsupportedHookCertaintyForbidden: true,
      trustSafeCtaContractRequired: true,
      ctaDestinationDriftForbidden: true,
      manipulativeCtaUrgencyForbidden: true,
      ctaMayNotObscureDisclosureOrSource: true,
      losslessCaptionContractRequired: true,
      captionTruncationForbidden: true,
      captionVoiceoverReconstructionRequired: true,
      trustSafeThumbnailContractRequired: true,
      thumbnailHookRewriteForbidden: true,
      thumbnailCtaForbidden: true,
      thumbnailCropResilienceRequired: true,
      losslessAccessibilityDescriptionRequired: true,
      accessibilityDescriptionTruncationForbidden: true,
      accessibilityDescriptionParaphraseForbidden: true,
      accessibilityDescriptionMustPreserveLimitationAndSource: true,
      deterministicVisualRegressionFingerprintRequired: true,
      visualRegressionDriftRequiresExplicitReview: true,
      generativeImageryMayNotDefineFactualAuthority: true,
    },
  }
}
