import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import MechanismCard from '@/components/evidence/MechanismCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import ReferencedStudies from '@/components/evidence/ReferencedStudies'
import ResearchLimitations from '@/components/evidence/ResearchLimitations'
import MisconceptionCallout from '@/components/evidence/MisconceptionCallout'
import EvidenceSummaryCard from '@/components/evidence/EvidenceSummaryCard'
import References from '@/components/References'
export const metadata: Metadata = buildPageMetadata({
  title: "How Psychoactive Substances Affect Perception",
  description: "Educational exploration of psychoactive perception, neurochemical signaling, altered states, sensory processing, and neuropharmacology.",
  path: "/learn/how-psychoactive-substances-affect-perception/",
})


const HOW_PSYCHOACTIVE_SUBSTANCES_AFFECT_PERCEPTION_REFS = [
  { n: 1, text: 'Carhart-Harris RL, et al. (2014). The entropic brain. Front Hum Neurosci, 8: 20.', url: 'https://pubmed.ncbi.nlm.nih.gov/24550805/' },
]

export default function PsychoactivePerceptionPage() {
  return (
    <div className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="How Psychoactive Substances Affect Perception"
        description="Educational exploration of psychoactive perception, neurochemical signaling, altered states, sensory processing, and neuropharmacology."
        url="https://thehippiescientist.net/learn/how-psychoactive-substances-affect-perception"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/learn' },
          { label: 'How Psychoactive Substances Affect Perception' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Psychoactive Neuropharmacology</p>

          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            How Psychoactive Substances Affect Perception
          </h1>
        </div>

        <p className="text-xl leading-9 text-muted">
          Psychoactive substances may influence perception through interactions with signaling systems associated with sensory processing, emotional interpretation, cognition, altered states, memory integration, and neurochemical modulation.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational psychoactive discussions commonly intersect with serotonergic signaling, glutamatergic systems, receptor modulation, expectancy effects, environmental context, emotional state, sleep continuity, and subjective variability. Modern neuropharmacology increasingly emphasizes systems interaction rather than simplistic one-receptor explanations.
        </p>
      </section>

      <MisconceptionCallout
        myth="Psychoactive experiences are completely predictable based on the substance alone"
        reality="Subjective experiences may vary substantially depending on mindset, environment, dosage, sleep continuity, stress burden, emotional state, prior experiences, neurochemical variability, and social context."
      />

      <EvidenceSummaryCard
        title="Psychoactive perception and neuropharmacology"
        evidenceLevel="Moderate"
        humanEvidence="Human psychoactive research demonstrates substantial variability in emotional intensity, sensory processing, perception changes, and subjective interpretation."
        mechanisticEvidence="Mechanistic evidence suggests altered states may involve serotonergic signaling, glutamatergic modulation, sensory filtering changes, and large-scale network interaction."
        safetyProfile="Psychoactive systems may involve psychological unpredictability, emotional intensity, interaction risks, perceptual distortion, and substantial individual variability."
      />

      <section className="grid gap-6 lg:grid-cols-3">
        <MechanismCard
          title="Sensory processing"
          description="Psychoactive systems may influence how sensory information is filtered, interpreted, emotionally contextualized, and integrated into conscious perception."
          pathway="Serotonin"
        />

        <MechanismCard
          title="Altered-state neurochemistry"
          description="Altered states may involve interconnected signaling systems associated with cognition, emotional processing, memory integration, perception, and environmental interpretation."
          pathway="Glutamate"
        />

        <MechanismCard
          title="Context and expectancy"
          description="Mindset, environment, expectations, emotional state, prior experiences, and social context may substantially influence subjective psychoactive experiences."
          pathway="Integrated systems"
        />
      </section>

      <SafetyNotice>
        Psychoactive substances may involve substantial individual variability, interaction risks, emotional intensity, perceptual changes, psychological unpredictability, and difficult subjective experiences. Educational interpretation should remain conservative, safety aware, and evidence informed.
      </SafetyNotice>

      <ResearchLimitations
        limitations={[
          'Subjective psychoactive experiences are difficult to standardize scientifically.',
          'Mechanistic theories may not fully explain conscious perception.',
          'Set and setting may strongly influence subjective interpretation.',
          'Long-term neuropsychological effects remain incompletely understood for many psychoactive systems.',
        ]}
      />

      <ReferencedStudies
        studies={[
          {
            title: 'National Institute on Drug Abuse',
            href: 'https://nida.nih.gov/',
            source: 'NIDA',
          },
          {
            title: 'PubMed Psychoactive Research',
            href: 'https://pubmed.ncbi.nlm.nih.gov/',
            source: 'NIH / PubMed',
          },
        ]}
      />
    </div>
  )
}
