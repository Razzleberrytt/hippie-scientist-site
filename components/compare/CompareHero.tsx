import Link from 'next/link'
import type { CompareItem } from '@/lib/compare'

interface CompareHeroProps {
  item1: CompareItem
  item2: CompareItem
}

export default function CompareHero({ item1, item2 }: CompareHeroProps) {
  // Safe default verdict for ashwagandha vs rhodiola
  const isAshwagandhaRhodiola =
    (item1.slug === 'ashwagandha' && item2.slug === 'rhodiola') ||
    (item1.slug === 'rhodiola' && item2.slug === 'ashwagandha')

  const verdict = isAshwagandhaRhodiola
    ? 'Quick verdict: ashwagandha is usually the calmer fit for stress and relaxation, while rhodiola is usually the more energizing fit for stress resilience, fatigue, and focus.'
    : `Quick verdict: compare ${item1.name} and ${item2.name} using the available profile data.`

  return (
    <section className="space-y-8 max-w-5xl">
      <div className="space-y-4 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Educational comparison</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-ink font-display">
          {item1.name} vs {item2.name}
        </h1>
        <p className="text-lg leading-relaxed text-muted">
          Compare source-backed evidence level, main use cases, mechanisms, dosing fields, and safety cautions.
        </p>
      </div>

      {/* Quick Verdict Banner */}
      <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5 shadow-sm">
        <p className="text-sm font-semibold text-brand-900 leading-relaxed">
          {verdict}
        </p>
        <p className="mt-2 text-xs text-muted">Individual responses vary; this is educational decision support, not medical advice.</p>
      </div>

      {/* Side-by-Side Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {[item1, item2].map((item) => (
          <div key={item.slug} className="card-premium p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="chip-readable text-xs">
                  {item.type === 'herb' ? 'Herb' : 'Compound'}
                </span>
                {item.evidenceLevel && (
                  <span className="text-xs uppercase font-bold tracking-wider text-brand-700">
                    {item.evidenceLevel}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-ink">
                  {item.name}
                </h2>
                {item.scientificName && (
                  <p className="text-xs italic text-brand-600 font-medium mt-0.5">
                    {item.scientificName}
                  </p>
                )}
              </div>
              <p className="text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            </div>
            <div className="pt-2">
              <Link href={item.pageUrl} className="chip-readable hover:bg-brand-900 hover:text-white transition-colors duration-200 py-1.5 px-3">
                Explore {item.name} profile
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
