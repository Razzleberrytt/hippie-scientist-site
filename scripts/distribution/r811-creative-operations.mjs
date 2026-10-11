import crypto from 'node:crypto'

const sha = (value) => crypto.createHash('sha256').update(value).digest('hex')
const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')
const hashOk = (value) => /^[a-f0-9]{64}$/i.test(String(value ?? ''))
const idOk = (value) => /^[a-z0-9][a-z0-9_-]{2,79}$/.test(String(value ?? ''))
const isoDay = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
const permitted = new Set(['hook-structure', 'caption-style', 'beat-order', 'teaser-pacing', 'visual-layout'])
const metrics = new Set(['three-second-hold', 'watch-through', 'attributed-follow-conversion', 'views-per-day'])
const forbiddenCosts = new Set(['openai-api', 'elevenlabs', 'paid-tts', 'paid-video-api', 'metered-inference', 'remote-gpu', 'social-posting-service'])
const protectedTerms = ['not', 'no', 'never', 'avoid', 'without', 'do not', 'may', 'might', 'rare', 'unknown', 'limited', 'uncertain', 'animal', 'in vitro']
const normalizedTokens = (value) => ' ' + clean(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ') + ' '
const tokenMatch = (value, token) => normalizedTokens(value).includes(' ' + normalizedTokens(token).trim() + ' ')
const unique = (values) => Array.isArray(values) && new Set(values).size === values.length
function approvalErrors(value, label, narrationHash, overlayHash, sourceHash) {
  const failures = []
  if (!value || value.decision !== 'approved' || value.reviewerRole !== 'editorial-science-reviewer'
      || !clean(value.reviewerId) || !isoDay(value.reviewedAt)) failures.push(label + ' requires dated named scientific/editorial approval')
  if (value?.narrationSha256 !== narrationHash || value?.overlaySha256 !== overlayHash || value?.sourcePacketSha256 !== sourceHash) {
    failures.push(label + ' human review is not bound to the exact narration, overlay and evidence')
  }
  return failures
}
export const R811_OUTPUT_TYPES = Object.freeze(['full-video', 'teaser-work-order', 'hook-variant-a', 'hook-variant-b', 'hook-variant-c', 'cover-preview'])
export function validateR811Plan(plan, { creativeR810 = null } = {}) {
  const errors = []
  if (plan?.schemaVersion !== 'ths-evidencemotion-r811-plan-v1') errors.push('R8.11 requires its explicit versioned schema')
  if (!idOk(plan?.videoId)) errors.push('R8.11 video ID must use a stable safe slug')
  if (!hashOk(plan?.sourcePacketSha256) || !hashOk(plan?.r810GovernedPlanSha256)) errors.push('R8.11 source and inherited R8.10 evidence hashes required')
  if (creativeR810 && (creativeR810.status !== 'approved' || creativeR810.governedPlanSha256 !== plan?.r810GovernedPlanSha256)) {
    errors.push('R8.11 must inherit the exact approved R8.10 science plan')
  }
  if (plan?.productionSystemRelease !== 'R8.11' || plan?.creativeMethodRelease !== 'R8.10') errors.push('R8.11 runs on governed R8.10 video methodology')
  if (plan?.sourceReview?.sourcePacketSha256 !== plan?.sourcePacketSha256 || plan?.sourceReview?.status !== 'approved'
      || !clean(plan?.sourceReview?.reviewerId) || !isoDay(plan?.sourceReview?.reviewedAt)) errors.push('R8.11 source packet requires independent dated source review')
  const experiment = plan?.experiment
  if (!experiment || !idOk(experiment.id) || !permitted.has(experiment.variable) ||
      !metrics.has(experiment.primaryMetric) || !clean(experiment.hypothesis) ||
      !clean(experiment.baseline) || !clean(experiment.expectedDirection)) {
    errors.push('R8.11 exactly one deliberate, falsifiable experiment is mandatory')
  }
  if (experiment?.secondaryExperiments?.length || plan?.experiments?.length) errors.push('R8.11 permits exactly one experiment variable per video')
  const versions = plan?.componentVersions || {}
  for (const name of ['hook', 'beatSkeleton', 'captionStyle', 'actorStyle']) {
    if (!/^[-a-z0-9]+-v[1-9]\d*$/.test(String(versions[name] ?? ''))) errors.push('R8.11 missing versioned component ' + name)
  }
  const hooks = Array.isArray(plan?.hookVariants) ? plan.hookVariants : []
  if (hooks.length !== 3 || !unique(hooks.map(x => x?.id)) ||
      hooks.some((x, i) => x?.id !== ['a', 'b', 'c'][i])) errors.push('R8.11 requires exactly three distinct A/B/C hook candidate IDs')
  const textSeen = new Set()
  for (const variant of hooks) {
    const name = 'R8.11 hook ' + String(variant?.id ?? '?')
    const narration = clean(variant?.narration)
    const screenText = clean(variant?.screenText)
    if (!narration || !screenText || narration.split(' ').length > 12 ||
        screenText.length > 62 || !Number.isFinite(variant?.durationSeconds) ||
        variant.durationSeconds < 2 || variant.durationSeconds > 3) errors.push(name + ' must be clear in the actual first three seconds')
    if (textSeen.has(narration.toLowerCase())) errors.push('R8.11 hook variants must be genuinely distinct')
    textSeen.add(narration.toLowerCase())
    for (const term of protectedTerms) {
      if (tokenMatch(narration, term) && !tokenMatch(screenText, term)) errors.push(name + ' drops spoken qualifier: ' + term)
    }
    if (!Array.isArray(variant?.claimIds) || variant.claimIds.length < 1 ||
        !unique(variant.claimIds) || variant.claimIds.some(x => !clean(x))) errors.push(name + ' must reference exact existing governed claim IDs')
    if (!Array.isArray(variant?.sourceIds) || !variant.sourceIds.length) errors.push(name + ' requires bound source IDs')
    errors.push(...approvalErrors(variant?.reviewReceipt, name, sha(narration), sha(screenText), plan?.sourcePacketSha256))
  }
  if (!hooks.some(x => x?.id === plan?.chosenHookId)) errors.push('R8.11 requires a specifically selected approved hook variant')
  if (!plan?.abTest || plan.abTest.autoPublishAllowed !== false || plan.abTest.autoChooseWinner !== false
      || !['same-platform-same-window', 'noncausal-manual-test'].includes(plan.abTest.comparisonPolicy)
      || !Number.isFinite(plan.abTest.minimumPostSpacingHours) || plan.abTest.minimumPostSpacingHours < 4) {
    errors.push('R8.11 A/B protocol requires manually spaced posts, same-window comparisons and no automatic winner or publishing')
  }
  if (plan?.zeroCost?.mode !== 'offline-no-paid-credits' || plan.zeroCost.accountRequired !== false ||
      plan.zeroCost.meteredCreditsAllowed !== false || plan.zeroCost.hostedGenerationAllowed !== false ||
      plan.zeroCost.autoPublishingAllowed !== false) errors.push('R8.11 zero-credit, no-hosted generation and manual publication policy required')
  for (const dep of plan?.zeroCost?.dependencies || []) {
    if (forbiddenCosts.has(clean(dep?.provider).toLowerCase()) || dep?.billable === true ||
        dep?.networkRequired === true) errors.push('R8.11 forbids paid/hosted/network-required generation dependencies')
  }
  if (plan?.publicationPolicy !== 'every-output-independent-human-QA') errors.push('R8.11 every derivative needs separate QA before release')
  if (plan?.templatePolicy !== 'approval-only-future-videos') errors.push('R8.11 may not change in-flight video templates')
  if (plan?.provenanceCard?.sourcePacketSha256 !== plan?.sourcePacketSha256
      || !clean(plan?.provenanceCard?.canonicalSourceUrl)
      || !isoDay(plan?.provenanceCard?.claimsVerifiedAt)
      || plan?.provenanceCard?.badge !== 'Source-linked, reviewed as of') {
    errors.push('R8.11 visible evidence card must show a real reviewed-as-of date, not a fabricated badge')
  }
  if (plan?.sourceReview?.reviewedAt && plan?.provenanceCard?.claimsVerifiedAt &&
      Date.parse(plan.provenanceCard.claimsVerifiedAt) > Date.parse(plan.sourceReview.reviewedAt)) {
    errors.push('R8.11 cannot display an as-of date later than the actual source review')
  }
  return [...new Set(errors)]
}
export function assertR811Plan(plan, options) {
  const errors = validateR811Plan(plan, options)
  if (errors.length) throw Error('R8.11 governed preflight failed:\n- ' + errors.join('\n- '))
  return plan
}
export function buildR811Receipt(plan, options) {
  assertR811Plan(plan, options)
  return Object.freeze({
    schemaVersion: 'ths-evidencemotion-r811-receipt-v1',
    release: 'R8.11',
    videoId: plan.videoId,
    sourcePacketSha256: plan.sourcePacketSha256,
    inheritedR810PlanSha256: plan.r810GovernedPlanSha256,
    planSha256: sha(JSON.stringify(plan)),
    experimentId: plan.experiment.id,
    experimentVariable: plan.experiment.variable,
    hypothesisSha256: sha(clean(plan.experiment.hypothesis)),
    chosenHookId: plan.chosenHookId,
    chosenHookNarrationSha256: sha(clean(plan.hookVariants.find(v => v.id === plan.chosenHookId).narration)),
    variantIds: plan.hookVariants.map(v => v.id),
    componentVersions: plan.componentVersions,
    zeroCreditsRequired: true,
    publishingPermission: false,
    scienceAuthority: 'inherited-approved-R8.10',
  })
}
export function verifyR811Receipt(plan, receipt, options) {
  const expected = buildR811Receipt(plan, options)
  if (JSON.stringify(expected) !== JSON.stringify(receipt)) throw Error('R8.11 experiment/lineage receipt differs from exact approved plan')
  return expected
}
