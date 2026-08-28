import crypto from 'node:crypto'

const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')
const sentence = (value) => {
  const text = clean(value)
  return text && /[.!?]$/.test(text) ? text : text ? `${text}.` : ''
}

function expectedDescription(input) {
  return clean([
    `Evidence snapshot: ${clean(input?.title)}`,
    `Finding: ${sentence(input?.finding)}`,
    `Evidence: ${clean(input?.evidenceType)} · grade ${clean(input?.evidenceGrade)}.`,
    `Limitation: ${sentence(input?.limitation)}`,
    `Source: ${clean(input?.sourceUrl)}`,
  ].join(' '))
}

function splitLosslessly(value, maxChars) {
  const text = clean(value)
  if (!text) return []
  if (!Number.isInteger(maxChars) || maxChars < 80) throw new Error('accessibility description max segment length must be an integer of at least 80 characters')

  const words = text.split(' ')
  const segments = []
  let segment = ''

  for (const word of words) {
    if (word.length > maxChars) throw new Error('accessibility description contains an indivisible token longer than the segment budget')
    const candidate = segment ? `${segment} ${word}` : word
    if (candidate.length <= maxChars) {
      segment = candidate
      continue
    }
    if (segment) segments.push(segment)
    segment = word
  }
  if (segment) segments.push(segment)
  return segments
}

export function buildLosslessAccessibilityDescriptionContract(input, { maxSegmentChars = 300 } = {}) {
  const fullText = expectedDescription(input)
  const segments = splitLosslessly(fullText, maxSegmentChars)
  const reconstructed = clean(segments.join(' '))

  if (reconstructed !== fullText) {
    throw new Error('accessibility description could not be segmented losslessly')
  }

  return {
    version: 1,
    fullText,
    fullTextSha256: crypto.createHash('sha256').update(fullText).digest('hex'),
    segments: segments.map((text, index) => ({
      index: index + 1,
      total: segments.length,
      text,
      characterCount: text.length,
    })),
    segmentBudget: {
      maxChars: maxSegmentChars,
      splitAtWordBoundariesOnly: true,
      truncationAllowed: false,
      ellipsisAllowed: false,
      paraphraseAllowed: false,
    },
    integrity: {
      exactNormalizedMatch: reconstructed === fullText,
      findingRequired: true,
      evidenceGradeRequired: true,
      limitationRequired: true,
      canonicalSourceRequired: true,
    },
    platformPolicy: {
      publishOnlyIfFullDescriptionCanBeRepresentedLosslessly: true,
      rejectPlatformTruncation: true,
      platformSpecificCompressionRequiresSeparatelyGovernedCopy: true,
    },
  }
}

export function validateLosslessAccessibilityDescriptionContract(contract, input) {
  const errors = []
  const expected = expectedDescription(input)
  const segments = Array.isArray(contract?.segments) ? contract.segments : []
  const reconstructed = clean(segments.map((segment) => segment?.text).join(' '))
  const maxChars = contract?.segmentBudget?.maxChars

  if (contract?.version !== 1) errors.push('accessibility description contract version must be 1')
  if (!expected) errors.push('accessibility description expected text is empty')
  if (clean(contract?.fullText) !== expected) errors.push('accessibility description full text must exactly preserve governed content')
  if (reconstructed !== expected) errors.push('accessibility description segments must reconstruct the full governed description exactly')
  if (!/^[a-f0-9]{64}$/.test(String(contract?.fullTextSha256 ?? ''))) errors.push('accessibility description must include a sha256 content identity')
  if (contract?.fullTextSha256 !== crypto.createHash('sha256').update(expected).digest('hex')) errors.push('accessibility description sha256 does not match the governed description')
  if (!Number.isInteger(maxChars) || maxChars < 80) errors.push('accessibility description segment budget must be at least 80 characters')
  if (!segments.length) errors.push('accessibility description must contain at least one segment')
  if (segments.some((segment) => clean(segment?.text).length > maxChars)) errors.push('accessibility description segment exceeds the declared character budget')
  if (segments.some((segment, index) => segment?.index !== index + 1 || segment?.total !== segments.length)) errors.push('accessibility description segment ordering metadata is invalid')
  if (contract?.segmentBudget?.splitAtWordBoundariesOnly !== true) errors.push('accessibility description must split only at word boundaries')
  if (contract?.segmentBudget?.truncationAllowed !== false) errors.push('accessibility description truncation must be forbidden')
  if (contract?.segmentBudget?.ellipsisAllowed !== false) errors.push('accessibility description ellipsis insertion must be forbidden')
  if (contract?.segmentBudget?.paraphraseAllowed !== false) errors.push('accessibility description paraphrase must be forbidden')
  if (contract?.integrity?.exactNormalizedMatch !== true) errors.push('accessibility description must declare exact normalized reconstruction')
  if (contract?.integrity?.findingRequired !== true || contract?.integrity?.limitationRequired !== true) errors.push('accessibility description must preserve finding and limitation')
  if (contract?.integrity?.evidenceGradeRequired !== true || contract?.integrity?.canonicalSourceRequired !== true) errors.push('accessibility description must preserve evidence grade and canonical source')
  if (contract?.platformPolicy?.publishOnlyIfFullDescriptionCanBeRepresentedLosslessly !== true) errors.push('platform delivery must fail closed when accessibility description cannot remain lossless')
  if (contract?.platformPolicy?.rejectPlatformTruncation !== true) errors.push('platform truncation must be rejected')

  return errors
}
