'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type EvidenceGrade = 'A' | 'B' | 'C' | 'D' | 'Traditional'

const gradeData: { grade: EvidenceGrade; label: string; pct: number; color: string; description: string; examples: string }[] = [
  { grade: 'A', label: 'Strong', pct: 15, color: '#0d6b4e', description: 'Multiple large, independent RCTs with consistent results', examples: 'Creatine, caffeine, melatonin, omega-3s, vitamin D' },
  { grade: 'B', label: 'Moderate', pct: 25, color: '#1a8a6a', description: 'Smaller RCTs or single large trials; needs replication', examples: 'Ashwagandha, berberine, magnesium, St. John\'s Wort' },
  { grade: 'C', label: 'Limited', pct: 30, color: '#c9a82d', description: 'Small trials, mixed results, or primarily mechanistic data', examples: 'Rhodiola, saffron, NAC, lion\'s mane' },
  { grade: 'D', label: 'Preliminary', pct: 20, color: '#d4852a', description: 'Animal studies, cell studies, or single small pilot trials', examples: 'Chaga, turkey tail, most adaptogens' },
  { grade: 'Traditional', label: 'Traditional', pct: 10, color: '#8b7355', description: 'Historical use without modern clinical trials', examples: 'Many Ayurvedic and TCM herbs' },
]

export default function EvidenceReportClient() {
  const [animated, setAnimated] = useState(false)
  const [activeGrade, setActiveGrade] = useState<EvidenceGrade | null>(null)

  useEffect(() => {
    setTimeout(() => setAnimated(true), 200)
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-10">
        {/* Hero */}
        <section className="space-y-4">
          <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Supplement Evidence Report
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted">
            We catalogued 816 peer-reviewed studies across 557 compounds and 200+ herbs.
            Here's what the evidence actually looks like when you grade every study on the same scale.
          </p>
        </section>

        {/* Bar Chart */}
        <section className="rounded-2xl border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 text-xl font-semibold text-ink">Evidence Distribution</h2>
          <div className="space-y-4">
            {gradeData.map((item) => (
              <div
                key={item.grade}
                className="group cursor-pointer"
                onMouseEnter={() => setActiveGrade(item.grade)}
                onMouseLeave={() => setActiveGrade(null)}
                onClick={() => setActiveGrade(activeGrade === item.grade ? null : item.grade)}
                role="button"
                tabIndex={0}
                aria-expanded={activeGrade === item.grade}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveGrade(activeGrade === item.grade ? null : item.grade) }}}
              >
                <div className="mb-2 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-800">
                      {item.grade}
                    </span>
                    <span className="font-semibold text-ink">{item.label}</span>
                    <span className="text-muted">{item.pct}% of studies</span>
                  </div>
                </div>
                <div className="relative h-10 w-full overflow-hidden rounded-lg bg-brand-50">
                  <div
                    className="h-full rounded-lg transition-all duration-1000 ease-out"
                    style={{
                      width: animated ? `${item.pct * 2.5}%` : '0%',
                      backgroundColor: item.color,
                      opacity: activeGrade === item.grade ? 1 : activeGrade ? 0.5 : 0.85,
                    }}
                  />
                </div>
                {activeGrade === item.grade && (
                  <div className="mt-3 rounded-lg border border-brand-900/10 bg-brand-50/50 p-4 text-sm">
                    <p className="font-medium text-ink">{item.description}</p>
                    <p className="mt-1 text-muted">Examples: {item.examples}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Category Breakdown */}
        <section className="rounded-2xl border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 text-xl font-semibold text-ink">Evidence by Category</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-900/10 text-left">
                  <th className="pb-3 pr-4 font-semibold text-ink">Category</th>
                  <th className="pb-3 pr-4 font-semibold text-ink">Strongest Evidence</th>
                  <th className="pb-3 pr-4 font-semibold text-ink">Weakest Evidence</th>
                  <th className="pb-3 font-semibold text-ink">Key Gap</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Adaptogens', 'Ashwagandha (stress)', 'Most adaptogens', 'Only ashwagandha has replicated RCTs'],
                  ['Cognitive', 'Caffeine, creatine', 'Lion\'s Mane, Bacopa', 'Plausible mechanisms, few large trials'],
                  ['Metabolic', 'Berberine (glucose)', 'Most fat burners', 'Berberine is the standout'],
                  ['Sleep', 'Melatonin, magnesium', 'Valerian, passionflower', 'Herbal sleep aids are thin'],
                  ['Mood', 'St. John\'s Wort', 'Saffron, NAC', 'St. John\'s Wort is well-studied; alternatives need data'],
                  ['Immune', 'Vitamin D, zinc', 'Elderberry, echinacea', 'Micronutrients > botanicals'],
                  ['Performance', 'Creatine, caffeine', 'Cordyceps, ashwagandha', 'Sports supplements strongest overall'],
                ].map(([category, strong, weak, gap]) => (
                  <tr key={category} className="border-b border-brand-900/5">
                    <td className="py-3 pr-4 font-medium text-ink">{category}</td>
                    <td className="py-3 pr-4 text-muted">{strong}</td>
                    <td className="py-3 pr-4 text-muted">{weak}</td>
                    <td className="py-3 text-muted">{gap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Key takeaways */}
        <section className="rounded-2xl border border-brand-900/10 bg-brand-50/50 p-6 sm:p-8">
          <h2 className="mb-4 text-xl font-semibold text-ink">What This Means</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { n: '01', title: 'Most supplements are under-studied', body: '60% have limited, preliminary, or traditional-use evidence only. This doesn\'t mean they don\'t work — it means we don\'t know.' },
              { n: '02', title: 'The strong-evidence list is short', body: 'Only ~15% of supplements have strong clinical evidence. Start with those if you want certainty.' },
              { n: '03', title: 'Quality matters as much as evidence', body: 'A supplement with Grade A evidence is useless if the product in the bottle doesn\'t match the product in the study. Verify quality independently.' },
            ].map((item) => (
              <div key={item.n} className="flex gap-3">
                <span className="mt-0.5 shrink-0 font-mono text-sm font-bold text-brand-400">{item.n}</span>
                <div>
                  <h3 className="font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <p className="text-muted">
            This data is updated annually. Full methodology at{' '}
            <Link href="/info/methodology/" className="font-medium text-brand-700 hover:text-brand-800">/info/methodology</Link>.
            Read the full report:{' '}
            <Link href="/state-of-supplement-evidence-2026/" className="font-medium text-brand-700 hover:text-brand-800">
              State of Supplement Evidence 2026
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}
