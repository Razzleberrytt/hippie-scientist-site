import type { AuthorityProfileModel, AuthoritySignal } from '@/lib/authority-profile'

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

export default function AuthorityProfileShell({ model }: { model: AuthorityProfileModel }) {
  return (
    <section className="space-y-5">
      <section className="compact-section section-rhythm-balanced">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="eyebrow-label">Authority Profile</p>
            <h2 className="compact-heading">Research-grade decision context.</h2>
            <p className="compact-copy">
              This layer summarizes practical fit, evidence maturity, safety context, mechanisms, timing, and editorial interpretation from the workbook-driven profile data.
            </p>
          </div>
          <div className="rounded-2xl border border-brand-900/10 bg-white/80 px-4 py-3 text-sm font-semibold text-ink shadow-sm">
            {model.readinessLabel.replace(/-/g, ' ')} · {model.readinessScore}
          </div>
        </div>
      </section>

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

      <AuthoritySection
        eyebrow="Evidence Hierarchy"
        title="What kind of evidence is visible."
        signals={model.evidenceHierarchy}
        dense
      />

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

      <AuthoritySection
        eyebrow="Stack Compatibility"
        title="How to think about combinations."
        signals={model.stackCompatibility}
        dense
      />

      <section className={`rounded-[1.5rem] border p-5 shadow-sm ${toneClass(model.editorialInterpretation.tone)}`}>
        <p className="eyebrow-label">Editorial Interpretation</p>
        <h3 className="mt-2 max-w-none text-2xl font-semibold tracking-tight">{model.editorialInterpretation.label}</h3>
        <p className="mt-3 text-sm leading-7 opacity-90">{model.editorialInterpretation.description}</p>
      </section>
    </section>
  )
}
