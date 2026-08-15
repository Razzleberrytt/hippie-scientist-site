import Link from 'next/link'
import { ChevronDown, Leaf, ShieldAlert } from 'lucide-react'
import type { InteractionEdge, SlugEntityTypeMap, InteractionSeverity } from '@/src/types/interactions'
import type { SafetyCertainty } from '@/src/lib/safety-governance'
import { canonicalProfileHref } from '@/lib/canonical-profile-href'

const MECHANISM_LABELS: Record<string, string> = {
  serotonergic: 'Serotonergic activity',
  anticoagulant: 'Bleeding / anticoagulant risk',
  cns_sedation: 'Sedation / CNS depression',
  blood_glucose: 'Blood-sugar lowering',
  blood_pressure: 'Blood-pressure effects',
}

const SEVERITY_ORDER: InteractionSeverity[] = ['severe', 'moderate', 'caution']
const MAX_VISIBLE_PARTNERS_PER_MECHANISM = 12

const SEVERITY_CONFIG: Record<InteractionSeverity, { label: string; accent: string; badge: string }> = {
  severe: {
    label: 'High-Priority Caution',
    accent: 'text-red-800 dark:text-red-200',
    badge: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-200',
  },
  moderate: {
    label: 'Moderate Caution',
    accent: 'text-[#8a5a1f] dark:text-amber-200',
    badge: 'border-[#dec69b] bg-[#f8f0df] text-[#8a5a1f] dark:border-amber-700/40 dark:bg-amber-950/25 dark:text-amber-200',
  },
  caution: {
    label: 'Caution',
    accent: 'text-[#6f653d] dark:text-amber-100',
    badge: 'border-[#dfe9dc] bg-[#f1f5ed] text-[#315f50] dark:border-[var(--border-soft)] dark:bg-[var(--surface-subtle)] dark:text-[var(--text-primary)]',
  },
}

const CERTAINTY_LABELS: Record<SafetyCertainty, string> = {
  known: 'Known',
  probable: 'Probable',
  theoretical: 'Theoretical',
  unknown: 'Unknown',
}

interface InteractionWarningsProps {
  edges: InteractionEdge[]
  slugTypeMap: SlugEntityTypeMap
}

function edgeCertainty(edge: InteractionEdge): SafetyCertainty {
  // Legacy generated files predate the explicit field. Their pairings were
  // mechanism-derived, so theoretical is the truthful backward-compatible default.
  return edge.certainty || 'theoretical'
}

export function InteractionWarnings({ edges, slugTypeMap }: InteractionWarningsProps) {
  if (!edges || edges.length === 0) return null

  const bySeverity = SEVERITY_ORDER.map((severity) => ({
    severity,
    items: edges.filter((edge) => edge.severity === severity),
  })).filter((group) => group.items.length > 0)

  if (bySeverity.length === 0) return null

  return (
    <section id='interactions' className='interaction-section-shell scroll-mt-24 p-5 sm:p-7'>
      <div className='max-w-3xl'>
        <p className='editorial-eyebrow'>Evidence-based safety</p>
        <h2 className='editorial-display mt-2 text-[2rem] sm:text-[2.7rem]'>Caution when combined</h2>
        <p className='mt-3 text-sm leading-7 text-[#526159] dark:text-[var(--text-secondary)] sm:text-base'>
          Severity and certainty are shown separately. A high-priority caution can still be theoretical: these pairings are screened from shared contraindication mechanisms and are not automatically documented clinical interactions. Provenance identifies the source fields that produced each flag; it does not upgrade the certainty of the pairwise claim.
        </p>
      </div>

      <div className='mt-6 space-y-3'>
        {bySeverity.map(({ severity, items }) => {
          const config = SEVERITY_CONFIG[severity]
          const byMechanism = [...new Set(items.map((edge) => edge.risk_mechanism))].map((mechanism) => ({
            mechanism,
            edges: items.filter((edge) => edge.risk_mechanism === mechanism),
          }))

          return (
            <details key={severity} className='interaction-severity-card group'>
              <summary className='flex cursor-pointer items-center gap-3 px-4 py-4 sm:px-5 sm:py-5'>
                <span className='editorial-icon-disc h-11 w-11 shrink-0'>
                  <ShieldAlert className={`h-5 w-5 ${config.accent}`} aria-hidden='true' strokeWidth={1.8} />
                </span>
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-baseline gap-x-2 gap-y-1'>
                    <h3 className={`font-display text-xl font-semibold ${config.accent}`}>{config.label}</h3>
                    <span className='text-xs font-bold text-[#647168] dark:text-[var(--text-muted)]'>{items.length} flagged pairings</span>
                  </div>
                  <p className='mt-1 line-clamp-1 text-xs leading-5 text-[#647168] dark:text-[var(--text-muted)]'>
                    {byMechanism.map((group) => MECHANISM_LABELS[group.mechanism] ?? group.mechanism).join(' · ')}
                  </p>
                </div>
                <ChevronDown className='h-5 w-5 shrink-0 text-[#315f50] transition-transform group-open:rotate-180' aria-hidden='true' />
              </summary>

              <div className='border-t border-[#123c2f]/10 px-4 pb-5 pt-4 sm:px-5'>
                <p className='mb-4 text-xs font-semibold text-[#647168] dark:text-[var(--text-muted)]'>
                  Representative pairings are shown below. Large mechanism groups are intentionally summarized to keep profiles focused and crawl-efficient.
                </p>
                <div className='interaction-chip-scroll space-y-5 pr-1'>
                  {byMechanism.map(({ mechanism, edges: mechanismEdges }) => {
                    const visibleEdges = mechanismEdges.slice(0, MAX_VISIBLE_PARTNERS_PER_MECHANISM)
                    const hiddenCount = mechanismEdges.length - visibleEdges.length
                    const certainties = [...new Set(mechanismEdges.map(edgeCertainty))]
                    const provenanceCount = mechanismEdges.filter((edge) => (edge.provenance?.source_ids?.length || 0) > 0).length

                    return (
                      <div key={mechanism} className='space-y-3'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <span className={`inline-flex rounded-full border px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] ${config.badge}`}>
                            {MECHANISM_LABELS[mechanism] ?? mechanism}
                          </span>
                          {certainties.map((certainty) => (
                            <span
                              key={certainty}
                              className='inline-flex rounded-full border border-brand-900/10 bg-white/80 px-2.5 py-1 text-[0.66rem] font-bold text-[#526159] dark:border-white/10 dark:bg-white/5 dark:text-[var(--text-secondary)]'
                            >
                              Certainty: {CERTAINTY_LABELS[certainty]}
                            </span>
                          ))}
                        </div>
                        <p className='text-[11px] leading-5 text-[#647168] dark:text-[var(--text-muted)]'>
                          Data provenance recorded for {provenanceCount} of {mechanismEdges.length} pairing{mechanismEdges.length === 1 ? '' : 's'} in this mechanism group.
                        </p>
                        <ul className='flex flex-wrap gap-2'>
                          {visibleEdges.map((edge) => {
                            const partnerType = slugTypeMap[edge.partner_slug]
                            const certainty = edgeCertainty(edge)
                            // interaction_edges.json carries raw workbook slugs, so a
                            // partner can be a slug that only exists to be 301'd. Resolve
                            // to the canonical URL rather than linking into a redirect.
                            const partnerHref = partnerType
                              ? canonicalProfileHref(
                                  partnerType === 'compound' ? 'compounds' : 'herbs',
                                  edge.partner_slug,
                                )
                              : null

                            const content = (
                              <>
                                <Leaf className='h-3.5 w-3.5 shrink-0 text-[#315f50]' aria-hidden='true' strokeWidth={1.8} />
                                <span>{edge.partner_name}</span>
                                <span className='sr-only'> — {CERTAINTY_LABELS[certainty]} interaction certainty</span>
                              </>
                            )
                            const title = `${edge.claim_language} Certainty: ${CERTAINTY_LABELS[certainty]}.`

                            return (
                              <li key={`${edge.partner_slug}-${edge.risk_mechanism}`} title={title}>
                                {partnerHref ? (
                                  <Link href={partnerHref} className='interaction-chip inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition'>
                                    {content}
                                  </Link>
                                ) : (
                                  <span className='interaction-chip inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold'>
                                    {content}
                                  </span>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                        {hiddenCount > 0 && (
                          <p className='text-xs leading-5 text-[#647168] dark:text-[var(--text-muted)]'>
                            +{hiddenCount} more pairing{hiddenCount === 1 ? '' : 's'} share this mechanism.{' '}
                            <Link href='/safety-checker' className='font-bold text-[#315f50] underline decoration-[#315f50]/30 underline-offset-2 hover:decoration-[#315f50]'>
                              Use the Safety Checker
                            </Link>{' '}
                            to review a specific combination.
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </details>
          )
        })}
      </div>
    </section>
  )
}
