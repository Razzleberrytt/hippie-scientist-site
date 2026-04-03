import type { HerbProduct } from '@/data/herbProducts'
import { DEFAULT_AMAZON_AFFILIATE_TAG } from '@/data/curatedProducts'
import type { AffiliateUseCaseAnchor } from '@/lib/affiliateClickTracking'
import { trackAffiliateLinkClick } from '@/lib/affiliateClickTracking'
import { normalizeAmazonAffiliateUrl } from '@/utils/affiliateUrls'

const bestForByForm: Record<string, string> = {
  capsule: 'structured daily routines',
  powder: 'mixing into drinks or food',
  tea: 'simple steep-and-sip routines',
  'loose herb': 'custom brewing preferences',
}

function getWhyThisFits(attributes: string[]) {
  const highlights = attributes.slice(0, 2)
  if (!highlights.length) return 'Why this fits: Focuses on straightforward label clarity.'
  if (highlights.length === 1) return `Why this fits: Emphasizes ${highlights[0]}.`
  return `Why this fits: Emphasizes ${highlights[0]} with ${highlights[1]}.`
}

function getBestFor(form: string) {
  return bestForByForm[form] ?? 'label-first comparisons across similar options'
}

function getHerbProductId(product: HerbProduct) {
  return `${product.productTitle} ${product.form}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function HerbProductSection({
  herbSlug,
  products,
  useCaseAnchor,
}: {
  herbSlug: string
  products: HerbProduct[]
  useCaseAnchor?: AffiliateUseCaseAnchor
}) {
  if (!products.length) return null

  const sortedProducts = [...products].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  const hasVisibleAffiliateProduct = sortedProducts.some(product =>
    Boolean(normalizeAmazonAffiliateUrl(product.affiliateUrl, DEFAULT_AMAZON_AFFILIATE_TAG)),
  )

  return (
    <section className='border-white/8 mt-6 border-t pt-5'>
      <div className='border-white/12 rounded-2xl border bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-4 md:p-5'>
        <div>
          <h2 className='text-sm font-semibold uppercase tracking-[0.16em] text-white/75'>
            Recommended products
          </h2>
          <p className='mt-1 text-sm text-white/70'>
            Product-format examples that align with the buyer guidance above.
          </p>
          {hasVisibleAffiliateProduct && (
            <p className='mt-1 text-xs text-white/65'>
              As an Amazon Associate, this site may earn from qualifying purchases.
            </p>
          )}
        </div>

        <div className='mt-4 grid gap-3 md:grid-cols-2'>
          {sortedProducts.map((product, index) => {
            const normalizedAffiliateUrl = normalizeAmazonAffiliateUrl(
              product.affiliateUrl,
              DEFAULT_AMAZON_AFFILIATE_TAG,
            )
            const productId = getHerbProductId(product)
            const position = product.highlight || index === 0 ? 'primary' : 'alternative'

            return (
              <article
                key={`${product.productTitle}-${product.form}`}
                className={`rounded-xl border p-3 ${
                  product.highlight
                    ? 'border-emerald-200/30 bg-emerald-200/[0.04]'
                    : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                <div className='flex items-start justify-between gap-3'>
                  <h3 className='text-sm font-semibold text-white/95'>{product.productTitle}</h3>
                  {product.highlight ? (
                    <span className='bg-emerald-200/12 shrink-0 rounded-full border border-emerald-200/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-emerald-100/90'>
                      Top Pick
                    </span>
                  ) : (
                    <span className='shrink-0 rounded-full border border-emerald-200/25 bg-emerald-200/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-emerald-100/85'>
                      Aligned with guidance above
                    </span>
                  )}
                </div>
                {product.brand && (
                  <p className='mt-1 text-xs text-white/65'>Brand: {product.brand}</p>
                )}
                <p className='mt-2 text-xs uppercase tracking-[0.14em] text-white/55'>
                  Form: <span className='capitalize text-white/85'>{product.form}</span>
                </p>
                <p className='text-white/78 mt-2 text-xs'>{getWhyThisFits(product.attributes)}</p>
                {product.reasoning && (
                  <p className='text-white/66 mt-1 text-xs'>{product.reasoning}</p>
                )}
                <p className='text-white/66 mt-1 text-xs'>
                  Best for: <span className='text-white/80'>{getBestFor(product.form)}</span>
                </p>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {product.attributes.slice(0, 3).map(attribute => (
                    <span key={attribute} className='ds-pill'>
                      {attribute}
                    </span>
                  ))}
                </div>
                {product.notes && (
                  <p className='mt-2 text-sm leading-relaxed text-white/80'>{product.notes}</p>
                )}
                {normalizedAffiliateUrl ? (
                  <a
                    href={normalizedAffiliateUrl}
                    target='_blank'
                    rel='nofollow noopener noreferrer'
                    className='text-white/78 mt-3 inline-flex items-center rounded-md border border-white/20 bg-white/[0.03] px-3 py-1.5 text-xs font-medium'
                    onClick={() =>
                      trackAffiliateLinkClick({
                        herbSlug,
                        productId,
                        position,
                        useCaseAnchor,
                        source: 'herb_product_section',
                      })
                    }
                  >
                    View Options
                  </a>
                ) : (
                  <button
                    type='button'
                    aria-disabled='true'
                    className='text-white/78 mt-3 inline-flex cursor-default items-center rounded-md border border-white/20 bg-white/[0.03] px-3 py-1.5 text-xs font-medium'
                  >
                    View Options
                  </button>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
