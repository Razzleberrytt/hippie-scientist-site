import Link from 'next/link'
import { notFound } from 'next/navigation'
import compoundsData from '../../../public/data/compounds.json'
import { getProductLink } from '@/lib/product-resolver'

const bestPageConfigs = [
  {
    slug: 'best-supplements-for-focus',
    title: 'Best Supplements for Focus',
    intro: 'A workbook-driven ranking of compounds commonly connected to focus, attention, mental clarity, and clean energy.',
    terms: ['focus', 'attention', 'mental clarity', 'brain fog', 'cognition', 'energy', 'fatigue', 'nootropic'],
  }
]

type Params = Promise<{ slug: string }>

type Compound = {
  slug: string
  name?: string
  summary?: string
  mechanism?: string
  effects?: string[]
  evidence?: string
  safety?: string
  dosage?: string
  confidence?: string
  product_cta?: string
}

const compounds = compoundsData as Compound[]

function textOf(compound: Compound) {
  return [
    compound.slug,
    compound.name,
    compound.summary,
    compound.mechanism,
    compound.evidence,
    compound.safety,
    compound.dosage,
    compound.confidence,
    ...(Array.isArray(compound.effects) ? compound.effects : []),
  ].filter(Boolean).join(' ').toLowerCase()
}

function scoreCompound(compound: Compound, terms: string[]) {
  const text = textOf(compound)
  let score = 0

  terms.forEach(term => {
    if (text.includes(term)) score += 20
  })

  if (compound.dosage) score += 10
  if (compound.safety) score += 8

  return score
}

function getRankedCompounds(terms: string[]) {
  return compounds
    .map(compound => ({ compound, score: scoreCompound(compound, terms) }))
    .filter(item => item.score > 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
}

export async function generateStaticParams() {
  return bestPageConfigs.map(page => ({ slug: page.slug }))
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params
  const page = bestPageConfigs.find(p => p.slug === slug)
  if (!page) return notFound()

  const ranked = getRankedCompounds(page.terms)

  return (
    <main className="space-y-8">
      <h1 className="text-3xl font-bold">{page.title}</h1>
      <p className="text-muted">{page.intro}</p>

      {ranked.map(({ compound }, i) => (
        <div key={compound.slug} className="border p-4 rounded-xl">
          <h2 className="text-xl font-semibold">#{i + 1} {compound.name}</h2>
          <p className="text-sm text-muted">{compound.summary}</p>

          <div className="flex gap-2 mt-3">
            <Link href={`/compounds/${compound.slug}`} className="text-sm underline">
              View details
            </Link>

            <a
              href={getProductLink(compound)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-black text-white px-4 py-2 text-sm font-semibold"
            >
              {compound.product_cta || 'Shop Options'}
            </a>
          </div>

          <div className="mt-3 text-xs text-muted">
            <strong>What to look for:</strong>
            <ul className="list-disc pl-4 mt-1">
              <li>Standardized extract</li>
              <li>Clinically relevant dosage</li>
              <li>Transparent labeling</li>
            </ul>
          </div>
        </div>
      ))}
    </main>
  )
}
