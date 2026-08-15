export type IntroBudgetInput = {
  intro?: string | null
  directAnswerPresent: boolean
  directAnswerBeforeLongBody: boolean
  maxIntroWords?: number
  maxIntroSentences?: number
}

export type IntroBudgetResult = {
  passes: boolean
  wordCount: number
  sentenceCount: number
  maxIntroWords: number
  maxIntroSentences: number
  reasons: string[]
}

export const DEFAULT_MAX_INTRO_WORDS = 80
export const DEFAULT_MAX_INTRO_SENTENCES = 3

export function countWords(value: string): number {
  return value.trim() ? value.trim().split(/\s+/).length : 0
}

export function countSentences(value: string): number {
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (!normalized) return 0
  const matches = normalized.match(/[^.!?]+[.!?]+(?:["'”’)]*)|[^.!?]+$/g)
  return matches?.filter((sentence) => sentence.trim()).length ?? 0
}

/**
 * First-screen editorial budget for important informational pages.
 *
 * The setup copy should orient the reader, not delay the answer. Pages can use
 * shorter limits, but exceeding the shared defaults should be an explicit
 * editorial decision rather than gradual template bloat.
 */
export function evaluateIntroBudget(input: IntroBudgetInput): IntroBudgetResult {
  const intro = input.intro?.trim() ?? ''
  const wordCount = countWords(intro)
  const sentenceCount = countSentences(intro)
  const maxIntroWords = input.maxIntroWords ?? DEFAULT_MAX_INTRO_WORDS
  const maxIntroSentences = input.maxIntroSentences ?? DEFAULT_MAX_INTRO_SENTENCES
  const reasons: string[] = []

  if (!input.directAnswerPresent) reasons.push('missing-direct-answer')
  if (!input.directAnswerBeforeLongBody) reasons.push('answer-after-long-body')
  if (wordCount > maxIntroWords) reasons.push('intro-too-long')
  if (sentenceCount > maxIntroSentences) reasons.push('too-many-intro-sentences')

  return {
    passes: reasons.length === 0,
    wordCount,
    sentenceCount,
    maxIntroWords,
    maxIntroSentences,
    reasons,
  }
}
