'use client'

import { useMemo } from 'react'
import data from '@/public/data/affiliate-products.json'
import AffiliateProductCard from './AffiliateProductCard'

const normalize = (str: string) =>
  str?.toLowerCase().replace(/[-\s]/g, '')

export default function AffiliateBlock({ compound }: { compound: string }) {
  const normalized = normalize(compound)

  const entry = useMemo(() => {
    const exact = data.find((d: any) => normalize(d.compound) === normalized)
    if (exact) return exact

    return data.find((d: any) => normalize(d.compound).includes(normalized) || normalized.includes(normalize(d.compound)))
  }, [normalized])

  if (!entry) {
    return (
      <a
        href={`https://www.amazon.com/s?k=${compound}+supplement`}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className='block w-full text-center rounded-xl bg-emerald-300 py-2 font-bold text-black'
      >
        Search this supplement
      </a>
    )
  }

  const products = entry.products.slice(0, 2)

  return (
    <div className='grid gap-3 mt-2'>
      {products.map((p: any, i: number) => (
        <AffiliateProductCard key={i} product={p} />
      ))}
    </div>
  )
}
