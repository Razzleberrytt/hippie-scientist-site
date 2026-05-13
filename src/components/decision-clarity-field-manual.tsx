import Link from 'next/link'
import { buildDecisionClarity } from '@/lib/decision-clarity'
import { cleanEditorialText, dedupeEditorialItems, isDuplicateTitleBody, isRenderableText } from '@/lib/editorial-rendering'

type EntityType = 'herb' | 'compound'

type DecisionClarityFieldManualProps = {
  record: any
  entityType: EntityType
  relatedRecords?: any[]
  effects?: string[]
  mechanisms?: string[]
  summary?: string
}

function FieldManualCard({
  label,
  title,
  items,
}: {
  label: string
  title: string
  items: string[]
}) {
  const cleanLabel = cleanEditorialText(label)
  const cleanTitle = cleanEditorialText(title)
  const renderableItems = dedupeEditorialItems(items, 4)

  if (!renderableItems.length || !isRenderableText(cleanTitle)) return null

  return (
    <div className="rounded-3xl border border-brand-900/10 bg-white/75 p-5 shadow-sm">
      <div className="space-y-3">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-900/55">
            {cleanLabel}
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-ink">
            {cleanTitle}
          </h3>
        </div>

        <ul className="space-y-3 text-sm leading-7 text-[#46574d]">
          {renderableItems.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-700/60" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function DecisionClarityFieldManual({
  record,
  entityType,
  relatedRecords = [],
  effects = [],
  mechanisms = [],
  summary = '',
}: DecisionClarityFieldManualProps) {
  const clarity = buildDecisionClarity({
    record,
    entityType,
    relatedRecords,
    effects,
    mechanisms,
    summary,
  })

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <p className="eyebrow-label">Guided Field Manual</p>
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Practical fit, expectations, and next steps
        </h2>
        <p className="detail-reading max-w-3xl text-[#46574d]">
          A plain-language decision layer for matching the profile to a real goal, avoiding overpromises, and choosing the next useful comparison.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FieldManualCard label="Fit Check" title="Best fit for" items={clarity.bestFitFor} />
        <FieldManualCard label="Reality Check" title="Usually not ideal for" items={clarity.usuallyNotIdealFor} />
        <FieldManualCard label="Authority Signal" title="Common misunderstandings" items={clarity.commonMisunderstandings} />
        <FieldManualCard label="Expectation Setting" title="Realistic expectations" items={clarity.realisticExpectations} />
        <FieldManualCard label="Timeline" title="Acute vs cumulative" items={clarity.acuteVsCumulative} />
        <FieldManualCard label="Response Range" title="Responder variability" items={clarity.responderVariability} />
        <FieldManualCard label="Product Fit" title="Formulation variability" items={clarity.formulationVariability} />
        <FieldManualCard label="Starting Point" title="If you're starting here" items={clarity.beginnerStartingPoints} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <FieldManualCard label="Stacking" title="Stack considerations" items={clarity.stackConsiderations} />

        <div className="rounded-3xl border border-brand-900/10 bg-brand-50/50 p-5 shadow-sm">
          <div className="space-y-4">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-900/55">
                Semantic Continuity
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-ink">
                Next best step
              </h3>
            </div>

            <div className="space-y-3">
{clarity.nextBestSteps
                .map((step) => ({
                  ...step,
                  label: cleanEditorialText(step.label),
                  note: cleanEditorialText(step.note),
                }))
                .filter((step) => isRenderableText(step.label))
                .map((step) => (
                step.href ? (
                  <Link
                    key={`${step.label}-${step.href}`}
                    href={step.href}
                    className="block rounded-2xl border border-brand-900/10 bg-white/80 p-4 transition hover:border-brand-700/25 hover:bg-white"
                  >
                    <p className="text-sm font-semibold text-ink">{step.label}</p>
                    {isRenderableText(step.note) && !isDuplicateTitleBody(step.label, step.note) ? (
                      <p className="mt-1 text-sm leading-6 text-[#5b6b61]">{step.note}</p>
                    ) : null}
                  </Link>
                ) : (
                  <div
                    key={step.label}
                    className="rounded-2xl border border-brand-900/10 bg-white/80 p-4"
                  >
                    <p className="text-sm font-semibold text-ink">{step.label}</p>
                    {isRenderableText(step.note) && !isDuplicateTitleBody(step.label, step.note) ? (
                      <p className="mt-1 text-sm leading-6 text-[#5b6b61]">{step.note}</p>
                    ) : null}
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
