import { getGoal } from '@/data/goals'
import { getRevenueProductSet } from '@/config/revenue-products'
import ProductTrustAffiliate from '@/components/monetization/ProductTrustAffiliate'

const SLOT_LABELS: Record<string, string> = {
  budget: 'Budget pick',
  overall: 'Best overall',
  premium: 'Premium pick',
}

type GoalTopAffiliatePicksProps = {
  goalSlug: string
  limit?: number
}

export default function GoalTopAffiliatePicks({ goalSlug, limit = 4 }: GoalTopAffiliatePicksProps) {
  const goal = getGoal(goalSlug)
  if (!goal) return null

  const picks = goal.quickPicks.slice(0, limit).flatMap((pick) => {
    const set = getRevenueProductSet(pick.slug)
    const product = set?.products.find((p) => p.slot === 'overall') ?? set?.products[0]
    if (!product?.affiliateUrl) return []
    return [
      {
        key: pick.slug,
        need: pick.need,
        productName: product.title || pick.option,
        brand: product.brand,
        href: product.affiliateUrl,
        rationale: product.rationale || `Starting point for ${pick.need.toLowerCase()} — verify dose and safety on the full profile.`,
        slotLabel: SLOT_LABELS[product.slot] || 'Editor pick',
      },
    ]
  })

  if (picks.length === 0) return null

  return (
    <section className='card-premium p-6 sm:p-8'>
      <h2 className='text-xl font-semibold text-ink'>Sourcing picks for this goal</h2>
      <p className='mt-2 text-sm leading-6 text-muted'>
        These are comparison starting points with quality context — not prescriptions. Open each profile for
        evidence and safety before buying.
      </p>
      <div className='mt-6 grid gap-4 sm:grid-cols-2'>
        {picks.map((pick) => (
          <div key={pick.key}>
            <p className='mb-2 text-xs font-semibold uppercase tracking-wider text-brand-700'>{pick.need}</p>
            <ProductTrustAffiliate
              productName={pick.productName}
              brand={pick.brand}
              href={pick.href}
              rationale={pick.rationale}
              slotLabel={pick.slotLabel}
            />
          </div>
        ))}
      </div>
    </section>
  )
}