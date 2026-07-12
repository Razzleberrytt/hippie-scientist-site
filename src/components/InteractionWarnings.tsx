// src/components/InteractionWarnings.tsx
import Link from 'next/link'
import type { InteractionEdge, SlugEntityTypeMap, InteractionSeverity } from '@/src/types/interactions'

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
        Mechanistic cautions from contraindication data, not confirmed clinical interactions — consult a clinician before combining.
      </p>

      {bySeverity.map(({ severity, items }) => {
        const config = SEVERITY_CONFIG[severity]
        // One horizontally scrolling chip rail per mechanism instead of a paragraph
        // per pairing. Only severe groups start expanded.
        const byMechanism = [...new Set(items.map(e => e.risk_mechanism))].map(mechanism => ({
          mechanism,
          edges: items.filter(e => e.risk_mechanism === mechanism),
        }))
        const mechanismSummary = byMechanism
          .map(({ mechanism }) => MECHANISM_LABELS[mechanism] ?? mechanism)
          .join(', ')

        return (
          <details key={severity} className={`group ${config.wrapper}`} {...(severity === 'severe' ? { open: true } : {})}>
            <summary className="flex cursor-pointer items-center justify-between gap-3 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/40 focus-visible:rounded">
              <span className={`text-xs font-bold uppercase tracking-wider ${config.heading}`}>
                {config.label} ({items.length}) <span className="font-semibold normal-case tracking-normal opacity-80">— {mechanismSummary}</span>
              </span>
              <span aria-hidden="true" className={`shrink-0 transition-transform group-open:rotate-180 ${config.heading}`}>v</span>
            </summary>
            <div className="mt-3 space-y-3">
              {byMechanism.map(({ mechanism, edges: mechanismEdges }) => (
                <div key={mechanism} className="space-y-1.5">
                  <span
                    className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.badge}`}
                  >
                    {MECHANISM_LABELS[mechanism] ?? mechanism}
                  </span>
                  <ul className="flex gap-1.5 overflow-x-auto pb-1.5 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
                    {mechanismEdges.map(edge => {
                      const partnerType = slugTypeMap[edge.partner_slug]
                      const partnerHref = partnerType
                        ? `/${partnerType === 'compound' ? 'compounds' : 'herbs'}/${edge.partner_slug}`
                        : null
                      const chipClass =
                        'inline-block shrink-0 whitespace-nowrap rounded-full border border-amber-900/15 bg-white/70 px-2.5 py-1 text-xs font-semibold leading-5 text-ink dark:border-white/15 dark:bg-white/10'

                      return (
                        <li key={`${edge.partner_slug}-${edge.risk_mechanism}`} className="shrink-0" title={edge.claim_language}>
                          {partnerHref ? (
                            <Link href={partnerHref} className={`${chipClass} hover:bg-white dark:hover:bg-white/20`}>
                              {edge.partner_name}
                            </Link>
                          ) : (
                            <span className={chipClass}>{edge.partner_name}</span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        )
      })}
    </section>
  )
}
