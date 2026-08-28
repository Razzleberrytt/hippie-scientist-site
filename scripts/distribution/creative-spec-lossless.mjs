import { buildCreativeSpec, CREATIVE_BRAND_TOKENS } from './creative-spec.mjs'
import { buildLosslessCreativeCopyPlan } from './creative-copy-pagination.mjs'
import { buildSourceLegibilityContract, validateSourceLegibilityContract } from './creative-source-legibility.mjs'
import { buildHookContract, validateHookContract } from './creative-hook-contract.mjs'
import { buildCtaContract, validateCtaContract } from './creative-cta-contract.mjs'
import { buildLosslessCaptionContract, validateLosslessCaptionContract } from './creative-caption-contract.mjs'
import { buildThumbnailContract, validateThumbnailContract } from './creative-thumbnail-contract.mjs'

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
  const maxChars = CREATIVE_BRAND_TOKENS.typography.bodyMaxChars
  const copyPlan = buildLosslessCreativeCopyPlan({
    finding: sentence(input.finding),
    limitation: sentence(input.limitation),
  }, { maxChars })

  const evidenceSlide = base.carousel.slides.find((slide) => slide.role === 'finding')
  const hookSlide = base.carousel.slides.find((slide) => slide.role === 'hook')
  const sourceSlide = base.carousel.slides.find((slide) => slide.role === 'source')

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
    scenes: base.verticalVideo.scenes,
    platformSafeAreas: base.verticalVideo.platformSafeAreas,
    maxCharsPerLine: CREATIVE_BRAND_TOKENS.typography.captionMaxCharsPerLine,
    maxLines: CREATIVE_BRAND_TOKENS.typography.captionMaxLines,
    minimumPxAt1080: CREATIVE_BRAND_TOKENS.typography.minimumCaptionPxAt1080,
  })
  const captionErrors = validateLosslessCaptionContract(captions, base.verticalVideo.scenes)
  if (captionErrors.length) {
    throw new Error(`Invalid lossless caption contract: ${captionErrors.join('; ')}`)
  }

  const thumbnails = buildThumbnailContract({
    hookText: hook.text,
    platformSafeAreas: base.verticalVideo.platformSafeAreas,
  })
  const thumbnailErrors = validateThumbnailContract(thumbnails, hook.text)
  if (thumbnailErrors.length) {
    throw new Error(`Invalid thumbnail presentation contract: ${thumbnailErrors.join('; ')}`)
  }

  const carousel = {
    ...base.carousel,
    slides: [hookSlide, ...findingSlides, ...limitationSlides, sourceSlide].filter(Boolean),
    losslessCopy: copyPlan,
    sourceLegibility,
    cta,
    rendererContract: {
      ...copyPlan.rendererContract,
      everyContinuationSlideRequiresCitation: true,
      everyContinuationSlideMustUseApprovedColorTreatment: true,
      everyContinuationSlideMustStayInsidePlatformSafeArea: true,
      sourceCardMustSatisfyLegibilityContract: true,
      sourceUrlMustRenderExactly: true,
      ctaMustSatisfyTrustContract: true,
      ctaDestinationMustEqualCanonicalEvidenceUrl: true,
    },
  }

  return {
    ...base,
    version: 10,
    thumbnails,
    carousel,
    verticalVideo: {
      ...base.verticalVideo,
      captions,
      losslessCopy: copyPlan,
      sourceLegibility,
      hook,
      cta,
      thumbnails,
      accessibility: {
        ...base.verticalVideo.accessibility,
        losslessDeterministicCaptionsRequired: true,
        captionVoiceoverReconstructionRequired: true,
        cropResilientThumbnailHeadlineRequired: true,
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
      },
    },
    delivery: {
      ...base.delivery,
      ctaContract: cta,
      captionContract: captions,
      thumbnailContract: thumbnails,
      factualTextPolicy: 'Finding and limitation copy must be rendered from losslessCopy pages verbatim and in order. Continuation pages/scenes may expand presentation length/count but may never truncate, paraphrase, or drop governed factual text.',
      sourcePresentationPolicy: 'The canonical source URL must remain fully legible, untruncated, inside the platform safe area, and visible on a dedicated video source scene for at least three seconds. A CTA or disclosure may never replace or cover the source.',
      hookPresentationPolicy: 'The opening hook must occupy the first two seconds, remain readable inside the vertical safe area, avoid unsupported certainty or ranking language, and may not compete with a CTA.',
      ctaPresentationPolicy: 'The CTA must use the fixed evidence-first wording, link exactly to the canonical evidence page, remain readable inside the platform safe area during the final three seconds, preserve source/disclosure visibility, and never use urgency or scarcity pressure.',
      captionPresentationPolicy: 'Captions must preserve scene voiceover exactly after whitespace normalization, split only at word boundaries, stay within the two-line readability budget and platform safe areas, and fail closed rather than truncate or add ellipses.',
      thumbnailPresentationPolicy: 'Thumbnail experiments must preserve the exact governed hook text across every stable variant, keep the headline/logo/disclosure crop-safe for 9:16, 4:5, and 1:1 surfaces, use at least 64px headline typography at 1080-wide output, contain no CTA, and vary composition only.',
    },
    guardrails: {
      ...base.guardrails,
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
    },
  }
}
