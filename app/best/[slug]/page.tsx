import Link from 'next/link'
import { notFound } from 'next/navigation'
import compoundsData from '../../../public/data/compounds.json'
import { applyClickBoost } from '@/lib/ranking-optimizer'

const bestPageConfigs = [
  {
    slug: 'best-supplements-for-focus',
    title: 'Best Supplements for Focus',
    intro: 'A workbook-driven ranking of compounds commonly connected to focus, attention, mental clarity, and clean energy.',
    terms: ['focus']
  }
]

export async function generateStaticParams() {
  return bestPageConfigs.map(page => ({ slug: page.slug }))
}

export default function Page({ params }: any) {
  const { slug } = params
  const page = bestPageConfigs.find(p => p.slug === slug)
  if (!page) return notFound()

  const baseRanked = (compoundsData as any[])
    .slice(0, 50)
    .map((c, i) => ({ ...c, _score: 100 - i }))

  const ranked = applyClickBoost(baseRanked, slug).slice(0, 10)

  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold">{page.title}</h1>

      {ranked.map((compound, i) => (
        <div key={compound.slug} className="border p-4 rounded-xl">
          <h2 className="text-xl font-semibold">#{i + 1} {compound.name}</h2>
          <p className="text-xs text-muted">Click boost: {compound._clickBoost || 0}</p>
        </div>
      ))}
    </main>
  )
}
