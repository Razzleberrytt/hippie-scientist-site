import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { getHerbs, getCompounds } from '@/lib/runtime-data'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { SearchSkeleton } from '@/components/skeletons'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'

const PathwayExplorerClient = dynamic(
  () => import('@/components/pathways/PathwayExplorerClient'),
  { loading: () => <SearchSkeleton /> }
)

export const metadata: Metadata = {
  title: 'Biological Pathway Connectivity Explorer',
  description: 'Explore biological receptor connections mapping target neurochemical networks (GABA, Dopamine, Serotonin, Acetylcholine) to modulating herbs and compounds.',
  robots: { index: false, follow: true },
}

export default async function PathwayExplorerPage() {
  const [rawHerbs, rawCompounds] = await Promise.all([getHerbs(), getCompounds()])

  const herbs = rawHerbs.filter((h: Record<string, unknown>) => {
    try {
      return getRuntimeVisibility(h).canRender
    } catch {
      return true
    }
  })

  const compounds = rawCompounds.filter((c: Record<string, unknown>) => {
    try {
      return getRuntimeVisibility(c).canRender
    } catch {
      return true
    }
  })

  return (
    <main className='mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10'>
      <AuthorityJsonLd
        title="Biological Pathway Connectivity Explorer"
        description="Interact with neurochemical targets and find modulating herbs and compounds sorted by scientific evidence certainty."
        url="https://thehippiescientist.net/pathways/explorer"
        type="MedicalWebPage"
      />

      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
        <p className='eyebrow-label'>Neuroscience Decoded</p>
        <h1 className='text-3xl font-bold tracking-tight text-ink sm:text-5xl mt-2'>
          Biological Pathway Explorer
        </h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>
          Navigate the synaptic connections between neurochemical receptor targets and modulating ingredients in our database. Map mechanisms of action to empirical outcomes.
        </p>
      </section>

      <PathwayExplorerClient herbs={herbs} compounds={compounds} />
    </main>
  )
}
