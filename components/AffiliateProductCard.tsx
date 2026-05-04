'use client'

type Product = {
  name: string
  brand: string
  price: string
  rating: number
  link: string
}

export default function AffiliateProductCard({ product }: { product: Product }) {
  return (
    <a
      href={product.link}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className='block rounded-2xl border border-brand/20 bg-glass-standard p-4 space-y-2 transition hover:bg-glass-heavy active:scale-[0.99]'
    >
      <h4 className='font-bold text-[color:var(--text-primary)]'>{product.name}</h4>
      <p className='text-sm text-[color:var(--text-secondary)]'>{product.brand}</p>
      <p className='text-sm text-[color:var(--text-secondary)]'>{product.price} • ⭐ {product.rating}</p>
    </a>
  )
}
