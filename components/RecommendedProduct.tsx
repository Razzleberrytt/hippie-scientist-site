import AffiliateDisclosure from './AffiliateDisclosure'
import { getRevenueProductSet } from '@/config/revenue-products'

type RecommendedProductProps = {
  slug: string
  title?: string
  limit?: number
  compact?: boolean
}

const slotLabels: Record<string, string> = {
  overall: 'Recommended product',
  budget: 'Budget option',
  premium: 'Premium option',
}

export default function RecommendedProduct({
  slug,
  title = 'Recommended product',
  limit = 1,
  compact = false,
}: RecommendedProductProps) {
  const productSet = getRevenueProductSet(slug)
  if (!productSet) return null

  const ordered = [
    ...productSet.products.filter((product) => product.slot === 'overall'),
    ...productSet.products.filter((product) => product.slot === 'budget'),
    ...productSet.products.filter((product) => product.slot === 'premium'),
  ].slice(0, limit)

  if (ordered.length === 0) return null

  return (
    <section className={`rounded-[1.25rem] border border-emerald-800/15 bg-white/90 shadow-sm ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-emerald-800'>Affiliate pick</p>
          <h2 className='mt-2 text-xl font-semibold text-ink'>{title}</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>
            Use this as a sourcing starting point. Check dose, form, testing, and safety before buying.
          </p>
        </div>
        <AffiliateDisclosure variant='compact' className='sm:max-w-[16rem]' />
      </div>

      <div className='mt-5 grid gap-3'>
        {ordered.map((product) => (
          <article key={`${product.slot}-${product.title || product.name}`} className='rounded-2xl border border-brand-900/10 bg-emerald-50/45 p-4'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <p className='text-xs font-bold uppercase tracking-[0.16em] text-emerald-800'>
                  {slotLabels[product.slot] || 'Editor pick'}
                </p>
                <h3 className='mt-1 text-base font-bold text-ink'>
                  {[product.brand, product.title || product.name].filter(Boolean).join(' - ')}
                </h3>
                <p className='mt-2 text-sm leading-6 text-muted'>{product.rationale}</p>
              </div>
              {product.affiliateUrl ? (
                <a
                  href={product.affiliateUrl}
                  target='_blank'
                  rel='nofollow sponsored noopener noreferrer'
                  className='inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-900'
                >
                  Check price
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
