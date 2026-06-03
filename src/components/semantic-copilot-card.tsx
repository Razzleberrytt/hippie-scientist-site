import Link from 'next/link'
import PathwayVisualChip from '@/components/pathway-visual-chip'
import {
  explainDecisionContext,
  explainSemanticRecommendation,
  explainTraversalChoice,
} from '@/lib/semantic-recommendation-reasoning'

type SemanticCopilotCardProps = {
  source?: any
  target?: any
  traversal?: {
    title: string
    description: string
    href?: string
    signals?: string[]
    score?: number
  }
  compact?: boolean
}

function confidenceClass(confidence: string) {
  if (confidence === 'high') return 'evidence-pill-strong'
  if (confidence === 'moderate') return 'evidence-pill-moderate'
  return 'chip-readable'
}

export default function SemanticCopilotCard({
  source,
  target,
  traversal,
  compact = false,
}: SemanticCopilotCardProps) {
  const reasoning = traversal
    ? explainTraversalChoice(traversal)
    : source && target
      ? explainSemanticRecommendation(source, target)
      : explainDecisionContext(source || target || {})

  const content = (
    <article className={`compact-card section-rhythm-compact ${compact ? 'p-4' : ''}`}>
      <div className="flex flex-wrap gap-2">
        <span className="identity-kicker">Semantic copilot</span>
        <span className={confidenceClass(reasoning.confidence)}>
          {reasoning.confidence} confidence
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="max-w-none text-lg font-semibold tracking-tight text-ink">
          {reasoning.title}
        </h3>

        <p className="text-sm leading-6 text-[#46574d]">
          {reasoning.explanation}
        </p>
      </div>

      {reasoning.signals.length > 0 ? (
        <div className="flex flex-wrap gap-2 border-t border-brand-900/10 pt-3">
          {reasoning.signals.map((signal) => (
            <PathwayVisualChip key={signal} pathway={signal} />
          ))}
        </div>
      ) : null}
    </article>
  )

  if (traversal?.href) {
    return (
      <Link href={traversal.href}>
        {content}
      </Link>
    )
  }

  return content
}
