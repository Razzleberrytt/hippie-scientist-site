import type { Metadata } from 'next'
import { getHerbs, getCompounds } from '@/lib/runtime-data'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import RelationalGraphClient from '@/components/graph/RelationalGraphClient'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'

export const metadata: Metadata = {
  title: 'Biological Relational Knowledge Graph Explorer | The Hippie Scientist',
  description: 'Explore neurochemical pathways, biological target networks, and evidence confidence certitude mappings for cognitive and wellness objectives.',
  robots: { index: false, follow: true },
}

export default async function ExploreGraphPage() {
  const [rawHerbs, rawCompounds] = await Promise.all([getHerbs(), getCompounds()])

  const herbs = rawHerbs.filter((h: any) => {
    try {
      return getRuntimeVisibility(h).canRender
    } catch {
      return true
    }
  })

  const compounds = rawCompounds.filter((c: any) => {
    try {
      return getRuntimeVisibility(c).canRender
    } catch {
      return true
    }
  })

  return (
    <main className='mx-auto max-w-7xl space-y-8 px-4 py-8 sm:py-10'>
      <AuthorityJsonLd
        title="Biological Relational Knowledge Graph Explorer"
        description="Navigate the scientific connections between cognitive/wellness goals, neurochemical targets, and evidence-supported botanicals."
        url="https://thehippiescientist.net/explore/graph"
        type="MedicalWebPage"
      />

      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-4'>
        <p className='eyebrow-label'>Semantic Explore Hub</p>
        <h1 className='text-3xl font-bold tracking-tight text-ink sm:text-5xl mt-2'>
          Biological Relational Graph
        </h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>
          Navigate herbs and compounds through their underlying pathways (GABAergic, Cholinergic, Dopaminergic, Serotonergic, etc.), GRADE evidence certitude ratings, and pharmacological synergy profiles.
        </p>
      </section>

      <RelationalGraphClient herbs={herbs} compounds={compounds} />

      <section className='rounded-2xl border border-brand-900/15 bg-slate-50 p-5 text-xs leading-relaxed text-slate-600'>
        <p className='font-bold text-slate-800'>Methodology & GRADE Classification:</p>
        <p className='mt-1.5'>
          Our mapping relates cognitive and physiological objectives to specific biochemical targets. Evidence certainty is rated on the GRADE scale, distinguishing between high-certitude human RCTs and preclinical or in-vitro datasets. Synergistic pairing maps indicate well-documented combinations (e.g. L-Theanine and Caffeine) that improve efficacy or reduce unwanted side-effects.
        </p>
      </section>
    </main>
  )
}
