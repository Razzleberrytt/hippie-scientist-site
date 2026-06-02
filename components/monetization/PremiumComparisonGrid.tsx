import Link from 'next/link'

export type ComparisonFactor = {
  label: string
  item1: string
  item2: string
  weight: 'critical' | 'important' | 'contextual'
}

export type ComparisonVerdictProps = {
  item1: {
    name: string
    href: string
    category: string
  }
  item2: {
    name: string
    href: string
    category: string
  }
  factors: ComparisonFactor[]
  verdict: {
    item1Wins: boolean
    reasoning: string
  }
  className?: string
}

export function PremiumComparisonGrid({
  item1,
  item2,
  factors,
  verdict,
  className = '',
}: ComparisonVerdictProps) {
  const criticalFactors = factors.filter((f) => f.weight === 'critical')
  const importantFactors = factors.filter((f) => f.weight === 'important')
  const contextualFactors = factors.filter((f) => f.weight === 'contextual')

  return (
    <section className={`space-y-6 ${className}`}>
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Item 1 Card */}
        <div className="rounded-[1.25rem] border-2 border-emerald-200 bg-white/90 p-6">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{item1.category}</p>
            <h2 className="text-2xl font-semibold text-ink">{item1.name}</h2>
          </div>
          <Link href={item1.href} className="mt-4 inline-block text-sm font-medium text-emerald-700 hover:underline">
            Explore {item1.name} →
          </Link>
        </div>

        {/* Item 2 Card */}
        <div className="rounded-[1.25rem] border-2 border-blue-200 bg-white/90 p-6">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">{item2.category}</p>
            <h2 className="text-2xl font-semibold text-ink">{item2.name}</h2>
          </div>
          <Link href={item2.href} className="mt-4 inline-block text-sm font-medium text-blue-700 hover:underline">
            Explore {item2.name} →
          </Link>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="rounded-[1.25rem] border border-brand-900/10 bg-white/90 p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-900/10">
              <th className="text-left py-3 pr-4 font-semibold text-ink">Factor</th>
              <th className="text-left py-3 pr-4 font-semibold text-ink">{item1.name}</th>
              <th className="text-left py-3 pr-4 font-semibold text-ink">{item2.name}</th>
            </tr>
          </thead>
          <tbody className="text-muted">
            {criticalFactors.length > 0 && (
              <>
                <tr>
                  <td colSpan={3} className="py-2 px-4 font-semibold text-ink text-xs uppercase tracking-[0.08em] bg-brand-900/5">
                    Critical Factors
                  </td>
                </tr>
                {criticalFactors.map((factor, idx) => (
                  <tr key={`critical-${idx}`} className="border-b border-brand-900/5">
                    <td className="py-3 pr-4 font-medium text-ink">{factor.label}</td>
                    <td className="py-3 pr-4">{factor.item1}</td>
                    <td className="py-3 pr-4">{factor.item2}</td>
                  </tr>
                ))}
              </>
            )}

            {importantFactors.length > 0 && (
              <>
                <tr>
                  <td colSpan={3} className="py-2 px-4 font-semibold text-ink text-xs uppercase tracking-[0.08em] bg-brand-900/5">
                    Important Considerations
                  </td>
                </tr>
                {importantFactors.map((factor, idx) => (
                  <tr key={`important-${idx}`} className="border-b border-brand-900/5">
                    <td className="py-3 pr-4 font-medium text-ink">{factor.label}</td>
                    <td className="py-3 pr-4">{factor.item1}</td>
                    <td className="py-3 pr-4">{factor.item2}</td>
                  </tr>
                ))}
              </>
            )}

            {contextualFactors.length > 0 && (
              <>
                <tr>
                  <td colSpan={3} className="py-2 px-4 font-semibold text-ink text-xs uppercase tracking-[0.08em] bg-brand-900/5">
                    Context-Dependent
                  </td>
                </tr>
                {contextualFactors.map((factor, idx) => (
                  <tr key={`contextual-${idx}`} className="border-b border-brand-900/5">
                    <td className="py-3 pr-4 font-medium text-ink">{factor.label}</td>
                    <td className="py-3 pr-4">{factor.item1}</td>
                    <td className="py-3 pr-4">{factor.item2}</td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Verdict */}
      <div className="rounded-[1.25rem] border border-brand-900/10 bg-white/90 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Bottom Line</p>
        <h3 className="mt-2 text-xl font-semibold text-ink">
          {verdict.item1Wins ? `${item1.name} usually fits better` : `${item2.name} usually fits better`}
        </h3>
        <p className="mt-3 text-sm leading-6 text-muted">{verdict.reasoning}</p>
      </div>
    </section>
  )
}
