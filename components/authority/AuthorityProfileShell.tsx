import type { AuthorityProfileModel, AuthoritySignal } from '@/lib/authority-profile'
import {
  buildCommonMistakesSection,
  buildCompareInsights,
  buildHumanEvidenceSummary,
  buildOutcomeSpecificGuidance,
  buildPracticalInterpretation,
  buildRealisticExpectations,
} from '@/lib/authority-content-enrichment'

function toneClass(tone: AuthoritySignal['tone']) {
  if (tone === 'strong') return 'border-emerald-700/20 bg-emerald-50/70 text-emerald-950'
  if (tone === 'moderate') return 'border-amber-700/20 bg-amber-50/70 text-amber-950'
  if (tone === 'caution') return 'border-rose-700/20 bg-rose-50/70 text-rose-950'
  return 'border-brand-900/10 bg-white/75 text-ink'
}

function toneBadge(tone: AuthoritySignal['tone']) {
  if (tone === 'strong') return 'Strong signal'
  if (tone === 'moderate') return 'Moderate signal'
  if (tone === 'caution') return 'Review carefully'
  return 'Context'
}

function AuthoritySignalCard({ signal }: { signal: AuthoritySignal }) {
  return (
    <article className={`rounded-[1.25rem] border p-4 shadow-sm ${toneClass(signal.tone)}`}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="identity-kicker">{toneBadge(signal.tone)}</span>
      </div>
      <h4 className="max-w-none text-base font-semibold tracking-tight">{signal.label}</h4>
      <p className="mt-2 text-sm leading-6 opacity-85">{signal.description}</p>
    </article>
  )
}

function AuthoritySection({ title, eyebrow, signals, dense = false }: { title: string; eyebrow: string; signals: AuthoritySignal[]; dense?: boolean }) {
  if (!signals.length) return null

  return (
    <section className="compact-card section-rhythm-compact">
      <div className="space-y-1">
        <p className="eyebrow-label">{eyebrow}</p>
        <h3 className="max-w-none text-2xl font-semibold tracking-tight text-ink">{title}</h3>
      </div>
      <div className={`grid gap-3 ${dense ? 'md:grid-cols-2' : 'lg:grid-cols-3'}`}>
        {signals.map((signal, index) => (
          <AuthoritySignalCard key={`${signal.label}-${index}`} signal={signal} />
        ))}
      </div>
    </section>
  )
}

function InsightCard({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <article className="rounded-[1.5rem] border border-brand-900/10 bg-white/80 p-5 shadow-sm">
      <p className="eyebrow-label">{eyebrow}</p>
      <h3 className="mt-2 max-w-none text-xl font-semibold tracking-tight text-ink">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#46574d]">{body}</p>
    </article>
  )
}

export default function AuthorityProfileShell({ model, record }: { model: AuthorityProfileModel; record?: any }) {
  const practicalInterpretation = record ? buildPracticalInterpretation(record) : ''
  const realisticExpectations = record ? buildRealisticExpectations(record) : ''
  const compareInsights = record ? buildCompareInsights(record) : null
  const humanEvidence = record ? buildHumanEvidenceSummary(record) : null
  const commonMistakes = record ? buildCommonMistakesSection(record) : []
  const outcomeGuidance = record ? buildOutcomeSpecificGuidance(record) : []

  return (
    <section className="space-y-5">
      <section className="compact-section section-rhythm-balanced">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="eyebrow-label">Authority Profile</p>
            <h2 className="compact-heading">Research-grade decision context.</h2>
            <p className="compact-copy">
              Practical interpretation, evidence context, safety framing, mechanisms, timing, and real-world expectations from the workbook-driven profile data.
            </p>
          </div>
          <div className="rounded-2xl border border-brand-900/10 bg-white/80 px-4 py-3 text-sm font-semibold text-ink shadow-sm">
            {model.readinessLabel.replace(/-/g, ' ')} · {model.readinessScore}
          </div>
        </div>
      </section>

      {record ? (
        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <InsightCard
            eyebrow="Practical interpretation"
            title="What this usually means in practice."
            body={practicalInterpretation}
          />
          <InsightCard
            eyebrow="Realistic expectations"
            title="What results should feel like."
            body={realisticExpectations}
          />
        </section>
      ) : null}

      <AuthoritySection
        eyebrow="Executive Summary"
        title="Fast read before going deeper."
        signals={model.executiveSummary}
        dense
      />

      <section className="grid gap-5 lg:grid-cols-2">
        <AuthoritySection
          eyebrow="Best For"
          title="Where this profile may fit."
          signals={model.bestFor}
          dense
        />
        <AuthoritySection
          eyebrow="Avoid If"
          title="Safety and caution context."
          signals={model.avoidIf}
          dense
        />
      </section>

      {outcomeGuidance.length > 0 ? (
        <section className="compact-card section-rhythm-compact">
          <div className="space-y-1">
            <p className="eyebrow-label">Outcome guidance</p>
            <h3 className="max-w-none text-2xl font-semibold tracking-tight text-ink">How to judge results without hype.</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {outcomeGuidance.slice(0, 4).map((item) => (
              <article key={item.outcome} className="rounded-[1.25rem] border border-brand-900/10 bg-white/75 p-4 shadow-sm">
                <h4 className="max-w-none text-base font-semibold tracking-tight text-ink">{item.outcome}</h4>
                <p className="mt-2 text-sm leading-6 text-[#46574d]">{item.guidance}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <AuthoritySection
        eyebrow="Evidence Hierarchy"
        title="What kind of evidence is visible."
        signals={model.evidenceHierarchy}
        dense
      />

      {humanEvidence ? (
        <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/80 p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="eyebrow-label">Human evidence read</p>
              <h3 className="mt-2 max-w-none text-2xl font-semibold tracking-tight text-ink">{humanEvidence.interpretation}</h3>
              <p className="mt-3 text-sm leading-7 text-[#46574d]">{humanEvidence.summary}</p>
            </div>
            <span className="rounded-2xl border border-brand-900/10 bg-brand-50/60 px-4 py-3 text-sm font-semibold text-ink">
              evidence weight {humanEvidence.evidenceWeight}
            </span>
          </div>
        </section>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-2">
        <AuthoritySection
          eyebrow="Mechanism Context"
          title="How the biology is framed."
          signals={model.mechanisms}
          dense
        />
        <AuthoritySection
          eyebrow="Time To Effect"
          title="What to expect over time."
          signals={model.timeline}
          dense
        />
      </section>

      {compareInsights ? (
        <InsightCard
          eyebrow="Compare context"
          title={compareInsights.headline}
          body={compareInsights.summary}
        />
      ) : null}

      <AuthoritySection
        eyebrow="Stack Compatibility"
        title="How to think about combinations."
        signals={model.stackCompatibility}
        dense
      />

      {commonMistakes.length > 0 ? (
        <section className="compact-card section-rhythm-compact">
          <div className="space-y-1">
            <p className="eyebrow-label">Common mistakes</p>
            <h3 className="max-w-none text-2xl font-semibold tracking-tight text-ink">What people usually get wrong.</h3>
          </div>
          <ul className="grid gap-3 md:grid-cols-2">
            {commonMistakes.map((mistake) => (
              <li key={mistake} className="rounded-[1.25rem] border border-amber-700/20 bg-amber-50/70 p-4 text-sm leading-6 text-amber-950 shadow-sm">
                {mistake}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={`rounded-[1.5rem] border p-5 shadow-sm ${toneClass(model.editorialInterpretation.tone)}`}>
        <p className="eyebrow-label">Editorial Interpretation</p>
        <h3 className="mt-2 max-w-none text-2xl font-semibold tracking-tight">{model.editorialInterpretation.label}</h3>
        <p className="mt-3 text-sm leading-7 opacity-90">{model.editorialInterpretation.description}</p>
      </section>
    </section>
  )
}
