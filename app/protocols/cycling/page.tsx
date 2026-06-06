import type { Metadata } from 'next'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import CyclingPlannerClient from '@/components/protocols/CyclingPlannerClient'

export const metadata: Metadata = {
  title: 'Supplement Tolerance Cycling Protocols & Washout Planner',
  description:
    'Plan off-cycle washout schedules and resensitization calendars for stimulants, adaptogens, and cognitive compounds.',
  robots: { index: false, follow: true },
}

export default function CyclingProtocolPage() {
  return (
    <main className='container-page py-10 space-y-12'>
      {/* Authority Structured Data */}
      <AuthorityJsonLd
        title='Supplement Tolerance Cycling Protocols & Washout Planner'
        description='Plan off-cycle washout schedules, receptor resensitization calendars, and substitution guidelines for coffee, adaptogens, and nootropic compounds.'
        url='https://thehippiescientist.net/protocols/cycling'
        type='MedicalWebPage'
      />

      {/* Header Section */}
      <section className='space-y-4 max-w-4xl'>
        <p className='eyebrow-label'>Clinical Protocols</p>
        <h1 className='text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl'>
          Tolerance Cycling & Washout Planner
        </h1>
        <p className='text-base leading-8 text-[#46574d] text-reading'>
          Receptor downregulation and chemical adaptation impair the efficiency of active ingredients over time. Explore scientific cycling schedules, customize washout durations, and manage resensitization checklists below.
        </p>
      </section>

      {/* Cycling Planner Client Component */}
      <section className='card-premium p-6 sm:p-8'>
        <CyclingPlannerClient />
      </section>
    </main>
  )
}
