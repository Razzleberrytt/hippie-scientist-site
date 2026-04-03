import type { HerbProduct } from '@/data/herbProducts'

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
              <h3 className='text-sm font-semibold text-white/95'>{product.name}</h3>
              {product.brand && <p className='mt-1 text-xs text-white/65'>Brand: {product.brand}</p>}
              <p className='mt-2 text-xs uppercase tracking-[0.14em] text-white/55'>
                Form: <span className='capitalize text-white/85'>{product.form}</span>
              </p>
              <div className='mt-2 flex flex-wrap gap-2'>
                {product.attributes.map(attribute => (
                  <span key={attribute} className='ds-pill'>
                    {attribute}
                  </span>
                ))}
              </div>
              {product.notes && <p className='mt-2 text-sm leading-relaxed text-white/80'>{product.notes}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
