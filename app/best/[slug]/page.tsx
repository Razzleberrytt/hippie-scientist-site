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

  return (
    <main className="space-y-10">
      <h1 className="text-3xl font-bold">{page.title}</h1>

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
                <thead>
                  <tr className="bg-neutral-100">
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Brand</th>
                    <th className="p-2 text-left">Why</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {picks.top && (
                    <tr className="border-t">
                      <td className="p-2">⭐ Top</td>
                      <td className="p-2">{picks.top.brand}</td>
                      <td className="p-2">{picks.top.notes}</td>
                      <td className="p-2">
                        <a href={picks.top.url} target="_blank" className="bg-black text-white px-3 py-1 rounded">View</a>
                      </td>
                    </tr>
                  )}

                  {picks.budget && (
                    <tr className="border-t">
                      <td className="p-2">💸 Budget</td>
                      <td className="p-2">{picks.budget.brand}</td>
                      <td className="p-2">{picks.budget.notes}</td>
                      <td className="p-2">
                        <a href={picks.budget.url} target="_blank" className="bg-black text-white px-3 py-1 rounded">View</a>
                      </td>
                    </tr>
                  )}

                  {picks.premium && (
                    <tr className="border-t">
                      <td className="p-2">🔬 Premium</td>
                      <td className="p-2">{picks.premium.brand}</td>
                      <td className="p-2">{picks.premium.notes}</td>
                      <td className="p-2">
                        <a href={picks.premium.url} target="_blank" className="bg-black text-white px-3 py-1 rounded">View</a>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <Link href={`/compounds/${compound.slug}`} className="underline text-sm">Details</Link>
              <a href={getProductLink(compound)} target="_blank" className="bg-black text-white px-3 py-1 rounded text-sm">Compare All</a>
            </div>
          </div>
        )
      })}
    </main>
  )
}
