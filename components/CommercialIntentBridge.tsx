'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { trackRevenueEvent } from '@/lib/revenue-tracking'

export default function CommercialIntentBridge() {
  const pathname = usePathname() || '/'
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!/^\/(herbs|compounds)\/[^/]+/.test(pathname)) {
      setActive(false)
      return
    }
    const params = new URLSearchParams(window.location.search)
    const queryClass = params.get('query_class')?.toLowerCase()
    const intent = params.get('intent')?.toLowerCase()
    setActive(queryClass === 'commercial' || queryClass === 'comparison' || intent === 'buy' || intent === 'compare')
  }, [pathname])

  if (!active) return null
  const slug = pathname.split('/')[2] || ''

  return (
    <aside className='border-y border-brand-900/10 bg-brand-50/70' aria-label='Commercial research next steps'>
      <div className='mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3'>
        <p className='text-sm text-ink'><strong>Researching a purchase?</strong> Keep the evidence page intact, then move to comparison or product-quality criteria.</p>
        <div className='flex flex-wrap gap-3 text-sm font-bold'>
          <Link href={`/guides/compare/?from=${encodeURIComponent(slug)}`} onClick={() => trackRevenueEvent({ kind: 'cta_click', location: 'commercial-intent-bridge', label: 'Compare options', productSlug: slug })} className='text-indigo-800 hover:underline'>Compare options →</Link>
          <Link href={`/learn/product-quality/?ingredient=${encodeURIComponent(slug)}`} onClick={() => trackRevenueEvent({ kind: 'cta_click', location: 'commercial-intent-bridge', label: 'Product quality', productSlug: slug })} className='text-indigo-800 hover:underline'>Product-quality checklist →</Link>
        </div>
      </div>
    </aside>
  )
}
