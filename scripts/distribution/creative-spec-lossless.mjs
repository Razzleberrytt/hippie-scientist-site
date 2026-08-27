import { buildCreativeSpec, CREATIVE_BRAND_TOKENS } from './creative-spec.mjs'
import { buildLosslessCreativeCopyPlan } from './creative-copy-pagination.mjs'
import { buildSourceLegibilityContract, validateSourceLegibilityContract } from './creative-source-legibility.mjs'

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

  const carousel = {
    ...base.carousel,
    slides: [hookSlide, ...findingSlides, ...limitationSlides, sourceSlide].filter(Boolean),
    losslessCopy: copyPlan,
    sourceLegibility,
    rendererContract: {
      ...copyPlan.rendererContract,
      everyContinuationSlideRequiresCitation: true,
      everyContinuationSlideMustUseApprovedColorTreatment: true,
      everyContinuationSlideMustStayInsidePlatformSafeArea: true,
      sourceCardMustSatisfyLegibilityContract: true,
      sourceUrlMustRenderExactly: true,
    },
  }

  return {
    ...base,
    version: 6,
    carousel,
    verticalVideo: {
      ...base.verticalVideo,
      losslessCopy: copyPlan,
      sourceLegibility,
      rendererContract: {
        ...copyPlan.rendererContract,
        factualScenesMustBeDerivedFromLosslessCopyPlan: true,
        legacyTruncatedFactualScenesMayNotBePublishedWhenContinuationIsRequired: true,
        dedicatedSourceSceneRequired: true,
        sourceSceneMinimumVisibleSeconds: sourceLegibility.video.minimumVisibleSeconds,
        sourceUrlMustRenderExactly: true,
      },
    },
    delivery: {
      ...base.delivery,
      factualTextPolicy: 'Finding and limitation copy must be rendered from losslessCopy pages verbatim and in order. Continuation pages/scenes may expand presentation length/count but may never truncate, paraphrase, or drop governed factual text.',
      sourcePresentationPolicy: 'The canonical source URL must remain fully legible, untruncated, inside the platform safe area, and visible on a dedicated video source scene for at least three seconds. A CTA or disclosure may never replace or cover the source.',
    },
    guardrails: {
      ...base.guardrails,
      losslessGovernedCopyRequired: true,
      continuationPagesMayNotBeDropped: true,
      governedCopyReconstructionMustMatchExactly: true,
      sourceCardLegibilityRequired: true,
      sourceUrlMayNotBeTruncatedOrRewritten: true,
      dedicatedVideoSourceSceneRequired: true,
    },
  }
}
