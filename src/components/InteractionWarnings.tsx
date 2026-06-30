// src/components/InteractionWarnings.tsx
import Link from 'next/link'
import type { InteractionEdge, SlugEntityTypeMap, InteractionSeverity } from '@/types/interactions'

const MECHANISM_LABELS: Record<string, string> = {
  serotonergic: 'Serotonergic activity',
  anticoagulant: 'Bleeding / anticoagulant risk',
  cns_sedation: 'Sedation / CNS depression',
  blood_glucose: 'Blood-sugar lowering',
  blood_pressure: 'Blood-pressure effects',
}

const SEVERITY_ORDER: InteractionSeverity[] = ['severe', 'moderate', 'caution']

const SEVERITY_CONFIG: Record<
  InteractionSeverity,
  { label: string; wrapper: string; heading: string; badge: string }
> = {
  // Reuses the existing "restricted ingredient" red-warning convention.
  severe: {
    label: 'High-Priority Caution',
    wrapper: 'rounded-2xl border border-red-200 bg-red-50 p-5 space-y-3',
    heading: 'text-red-900',
    badge: 'bg-red-100 text-red-800 border border-red-200',
  },
  // Reuses the existing amber Safety & Cautions convention.
  moderate: {
    label: 'Moderate Caution',
    wrapper:
      'rounded-2xl bg-amber-50/70 border border-amber-900/10 border-l-4 border-amber-500/60 p-4 sm:p-5 space-y-3',
    heading: 'text-amber-900',
    badge: 'bg-amber-100 text-amber-800 border border-amber-200',
  },
  caution: {
    label: 'Caution',
    wrapper:
      'rounded-2xl bg-amber-50/70 border border-amber-900/10 border-l-4 border-amber-300/60 p-4 sm:p-5 space-y-3',
    heading: 'text-amber-900',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
}

interface InteractionWarningsProps {
  edges: InteractionEdge[]
  slugTypeMap: SlugEntityTypeMap
}

export function InteractionWarnings({ edges, slugTypeMap }: InteractionWarningsProps) {
  if (!edges || edges.length === 0) return null

  const bySeverity = SEVERITY_ORDER.map(severity => ({
    severity,
    items: edges.filter(e => e.severity === severity),
  })).filter(group => group.items.length > 0)

  if (bySeverity.length === 0) return null

  return (
    <section id="interactions" className="space-y-4 scroll-mt-24">
      <h2 className="text-lg font-bold text-ink">Caution When Combined With</h2>
      <p className="text-sm leading-6 text-muted">
        These pairings share a flagged risk mechanism. This is a mechanistic caution derived
        from contraindication data, not a confirmed clinical interaction — consult a clinician
        before combining.
      </p>

      {bySeverity.map(({ severity, items }) => {
        const config = SEVERITY_CONFIG[severity]
        return (
          <div key={severity} className={config.wrapper}>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${config.heading}`}>
              {config.label} ({items.length})
            </h3>
            <ul className="space-y-3">
              {items.map(edge => {
                const partnerType = slugTypeMap[edge.partner_slug]
                const partnerHref = partnerType
                  ? `/${partnerType === 'compound' ? 'compounds' : 'herbs'}/${edge.partner_slug}`
                  : null

                return (
                  <li key={`${edge.partner_slug}-${edge.risk_mechanism}`} className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {partnerHref ? (
                        <Link
                          href={partnerHref}
                          className="text-sm font-semibold text-ink underline decoration-amber-500/40 underline-offset-2 hover:decoration-amber-500"
                        >
                          {edge.partner_name}
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold text-ink">{edge.partner_name}</span>
                      )}
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.badge}`}
                      >
                        {MECHANISM_LABELS[edge.risk_mechanism] ?? edge.risk_mechanism}
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-muted">{edge.claim_language}</p>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
