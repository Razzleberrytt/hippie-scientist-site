import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import MechanismCard from '@/components/evidence/MechanismCard'
import SafetyNotice from '@/components/evidence/SafetyNotice'
import ReferencedStudies from '@/components/evidence/ReferencedStudies'

export default function PsychoactivePerceptionPage() {
  return (
    <main className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="How Psychoactive Substances Affect Perception"
        description="Educational exploration of psychoactive perception, neurochemical signaling, altered states, sensory processing, and neuropharmacology."
        url="https://thehippiescientist.net/education/how-psychoactive-substances-affect-perception"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'How Psychoactive Substances Affect Perception' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Psychoactive Neuropharmacology</p>

          <h1 className="text-5xl font-bold tracking-tight text-ink">
            How Psychoactive Substances Affect Perception
          </h1>
        </div>

        <p className="text-xl leading-9 text-[#46574d]">
          Psychoactive substances may influence perception through interactions with signaling systems associated with sensory processing, emotional interpretation, cognition, altered states, and neurochemical modulation.
        </p>

        <p className="text-base leading-8 text-[#5c6b63]">
          Educational psychoactive discussions commonly intersect with serotonergic signaling, glutamatergic systems, receptor modulation, expectancy effects, environmental context, and subjective variability.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <MechanismCard
          title="Sensory processing"
          description="Psychoactive systems may influence how sensory information is processed, filtered, interpreted, and emotionally contextualized."
          pathway="Serotonin"
        />

        <MechanismCard
          title="Altered-state neurochemistry"
          description="Altered states may involve interconnected signaling systems associated with cognition, emotional processing, perception, and environmental interpretation."
          pathway="Glutamate"
        />

        <MechanismCard
          title="Context and expectancy"
          description="Mindset, environment, prior experience, and expectancy may substantially influence subjective psychoactive experiences."
          pathway="Integrated systems"
        />
      </section>

      <SafetyNotice>
        Psychoactive substances may involve substantial individual variability, interaction risks, emotional intensity, perceptual changes, and psychological unpredictability. Educational interpretation should remain conservative and safety aware.
      </SafetyNotice>

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
    </main>
  )
}
