import Link from 'next/link'
import PathwayVisualChip from '@/components/pathway-visual-chip'
import SemanticGraphMap from '@/components/semantic-graph-map'
import SemanticVisibilityGate from '@/components/semantic-visibility-gate'
import SemanticCopilotCard from '@/components/semantic-copilot-card'
import { buildAdaptiveTraversal, buildCuriosityLoop } from '@/lib/adaptive-semantic-traversal'
import { buildSemanticGraphVisual } from '@/lib/semantic-graph-visuals'
import { buildConversationalSemanticPrompts } from '@/lib/conversational-semantic-prompts'

type DynamicSemanticDashboardProps = {
  source: any
  candidates?: any[]
  title?: string
  description?: string
}

export default function DynamicSemanticDashboard({
  source,
  candidates = [],
  title = 'Dynamic semantic dashboard',
  description = 'Navigate the live semantic graph through adaptive traversal, explainable recommendations, and ecosystem-aware continuation paths.',
}: DynamicSemanticDashboardProps) {
  const traversal = buildAdaptiveTraversal(source, candidates, 8)
  const curiosity = buildCuriosityLoop(source, candidates)
  const prompts = buildConversationalSemanticPrompts(source, candidates, 5)
  const graph = buildSemanticGraphVisual(source, candidates, 18)

  return (
    <section className="section-rhythm-balanced">
      <section className="compact-section section-rhythm-balanced overflow-hidden">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="eyebrow-label">Live Graph Navigation</p>
              <span className="chip-readable">Semantic dashboard</span>
            </div>

            <h2 className="compact-heading">{title}</h2>
            <p className="compact-copy">{description}</p>

            <div className="flex flex-wrap gap-2 pt-2">
              {['Graph', 'Pathways', 'Evidence', 'Compare', 'Ecosystems'].map((signal) => (
                <PathwayVisualChip key={signal} pathway={signal} />
              ))}
            </div>
          </div>

          <article className="compact-card section-rhythm-compact bg-brand-50/40">
            <p className="eyebrow-label">Strongest semantic thread</p>
            <h3 className="max-w-none text-2xl font-semibold tracking-tight text-ink">
              {curiosity.headline}
            </h3>
            <p className="text-sm leading-7 text-[#46574d]">{curiosity.body}</p>

            {curiosity.primary?.href ? (
              <Link href={curiosity.primary.href} className="button-primary inline-flex rounded-full px-5 py-3 text-sm">
                Follow graph branch →
              </Link>
            ) : null}
          </article>
        </div>
      </section>

      <SemanticVisibilityGate minHeight={440}>
        <SemanticGraphMap
          title="Live semantic graph map"
          description="A visual map of current ecosystem relationships, adaptive traversal candidates, and pathway continuity signals."
          nodes={graph.nodes}
          edges={graph.edges}
        />
      </SemanticVisibilityGate>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="compact-section section-rhythm-compact">
          <div className="space-y-2">
            <p className="eyebrow-label">Graph branches</p>
            <h3 className="compact-heading">Adaptive next steps.</h3>
            <p className="compact-copy">These branches are ranked by semantic overlap, evidence context, mechanism density, and ecosystem continuity.</p>
          </div>

          <div className="grid gap-3">
            {traversal.slice(0, 6).map((item) => (
              <SemanticCopilotCard
                key={`${item.type}-${item.title}`}
                traversal={item}
                compact
              />
            ))}
          </div>
        </article>

        <article className="compact-section section-rhythm-compact">
          <div className="space-y-2">
            <p className="eyebrow-label">Exploration prompts</p>
            <h3 className="compact-heading">Choose your research direction.</h3>
            <p className="compact-copy">Conversational prompts help turn semantic graph structure into clearer next-step decisions.</p>
          </div>

          <div className="grid gap-3">
            {prompts.map((prompt) => {
              const content = (
                <div className="compact-card group section-rhythm-compact h-full">
                  <div className="flex flex-wrap gap-2">
                    <span className="identity-kicker">{prompt.intent}</span>
                  </div>
                  <h4 className="max-w-none text-base font-semibold tracking-tight text-ink group-hover:text-brand-700">
                    {prompt.question}
                  </h4>
                  <p className="text-sm leading-6 text-[#46574d]">{prompt.answerFrame}</p>
                  {prompt.signals.length > 0 ? (
                    <div className="flex flex-wrap gap-2 border-t border-brand-900/10 pt-3">
                      {prompt.signals.slice(0, 3).map((signal) => (
                        <span key={signal} className="chip-readable bg-white/[0.9]">{signal}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              )

              return prompt.href ? (
                <Link key={`${prompt.intent}-${prompt.question}`} href={prompt.href}>{content}</Link>
              ) : (
                <div key={`${prompt.intent}-${prompt.question}`}>{content}</div>
              )
            })}
          </div>
        </article>
      </section>
    </section>
  )
}
