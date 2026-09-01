import Link from 'next/link'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import ProductTrustAffiliate from '@/components/monetization/ProductTrustAffiliate'
import { getRevenueProductSet } from '@/config/revenue-products'
import { getCompounds, getHerbs } from '@/lib/runtime-data'
import { canRenderConfiguredRevenueProducts } from '@/lib/revenue-product-governance'

export type DecisionProductCandidate = {
  slug: string
  label: string
  fit: string
  safetyCheck: string
  qualitySignals: string[]
  profileHref: string
}

type DecisionToProductEndpointProps = {
  title?: string
  description?: string
  candidates: DecisionProductCandidate[]
  trackingLocation?: string
}

function usableAffiliateUrl(value: unknown): value is string {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim())
}

export default async function DecisionToProductEndpoint({
  title = 'Turn the evidence into a safer shopping checklist',
  description = 'Start with fit and safety. Product examples only appear when the site’s current monetization policy permits them.',
  candidates,
  trackingLocation = 'decision-to-product-endpoint',
}: DecisionToProductEndpointProps) {
  const [herbs, compounds] = await Promise.all([getHerbs(), getCompounds()])
  const runtimeRecords = [...herbs, ...compounds]

  const decisions = candidates.map((candidate) => {
    const record = runtimeRecords.find((item) => String(item.slug || '') === candidate.slug) ?? null
    const productSet = getRevenueProductSet(candidate.slug)
    const commerceAllowed = Boolean(
      record && productSet && canRenderConfiguredRevenueProducts(candidate.slug, record),
    )
    const product = commerceAllowed
      ? productSet?.products.find((item) => item.slot === 'overall' && usableAffiliateUrl(item.affiliateUrl))
        ?? productSet?.products.find((item) => usableAffiliateUrl(item.affiliateUrl))
        ?? null
      : null

    return { candidate, product }
  })

  const hasCommerceAction = decisions.some(({ product }) => Boolean(product))

  return (
    <section className='card-premium p-5 sm:p-8' data-module-position={trackingLocation}>
      <div className='max-w-3xl'>
        <p className='eyebrow-label'>Decision endpoint</p>
        <h2 className='mt-2 text-2xl font-semibold tracking-tight text-ink'>{title}</h2>
        <p className='mt-2 text-sm leading-7 text-muted'>{description}</p>
        {hasCommerceAction ? <AffiliateDisclosure variant='compact' className='mt-3' /> : null}
      </div>

      <div className='mt-6 grid gap-4 lg:grid-cols-3'>
        {decisions.map(({ candidate, product }) => (
          <article key={candidate.slug} className='rounded-2xl border border-brand-900/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5'>
            <h3 className='text-lg font-semibold text-ink'>{candidate.label}</h3>

            <div className='mt-4 space-y-3 text-sm leading-6 text-muted'>
              <div>
                <p className='text-xs font-bold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-200'>Evidence fit</p>
                <p className='mt-1'>{candidate.fit}</p>
              </div>
              <div>
                <p className='text-xs font-bold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-200'>Safety check first</p>
                <p className='mt-1'>{candidate.safetyCheck}</p>
              </div>
              <div>
                <p className='text-xs font-bold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-200'>Quality signals</p>
                <ul className='mt-1 space-y-1.5'>
                  {candidate.qualitySignals.map((signal) => <li key={signal}>• {signal}</li>)}
                </ul>
              </div>
            </div>

            {product && usableAffiliateUrl(product.affiliateUrl) ? (
              <ProductTrustAffiliate
                compact
                productName={product.title || product.name || candidate.label}
                brand={product.brand}
                href={product.affiliateUrl}
                rationale={product.rationale || `A governed sourcing example for ${candidate.label}.`}
                slotLabel='Current sourcing example'
                productSlug={candidate.slug}
                productSlot={product.slot}
                trackingLocation={trackingLocation}
              />
            ) : (
              <div className='mt-4 space-y-2 border-t border-brand-900/10 pt-4 dark:border-white/10'>
                <p className='text-xs leading-5 text-muted'>No governed product action is shown here. Keep the decision educational until the current site policy and product data both permit commerce.</p>
                <Link href={candidate.profileHref} className='inline-flex min-h-10 items-center text-sm font-semibold text-brand-700 hover:underline'>
                  Review evidence and safety →
                </Link>
              </div>
            )}
          </article>
        ))}
      </div>

      <p className='mt-5 text-xs leading-6 text-muted'>
        Product examples are sourcing starting points, not prescriptions. For a brand-neutral checklist, use the{' '}
        <Link href='/learn/product-quality/' className='font-semibold text-brand-700 hover:underline'>supplement product-quality guide</Link>.
      </p>
    </section>
  )
}
