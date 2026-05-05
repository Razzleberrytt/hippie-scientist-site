import Link from 'next/link'
import { notFound } from 'next/navigation'
import compoundsData from '../../../public/data/compounds.json'

const bestPageConfigs = [
  {
    slug: 'best-supplements-for-focus',
    title: 'Best Supplements for Focus',
    intro: 'A workbook-driven ranking of compounds commonly connected to focus, attention, mental clarity, and clean energy.',
    terms: ['focus', 'attention', 'mental clarity', 'brain fog', 'cognition', 'energy', 'fatigue', 'nootropic'],
  },
  {
    slug: 'best-supplements-for-sleep',
    title: 'Best Supplements for Sleep',
    intro: 'A practical ranking of sleep-support compounds with dose, safety, and evidence context kept visible.',
    terms: ['sleep', 'insomnia', 'relaxation', 'calm', 'night', 'sleep latency', 'sleep quality'],
  },
  {
    slug: 'best-supplements-for-stress',
    title: 'Best Supplements for Stress',
    intro: 'A safety-aware ranking of adaptogens and calming compounds for stress resilience and recovery.',
    terms: ['stress', 'anxiety', 'cortisol', 'calm', 'adaptogen', 'relaxation', 'mood'],
  },
  {
    slug: 'best-supplements-for-inflammation',
    title: 'Best Supplements for Inflammation',
    intro: 'A ranking of inflammation, recovery, and joint-support compounds generated from workbook fields.',
    terms: ['inflammation', 'joint', 'pain', 'recovery', 'oxidative', 'arthritis', 'anti-inflammatory'],
  },
  {
    slug: 'best-supplements-for-gut-health',
    title: 'Best Supplements for Gut Health',
    intro: 'A workbook-driven guide to digestion, gut support, fiber, and tolerance-aware supplement choices.',
    terms: ['gut', 'digestion', 'digestive', 'bloating', 'fiber', 'microbiome', 'stomach'],
  },
  {
    slug: 'best-supplements-for-energy',
    title: 'Best Supplements for Energy',
    intro: 'A ranking of compounds connected to fatigue, stamina, clean energy, and performance support.',
    terms: ['energy', 'fatigue', 'stamina', 'performance', 'endurance', 'mitochondria', 'alertness'],
  },
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

function evidenceWeight(value?: string) {
  const text = String(value || '').toLowerCase()
  if (text.includes('high') || text.includes('strong')) return 40
  if (text.includes('moderate')) return 28
  if (text.includes('limited')) return 14
  if (text.includes('low')) return 8
  return 10
}

function scoreCompound(compound: Compound, terms: string[]) {
  const text = textOf(compound)
  const keywordScore = terms.reduce((sum, term) => sum + (text.includes(term.toLowerCase()) ? 18 : 0), 0)
  const effectScore = Array.isArray(compound.effects)
    ? compound.effects.reduce((sum, effect) => sum + (terms.some(term => effect.toLowerCase().includes(term.toLowerCase())) ? 12 : 0), 0)
    : 0
  const completeness = [compound.summary, compound.dosage, compound.safety, compound.mechanism].filter(Boolean).length * 4
  return keywordScore + effectScore + evidenceWeight(compound.evidence || compound.confidence) + completeness
}

function getRankedCompounds(terms: string[]) {
  return compounds
    .map(compound => ({ compound, score: scoreCompound(compound, terms) }))
    .filter(item => item.compound.slug && item.score >= 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
}

export async function generateStaticParams() {
  return bestPageConfigs.map(page => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params
  const page = bestPageConfigs.find(item => item.slug === slug)
  if (!page) return { title: 'Best Supplements | The Hippie Scientist' }
  return {
    title: `${page.title} | The Hippie Scientist`,
    description: page.intro,
    alternates: { canonical: `/best/${page.slug}` },
  }
}

export default async function BestSupplementsPage({ params }: { params: Params }) {
  const { slug } = await params
  const page = bestPageConfigs.find(item => item.slug === slug)
  if (!page) return notFound()

  const ranked = getRankedCompounds(page.terms)

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Workbook-driven ranking</p>
        <h1 className="mt-2 text-3xl font-bold">{page.title}</h1>
        <p className="mt-3 max-w-3xl text-muted">{page.intro}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
          {page.terms.map(term => <span key={term} className="rounded-full border px-3 py-1">{term}</span>)}
        </div>
      </section>

      <section className="space-y-4">
        {ranked.map(({ compound, score }, index) => (
          <article key={compound.slug} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold text-muted">#{index + 1} · Score {score}</p>
                <h2 className="mt-1 text-2xl font-bold">{compound.name || compound.slug}</h2>
                <p className="mt-2 max-w-3xl text-sm text-muted">{compound.summary || 'Workbook profile available. Open the compound page for more context.'}</p>
              </div>
              <Link href={`/compounds/${compound.slug}`} className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-neutral-50">View profile</Link>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl bg-neutral-50 p-3 text-sm"><strong>Evidence:</strong><br />{compound.evidence || compound.confidence || 'Needs workbook grading'}</div>
              <div className="rounded-xl bg-neutral-50 p-3 text-sm"><strong>Dose:</strong><br />{compound.dosage || 'Needs dose review'}</div>
              <div className="rounded-xl bg-neutral-50 p-3 text-sm"><strong>Safety:</strong><br />{compound.safety || 'Review before stacking'}</div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border bg-neutral-50 p-5">
        <h2 className="text-xl font-bold">How this ranking is generated</h2>
        <p className="mt-2 text-sm text-muted">This page scores compounds using workbook fields: matched effects, summary/mechanism text, evidence labels, dosage visibility, and safety completeness. It is a decision guide, not medical advice.</p>
      </section>
    </main>
  )
}
