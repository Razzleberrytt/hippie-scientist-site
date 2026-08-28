const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')

const UNSUPPORTED_STRENGTH = /\b(cure|cures|cured|proven|guaranteed|guarantees|miracle|best|strongest|works for everyone|definitely works)\b/i

export function buildHookContract({ hookText, platformSafeArea }) {
  const text = clean(hookText)
  const errors = []
  if (!text) errors.push('hook text is required')
  if (text.length > 90) errors.push('hook text must remain at or below 90 characters')
  if (UNSUPPORTED_STRENGTH.test(text)) errors.push('hook text may not imply unsupported certainty or superiority')
  if (!platformSafeArea) errors.push('hook requires an explicit platform safe area')
  if (errors.length) throw new Error(`Invalid first-two-second hook contract: ${errors.join('; ')}`)

  return Object.freeze({
    version: 1,
    text,
    timing: {
      startSeconds: 0,
      endSeconds: 2,
      mustBeginAtZero: true,
      minimumVisibleSeconds: 2,
    },
    typography: {
      minimumPxAt1080: 56,
      maximumLines: 3,
      maximumCharacters: 90,
      highContrastRequired: true,
    },
    placement: {
      safeAreaRequired: true,
      platformSafeArea,
    },
    trust: {
      factualAuthority: 'upstream-governed-copy-only',
      unsupportedCertaintyForbidden: true,
      unsupportedRankingLanguageForbidden: true,
      ctaAllowedDuringHook: false,
      evidenceGradeMayNotBeVisuallyStrengthened: true,
    },
    experimentation: {
      layoutMayVary: true,
      backgroundMayVary: true,
      transitionMayVary: true,
      factualMeaningMayVary: false,
      evidenceGradeMayVary: false,
      limitationMayBeHidden: false,
    },
  })
}

export function validateHookContract(contract) {
  const errors = []
  if (!contract || contract.version !== 1) errors.push('hook contract v1 is required')
  if (!contract?.text) errors.push('hook text is required')
  if ((contract?.text?.length ?? 0) > 90) errors.push('hook text exceeds 90 characters')
  if (UNSUPPORTED_STRENGTH.test(contract?.text ?? '')) errors.push('hook text contains unsupported certainty or ranking language')
  if (contract?.timing?.startSeconds !== 0 || contract?.timing?.endSeconds !== 2) errors.push('hook must occupy exactly the first two seconds')
  if ((contract?.typography?.minimumPxAt1080 ?? 0) < 56) errors.push('hook text must be at least 56px at 1080-wide output')
  if (contract?.placement?.safeAreaRequired !== true) errors.push('hook must stay inside platform safe area')
  if (contract?.trust?.ctaAllowedDuringHook !== false) errors.push('CTA must not compete with the first-two-second hook')
  if (contract?.trust?.unsupportedCertaintyForbidden !== true) errors.push('unsupported certainty must remain forbidden')
  return errors
}
