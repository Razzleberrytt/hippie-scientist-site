import Link from 'next/link'
import type { CompareItem } from '@/lib/compare'
import { revenueProductSets } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'

interface CompareAffiliateProps {
  item1: CompareItem
  item2: CompareItem
  isHR: boolean
}

export default function CompareAffiliate({ item1, item2, isHR }: CompareAffiliateProps) {
  if (isHR) return null

  const set1 = revenueProductSets[item1.slug]
  const set2 = revenueProductSets[item2.slug]

  if (!set1 && !set2) return null

  return (
    <section aria-labelledby="compare-product-options-heading" className="space-y-8">
      <div className="rounded-3xl border border-brand-900/10 bg-white/80 p-5 shadow-sm sm:p-6">
        <div className="max-w-3xl space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
            Product options
          </p>
          <h2 id="compare-product-options-heading" className="text-2xl font-semibold tracking-tight text-ink">
            Only shop after the fit makes sense
          </h2>
          <p className="text-sm leading-6 text-muted">
            Use the comparison, dosing notes, safety flags, and full profiles first. These product sections are optional next steps for readers who already know which side fits their goal.
          </p>
          <Link
            href="/info/affiliate-disclosure/"
            className="inline-flex text-xs font-bold text-brand-700 underline underline-offset-4 hover:text-brand-800"
          >
            Read our affiliate disclosure →
          </Link>
        </div>
      </div>

      {set1 && (
        <RecommendationSection
          title={`If you choose ${item1.name}`}
          products={set1.products}
        />
      )}
      {set2 && (
        <RecommendationSection
          title={`If you choose ${item2.name}`}
          products={set2.products}
        />
      )}
    </section>
  )
}
