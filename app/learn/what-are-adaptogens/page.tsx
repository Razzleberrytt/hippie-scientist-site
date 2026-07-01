import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import MisconceptionCallout from '@/components/evidence/MisconceptionCallout'
import ResearchLimitations from '@/components/evidence/ResearchLimitations'
import ReferencedStudies from '@/components/evidence/ReferencedStudies'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import RelatedEducationSystems from '@/components/education/related-education-systems'
export const metadata: Metadata = buildPageMetadata({
  title: "What Are Adaptogens?",
  description: "Educational introduction to adaptogens, stress-response systems, nervous-system regulation, and evidence-informed adaptogenic neuropharmacology.",
  path: "/learn/what-are-adaptogens/",
})


const systems = [
  {
    href: '/guides/anxiety',
    title: 'Stress Regulation',
    description: 'Educational exploration of stress-response continuity, nervous-system resilience, and recovery biology.',
  },
  {
    href: '/guides/anxiety',
    title: 'Burnout Recovery',
    description: 'Recovery-oriented protocol ecosystem focused on fatigue, emotional regulation, and resilience.',
  },
  {
    href: '/herbs/rhodiola',
    title: 'Rhodiola',
    description: 'Adaptogenic herb frequently explored for stress resilience, fatigue systems, and cognition continuity.',
  },
  {
    href: '/learn/cognitive-resilience-systems',
    title: 'Cognitive Resilience Systems',
    description: 'Authority hub exploring sustainable cognition, attentional resilience, and recovery continuity.',
  },
]

const mechanisms = [
  {
    title: 'Stress-Response Regulation',
    body: 'Adaptogen discussions commonly involve hypothalamic-pituitary-adrenal signaling, cortisol continuity, autonomic stress regulation, emotional resilience systems, and fatigue adaptation pathways.',
  },
  {
    title: 'Fatigue and Recovery',
    body: 'Adaptogenic herbs are often explored in relation to burnout neurobiology, recovery continuity, stress-related fatigue, sleep restoration, resilience physiology, and nervous-system recovery systems.',
  },
  {
    title: 'Cognition and Resilience',
    body: 'Some adaptogenic compounds are investigated for possible relationships with attentional continuity, cognitive fatigue, motivational signaling, emotional regulation, and physiological adaptation under stress burden.',
  },
]

const faqItems = [
  {
    question: 'Are adaptogens scientifically proven?',
    answer:
      'Some adaptogenic herbs have human clinical evidence associated with stress resilience and fatigue systems, but evidence quality differs substantially between compounds and many claims remain preliminary.',
  },
  {
    question: 'Do all adaptogens work the same way?',
    answer:
      'No. Adaptogenic herbs may involve different neurochemical systems, inflammatory pathways, endocrine interactions, autonomic signaling patterns, and pharmacological profiles.',
  },
  {
    question: 'Can adaptogens interact with medications?',
    answer:
      'Yes. Some adaptogenic herbs may influence endocrine systems, blood pressure, sleep physiology, mood regulation, immune signaling, or medication metabolism.',
  },
]

export default function AdaptogensEducationPage() {
  return (
    <div className='container-page py-10 space-y-12'>
      <AuthorityJsonLd
        title='What Are Adaptogens?'
        description='Educational introduction to adaptogens, stress-response systems, nervous-system regulation, and evidence-informed adaptogenic neuropharmacology.'
        url='https://thehippiescientist.net/learn/what-are-adaptogens'
        type='Article'
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/learn' },
          { label: 'What Are Adaptogens?' },
        ]}
      />

      <section className='space-y-5 max-w-4xl'>
        <p className='eyebrow-label'>Educational Supernode</p>

        <h1 className='font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl'>
          What Are Adaptogens?
        </h1>

        <p className='text-lg leading-8 text-muted'>
          Adaptogens are herbs and compounds associated with stress-response
          regulation, nervous-system resilience, fatigue recovery,
          neuroendocrine adaptation, emotional-processing continuity, and
          physiological stress adaptation systems.
        </p>

        <p className='text-base leading-8 text-[#5c6b63]'>
          Educational adaptogen exploration commonly intersects with cortisol
          biology, autonomic nervous-system signaling, burnout physiology,
          sleep recovery, fatigue neurobiology, inflammatory signaling, and
          neuropharmacology.
        </p>
      </section>

      <MisconceptionCallout
        myth='Adaptogens are scientifically proven cure-all herbs'
        reality='Adaptogens represent a broad educational category with varying evidence quality, heterogeneous mechanisms, incomplete standardization, and differing levels of human clinical support depending on the herb or compound being discussed.'
      />

      <EvidenceSummaryCard
        title='Adaptogens and stress resilience systems'
        evidenceLevel='Moderate'
        humanEvidence='Some adaptogenic herbs have human evidence associated with stress resilience, fatigue recovery, emotional regulation, and cognitive continuity, though evidence quality varies substantially by compound.'
        mechanisticEvidence='Mechanistic models commonly involve stress-response signaling, neuroendocrine adaptation, inflammatory biology, autonomic regulation, and nervous-system resilience pathways.'
        safetyProfile='Adaptogenic compounds are not universally interchangeable. Safety profiles, medication interactions, endocrine effects, and evidence quality may differ significantly between herbs.'
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
          <p className='eyebrow-label'>Scientific Context</p>

          <h2 className='text-3xl font-semibold tracking-tight text-ink'>
            Adaptogens intersect with broader resilience biology
          </h2>

          <p className='text-base leading-8 text-muted'>
            Modern adaptogen discussions frequently overlap with
            neuroinflammation research, mitochondrial stress adaptation,
            autonomic nervous-system flexibility, sleep restoration, fatigue
            physiology, and chronic stress signaling continuity.
          </p>
        </div>
      </section>

      <SafetyNotice>
        Adaptogenic herbs may interact with medications, endocrine systems,
        autoimmune conditions, sleep physiology, mood regulation, or
        cardiovascular signaling. Educational content should not replace
        individualized medical guidance.
      </SafetyNotice>

      <ResearchLimitations
        limitations={[
          'The adaptogen category is not uniformly defined across scientific literature.',
          'Many adaptogenic herbs have limited large-scale human trials.',
          'Standardization and extraction methods vary substantially between products.',
          'Mechanistic explanations may oversimplify complex stress physiology.',
        ]}
      />

      <section className='space-y-6'>
        <div className='space-y-2'>
          <p className='eyebrow-label'>Educational FAQ</p>

          <h2 className='text-3xl font-semibold tracking-tight text-ink'>
            Common adaptogen questions
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
        title='Continue exploring adaptogenic systems'
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
            title: 'PubMed Adaptogen Research',
            href: 'https://pubmed.ncbi.nlm.nih.gov/',
            source: 'NIH / PubMed',
          },
        ]}
      />
    </div>
  )
}
