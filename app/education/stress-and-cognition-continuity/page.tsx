import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import HumanVsMechanisticEvidence from '@/components/evidence/HumanVsMechanisticEvidence'
import TranslationalLimitationsCard from '@/components/evidence/TranslationalLimitationsCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import RelatedEducationSystems from '@/components/education/related-education-systems'
export const metadata: Metadata = buildPageMetadata({
  title: "Stress and Cognition Continuity",
  description: "Educational exploration of stress physiology, recovery continuity, attentional resilience, and sustainable cognition systems.",
  path: "/education/stress-and-cognition-continuity/",
})


const systems = [
  {
    title: 'Stress Physiology',
    body: 'Stress physiology may influence attentional filtering, emotional regulation, nervous-system stability, sleep continuity, cognition flexibility, and subjective mental performance.',
  },
  {
    title: 'Recovery Continuity',
    body: 'Recovery biology, emotional restoration, sleep quality, nervous-system downregulation, and sustainable pacing may support cognition resilience over time.',
  },
  {
    title: 'Contextual Neurobiology',
    body: 'Human cognition may emerge from interactions between stress systems, environmental context, emotional salience, recovery continuity, perception systems, and biological variability.',
  },
]

const faqs = [
  {
    question: 'Why can stress impair cognition?',
    answer: 'Stress overload may influence attentional stability, emotional regulation, sleep continuity, cognition flexibility, nervous-system balance, and recovery systems.',
  },
  {
    question: 'Why does recovery matter for cognition continuity?',
    answer: 'Recovery continuity may support attentional resilience, emotional stability, stress regulation, nervous-system restoration, and sustainable cognition systems.',
  },
  {
    question: 'Why do stress responses vary between people?',
    answer: 'Human experiences may differ because of contextual neurobiology, emotional regulation, recovery systems, sleep continuity, medications, environmental context, and biological variability.',
  },
]

const relatedSystems = [
  {
    href: '/goals/stress',
    title: 'Burnout Recovery',
  },
  {
    href: '/goals/stress',
    title: 'Recovery-Oriented Productivity',
  },
  {
    href: '/education/why-fatigue-is-biologically-complex',
    title: 'Fatigue Complexity',
  },
  {
    href: '/goals/focus',
    title: 'Recovery-Oriented Cognition Systems',
  },
]

export default function StressAndCognitionContinuityPage() {
  return (
    <div className='container-page py-10 space-y-12'>
      <AuthorityJsonLd
        title='Stress and Cognition Continuity'
        description='Educational exploration of stress physiology, recovery continuity, attentional resilience, and sustainable cognition systems.'
        url='https://thehippiescientist.net/education/stress-and-cognition-continuity'
        type='Article'
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Stress and Cognition Continuity' },
        ]}
      />

      <section className='space-y-6 max-w-4xl'>
        <div className='space-y-3'>
          <p className='eyebrow-label'>Recovery-Oriented Neuroscience</p>
          <h1 className='font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl'>
            Stress and Cognition Continuity
          </h1>
        </div>

        <p className='text-xl leading-9 text-[#46574d]'>
          Human cognition may depend heavily on stress regulation, recovery
          continuity, emotional stability, sleep quality, nervous-system
          resilience, and contextual neurobiology rather than isolated
          productivity intensity alone.
        </p>
      </section>

      <EvidenceSummaryCard
        title='Stress physiology and cognition resilience'
        evidenceLevel='Strong'
        humanEvidence='Human research increasingly investigates relationships between stress physiology, emotional regulation, sleep continuity, attentional resilience, burnout systems, and cognition sustainability.'
        mechanisticEvidence='Mechanistic models commonly involve autonomic regulation, emotional salience pathways, stress-response systems, inflammatory signaling, and attentional neurobiology.'
        safetyProfile='Chronic stress overload, hyperarousal, severe sleep disruption, emotional exhaustion, and nervous-system strain may negatively influence cognition continuity and recovery systems.'
      />

      <section className='grid gap-6 lg:grid-cols-3'>
        {systems.map(system => (
          <div key={system.title} className='card-premium p-6 space-y-4'>
            <h2 className='text-2xl font-semibold tracking-tight text-ink'>
              {system.title}
            </h2>

            <p className='text-sm leading-7 text-[#46574d]'>
              {system.body}
            </p>
          </div>
        ))}
      </section>

      <HumanVsMechanisticEvidence />
      <TranslationalLimitationsCard />

      <section className='space-y-6'>
        <div className='space-y-2'>
          <p className='eyebrow-label'>Educational FAQ</p>
          <h2 className='text-3xl font-semibold tracking-tight text-ink'>
            Common stress and cognition questions
          </h2>
        </div>

        <div className='grid gap-5'>
          {faqs.map(faq => (
            <div key={faq.question} className='card-premium p-6 space-y-3'>
              <h3 className='text-xl font-semibold tracking-tight text-ink'>
                {faq.question}
              </h3>

              <p className='text-sm leading-7 text-[#46574d]'>
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      <SafetyNotice>
        Persistent exhaustion, severe emotional distress, chronic sleep
        disruption, or major cognition difficulties should be evaluated
        appropriately. Educational content is not a substitute for individualized
        medical guidance.
      </SafetyNotice>

      <RelatedEducationSystems
        title='Continue exploring recovery-oriented neuroscience'
        systems={relatedSystems}
      />
    </div>
  )
}
