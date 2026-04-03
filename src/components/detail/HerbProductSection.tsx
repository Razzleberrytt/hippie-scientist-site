import type { HerbProduct } from '@/data/herbProducts'

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

export default function HerbProductSection({ products }: { products: HerbProduct[] }) {
  if (!products.length) return null

  return (
    <section className='border-white/8 mt-6 border-t pt-5'>
      <div className='rounded-2xl border border-white/12 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-4 md:p-5'>
        <div>
          <h2 className='text-sm font-semibold uppercase tracking-[0.16em] text-white/75'>
            Recommended Products
          </h2>
          <p className='mt-1 text-sm text-white/70'>
            Product-format examples that align with the buyer guidance above.
          </p>
        </div>

        <div className='mt-4 grid gap-3 md:grid-cols-2'>
          {products.map(product => (
            <article
              key={`${product.name}-${product.form}`}
              className='rounded-xl border border-white/10 bg-white/[0.02] p-3'
            >
              <div className='flex items-start justify-between gap-3'>
                <h3 className='text-sm font-semibold text-white/95'>{product.name}</h3>
                <span className='shrink-0 rounded-full border border-emerald-200/25 bg-emerald-200/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-emerald-100/85'>
                  Aligned with guidance above
                </span>
              </div>
              {product.brand && <p className='mt-1 text-xs text-white/65'>Brand: {product.brand}</p>}
              <p className='mt-2 text-xs uppercase tracking-[0.14em] text-white/55'>
                Form: <span className='capitalize text-white/85'>{product.form}</span>
              </p>
              <p className='mt-2 text-xs text-white/78'>{getWhyThisFits(product.attributes)}</p>
              <p className='mt-1 text-xs text-white/66'>
                Best for: <span className='text-white/80'>{getBestFor(product.form)}</span>
              </p>
              <div className='mt-2 flex flex-wrap gap-2'>
                {product.attributes.slice(0, 3).map(attribute => (
                  <span key={attribute} className='ds-pill'>
                    {attribute}
                  </span>
                ))}
              </div>
              {product.notes && <p className='mt-2 text-sm leading-relaxed text-white/80'>{product.notes}</p>}
              {product.affiliateUrl?.trim() ? (
                <a
                  href={product.affiliateUrl}
                  target='_blank'
                  rel='nofollow noopener noreferrer'
                  className='mt-3 inline-flex items-center rounded-md border border-white/20 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/78'
                >
                  View Options
                </a>
              ) : (
                <button
                  type='button'
                  aria-disabled='true'
                  className='mt-3 inline-flex cursor-default items-center rounded-md border border-white/20 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/78'
                >
                  View Options
                </button>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
