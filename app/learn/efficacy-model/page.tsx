import type { Metadata } from 'next'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import EfficacyModelerClient from '../../../src/components/education/EfficacyModelerClient'

export const metadata: Metadata = {
  title: 'Supplement Efficacy & Pharmacokinetics Modeler',
  description:
    'Simulate absorption onset, peak action, half-life clearance timelines, and cumulative build-up curves for herbs and compounds.',
  alternates: { canonical: '/learn/efficacy-model/' },
}

export default function EfficacyModelPage() {
  return (
    <div className='container-page py-10 space-y-12'>
      {/* Authority Structured Data */}
      <AuthorityJsonLd
        title='Interactive Supplement Efficacy Modeler & Pharmacokinetics Visualizer'
        description='Simulate pharmacokinetic timeline curves, including absorption onset, peak action, clearance half-lives, and cumulative build-up patterns for key herbs and compounds.'
        url='https://thehippiescientist.net/learn/efficacy-model'
        type='MedicalWebPage'
      />

      {/* Header Section */}
      <section className='space-y-4 max-w-4xl'>
        <p className='eyebrow-label'>Decision Support Tools</p>
        <h1 className='text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl'>
          Interactive Efficacy Modeler
        </h1>
        <p className='text-base leading-8 text-muted text-reading'>
          Model pharmacokinetic curves, onset timings, peak impact intervals, and elimination half-lives. Adjust supplement dosages below to simulate biological thresholds and resolve verified sourcing channels.
        </p>
      </section>

      {/* Modeler Core Client Component */}
      <section className='card-premium p-6 sm:p-8'>
        <EfficacyModelerClient />
      </section>
    </div>
  )
}
