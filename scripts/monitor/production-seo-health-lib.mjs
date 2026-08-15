export const CANONICAL_ORIGIN = 'https://thehippiescientist.net'

export function evaluateHostNormalization({ inputUrl, result, label, canonicalOrigin = CANONICAL_ORIGIN }) {
  const errors = []

  if (!result?.response) {
    errors.push({ type: 'redirect-overflow', label, chain: result?.chain || [] })
    return errors
  }

  const requested = new URL(inputUrl)
  const final = new URL(result.finalUrl)

  if (final.origin !== canonicalOrigin) {
    errors.push({ type: 'wrong-final-origin', label, finalUrl: result.finalUrl, chain: result.chain })
  }
  if (final.pathname !== requested.pathname) {
    errors.push({
      type: 'host-redirect-path-mismatch',
      label,
      expectedPath: requested.pathname,
      finalPath: final.pathname,
      finalUrl: result.finalUrl,
      chain: result.chain,
    })
  }
  if (result.chain.length > 3) {
    errors.push({ type: 'host-redirect-chain-too-long', label, chain: result.chain })
  }
  if (result.response.status >= 400) {
    errors.push({ type: 'host-normalization-error-status', label, status: result.response.status })
  }

  return errors
}
