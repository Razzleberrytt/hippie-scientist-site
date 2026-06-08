import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import HumanVsMechanisticEvidence from '@/components/evidence/HumanVsMechanisticEvidence'
import TranslationalLimitationsCard from '@/components/evidence/TranslationalLimitationsCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import RelatedEducationSystems from '@/components/education/related-education-systems'

const principles = [
  {
    title: 'Scientific Literacy',
    body: 'Neuroscience and physiology are highly complex systems involving stress regulation, sleep continuity, emotional salience, attentional processing, environmental context, and biological variability.',
  },
  {
    title: 'Human Context',
    body: 'Human experiences are influenced by substantially more than isolated neurotransmitter explanations. Recovery systems, emotional regulation, context, stress physiology, and nervous-system sensitivity may all matter.',
  },
  {
    title: 'Sustainable Cognition',
    body: 'Recovery-oriented neuroscience may support calmer attentional continuity, emotional stability, nervous-system resilience, and sustainable cognition rather than perpetual hyperstimulation.',
  },
]

const faqs = [
  {
    question: 'What does scientific but human mean?',
    answer: 'Scientific but human neuroscience emphasizes evidence-informed interpretation while recognizing emotional context, biological variability, subjective experiences, stress physiology, and recovery-oriented cognition systems.',
  },
  {
    question: 'Why avoid oversimplified neuroscience?',
    answer: 'Reductionist explanations may flatten biological complexity and ignore contextual neurobiology, emotional regulation, recovery systems, environmental influences, and human variability.',
  },
  {
    question: 'Why emphasize recovery-oriented cognition?',
    answer: 'Sustainable cognition may depend heavily on sleep continuity, emotional regulation, stress resilience, nervous-system restoration, and calm attentional continuity over time.',
  },
]

const relatedSystems = [
  {
    href: '/education/why-neuroscience-is-difficult',
    title: 'Why Neuroscience Is Difficult',
  },
  {
    href: '/education/stress-and-cognition-continuity',
    title: 'Stress and Cognition Continuity',
  },
  {
    href: '/goals/focus',
    title: 'Recovery-Oriented Cognition Systems',
  },
  {
    href: '/education/why-online-supplement-claims-spread',
    title: 'Why Online Supplement Claims Spread',
  },
  {
    href: '/education/placebo-and-context-effects',
    title: 'Placebo and Context Effects',
  },
  {
    href: '/education/why-individual-variability-matters',
    title: 'Individual Variability',
  },
]

export default function ScientificButHumanNeurosciencePage() {
  return (
    <main className='container-page py-10 space-y-12'>
      <AuthorityJsonLd
        title='Scientific But Human Neuroscience'
        description='Authority hub exploring scientific literacy, contextual neurobiology, sustainable cognition, recovery-oriented neuroscience, and emotionally mature evidence interpretation.'
        url='https://thehippiescientist.net/education/scientific-but-human-neuroscience'
        type='Article'
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Scientific But Human Neuroscience' },
        ]}
      />

      <section className='space-y-6 max-w-5xl'>
        <div className='space-y-3'>
          <p className='eyebrow-label'>Platform Philosophy</p>
          <h1 className='text-5xl font-bold tracking-tight text-ink'>
            Scientific But Human Neuroscience
          </h1>
        </div>

        <p className='text-xl leading-9 text-[#46574d]'>
          Human cognition and emotional experiences may emerge from complex interactions
          between stress physiology, emotional regulation, recovery biology,
          attentional systems, environmental context, nervous-system sensitivity, and
          biological variability. Scientific literacy may become stronger when
          neuroscience remains both evidence-informed and emotionally human.
        </p>
      </section>

      <EvidenceSummaryCard
        title='Contextual neurobiology and sustainable cognition'
        evidenceLevel='Strong'
        humanEvidence='Human research increasingly investigates relationships between stress physiology, emotional regulation, recovery continuity, attentional resilience, environmental context, and cognition sustainability.'
        mechanisticEvidence='Mechanistic models commonly involve autonomic regulation, emotional salience pathways, attentional neurobiology, inflammatory signaling, stress-response systems, and contextual processing systems.'
        safetyProfile='Oversimplified neuroscience narratives may create misunderstanding about biological complexity, contextual variability, recovery systems, and subjective human experiences.'
      />

      <section className='grid gap-6 lg:grid-cols-3'>
        {principles.map(principle => (
          <div key={principle.title} className='card-premium p-6 space-y-4'>
            <h2 className='text-2xl font-semibold tracking-tight text-ink'>
              {principle.title}
            </h2>

            <p className='text-sm leading-7 text-[#46574d]'>
              {principle.body}
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
            Common philosophy and neuroscience questions
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
        Educational neuroscience content is not a substitute for individualized
        medical guidance, clinical evaluation, or mental-health
        support.
      </SafetyNotice>

      <RelatedEducationSystems
        title='Explore the broader neuroscience ecosystem'
        systems={relatedSystems}
      />
    </main>
  )
}
