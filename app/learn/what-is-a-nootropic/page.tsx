import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import EducationPageLayout from '@/components/layouts/EducationPageLayout'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import MisconceptionCallout from '@/components/evidence/MisconceptionCallout'
import ResearchLimitations from '@/components/evidence/ResearchLimitations'
import ReferencedStudies from '@/components/evidence/ReferencedStudies'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import RelatedEducationSystems from '@/components/education/related-education-systems'
import References from '@/components/References'
export const metadata: Metadata = buildPageMetadata({
  title: "What Is a Nootropic?",
  description: "Educational introduction to nootropics, cognition-oriented compounds, focus systems, neuropharmacology, and cognitive support.",
  path: "/learn/what-is-a-nootropic/",
})


const systems = [
  {
    href: '/guides/focus',
    title: 'Non-Stimulant Focus',
    description: 'Recovery-oriented focus systems emphasizing attentional continuity and calm cognition.',
  },
  {
    href: '/learn/dopamine',
    title: 'Dopamine Pathway',
    description: 'Educational exploration of motivational signaling, salience systems, and neuropharmacology.',
  },
  {
    href: '/compounds/l-theanine',
    title: 'L-Theanine',
    description: 'Evidence-informed calm-focus compound frequently discussed in cognition-support ecosystems.',
  },
  {
    href: '/learn/scientific-but-human-neuroscience',
    title: 'Scientific But Human Neuroscience',
    description: 'Contextual neuroscience framework emphasizing sustainable cognition and emotional complexity.',
  },
]

const mechanisms = [
  {
    title: 'Attention and Executive Function',
    body: 'Nootropic discussions commonly involve attentional filtering, executive-function systems, working memory, motivational signaling, cognition continuity, and task-oriented mental performance.',
  },
  {
    title: 'Stress and Cognitive Fatigue',
    body: 'Cognition-oriented compounds are frequently explored in relation to stress resilience, burnout neurobiology, emotional regulation, cognitive fatigue, recovery continuity, and sleep-dependent performance systems.',
  },
  {
    title: 'Neuropharmacology and Stimulation',
    body: 'Educational nootropic exploration may intersect with dopaminergic signaling, cholinergic systems, glutamatergic pathways, arousal regulation, stimulant neurobiology, and overstimulation risk management.',
  },
]

const faqItems = [
  {
    question: 'Do nootropics increase intelligence?',
    answer:
      'Nootropic discussions commonly involve focus systems, alertness, cognition continuity, or fatigue management rather than guaranteed intelligence enhancement. Human cognition remains influenced by sleep quality, stress burden, emotional regulation, environment, education, and overall health.',
  },
  {
    question: 'Are all nootropics stimulants?',
    answer:
      'No. Some nootropics are stimulating while others are explored for calm-focus systems, stress resilience, recovery continuity, emotional regulation, or sleep-supportive cognition strategies.',
  },
  {
    question: 'Why are nootropic claims often exaggerated online?',
    answer:
      'Online nootropic discussions frequently oversimplify neuroscience, exaggerate mechanistic certainty, ignore individual variability, or frame preliminary evidence as definitive cognitive enhancement.',
  },
]

const WHAT_IS_A_NOOTROPIC_REFS = [
  { n: 1, text: 'Froestl W, et al. (2012). Cognitive enhancers. J Alzheimers Dis, 29(4): 729-750.', url: 'https://pubmed.ncbi.nlm.nih.gov/22366771/' },
  { n: 2, text: 'Pase MP, et al. (2012). Bacopa for cognition. J Altern Complement Med, 18(7): 647-652.', url: 'https://pubmed.ncbi.nlm.nih.gov/22747190/' },
]

export default function NootropicEducationPage() {
  return (
    <>
      <AuthorityJsonLd
        title='What Is a Nootropic?'
        description='Educational introduction to nootropics, cognition-oriented compounds, focus systems, neuropharmacology, and cognitive support.'
        url='https://thehippiescientist.net/learn/what-is-a-nootropic'
        type='Article'
        faqItems={faqItems}
      />

      <EducationPageLayout
        title='What Is a Nootropic?'
        description='Nootropics are compounds, herbs, or substances associated with cognition-oriented systems including focus continuity, memory formation, attentional regulation, motivation signaling, alertness, executive function, and mental performance.'
      >
      <section className='space-y-5 max-w-4xl'>
        <p className='text-base leading-8 text-[#5c6b63]'>
          Educational nootropic exploration commonly intersects with
          neuropharmacology, stress-aware cognition systems, sleep-dependent
          recovery biology, stimulant neurochemistry, emotional regulation,
          burnout physiology, and evidence-oriented interpretation.
        </p>
      </section>

      <MisconceptionCallout
        myth='Nootropics reliably create intelligence or unlimited productivity'
        reality='Human cognition depends on interacting systems including sleep quality, stress resilience, emotional regulation, nutrition, recovery biology, education, environment, nervous-system health, and individual variability. Cognitive enhancement narratives are often oversimplified online.'
      />

      <EvidenceSummaryCard
        title='Nootropics and cognition-oriented neuropharmacology'
        evidenceLevel='Moderate'
        humanEvidence='Some nootropic compounds have human evidence associated with focus continuity, attentional systems, fatigue management, or cognition support, though evidence quality varies substantially between compounds.'
        mechanisticEvidence='Mechanistic models commonly involve dopaminergic signaling, cholinergic systems, glutamatergic pathways, arousal regulation, stress-response continuity, and executive-function neurobiology.'
        safetyProfile='Cognition-oriented compounds may involve overstimulation risks, sleep disruption, anxiety exacerbation, cardiovascular effects, tolerance concerns, emotional dysregulation, or interaction risks depending on the compound.'
      />

      <section className='grid gap-6 lg:grid-cols-3'>
        {mechanisms.map(mechanism => (
          <div key={mechanism.title} className='card-premium p-6 space-y-4'>
            <h2 className='text-2xl font-semibold tracking-tight text-ink'>
              {mechanism.title}
            </h2>

            <p className='text-sm leading-7 text-muted'>
              {mechanism.body}
            </p>
          </div>
        ))}
      </section>

      <section className='card-premium p-8 space-y-6'>
        <div className='space-y-2 max-w-3xl'>
          <p className='eyebrow-label'>Educational Context</p>

          <h2 className='text-3xl font-semibold tracking-tight text-ink'>
            Cognition involves tradeoffs and state-dependent performance
          </h2>

          <p className='text-base leading-8 text-muted'>
            Focus continuity, memory formation, productivity, motivation systems,
            and cognitive endurance are influenced by stress physiology,
            emotional regulation, recovery biology, sleep continuity,
            nervous-system resilience, and environmental context rather than
            isolated neurotransmitter explanations.
          </p>
        </div>
      </section>

      <SafetyNotice>
        Excessive stimulant exposure, chronic sleep disruption, burnout, severe
        anxiety symptoms, or compulsive productivity behaviors may negatively
        affect cognition continuity and nervous-system resilience. Educational
        content is not a substitute for individualized medical guidance.
      </SafetyNotice>

      <ResearchLimitations
        limitations={[
          'Human cognition remains biologically and psychologically complex.',
          'Mechanistic evidence may not reliably predict real-world cognitive outcomes.',
          'Online nootropic discussions frequently exaggerate certainty and efficacy.',
          'Different compounds may involve substantially different safety profiles and evidence quality.',
        ]}
      />

      <section className='space-y-6'>
        <div className='space-y-2'>
          <p className='eyebrow-label'>Educational FAQ</p>

          <h2 className='text-3xl font-semibold tracking-tight text-ink'>
            Common nootropic questions
          </h2>
        </div>

        <div className='grid gap-5'>
          {faqItems.map(item => (
            <div key={item.question} className='card-premium p-6 space-y-3'>
              <h3 className='text-xl font-semibold tracking-tight text-ink'>
                {item.question}
              </h3>

              <p className='text-sm leading-7 text-muted'>
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      <RelatedEducationSystems
        title='Continue exploring cognition systems'
        systems={systems}
      />

      <ReferencedStudies
        studies={[
          {
            title: 'National Center for Complementary and Integrative Health',
            href: 'https://www.nccih.nih.gov/',
            source: 'NCCIH',
          },
          {
            title: 'PubMed Cognition Research',
            href: 'https://pubmed.ncbi.nlm.nih.gov/',
            source: 'NIH / PubMed',
          },
        ]}
      />
      <References refs={WHAT_IS_A_NOOTROPIC_REFS} />
      </EducationPageLayout>
    </>
  )
}
