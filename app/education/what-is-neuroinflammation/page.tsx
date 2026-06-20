import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import MisconceptionCallout from '@/components/evidence/MisconceptionCallout'
import ResearchLimitations from '@/components/evidence/ResearchLimitations'
import ReferencedStudies from '@/components/evidence/ReferencedStudies'
import SafetyNotice from '@/components/evidence/SafetyNotice'
export const metadata: Metadata = buildPageMetadata({
  title: "What Is Neuroinflammation?",
  description: "Educational exploration of neuroinflammation, stress-response biology, nervous-system signaling, cognition systems, and recovery-oriented neuropharmacology.",
  path: "/education/what-is-neuroinflammation/",
})


const sections = [
  {
    title: 'Stress-Response Burden',
    body: 'Chronic stress signaling may influence inflammatory pathways, nervous-system regulation, sleep continuity, fatigue systems, cognition resilience, emotional processing, and recovery-oriented neurobiology.',
  },
  {
    title: 'Cognition and Brain Fog',
    body: 'Educational neuroinflammation discussions commonly intersect with concentration difficulties, cognitive fatigue, stress overload, emotional exhaustion, attentional disruption, and recovery-oriented neuropharmacology.',
  },
  {
    title: 'Sleep and Recovery Systems',
    body: 'Sleep architecture, nervous-system restoration, immune signaling, emotional regulation, glymphatic clearance systems, and recovery continuity may all interact with inflammatory neurobiology.',
  },
]

const relatedSystems = [
  {
    href: '/goals/stress',
    title: 'Burnout Recovery',
  },
  {
    href: '/goals/stress',
    title: 'Stress Regulation',
  },
  {
    href: '/education/what-are-adaptogens',
    title: 'Adaptogens',
  },
  {
    href: '/education/glutamate',
    title: 'Glutamate Pathway',
  },
]

const faqItems = [
  {
    question: 'Is neuroinflammation the same as ordinary inflammation?',
    answer:
      'Neuroinflammation generally refers to inflammatory signaling associated with nervous-system and brain-related immune activity. Educational discussions often involve microglial signaling, immune communication, stress biology, and nervous-system regulation.',
  },
  {
    question: 'Does neuroinflammation explain every mental-health symptom?',
    answer:
      'No. Emotional regulation, cognition, fatigue systems, and psychiatric symptoms involve complex interacting biological, psychological, behavioral, social, and environmental influences.',
  },
  {
    question: 'Why is neuroinflammation discussed so often online?',
    answer:
      'Neuroinflammation has become a popular systems-biology topic because inflammatory signaling may intersect with stress physiology, fatigue systems, cognition continuity, recovery biology, and nervous-system regulation. However, online discussions sometimes exaggerate mechanistic certainty.',
  },
]

export default function NeuroinflammationEducationPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="What Is Neuroinflammation?"
        description="Educational exploration of neuroinflammation, stress-response biology, nervous-system signaling, cognition systems, and recovery-oriented neuropharmacology."
        url="https://thehippiescientist.net/education/what-is-neuroinflammation"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'What Is Neuroinflammation?' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Educational Supernode</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            What Is Neuroinflammation?
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Neuroinflammation refers to inflammatory signaling processes associated with nervous-system and brain-related immune activity. Educational exploration of neuroinflammation often intersects with stress biology, fatigue systems, cognition continuity, emotional processing, sleep recovery, and nervous-system regulation.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Neuroinflammatory discussions are biologically complex and highly context dependent. Educational interpretation should remain conservative, evidence aware, systems oriented, and cautious regarding exaggerated mechanistic claims.
        </p>
      </section>

      <MisconceptionCallout
        myth="Neuroinflammation explains every mental-health or cognition problem"
        reality="Inflammatory signaling may intersect with emotional regulation, fatigue systems, cognition continuity, recovery biology, and stress physiology, but human neurobiology remains highly complex and cannot usually be reduced to a single explanatory mechanism."
      />

      <EvidenceSummaryCard
        title="Neuroinflammation and nervous-system signaling"
        evidenceLevel="Moderate"
        humanEvidence="Human research increasingly investigates relationships between inflammatory signaling, stress burden, cognition changes, fatigue systems, sleep disruption, and emotional-processing continuity."
        mechanisticEvidence="Mechanistic models commonly involve immune signaling, microglial activation, stress physiology, oxidative stress systems, inflammatory mediators, and nervous-system regulation pathways."
        safetyProfile="Online neuroinflammation discussions frequently oversimplify evidence quality and mechanistic certainty. Biological variability and underlying medical causes should be considered carefully."
      />

      <section className="grid gap-6 lg:grid-cols-3">
        {sections.map((section) => (
          <div key={section.title} className="card-premium p-6 space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              {section.title}
            </h2>

            <p className="text-sm leading-7 text-[#46574d]">
              {section.body}
            </p>
          </div>
        ))}
      </section>

      <section className="card-premium p-8 space-y-6">
        <div className="space-y-2 max-w-3xl">
          <p className="eyebrow-label">Systems Biology Context</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Neuroinflammation intersects with broader recovery biology
          </h2>

          <p className="text-base leading-8 text-[#46574d]">
            Modern systems-biology discussions increasingly explore interactions between inflammatory signaling, stress-response continuity, mitochondrial function, nervous-system recovery, glymphatic clearance, fatigue systems, sleep restoration, and cognition resilience.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-black/5 bg-white/60 p-6 space-y-3">
            <h3 className="text-xl font-semibold text-ink">
              Frequently discussed mechanisms
            </h3>

            <ul className="space-y-2 text-sm leading-7 text-[#46574d]">
              <li>• Immune signaling pathways</li>
              <li>• Stress-response physiology</li>
              <li>• Oxidative stress systems</li>
              <li>• Nervous-system recovery biology</li>
              <li>• Sleep and glymphatic continuity</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white/60 p-6 space-y-3">
            <h3 className="text-xl font-semibold text-ink">
              Major evidence limitations
            </h3>

            <ul className="space-y-2 text-sm leading-7 text-[#46574d]">
              <li>• Difficult human measurement systems</li>
              <li>• Mechanistic uncertainty</li>
              <li>• High individual variability</li>
              <li>• Translational limitations</li>
              <li>• Correlation vs causation issues</li>
            </ul>
          </div>
        </div>
      </section>

      <SafetyNotice>
        Persistent severe fatigue, cognitive decline, neurological symptoms, chronic inflammatory conditions, or significant mental-health symptoms should be evaluated appropriately. Educational content is not a substitute for individualized medical care.
      </SafetyNotice>

      <ResearchLimitations
        limitations={[
          'Neuroinflammatory signaling remains incompletely understood.',
          'Human inflammatory biomarkers are difficult to interpret in isolation.',
          'Online discussions often exaggerate certainty regarding mechanisms.',
          'Multiple overlapping biological systems may influence subjective symptoms.',
        ]}
      />

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="eyebrow-label">Educational FAQ</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Common neuroinflammation questions
          </h2>
        </div>

        <div className="grid gap-5">
          {faqItems.map((item) => (
            <div key={item.question} className="card-premium p-6 space-y-3">
              <h3 className="text-xl font-semibold tracking-tight text-ink">
                {item.question}
              </h3>

              <p className="text-sm leading-7 text-[#46574d]">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow-label">Related Educational Systems</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Continue exploring recovery-oriented neuropharmacology
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {relatedSystems.map((system) => (
            <Link
              key={system.href}
              href={system.href}
              className="card-premium p-6 transition hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <p className="eyebrow-label">Related System</p>

                <h3 className="text-2xl font-semibold tracking-tight text-ink">
                  {system.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ReferencedStudies
        studies={[
          {
            title: 'National Institute of Neurological Disorders and Stroke',
            href: 'https://www.ninds.nih.gov/',
            source: 'NINDS',
          },
          {
            title: 'PubMed Neuroinflammation Research',
            href: 'https://pubmed.ncbi.nlm.nih.gov/',
            source: 'NIH / PubMed',
          },
        ]}
      />
    </main>
  )
}
