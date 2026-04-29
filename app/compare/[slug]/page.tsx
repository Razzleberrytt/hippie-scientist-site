import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import aTierIndex from '@/../public/data/a-tier-index.json'
import { baseCompounds } from '@/data/compounds/compoundData'

type Params = { params: Promise<{ slug: string }> }
type ComparisonConfig = { slug: string; title: string; left: string; right: string }

const COMPARISONS: ComparisonConfig[] = [
  { slug: 'creatine-vs-caffeine', title: 'Creatine vs Caffeine', left: 'creatine', right: 'caffeine' },
  { slug: 'epa-vs-dha', title: 'EPA vs DHA', left: 'epa', right: 'dha' },
]

const DIMENSIONS = ['Mechanism', 'Use case', 'Evidence strength'] as const
type Dimension = (typeof DIMENSIONS)[number]

const resolveTierSlug = (compoundSlug: string): string =>
  compoundSlug === 'epa' || compoundSlug === 'dha' ? 'omega-3' : compoundSlug

const getMechanism = (compoundName: string): string => {
  const match = baseCompounds.find(item => item.name.toLowerCase() === compoundName.toLowerCase())
  return match?.mechanism ?? 'Not available in current dataset.'
}

const getUseCase = (compoundSlug: string): string => {
  const match = aTierIndex.global.find(item => item.slug === resolveTierSlug(compoundSlug))
  return match ? `Primary domain in current dataset: ${match.domain}.` : 'Not available in current dataset.'
}

const getEvidenceStrength = (compoundSlug: string): string => {
  const match = aTierIndex.global.find(item => item.slug === resolveTierSlug(compoundSlug))
  return match ? `Confidence score in current dataset: ${match.confidenceScore}/100.` : 'Not available in current dataset.'
}

const getCell = (compound: string, dimension: Dimension): string => {
  if (dimension === 'Mechanism') return getMechanism(compound)
  if (dimension === 'Use case') return getUseCase(compound)
  return getEvidenceStrength(compound)
}

export function generateStaticParams() {
  return COMPARISONS.map(item => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const comparison = COMPARISONS.find(item => item.slug === slug)
  if (!comparison) return { title: 'Comparison Not Found | The Hippie Scientist' }
  return {
    title: `${comparison.title} | Compound Comparison`,
    description: `Direct comparison of ${comparison.left.toUpperCase()} and ${comparison.right.toUpperCase()} using current dataset fields only.`,
    alternates: { canonical: `/compare/${comparison.slug}` },
  }
}

export default async function ComparePage({ params }: Params) {
  const { slug } = await params
  const comparison = COMPARISONS.find(item => item.slug === slug)
  if (!comparison) notFound()
  return (
    <main className='mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8'>
      <h1 className='text-3xl font-semibold tracking-tight text-white sm:text-4xl'>{comparison.title}</h1>
      <p className='mt-3 text-sm text-zinc-300'>Scope: mechanism, use case, and evidence strength from current in-repo data only.</p>
      <div className='mt-8 overflow-x-auto'>
        <table className='w-full min-w-[720px] border-collapse text-left'>
          <thead><tr className='border-b border-white/20 text-sm text-zinc-300'><th className='px-3 py-3 font-medium'>Dimension</th><th className='px-3 py-3 font-medium'>{comparison.left.toUpperCase()}</th><th className='px-3 py-3 font-medium'>{comparison.right.toUpperCase()}</th></tr></thead>
          <tbody>{DIMENSIONS.map(dimension => (<tr key={dimension} className='border-b border-white/10 align-top'><th className='px-3 py-4 text-sm font-semibold text-white'>{dimension}</th><td className='px-3 py-4 text-sm text-zinc-200'>{getCell(comparison.left, dimension)}</td><td className='px-3 py-4 text-sm text-zinc-200'>{getCell(comparison.right, dimension)}</td></tr>))}</tbody>
        </table>
      </div>
    </main>
  )
}
