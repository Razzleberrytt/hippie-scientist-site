import type { Metadata } from 'next'
import { getHerbs, getCompounds } from '../../../src/lib/runtime-data'
import { getRuntimeVisibility } from '../../../lib/runtime-visibility'
import StackBuilderClient from '../../../src/components/stacks/StackBuilderClient'

export const metadata: Metadata = {
  title: 'Interactive Supplement Stack Builder',
  description: 'Design and validate custom herb and compound stacks. Check for mechanism overlap, safety concerns, and target receptor redundancies in real time.',
  robots: { index: false, follow: true },
}

export default async function StackBuilderPage() {
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
      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
        <h1 className='text-3xl font-bold tracking-tight text-ink sm:text-5xl'>
          Interactive Supplement Stack Builder
        </h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>
          Design a custom supplement stack and dynamically audit target receptor overlaps, duplicate pathways, synergistic mechanisms, and safety warnings before choosing your options.
        </p>
      </section>

      <StackBuilderClient herbs={herbs} compounds={compounds} />
    </div>
  )
}
