import data from '@/public/data/affiliate-products.json'
import AffiliateProductCard from './AffiliateProductCard'

export default function AffiliateBlock({ compound }: { compound: string }) {
  const entry = data.find((d: any) => d.compound === compound)

  if (!entry) return null

  const products = entry.products.slice(0, 2)

  return (
    <div className='grid gap-3 mt-2'>
      {products.map((p: any, i: number) => (
        <AffiliateProductCard key={i} product={p} />
      ))}
    </div>
  )
}
