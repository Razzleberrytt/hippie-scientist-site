import { text, unique } from '@/lib/display-utils'
import { isBuiltComparisonSlug } from '@/lib/comparison-utils'

export type SemanticLinkSuggestion = {
  label: string
  href: string
  reason: string
  type: 'profile' | 'compare' | 'ecosystem' | 'stack'
}

function normalize(value: unknown) {
  return text(value).toLowerCase().trim()
}

function compareSlugFromHref(href: string) {
  return String(href || '').trim().replace(/^\/(?:guides\/)?compare\//, '').replace(/\/$/, '')
}

export function buildSemanticLinkSuggestions(source: Record<string, unknown>, candidates: Record<string, unknown>[] = [], limit = 12): SemanticLinkSuggestion[] {
  const sourceSignals = unique([
    source?.slug,
    source?.name,
    ...(Array.isArray(source?.effects) ? source.effects : []),
    ...(Array.isArray(source?.primary_effects) ? source.primary_effects : []),
    ...(Array.isArray(source?.mechanisms) ? source.mechanisms : []),
    ...(Array.isArray(source?.pathways) ? source.pathways : []),
  ].map(normalize).filter(Boolean))

  return candidates
    .filter((candidate) => candidate?.slug && candidate.slug !== source?.slug)
    .map((candidate) => {
      const candidateSignals = unique([
        candidate?.slug,
        candidate?.name,
        ...(Array.isArray(candidate?.effects) ? candidate.effects : []),
        ...(Array.isArray(candidate?.primary_effects) ? candidate.primary_effects : []),
        ...(Array.isArray(candidate?.mechanisms) ? candidate.mechanisms : []),
        ...(Array.isArray(candidate?.pathways) ? candidate.pathways : []),
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
            ? `/guides/compare/${candidate.slug}`
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
    // Never surface a comparison link unless that comparison page is built;
    // an unbuilt /guides/compare/ slug 404s under static export.
    .filter((item) => item.type !== 'compare' || isBuiltComparisonSlug(compareSlugFromHref(item.href)))
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .slice(0, limit)
    .map(({ score: _score, ...item }) => item)
}
