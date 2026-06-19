import Link from 'next/link'
import PathwayVisualChip from './pathway-visual-chip'
import type { SemanticNavigationSuggestion } from '../lib/ai-semantic-navigation'

type SemanticAssistantPanelProps = {
  headline: string
  body: string
  signals?: string[]
  suggestions: SemanticNavigationSuggestion[]
}

function intentLabel(intent: SemanticNavigationSuggestion['intent']) {
  switch (intent) {
    case 'compare':
      return 'Compare next'
    case 'deepen-mechanism':
      return 'Deepen mechanism'
    case 'find-gentler':
      return 'Gentler pathway'
    case 'find-stronger-evidence':
      return 'Stronger evidence'
    case 'continue-ecosystem':
      return 'Continue ecosystem'
    case 'build-stack':
      return 'Stack context'
    default:
      return 'Explore next'
  }
}

export default function SemanticAssistantPanel({
  headline,
  body,
  signals = [],
  suggestions,
}: SemanticAssistantPanelProps) {
  if (!suggestions?.length) return null

  return (
    <section className="compact-section section-rhythm-balanced overflow-hidden">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="eyebrow-label">Semantic Assistant</p>
          <span className="chip-readable">Guided research navigation</span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          <div className="space-y-3">
            <h2 className="compact-heading">{headline}</h2>
            <p className="compact-copy">{body}</p>

            {signals.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {signals.slice(0, 5).map((signal) => (
                  <PathwayVisualChip key={signal} pathway={signal} />
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-3">
            {suggestions.map((suggestion) => {
              const content = (
                <article className="compact-card group section-rhythm-compact h-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="identity-kicker">{intentLabel(suggestion.intent)}</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="max-w-none text-base font-semibold leading-tight tracking-tight text-ink group-hover:text-brand-700">
                      {suggestion.title}
                    </h3>

                    <p className="text-sm leading-6 text-[#46574d]">
                      {suggestion.description}
                    </p>
                  </div>

                  {suggestion.signals.length > 0 ? (
                    <div className="flex flex-wrap gap-2 border-t border-brand-900/10 pt-3">
                      {suggestion.signals.slice(0, 3).map((signal) => (
                        <span key={signal} className="chip-readable bg-white/[0.9]">
                          {signal}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </article>
              )

              return suggestion.href ? (
                <Link key={`${suggestion.intent}-${suggestion.title}`} href={suggestion.href}>
                  {content}
                </Link>
              ) : (
                <div key={`${suggestion.intent}-${suggestion.title}`}>{content}</div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
