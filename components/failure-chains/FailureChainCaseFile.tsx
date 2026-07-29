type Preventability = 'Low' | 'Moderate' | 'High' | 'Very high' | 'Unknown'
type MedicalSeverity = 'Moderate' | 'Severe' | 'Critical' | 'Fatal'
type DocumentationConfidence = 'Low' | 'Moderate' | 'High'

interface FailureChainCaseFileProps {
  caseId: string
  incident: string
  reported: string
  outcome: string
  primaryFailure: string
  preventability: Preventability
  medicalSeverity: MedicalSeverity
  documentationConfidence: DocumentationConfidence
  documentation: string
  steps: string[]
}

const severityClasses: Record<MedicalSeverity, string> = {
  Moderate: 'border-amber-700/20 bg-amber-50 text-amber-900',
  Severe: 'border-orange-700/20 bg-orange-50 text-orange-900',
  Critical: 'border-red-700/20 bg-red-50 text-red-900',
  Fatal: 'border-red-900/25 bg-red-100 text-red-950',
}

const preventabilityClasses: Record<Preventability, string> = {
  Low: 'border-slate-700/20 bg-slate-50 text-slate-800',
  Moderate: 'border-amber-700/20 bg-amber-50 text-amber-900',
  High: 'border-orange-700/20 bg-orange-50 text-orange-900',
  'Very high': 'border-red-700/20 bg-red-50 text-red-900',
  Unknown: 'border-slate-700/20 bg-slate-50 text-slate-800',
}

const confidenceClasses: Record<DocumentationConfidence, string> = {
  Low: 'border-slate-700/20 bg-slate-50 text-slate-800',
  Moderate: 'border-amber-700/20 bg-amber-50 text-amber-900',
  High: 'border-emerald-700/20 bg-emerald-50 text-emerald-900',
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-brand-900/10 bg-[var(--surface-subtle)] p-4">
      <dt className="text-xs font-bold uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-2 text-sm font-semibold leading-6 text-ink">{value}</dd>
    </div>
  )
}

export default function FailureChainCaseFile({
  caseId,
  incident,
  reported,
  outcome,
  primaryFailure,
  preventability,
  medicalSeverity,
  documentationConfidence,
  documentation,
  steps,
}: FailureChainCaseFileProps) {
  const headingId = `failure-chain-${caseId.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

  return (
    <section aria-labelledby={headingId} className="card-premium overflow-hidden p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-brand-700/20 bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-800">
          {caseId}
        </span>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${severityClasses[medicalSeverity]}`}>
          Severity: {medicalSeverity}
        </span>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${preventabilityClasses[preventability]}`}>
          Preventability: {preventability}
        </span>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${confidenceClasses[documentationConfidence]}`}>
          Documentation: {documentationConfidence}
        </span>
      </div>

      <div className="mt-5 max-w-3xl">
        <p className="eyebrow-label">Failure Chains case file</p>
        <h2 id={headingId} className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {incident}
        </h2>
        <p className="mt-2 text-sm font-semibold text-muted">{reported}</p>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <Detail label="Outcome" value={outcome} />
        <Detail label="Primary failure" value={primaryFailure} />
        <Detail label="Source basis" value={documentation} />
        <Detail
          label="Editorial reading"
          value="The chain describes this incident; it is not a frequency estimate for all exposures."
        />
      </dl>

      <div className="mt-7 border-t border-brand-900/10 pt-6">
        <h3 className="text-lg font-bold text-ink">Failure chain</h3>
        <ol className="mt-5 space-y-0" aria-label={`${caseId} failure chain`}>
          {steps.map((step, index) => (
            <li
              key={`${caseId}-${index}-${step}`}
              className="relative border-l-2 border-brand-700/20 pb-5 pl-7 last:border-transparent last:pb-0"
            >
              <span
                aria-hidden="true"
                className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full border border-brand-700/25 bg-white text-xs font-bold text-brand-800"
              >
                {index + 1}
              </span>
              <p className="text-sm font-medium leading-6 text-ink">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
