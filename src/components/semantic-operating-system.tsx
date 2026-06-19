import Link from 'next/link'
import PathwayVisualChip from '@/components/pathway-visual-chip'
import SemanticSessionContinuity from '@/components/semantic-session-continuity'
import { buildAdaptiveTraversal, buildCuriosityLoop } from '@/lib/adaptive-semantic-traversal'
import { buildConversationalSemanticPrompts } from '@/lib/conversational-semantic-prompts'

type SemanticOperatingSystemProps = {
  source?: any
  candidates?: any[]
  title?: string
  description?: string
}

function fallbackSource() {
  return {
    slug: 'semantic-operating-system',
    name: 'Related Topic Exploration',
    displayName: 'Related Topic Exploration',
    effects: ['discovery', 'evidence', 'pathways', 'ecosystems'],
    mechanisms: ['related topics', 'topic continuity'],
    pathways: ['sleep', 'stress', 'focus', 'energy', 'inflammation'],
  }
}

export default function SemanticOperatingSystem({
  source,
  candidates = [],
  title = 'Related topic explorer',
  description = 'A unified layer for continuing research threads, following adjacent pathways, comparing related profiles, and moving through research ecosystems.',
}: SemanticOperatingSystemProps) {
  const current = source || fallbackSource()
  const traversal = buildAdaptiveTraversal(current, candidates, 6)
  const curiosity = buildCuriosityLoop(current, candidates)
  const prompts = buildConversationalSemanticPrompts(current, candidates, 5)

  return (
    <section className="section-rhythm-balanced">
      <section className="compact-section section-rhythm-balanced overflow-hidden">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="eyebrow-label">Related Topics</p>
              <span className="chip-readable">Explore next</span>
            </div>

            <h2 className="compact-heading">{title}</h2>
            <p className="compact-copy">{description}</p>

            <div className="flex flex-wrap gap-2 pt-2">
              {['Continue', 'Compare', 'Deepen', 'Bridge', 'Resume'].map((signal) => (
                <PathwayVisualChip key={signal} pathway={signal} />
              ))}
            </div>
          </div>

          <article className="compact-card section-rhythm-compact bg-brand-50/40">
            <p className="eyebrow-label">Current topic thread</p>
            <h3 className="max-w-none text-2xl font-semibold tracking-tight text-ink">
              {curiosity.headline}
            </h3>
            <p className="text-sm leading-7 text-[#46574d]">{curiosity.body}</p>

            {curiosity.primary?.href ? (
              <Link href={curiosity.primary.href} className="button-primary inline-flex rounded-full px-5 py-3 text-sm">
                Follow strongest branch →
              </Link>
            ) : null}
          </article>
        </div>
      </section>

      <SemanticSessionContinuity />

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="compact-section section-rhythm-compact">
          <div className="space-y-2">
            <p className="eyebrow-label">Related branches</p>
            <h3 className="compact-heading">Recommended next branches.</h3>
          </div>

          <div className="grid gap-3">
            {traversal.slice(0, 5).map((item) => {
              const content = (
                <div className="compact-card group section-rhythm-compact h-full">
                  <div className="flex flex-wrap gap-2">
                    <span className="chip-readable">{item.type}</span>
                    <span className="identity-kicker">score {item.score}</span>
                  </div>
                  <h4 className="max-w-none text-base font-semibold tracking-tight text-ink group-hover:text-brand-700">
                    {item.title}
                  </h4>
                  <p className="text-sm leading-6 text-[#46574d]">{item.description}</p>
                  {item.signals.length > 0 ? (
                    <div className="flex flex-wrap gap-2 border-t border-brand-900/10 pt-3">
                      {item.signals.slice(0, 3).map((signal) => (
                        <span key={signal} className="chip-readable bg-white/[0.9]">{signal}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              )

              return item.href ? (
                <Link key={`${item.type}-${item.title}`} href={item.href}>{content}</Link>
              ) : (
                <div key={`${item.type}-${item.title}`}>{content}</div>
              )
            })}
          </div>
        </article>

        <article className="compact-section section-rhythm-compact">
          <div className="space-y-2">
            <p className="eyebrow-label">Conversational prompts</p>
            <h3 className="compact-heading">Ask better next questions.</h3>
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
