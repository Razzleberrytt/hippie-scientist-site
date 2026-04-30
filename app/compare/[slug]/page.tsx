import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import aTierIndex from '@/../public/data/a-tier-index.json'
import { getCompounds } from '@/lib/runtime-data'

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

const normalize = (value: string): string => value.trim().toLowerCase()

const formatMechanism = (mechanisms?: string[]): string => {
  if (!Array.isArray(mechanisms) || mechanisms.length === 0) return 'Not available in current dataset.'
  return mechanisms.filter(Boolean).join('; ')
}

async function getMechanism(compoundSlug: string): Promise<string> {
  const compounds = await getCompounds()
  const normalizedSlug = normalize(compoundSlug)
  const match = compounds.find(item => normalize(item.slug) === normalizedSlug || normalize(item.name ?? '') === normalizedSlug || normalize(item.displayName ?? '') === normalizedSlug)
  return formatMechanism(match?.mechanisms)
}

const getUseCase = (compoundSlug: string): string => {
  const match = aTierIndex.items.find(item => item.slug === resolveTierSlug(compoundSlug))
  return match ? `Primary domain in current dataset: ${match.domain}.` : 'Not available in current dataset.'
}

const getEvidenceStrength = (compoundSlug: string): string => {
  const match = aTierIndex.items.find(item => item.slug === resolveTierSlug(compoundSlug))
  return match ? `Confidence score in current dataset: ${match.confidenceScore}/100.` : 'Not available in current dataset.'
}

const getCell = async (compound: string, dimension: Dimension): Promise<string> => {
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

  const rows = await Promise.all(
    DIMENSIONS.map(async dimension => ({
      dimension,
      left: await getCell(comparison.left, dimension),
      right: await getCell(comparison.right, dimension),
    })),
  )

  return (
    <main className='mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8'>
      <h1 className='text-3xl font-semibold tracking-tight text-white sm:text-4xl'>{comparison.title}</h1>
      <p className='mt-3 text-sm text-zinc-300'>Scope: mechanism, use case, and evidence strength from current workbook-generated data only.</p>
      <div className='mt-8 overflow-x-auto'>
        <table className='w-full min-w-[720px] border-collapse text-left'>
          <thead><tr className='border-b border-white/20 text-sm text-zinc-300'><th className='px-3 py-3 font-medium'>Dimension</th><th className='px-3 py-3 font-medium'>{comparison.left.toUpperCase()}</th><th className='px-3 py-3 font-medium'>{comparison.right.toUpperCase()}</th></tr></thead>
          <tbody>{rows.map(row => (<tr key={row.dimension} className='border-b border-white/10 align-top'><th className='px-3 py-4 text-sm font-semibold text-white'>{row.dimension}</th><td className='px-3 py-4 text-sm text-zinc-200'>{row.left}</td><td className='px-3 py-4 text-sm text-zinc-200'>{row.right}</td></tr>))}</tbody>
        </table>
      </div>
    </main>
  )
}
