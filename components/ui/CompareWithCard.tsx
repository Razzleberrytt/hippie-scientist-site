import Link from 'next/link'
import type { ComparisonFraming } from '@/lib/research-intelligence'

export default function CompareWithCard({ comparisons = [] }: { comparisons?: ComparisonFraming[] }) {
  const visible = comparisons.slice(0, 4)
  if (visible.length < 2) return null

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {visible.map(item => (
        <Link key={item.href} href={item.href} className="card-premium block p-5 hover:-translate-y-0.5">
          <p className="eyebrow-label">Compare with</p>
          <h3 className="mt-2 text-lg font-semibold text-ink">{item.title}</h3>
          <p className="mt-3 text-sm leading-6 text-[#46574d]"><span className="font-semibold text-ink">Overlap:</span> {item.overlappingFocus}</p>
          <p className="mt-3 text-sm leading-6 text-[#46574d]"><span className="font-semibold text-ink">Distinction:</span> {item.keyDistinction}</p>
          <p className="mt-3 text-xs leading-5 text-muted-readable">{item.evidenceEmphasis}</p>
        </Link>
      ))}
    </div>
  )
}
