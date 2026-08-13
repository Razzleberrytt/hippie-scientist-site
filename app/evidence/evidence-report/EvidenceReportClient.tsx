'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type GradeRow = {
  label: string
  count: number
  pct: number
}

type EvidenceReportClientProps = {
  profileCount: number
  gradedCount: number
  gradeData: GradeRow[]
}

function formatPct(value: number) {
  if (!Number.isFinite(value)) return '0%'
  if (value >= 10) return `${Math.round(value)}%`
  return `${value.toFixed(1)}%`
}

export default function EvidenceReportClient({ profileCount, gradedCount, gradeData }: EvidenceReportClientProps) {
  const [animated, setAnimated] = useState(false)
  const unclassifiedCount = Math.max(0, profileCount - gradedCount)

  useEffect(() => {
    const timer = window.setTimeout(() => setAnimated(true), 200)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <section className="space-y-4">
          <p className="eyebrow-label">Generated from current runtime data</p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Supplement Evidence Report
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-muted">
            This report summarizes the evidence-grade labels attached to the {profileCount} herb and compound reference records that are currently renderable in the site runtime. It is a profile-level distribution, not a count or grading of individual studies.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3" aria-label="Evidence report summary">
          <div className="rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Renderable records</p>
            <p className="mt-2 text-3xl font-bold text-ink">{profileCount}</p>
          </div>
          <div className="rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Explicit grade</p>
            <p className="mt-2 text-3xl font-bold text-ink">{gradedCount}</p>
          </div>
          <div className="rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Unclassified</p>
            <p className="mt-2 text-3xl font-bold text-ink">{unclassifiedCount}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="max-w-3xl">
            <h2 className="text-xl font-semibold text-ink">Evidence-label distribution</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Percentages below are calculated at build time from the current renderable runtime records. They can change when profiles are added, removed, re-reviewed, or reclassified.
            </p>
          </div>

          {gradeData.length > 0 ? (
            <div className="mt-7 space-y-5">
              {gradeData.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-3 text-sm">
                    <div className="flex items-baseline gap-3">
                      <span className="inline-flex min-w-8 justify-center rounded-full bg-brand-50 px-2 py-1 text-xs font-bold text-brand-800">
                        {item.label}
                      </span>
                      <span className="font-semibold text-ink">{item.count} records</span>
                    </div>
                    <span className="text-muted">{formatPct(item.pct)}</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-brand-50" aria-hidden="true">
                    <div
                      className="h-full rounded-full bg-brand-700 transition-all duration-700 ease-out"
                      style={{ width: animated ? `${Math.max(0, Math.min(100, item.pct))}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-xl border border-brand-900/10 bg-brand-50/40 p-4 text-sm text-muted">
              No evidence-grade labels are available in the current runtime data.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-brand-900/10 bg-brand-50/50 p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-ink">How to interpret this report</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <h3 className="font-semibold text-ink">A profile grade is not a study count</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                A record’s evidence grade summarizes editorial confidence for that profile. It does not mean every claim or outcome on the page has the same evidence strength.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-ink">Distribution is not a product recommendation</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                A higher evidence grade does not establish that an ingredient is appropriate, safe, effective for every goal, or equivalent across products and formulations.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-ink">Unclassified does not mean ineffective</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                It means the current runtime record does not expose an explicit evidence-grade label. The underlying page may still contain research context that needs structured review.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-ink">The data is regenerated with the site</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                This page no longer relies on manually maintained percentages, fixed study totals, or hand-picked category winners that can drift away from the current library.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-ink">Go deeper</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            Use the methodology and individual profile citations to understand why a specific grade was assigned. Evidence quality, directness, consistency, precision, safety, formulation, and applicability still need claim-level interpretation.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/info/methodology/" className="rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-900">
              Read methodology
            </Link>
            <Link href="/evidence/evidence-checker/" className="rounded-full border border-brand-900/15 px-5 py-2.5 text-sm font-semibold text-ink hover:border-brand-700/30 hover:bg-brand-50">
              Open evidence lookup
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
