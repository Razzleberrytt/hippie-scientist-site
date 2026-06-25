import { getGoal } from '@/data/goals'
import { getRevenueProductSet } from '@/config/revenue-products'
import ProductTrustAffiliate from '@/components/monetization/ProductTrustAffiliate'
import { isRestrictedRecord } from '@/src/lib/restricted-ingredients'

const SLOT_LABELS: Record<string, string> = {
  budget: 'Budget pick',
  overall: 'Best overall',
  premium: 'Premium pick',
}

type GoalTopAffiliatePicksProps = {
  goalSlug: string
  limit?: number
  suppressMonetization?: boolean
}

export default function GoalTopAffiliatePicks({
  goalSlug,
  limit = 2,
  suppressMonetization = false,
}: GoalTopAffiliatePicksProps) {
  if (suppressMonetization) return null

  const goal = getGoal(goalSlug)
  if (!goal) return null

  const picks = goal.quickPicks.slice(0, limit).flatMap((pick) => {
    if (isRestrictedRecord({ slug: pick.slug, name: pick.option })) return []
    const set = getRevenueProductSet(pick.slug)
    const product = set?.products.find((p) => p.slot === 'overall') ?? set?.products[0]
    if (!product?.affiliateUrl || isRestrictedRecord(product)) return []
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
    <section className='card-premium p-5 sm:p-8'>
      <p className='eyebrow-label'>Optional sourcing notes</p>
      <h2 className='mt-2 text-xl font-semibold text-ink'>Sourcing picks for this goal</h2>
      <p className='mt-2 text-sm leading-6 text-muted'>
        These are product examples to research carefully — not prescriptions and not a substitute for the safety notes above.
      </p>
      <div className='mt-6 grid gap-4 sm:grid-cols-2'>
        {picks.map((pick) => (
          <div key={pick.key}>
            <p className='mb-2 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-200'>{pick.need}</p>
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
