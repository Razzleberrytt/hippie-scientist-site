type Product = {
  name: string
  brand: string
  price: string
  rating: number
  link: string
}

export default function AffiliateProductCard({ product }: { product: Product }) {
  return (
    <div className='rounded-2xl border border-white/10 bg-white/[0.04] p-4 space-y-2'>
      <h4 className='font-bold text-white'>{product.name}</h4>
      <p className='text-sm text-white/60'>{product.brand}</p>
      <p className='text-sm text-white/70'>{product.price} • ⭐ {product.rating}</p>
      <a
        href={product.link}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className='block w-full text-center rounded-xl bg-emerald-300 py-2 font-bold text-black'
      >
        View Product
      </a>
    </div>
  )
}
