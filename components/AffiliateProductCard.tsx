type Product = {
  name: string
  brand: string
  price: string
  rating: number
  link: string
}

export default function AffiliateProductCard({ product }: { product: Product }) {
  const compoundName = product.name.split(' ')[0]

  return (
    <a
      href={product.link}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className='block rounded-2xl border border-white/10 bg-white/[0.04] p-4 space-y-2 transition hover:bg-white/[0.08] active:scale-[0.99]'
    >
      <h4 className='font-bold text-white'>{product.name}</h4>
      <p className='text-sm text-white/70'>{product.brand}</p>
      <p className='text-sm text-white/80'>{product.price} • ⭐ {product.rating}</p>
      <div className='w-full text-center rounded-xl bg-emerald-300 py-2 font-bold text-black'>
        Check Price
      </div>
    </a>
  )
}
