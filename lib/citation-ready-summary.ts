function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function splitSentences(value: string): string[] {
  const normalized = normalizeWhitespace(value)
  if (!normalized) return []

  return (
    normalized.match(/[^.!?]+(?:[.!?]+["'”’)]*|$)/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? []
  )
}

function stripTerminalPunctuation(value: string): string {
  return value.replace(/[.!?]+["'”’)]*$/g, '').trim()
}

/**
 * Keep citation-ready answers within a 2–4 sentence extraction window.
 *
 * - 2–4 sentences: preserve exactly.
 * - 1 sentence: add a neutral instruction to keep evidence limits/safety attached.
 * - >4 sentences: preserve the first three sentences and fold all remaining
 *   context into a semicolon-delimited fourth sentence instead of deleting it.
 */
export function toCitationReadySummary(answer: string): string {
  const sentences = splitSentences(answer)
  if (!sentences.length) return ''
  if (sentences.length === 1) {
    return `${sentences[0]} Interpret this conclusion alongside the evidence limitations and safety context below.`
  }
  if (sentences.length <= 4) return sentences.join(' ')

  const tail = sentences
    .slice(3)
    .map(stripTerminalPunctuation)
    .filter(Boolean)
    .join('; ')

  return `${sentences.slice(0, 3).join(' ')} ${tail}.`
}

export function citationReadySentenceCount(answer: string): number {
  return splitSentences(toCitationReadySummary(answer)).length
}
