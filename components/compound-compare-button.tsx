'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

const KEY = 'compare-compounds'

export function CompoundCompareButton({ slug }: { slug: string }) {
  const router = useRouter()

  const onClick = useCallback(() => {
    const current = JSON.parse(localStorage.getItem(KEY) || '[]') as string[]
    const unique = current.filter((item) => item !== slug)
    const next = [...unique, slug].slice(-2)
    localStorage.setItem(KEY, JSON.stringify(next))
    if (next.length >= 2) router.push(`/compare?c=${next.join(',')}`)
  }, [router, slug])

  return (
    <button onClick={onClick} className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-100">
      Compare
    </button>
  )
}
