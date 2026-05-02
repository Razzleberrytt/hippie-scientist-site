'use client'

import { useMemo } from 'react'
import data from '@/public/data/affiliate-products.json'
import AffiliateProductCard from './AffiliateProductCard'

const normalize = (str: string) =>
  String(str || '').toLowerCase().replace(/[-\s]/g, '')

const formatName = (value: string) =>
  String(value || '')
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

type AffiliateBlockProps = {
  compound: string
  intentLabel?: string
  compact?: boolean
}

export default function AffiliateBlock({ compound, intentLabel, compact = false }: AffiliateBlockProps) {
  const normalized = normalize(compound)
  const displayName = formatName(compound)

  const entry = useMemo(() => {
    const exact = data.find((d: any) => normalize(d.compound) === normalized)
    if (exact) return exact

    return data.find((d: any) => normalize(d.compound).includes(normalized) || normalized.includes(normalize(d.compound)))
  }, [normalized])

  if (!entry) {
    return (
      <div className='rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-3'>
        {intentLabel ? <p className='mb-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-100'>{intentLabel}</p> : null}
        <a
          href={`https://www.amazon.com/s?k=${encodeURIComponent(`${displayName} supplement`)}&tag=razzleberry02-20`}
          target='_blank'
          rel='noopener noreferrer sponsored'
          className='block w-full rounded-xl bg-emerald-300 py-2.5 text-center text-sm font-black text-black hover:bg-emerald-200'
        >
          Shop {displayName} options →
        </a>
        <p className='mt-2 text-center text-[0.7rem] text-white/40'>Prices and availability may change.</p>
      </div>
    )
  }

  const products = [entry.products?.[0], entry.products?.[1]].filter(Boolean)
  const labels = ['Best overall', 'Best budget']

  return (
    <div className={`grid gap-3 ${compact ? '' : 'mt-2'}`}>
      {intentLabel ? <p className='text-xs font-black uppercase tracking-[0.16em] text-emerald-100'>{intentLabel}</p> : null}
      {products.map((p: any, i: number) => (
        <div key={i} className='rounded-2xl border border-white/10 bg-white/[0.03] p-2'>
          <p className='mb-2 px-1 text-[0.7rem] font-black uppercase tracking-[0.16em] text-white/45'>{labels[i] ?? 'Top pick'}</p>
          <AffiliateProductCard product={p} />
        </div>
      ))}
      <p className='text-center text-[0.7rem] text-white/40'>Prices and availability may change.</p>
    </div>
  )
}
