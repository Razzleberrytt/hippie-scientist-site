import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useEffect, useState } from 'react'
import compoundsData from '../../../public/data/compounds.json'
import { getProductLink } from '@/lib/product-resolver'
import { getProductPicks, groupProductPicks } from '@/lib/product-ranking'
import { generateAmazonProductPicks } from '@/lib/amazon-auto'

const bestPageConfigs = [
  {
    slug: 'best-supplements-for-focus',
    title: 'Best Supplements for Focus',
    intro: 'A workbook-driven ranking of compounds commonly connected to focus, attention, mental clarity, and clean energy.',
    terms: ['focus', 'attention', 'mental clarity', 'brain fog', 'cognition', 'energy', 'fatigue', 'nootropic'],
  }
]

type Params = Promise<{ slug: string }>

const compounds = compoundsData as any[]

export async function generateStaticParams() {
  return bestPageConfigs.map(page => ({ slug: page.slug }))
}

export default function PageWrapper({ params }: { params: any }) {
  const [showCTA, setShowCTA] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY
      const height = document.body.scrollHeight - window.innerHeight
      const depth = (scrolled / height) * 100
      if (depth > 25) setShowCTA(true)
    }

    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const { slug } = params
  const page = bestPageConfigs.find(p => p.slug === slug)
  if (!page) return notFound()

  const ranked = compounds.slice(0, 10)

  const first = ranked[0]
  let topPick = null
  if (first) {
    let picks = groupProductPicks(getProductPicks(first.slug))
    if (!picks.top && !picks.budget && !picks.premium) {
      picks = generateAmazonProductPicks(first.slug)
    }
    topPick = picks.top || picks.budget || picks.premium
  }

  return (
    <main className="space-y-10 pb-32">
      <h1 className="text-3xl font-bold">{page.title}</h1>

      {topPick && (
        <div className="border-2 border-green-500 p-5 rounded-2xl bg-green-50">
          <p className="text-sm font-semibold">🔥 Best Overall • Popular Right Now</p>
          <h2 className="text-xl font-bold mt-1">{topPick.brand} — {topPick.name}</h2>
          <p className="text-sm text-muted mt-1">{topPick.notes}</p>
          <a href={topPick.url} target="_blank" className="inline-block mt-3 bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold">
            View Top Pick
          </a>
        </div>
      )}

      {ranked.map((compound, i) => (
        <div key={compound.slug} className="border p-5 rounded-xl">
          <h2 className="text-xl font-semibold">#{i + 1} {compound.name}</h2>
          {i < 3 && (
            <div className="text-xs text-orange-600 font-semibold mt-1">
              ⚡ High Demand • Frequently Chosen
            </div>
          )}
        </div>
      ))}

      {topPick && showCTA && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-2xl shadow-lg">
          🔥 Most people choose this →
          <a href={topPick.url} target="_blank" className="underline ml-2">Buy Now</a>
        </div>
      )}

      {topPick && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-between items-center">
          <div className="text-sm"><strong>Top Pick:</strong> {topPick.brand}</div>
          <a href={topPick.url} target="_blank" className="bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold">Buy Now</a>
        </div>
      )}
    </main>
  )
}
