import type { Metadata } from 'next'
import { getHerbs, getCompounds } from '@/lib/runtime-data'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import DynamicComparerClient from '@/components/compare/DynamicComparerClient'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'

export const metadata: Metadata = {
  title: 'Dynamic Ingredient Comparison Matrix',
  description: 'Select and compare any two herbs, compounds, or adaptogens side-by-side on evidence strength, mechanisms, safety profiles, and dosages.',
  robots: { index: false, follow: true },
}

export default async function DynamicComparePage() {
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
    <div className='mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10'>
      <AuthorityJsonLd
        title="Dynamic Ingredient Comparison Matrix"
        description="Side-by-side scientific comparison of herbs, compounds, and active extracts."
        url="https://www.thehippiescientist.net/compare/dynamic"
        type="MedicalWebPage"
      />

      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
        <p className='eyebrow-label'>Scientific Tradeoff Auditor</p>
        <h1 className='text-3xl font-bold tracking-tight text-ink sm:text-5xl mt-2'>
          Dynamic Comparison Matrix
        </h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>
          Audit potential options by choosing any two botanical extracts or compounds from our database. Compare safety profiles, receptor targets, evidence certitude, and standard preparations in real-time.
        </p>
      </section>

      <DynamicComparerClient herbs={herbs} compounds={compounds} />
    </div>
  )
}
