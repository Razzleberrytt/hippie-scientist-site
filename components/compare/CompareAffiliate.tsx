import type { CompareItem } from '@/lib/compare'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'

interface CompareAffiliateProps {
  item1: CompareItem
  item2: CompareItem
}

export default function CompareAffiliate({ item1, item2 }: CompareAffiliateProps) {
  // If either item is harm-reduction, do not monetize (render nothing)
  if (item1.isHarmReduction || item2.isHarmReduction) {
    return null
  }

  // Fetch the product sets from configuration
  const productSet1 = getRevenueProductSet(item1.slug)
  const productSet2 = getRevenueProductSet(item2.slug)

  // If no products are defined for either item, render nothing
  if (!productSet1 && !productSet2) {
    return null
  }

  const products = [
    ...(productSet1?.products || []),
    ...(productSet2?.products || [])
  ]

  if (products.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <RecommendationSection
        title={`${item1.name} and ${item2.name} Sourcing Options`}
        description="Existing configured product picks for these two non-harm-reduction profiles. Use them as sourcing starting points, not medical recommendations."
        products={products}
      />
      <AffiliateDisclosure variant="compact" />
    </div>
  )
}
