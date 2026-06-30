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
  title: "Understanding Altered States",
  description: "Educational exploration of altered states, perception-oriented neurobiology, emotional processing, psychoactive context, and systems-oriented neuroscience.",
  path: "/learn/understanding-altered-states/",
})


const mechanisms = [
  {
    title: 'Perception and Sensory Processing',
    body: 'Altered-state discussions commonly involve sensory integration, attentional modulation, emotional intensity, environmental interpretation, cognition continuity, and perception-oriented neurobiology.',
  },
  {
    title: 'Emotional and Psychological Context',
    body: 'Psychological state, emotional regulation, stress burden, expectancy effects, prior experiences, trauma exposure, social environment, and contextual interpretation may substantially influence altered-state experiences.',
  },
  {
    title: 'Recovery and Integration',
    body: 'Sleep continuity, emotional processing, recovery-oriented neurobiology, stress regulation, social support systems, and reflective integration practices are frequently discussed in relation to intense altered experiences.',
  },
]

const relatedSystems = [
  {
    href: '/learn/why-set-and-setting-matter',
    title: 'Set and Setting',
  },
  {
    href: '/psychoactive',
    title: 'Psychoactive Education',
  },
  {
    href: '/learn/how-emotional-regulation-works',
    title: 'Emotional Regulation',
  },
  {
    href: '/learn/how-stress-affects-the-brain',
    title: 'Stress Neurobiology',
  },
]

const faqItems = [
  {
    question: 'What is an altered state?',
    answer:
      'Altered states generally refer to changes in perception, cognition continuity, emotional intensity, sensory processing, awareness, or consciousness-related experience compared with an individual’s typical waking state.',
  },
  {
    question: 'Are altered states always caused by psychoactive substances?',
    answer:
      'No. Altered states may also occur through meditation, sleep deprivation, intense stress, sensory overload, breathwork, trauma responses, illness, dreaming, or other physiological and psychological conditions.',
  },
  {
    question: 'Why do altered experiences vary so much between people?',
    answer:
      'Altered experiences may be influenced by psychological context, emotional regulation, stress physiology, environmental setting, prior experiences, sleep quality, nervous-system state, social dynamics, and individual biological variability.',
  },
]

export default function AlteredStatesEducationPage() {
  return (
    <div className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Understanding Altered States"
        description="Educational exploration of altered states, perception-oriented neurobiology, emotional processing, psychoactive context, and systems-oriented neuroscience."
        url="https://thehippiescientist.net/learn/understanding-altered-states"
        type="Article"
        faqItems={faqItems}
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/learn' },
          { label: 'Understanding Altered States' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Educational Supernode</p>

          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Understanding Altered States
          </h1>
        </div>

        <p className="text-xl leading-9 text-muted">
          Altered states involve changes in perception, cognition continuity, emotional intensity, sensory interpretation, awareness, and consciousness-related experience associated with complex psychological, neurochemical, environmental, and physiological interactions.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational altered-state discussions commonly intersect with psychoactive neuropharmacology, emotional regulation, stress physiology, expectancy effects, sensory-processing systems, sleep continuity, contextual interpretation, and systems-oriented neuroscience.
        </p>
      </section>

      <MisconceptionCallout
        myth="Altered states always produce enlightenment, insight, or personal growth"
        reality="Altered experiences may involve unpredictability, emotional intensity, confusion, anxiety, psychological distress, perceptual disruption, trauma-related activation, or difficult integration experiences depending on context and individual variability."
      />

      <EvidenceSummaryCard
        title="Altered states and perception-oriented neurobiology"
        evidenceLevel="Moderate"
        humanEvidence="Human research increasingly explores altered-state experiences in relation to emotional processing, perception changes, psychological context, sensory integration, and consciousness-related neuroscience."
        mechanisticEvidence="Mechanistic models commonly involve sensory-processing modulation, attentional changes, emotional salience systems, contextual interpretation, stress physiology, and psychoactive neuropharmacology."
        safetyProfile="Altered experiences may involve psychological unpredictability, emotional destabilization, stress amplification, traumatic activation, interaction risks, impaired judgment, or vulnerability-related concerns depending on the context."
      />

      <section className="grid gap-6 lg:grid-cols-3">
        {mechanisms.map((mechanism) => (
          <div key={mechanism.title} className="card-premium p-6 space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              {mechanism.title}
            </h2>

            <p className="text-sm leading-7 text-muted">
              {mechanism.body}
            </p>
          </div>
        ))}
      </section>

      <section className="card-premium p-8 space-y-6">
        <div className="space-y-2 max-w-3xl">
          <p className="eyebrow-label">Systems-Oriented Context</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Altered experiences are highly context dependent
          </h2>

          <p className="text-base leading-8 text-muted">
            Emotional state, stress burden, environment, social support, prior expectations, trauma exposure, sleep continuity, sensory conditions, and nervous-system resilience may all influence altered-state experiences and interpretation.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-black/5 bg-white/60 p-6 space-y-3">
            <h3 className="text-xl font-semibold text-ink">
              Commonly discussed altered-state systems
            </h3>

            <ul className="space-y-2 text-sm leading-7 text-muted">
              <li>• Sensory-processing modulation</li>
              <li>• Emotional salience systems</li>
              <li>• Contextual interpretation</li>
              <li>• Stress-response interaction</li>
              <li>• Perception continuity changes</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white/60 p-6 space-y-3">
            <h3 className="text-xl font-semibold text-ink">
              Major evidence limitations
            </h3>

            <ul className="space-y-2 text-sm leading-7 text-muted">
              <li>• Subjective variability</li>
              <li>• Difficult blinding conditions</li>
              <li>• Small clinical trial sizes</li>
              <li>• Long-term uncertainty</li>
              <li>• Complex psychological confounders</li>
            </ul>
          </div>
        </div>
      </section>

      <SafetyNotice>
        Intense altered experiences may involve psychological distress, panic reactions, trauma-related activation, emotional destabilization, impaired judgment, or vulnerability-related risks. Educational content is not a substitute for individualized medical or mental-health care.
      </SafetyNotice>

      <ResearchLimitations
        limitations={[
          'Altered-state neuroscience remains incompletely understood.',
          'Subjective consciousness experiences are difficult to standardize scientifically.',
          'Psychological and environmental variables may strongly influence outcomes.',
          'Online discussions frequently exaggerate certainty and transformative claims.',
        ]}
      />

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="eyebrow-label">Educational FAQ</p>

          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Common altered-state questions
          </h2>
        </div>

        <div className="grid gap-5">
          {faqItems.map((item) => (
            <div key={item.question} className="card-premium p-6 space-y-3">
              <h3 className="text-xl font-semibold tracking-tight text-ink">
                {item.question}
              </h3>

              <p className="text-sm leading-7 text-muted">
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
            Continue exploring psychoactive education systems
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {relatedSystems.map((system) => (
            <Link
              key={system.href}
              href={system.href}
              className="card-premium p-6 transition motion-safe:hover:-translate-y-0.5"
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
            title: 'National Institute of Mental Health',
            href: 'https://www.nimh.nih.gov/',
            source: 'NIMH',
          },
          {
            title: 'PubMed Consciousness Research',
            href: 'https://pubmed.ncbi.nlm.nih.gov/',
            source: 'NIH / PubMed',
          },
        ]}
      />
    </div>
  )
}
