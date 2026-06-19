import React from 'react'
import Link from 'next/link'
import { scoreRelatedProfile, getOverlap } from '../../lib/semantic-relationships'
import { normalizeEvidence } from '../../lib/evidence-mapping'
import { generatedComparisons } from '@/data/generated-comparisons'
import { supplementComparisons } from '@/data/comparisons'

export interface RelationalUiProps {
  record: any
  relatedRecords: any[]
}

function findComparisonSlug(slugA: string, slugB: string): string | null {
  const possible1 = `${slugA}-vs-${slugB}`
  const possible2 = `${slugB}-vs-${slugA}`

  if (generatedComparisons.includes(possible1 as any)) return possible1
  if (generatedComparisons.includes(possible2 as any)) return possible2

  if (supplementComparisons.some((c) => c.slug === possible1)) return possible1
  if (supplementComparisons.some((c) => c.slug === possible2)) return possible2

  return null
}

export default function RelationalUi({ record, relatedRecords }: RelationalUiProps) {
  if (!record || !relatedRecords || relatedRecords.length === 0) return null

  // Compute and score connections
  const connections = relatedRecords
    .map((candidate) => {
      const relationship = scoreRelatedProfile(record, candidate)
      const evidence = normalizeEvidence(candidate)
      const sharedPathways = getOverlap(record.pathways || [], candidate.pathways || [])
      return {
        candidate,
        relationship,
        evidence,
        sharedPathways,
        score: relationship.score + sharedPathways.length,
      }
    })
    .filter((conn) => conn.score > 0 && conn.candidate.slug !== record.slug)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  if (connections.length === 0) return null

  // Count shared occurrences in the catalog
  const currentPathways = record.pathways || []
  const currentMechanisms = record.canonical_mechanisms || record.mechanisms || []

  return (
    <section className="rounded-3xl border border-brand-900/10 bg-white/70 p-6 shadow-sm backdrop-blur-xl md:p-8">
      <div className="mb-6 space-y-1">
        <p className="eyebrow-label text-brand-700">Relational Intelligence</p>
        <h3 className="text-2xl font-bold tracking-tight text-ink">
          Biological & Pathway Overlap Explorer
        </h3>
        <p className="text-sm text-muted">
          Analyze shared pathways, mechanism directionality, and direct clinical evidence certitude across connected profiles.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Connections List */}
        <div className="space-y-4 lg:col-span-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
            Strongest Connected Profiles
          </h4>
          <div className="space-y-4">
            {connections.map(({ candidate, relationship, evidence, sharedPathways, score }) => {
              const compSlug = findComparisonSlug(record.slug, candidate.slug)
              const typeIcon = candidate.type === 'herb' ? '🌿' : '⚗️'
              const href = candidate.type === 'herb' ? `/herbs/${candidate.slug}` : `/compounds/${candidate.slug}`

              return (
                <div
                  key={candidate.slug}
                  className="rounded-2xl border border-brand-900/10 bg-white p-5 transition hover:border-brand-700/30"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" aria-hidden="true">{typeIcon}</span>
                      <Link href={href} className="text-base font-semibold text-ink hover:text-brand-700 transition">
                        {candidate.name}
                      </Link>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          'rounded px-2 py-0.5 text-[0.68rem] font-bold tracking-wider uppercase',
                          evidence.grade === 'A' || evidence.grade === 'B'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-700/20'
                            : evidence.grade === 'C'
                            ? 'bg-amber-50 text-amber-700 border border-amber-700/20'
                            : 'bg-stone-50 text-stone-700 border border-stone-700/20',
                        ].join(' ')}
                      >
                        Evidence Grade {evidence.grade}
                      </span>
                      <span className="text-xs font-semibold text-muted">
                        Overlap score: {score}
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-muted leading-relaxed">
                    {evidence.label} • {evidence.description}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {sharedPathways.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[0.62rem] font-bold uppercase tracking-wider text-muted block">
                          Shared Pathways
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {sharedPathways.slice(0, 3).map((p) => (
                            <span key={p} className="rounded bg-brand-50 px-1.5 py-0.5 text-[0.65rem] font-semibold text-brand-800">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {relationship.sharedMechanisms.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[0.62rem] font-bold uppercase tracking-wider text-muted block">
                          Shared Mechanisms
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {relationship.sharedMechanisms.slice(0, 3).map((m) => (
                            <span key={m} className="rounded bg-brand-50 px-1.5 py-0.5 text-[0.65rem] font-semibold text-brand-800">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end">
                    {compSlug ? (
                      <Link
                        href={`/compare/${compSlug}`}
                        className="text-xs font-semibold text-brand-700 hover:text-brand-900 transition"
                      >
                        Compare {record.name} vs {candidate.name} →
                      </Link>
                    ) : (
                      <Link
                        href={href}
                        className="text-xs font-semibold text-brand-700 hover:text-brand-900 transition"
                      >
                        Explore {candidate.name} →
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Overlap Summary Column */}
        <div className="space-y-4 rounded-2xl bg-brand-900/5 p-5 border border-brand-900/5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
            Ecosystem Footprint
          </h4>

          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-ink block">Primary Pathways</span>
              {currentPathways.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {currentPathways.map((p: string) => (
                    <span key={p} className="rounded-full bg-white px-2.5 py-0.5 text-[0.68rem] font-medium text-ink shadow-sm border border-brand-900/5">
                      {p}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-muted italic">No pathways listed</span>
              )}
            </div>

            <div className="space-y-2 border-t border-brand-900/10 pt-4">
              <span className="text-xs font-bold text-ink block">Normalized Mechanisms</span>
              {currentMechanisms.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {currentMechanisms.map((m: string) => (
                    <span key={m} className="rounded-full bg-white px-2.5 py-0.5 text-[0.68rem] font-medium text-ink shadow-sm border border-brand-900/5">
                      {m}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-muted italic">No mechanisms listed</span>
              )}
            </div>

            <div className="border-t border-brand-900/10 pt-4 space-y-2">
              <span className="text-xs font-bold text-ink block">Validation Note</span>
              <p className="text-[0.68rem] text-muted leading-relaxed">
                Relational scoring is fully transparent, representing direct token overlap counts for shared mechanisms, pathways, and physiological outcomes. It operates without commercial bias.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
