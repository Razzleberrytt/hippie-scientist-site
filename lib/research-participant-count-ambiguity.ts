import { parseSampleSize } from './evidence-study'
import { canonicalStudyGroups, type ResearchSource } from './research-coverage'
import type { ResearchQualityAnalysis } from './research-quality-analysis'

export type StudyParticipantCountAmbiguity = {
  url: string
  studyId: string
  participantCounts: number[]
  minParticipantCount: number
  maxParticipantCount: number
  spread: number
}

function explicitParticipantCounts(source: ResearchSource): number[] {
  const candidates = [
    source.sampleSize,
    source.sample_size,
    source.n,
    source.participantCount,
    source.participant_count,
    source.participants_n,
  ]
  const participants = source.participants
  if (typeof participants === 'number' || /^\s*n\s*=/.test(String(participants ?? ''))) {
    candidates.push(participants)
  }

  return [...new Set(
    candidates
      .map(parseSampleSize)
      .filter((value): value is number => value !== null),
  )].sort((a, b) => a - b)
}

/**
 * Preserve conflicting explicit participant-count metadata on one canonical
 * publication instead of silently letting source order choose which N wins.
 *
 * This is advisory metadata ambiguity, not proof that either value is wrong:
 * a publication can legitimately report enrolled, randomized, analyzed, or
 * per-protocol populations. Editorial review should reconcile the intended N.
 */
export function analyzeStudyParticipantCountAmbiguities(
  analysis: ResearchQualityAnalysis,
): StudyParticipantCountAmbiguity[] {
  const ambiguities: StudyParticipantCountAmbiguity[] = []

  for (const { url, record } of analysis.profiles) {
    for (const [studyId, group] of canonicalStudyGroups(record)) {
      const participantCounts = [...new Set(group.flatMap(explicitParticipantCounts))].sort((a, b) => a - b)
      if (participantCounts.length < 2) continue
      const minParticipantCount = participantCounts[0]
      const maxParticipantCount = participantCounts.at(-1) ?? minParticipantCount
      ambiguities.push({
        url,
        studyId,
        participantCounts,
        minParticipantCount,
        maxParticipantCount,
        spread: maxParticipantCount - minParticipantCount,
      })
    }
  }

  return ambiguities.sort((a, b) =>
    b.spread - a.spread
    || a.url.localeCompare(b.url)
    || a.studyId.localeCompare(b.studyId),
  )
}
