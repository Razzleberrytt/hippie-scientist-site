import { text, unique } from '@/lib/display-utils'

export type SemanticLinkSuggestion = {
  label: string
  href: string
  reason: string
  type: 'profile' | 'compare' | 'ecosystem' | 'stack'
}

function normalize(value: unknown) {
  return text(value).toLowerCase().trim()
}

export function buildSemanticLinkSuggestions(source: any, candidates: any[] = [], limit = 12): SemanticLinkSuggestion[] {
  const sourceSignals = unique([
    source?.slug,
    source?.name,
    ...(source?.effects || []),
    ...(source?.primary_effects || []),
    ...(source?.mechanisms || []),
    ...(source?.pathways || []),
  ].map(normalize).filter(Boolean))

  return candidates
    .filter((candidate) => candidate?.slug && candidate.slug !== source?.slug)
    .map((candidate) => {
      const candidateSignals = unique([
        candidate?.slug,
        candidate?.name,
        ...(candidate?.effects || []),
        ...(candidate?.primary_effects || []),
        ...(candidate?.mechanisms || []),
        ...(candidate?.pathways || []),
      ].map(normalize).filter(Boolean))

      const overlap = sourceSignals.filter((signal) =>
        candidateSignals.some((candidateSignal) => candidateSignal.includes(signal) || signal.includes(candidateSignal)),
      )

      const type: SemanticLinkSuggestion['type'] =
        candidate?.entityType === 'stack'
          ? 'stack'
          : candidate?.entityType === 'compare'
            ? 'compare'
            : candidate?.entityType === 'ecosystem'
              ? 'ecosystem'
              : 'profile'

      const href =
        type === 'stack'
          ? `/stacks/${candidate.slug}`
          : type === 'compare'
            ? `/compare/${candidate.slug}`
            : type === 'ecosystem'
              ? `/supernodes/${candidate.slug}`
              : candidate?.entityType === 'herb'
                ? `/herbs/${candidate.slug}`
                : `/compounds/${candidate.slug}`

      return {
        label: text(candidate?.displayName || candidate?.name || candidate?.slug),
        href,
        reason: overlap.slice(0, 3).join(', ') || 'Adjacent semantic ecosystem',
        type,
        score: overlap.length,
      }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .slice(0, limit)
    .map(({ score, ...item }) => item)
}
