import { list, text, unique } from '@/lib/display-utils'
import { buildSemanticLinkSuggestions } from '@/lib/semantic-internal-linking'

export type ProgrammaticTopicCluster = {
  slug: string
  title: string
  description: string
  intent: 'best-for' | 'compare' | 'pathway' | 'beginner-guide'
  signals: string[]
  links: ReturnType<typeof buildSemanticLinkSuggestions>
}

function slugify(value: unknown) {
  return text(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function title(value: unknown) {
  return text(value)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function recordSignals(record: any) {
  return unique([
    ...list(record?.best_for),
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.mechanisms),
    ...list(record?.pathways),
    ...list(record?.topics),
  ].map(text).filter(Boolean)).slice(0, 12)
}

export function buildProgrammaticTopicClusters(records: any[] = [], limit = 24): ProgrammaticTopicCluster[] {
  const counts = new Map<string, any[]>()

  records.forEach((record) => {
    recordSignals(record).forEach((signal) => {
      const key = slugify(signal)
      if (!key) return
      counts.set(key, [...(counts.get(key) || []), record])
    })
  })

  return Array.from(counts.entries())
    .map(([slug, clusterRecords]) => {
      const label = title(slug)
      const seed = {
        slug,
        name: label,
        effects: [label],
        mechanisms: [label],
        pathways: [label],
      }

      const intent: ProgrammaticTopicCluster['intent'] =
        /sleep|stress|focus|energy|recovery|inflammation|memory|anxiety|calm/i.test(label)
          ? 'best-for'
          : /gaba|dopamine|acetylcholine|mitochond/i.test(label)
            ? 'pathway'
            : clusterRecords.length >= 5
              ? 'beginner-guide'
              : 'compare'

      return {
        slug,
        title:
          intent === 'best-for'
            ? `Best supplements for ${label}`
            : intent === 'pathway'
              ? `${label} pathway guide`
              : intent === 'compare'
                ? `Compare ${label} options`
                : `Beginner guide to ${label}`,
        description: `A programmatic semantic cluster built from ${clusterRecords.length} connected records, organized around ${label} context.`,
        intent,
        signals: unique(clusterRecords.flatMap(recordSignals)).slice(0, 8),
        links: buildSemanticLinkSuggestions(seed, clusterRecords, 8),
        score: clusterRecords.length,
      }
    })
    .filter((cluster) => cluster.score >= 2)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit)
    .map(({ score: _score, ...cluster }) => cluster)
}
