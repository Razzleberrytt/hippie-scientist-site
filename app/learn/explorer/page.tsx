import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { getHerbs, getCompounds } from '../../../src/lib/runtime-data'
import { getRuntimeVisibility } from '../../../lib/runtime-visibility'
import { SearchSkeleton } from '@/components/skeletons'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'

const PathwayExplorerClient = dynamic(
  () => import('../../../src/components/pathways/PathwayExplorerClient'),
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
    <div className='mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10'>
      <AuthorityJsonLd
        title="Biological Pathway Connectivity Explorer"
        description="Interact with neurochemical targets and find modulating herbs and compounds sorted by scientific evidence certainty."
        url="https://thehippiescientist.net/learn/explorer"
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

      <section className='grid gap-4 md:grid-cols-3' aria-label='How to read pathway relationships'>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
          <h2 className='text-base font-bold text-ink'>Mechanism is not the same as outcome</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>
            A compound can interact with a receptor, enzyme, transporter, or pathway without producing a predictable real-world effect in every person. The explorer is best used to understand plausible directions of action before reading the full evidence profile.
          </p>
        </article>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
          <h2 className='text-base font-bold text-ink'>Look for converging signals</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>
            Stronger confidence usually comes from multiple signals pointing the same direction: mechanism data, human trials, safety history, dose realism, and practical fit. A pathway match alone should not be treated as proof of benefit.
          </p>
        </article>
        <article className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
          <h2 className='text-base font-bold text-ink'>Use caution with stacking</h2>
          <p className='mt-2 text-sm leading-6 text-muted'>
            If several ingredients influence the same pathway, the combined effect can be stronger than expected. This matters most for sedating, stimulating, serotonergic, blood-pressure, anticoagulant, and liver-metabolism patterns.
          </p>
        </article>
      </section>

      <section className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm'>
        <h2 className='text-xl font-bold tracking-tight text-ink'>How this explorer fits into the evidence workflow</h2>
        <div className='mt-4 space-y-4 text-sm leading-7 text-muted'>
          <p>
            Pathway maps are useful for discovery, but they are only one layer of supplement evaluation. A GABA, dopamine, serotonin, acetylcholine, inflammation, or stress-response connection tells you where to investigate next; it does not tell you whether a product is effective, safe, or appropriately dosed.
          </p>
          <p>
            Use the explorer to generate better questions: which profiles share similar mechanisms, which ingredients might duplicate each other in a stack, which safety warnings should be checked, and which pages deserve deeper reading before buying or combining anything.
          </p>
        </div>
      </section>

      <PathwayExplorerClient herbs={herbs} compounds={compounds} />
    </div>
  )
}
