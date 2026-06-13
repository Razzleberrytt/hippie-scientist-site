import type { Metadata } from 'next'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import SubstitutionEnginePanel from '@/components/sourcing/SubstitutionEnginePanel'

export const metadata: Metadata = {
  title: 'Interactive Botanical Substitution Engine & Alternative Stacking',
  description:
    'Explore safe supplement alternatives based on medical contraindications, stimulant sensitivity, or specific health conditions.',
}

export default function SubstitutionPage() {
  return (
    <div className='container-page py-10 space-y-12'>
      {/* Authority Structured Data */}
      <AuthorityJsonLd
        title='Interactive Botanical Substitution Engine & Alternative Stacking'
        description='Find safe supplement alternatives based on medical contraindications, stimulant sensitivity, thyroid conditions, or autoimmune concerns.'
        url='https://thehippiescientist.net/sourcing/substitution'
        type='MedicalWebPage'
      />

      {/* Header Section */}
      <section className='space-y-4 max-w-4xl'>
        <p className='eyebrow-label'>Sourcing & Safety Tools</p>
        <h1 className='text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl'>
          Botanical Substitution Engine
        </h1>
        <p className='text-base leading-8 text-[#46574d] text-reading'>
          Explore scientifically sound alternative ingredients when primary options are contraindicated due to caffeine sensitivity, thyroid conditions, or autoimmune concerns. Map your symptoms to find safe substitutions and verified products.
        </p>
      </section>

      {/* Substitution Engine Panel Core Component */}
      <section className='card-premium p-6 sm:p-8'>
        <SubstitutionEnginePanel />
      </section>
    </div>
  )
}
