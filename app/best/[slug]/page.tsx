import Link from 'next/link'
import { notFound } from 'next/navigation'
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

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params
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
    <main className="space-y-10 pb-24">
      <h1 className="text-3xl font-bold">{page.title}</h1>

      {topPick && (
        <div className="border-2 border-green-500 p-5 rounded-2xl bg-green-50">
          <p className="text-sm font-semibold">🔥 Best Overall Choice</p>
          <h2 className="text-xl font-bold mt-1">{topPick.brand} — {topPick.name}</h2>
          <p className="text-sm text-muted mt-1">{topPick.notes}</p>
          <a href={topPick.url} target="_blank" className="inline-block mt-3 bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold">
            View Top Pick
          </a>
        </div>
      )}

      {ranked.map((compound, i) => {
        let picks = groupProductPicks(getProductPicks(compound.slug))
        if (!picks.top && !picks.budget && !picks.premium) {
          picks = generateAmazonProductPicks(compound.slug)
        }

        return (
          <div key={compound.slug} className="border p-5 rounded-xl space-y-4">
            <h2 className="text-xl font-semibold">#{i + 1} {compound.name}</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <tbody>
                  {picks.top && (
                    <tr className="bg-green-50">
                      <td className="p-2">⭐</td>
                      <td className="p-2 font-semibold">{picks.top.brand}</td>
                      <td className="p-2">{picks.top.notes}</td>
                      <td className="p-2"><a href={picks.top.url} target="_blank" className="bg-black text-white px-3 py-1 rounded">View</a></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {topPick && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-between items-center">
          <div className="text-sm">
            <strong>Top Pick:</strong> {topPick.brand}
          </div>
          <a href={topPick.url} target="_blank" className="bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold">
            Buy Now
          </a>
        </div>
      )}
    </main>
  )
}
