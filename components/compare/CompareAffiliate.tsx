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
    <div className="space-y-8">
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
    </div>
  )
}
