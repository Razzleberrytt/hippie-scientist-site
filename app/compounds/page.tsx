import type { Metadata } from 'next'
import Link from 'next/link'
import { getCompounds } from '@/lib/runtime-data'

type CompoundListItem = {
  slug: string
  displayName?: string
  name?: string
  summary?: string
  description?: string
}

const getCompoundLabel = (compound: CompoundListItem): string =>
  compound.displayName ?? compound.name ?? compound.slug

const truncateText = (value: string | undefined, maxLength: number): string => {
  if (!value) return 'Profile coming soon.'
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength - 1).trimEnd()}…`
}

export const metadata: Metadata = {
  title: 'Compounds | The Hippie Scientist',
  description: 'Browse compound profiles and plain-English summaries.',
}

export default async function CompoundsPage() {
  const compounds = [...(await getCompounds() as CompoundListItem[])].sort((a, b) =>
    getCompoundLabel(a).localeCompare(getCompoundLabel(b)),
  )

  return (
    <div className='space-y-8'>
      <section className='rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8'>
        <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
          Library
        </p>
        <h1 className='mt-2 text-4xl font-bold tracking-tight'>Compounds</h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-white/75'>
          Browse active constituents, simple explanations, and quick research
          notes.
        </p>
        <p className='mt-3 text-sm text-white/60'>
          {compounds.length} profiles available
        </p>
      </section>

      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        {compounds.map(compound => (
          <Link
            key={compound.slug}
            href={`/compounds/${compound.slug}`}
            className='group ds-card flex h-full flex-col transition hover:border-white/30 hover:bg-white/5'
          >
            <p className='text-xs font-medium uppercase tracking-[0.2em] text-white/50'>
              Compound profile
            </p>

            <h2 className='mt-3 text-xl font-semibold'>
              {getCompoundLabel(compound)}
            </h2>

            <p className='mt-3 flex-1 text-sm leading-6 text-white/70'>
              {truncateText(compound.summary ?? compound.description, 180)}
            </p>

            <span className='mt-4 inline-flex text-sm font-medium text-blue-300 transition group-hover:translate-x-0.5'>
              Read profile →
            </span>
          </Link>
        ))}
      </section>
    </div>
  )
}
