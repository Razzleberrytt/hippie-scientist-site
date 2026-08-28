const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')
const MANIPULATIVE_URGENCY = /\b(act now|buy now|limited time|last chance|don't miss|dont miss|hurry|urgent|before it's gone|before its gone|must click|click now)\b/i

function canonical(value) {
  try {
    const url = new URL(String(value ?? ''))
    return `${url.origin}${url.pathname}`
  } catch {
    return ''
  }
}

export function buildCtaContract({ ctaText, landingUrl, sourceUrl, platformSafeArea }) {
  const text = clean(ctaText)
  const landing = clean(landingUrl)
  const source = clean(sourceUrl)
  const errors = []

  if (!text) errors.push('CTA text is required')
  if (text.length > 36) errors.push('CTA text must remain at or below 36 characters')
  if (MANIPULATIVE_URGENCY.test(text)) errors.push('CTA may not use manipulative urgency language')
  if (!landing || !source) errors.push('CTA requires landing and source URLs')
  if (landing !== source || canonical(landing) !== canonical(source)) errors.push('CTA landing URL must exactly match the canonical evidence source URL')
  if (!platformSafeArea) errors.push('CTA requires an explicit platform safe area')
  if (errors.length) throw new Error(`Invalid CTA presentation contract: ${errors.join('; ')}`)

  return Object.freeze({
    version: 1,
    text,
    destination: {
      landingUrl: landing,
      canonicalSourceUrl: source,
      exactMatchRequired: true,
      redirectOrDestinationSubstitutionAllowed: false,
    },
    timing: {
      startSeconds: 27,
      endSeconds: 30,
      minimumVisibleSeconds: 3,
      openingHookCompetitionAllowed: false,
    },
    typography: {
      minimumPxAt1080: 44,
      maximumCharacters: 36,
      highContrastRequired: true,
    },
    placement: {
      safeAreaRequired: true,
      platformSafeArea,
      sourceMayNotBeCovered: true,
      disclosureMayNotBeCovered: true,
    },
    trust: {
      manipulativeUrgencyForbidden: true,
      deceptiveScarcityForbidden: true,
      unsupportedBenefitPromiseForbidden: true,
      disclosureMustRemainVisible: true,
      sourceTrailMustRemainAvailable: true,
    },
    experimentation: {
      layoutMayVary: true,
      emphasisMayVary: true,
      transitionMayVary: true,
      textMayVary: false,
      destinationMayVary: false,
      disclosureVisibilityMayVary: false,
      sourceVisibilityMayVary: false,
    },
  })
}

export function validateCtaContract(contract) {
  const errors = []
  if (!contract || contract.version !== 1) errors.push('CTA contract v1 is required')
  if (!contract?.text) errors.push('CTA text is required')
  if ((contract?.text?.length ?? 0) > 36) errors.push('CTA text exceeds 36 characters')
  if (MANIPULATIVE_URGENCY.test(contract?.text ?? '')) errors.push('CTA contains manipulative urgency language')
  if (!contract?.destination?.landingUrl || contract.destination.landingUrl !== contract?.destination?.canonicalSourceUrl) {
    errors.push('CTA destination must equal canonical source URL')
  }
  if (contract?.destination?.exactMatchRequired !== true || contract?.destination?.redirectOrDestinationSubstitutionAllowed !== false) {
    errors.push('CTA destination integrity must remain fail-closed')
  }
  if (contract?.timing?.startSeconds !== 27 || contract?.timing?.endSeconds !== 30 || (contract?.timing?.minimumVisibleSeconds ?? 0) < 3) {
    errors.push('CTA must occupy the final three seconds')
  }
  if ((contract?.typography?.minimumPxAt1080 ?? 0) < 44) errors.push('CTA must be at least 44px at 1080-wide output')
  if (contract?.placement?.safeAreaRequired !== true) errors.push('CTA must stay inside platform safe area')
  if (contract?.placement?.sourceMayNotBeCovered !== true || contract?.placement?.disclosureMayNotBeCovered !== true) {
    errors.push('CTA may not cover source or disclosure presentation')
  }
  if (contract?.trust?.manipulativeUrgencyForbidden !== true || contract?.trust?.deceptiveScarcityForbidden !== true) {
    errors.push('CTA trust guardrails must remain enabled')
  }
  return errors
}
