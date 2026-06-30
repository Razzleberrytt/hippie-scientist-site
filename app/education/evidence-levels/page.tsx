import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import EvidenceBadge from '@/components/evidence/EvidenceBadge'
import ResearchLimitations from '@/components/evidence/ResearchLimitations'
export const metadata: Metadata = buildPageMetadata({
  title: "Understanding Evidence Levels",
  description: "Educational overview of evidence strength systems, human evidence prioritization, mechanistic evidence, and scientific interpretation methodology.",
  path: "/education/evidence-levels/",
})


const levels = [
  {
    level: 'Strong' as const,
    description:
      'Strong evidence generally includes human clinical trials, systematic reviews, meta-analyses, or substantial human evidence continuity.',
  },
  {
    level: 'Moderate' as const,
    description:
      'Moderate evidence may include smaller human studies, mechanistic support, or emerging clinical evidence.',
  },
  {
    level: 'Limited' as const,
    description:
      'Limited evidence often includes preliminary studies, sparse human data, or inconsistent findings.',
  },
  {
    level: 'Traditional' as const,
    description:
      'Traditional evidence reflects ethnobotanical or historical use without strong modern clinical validation.',
  },
  {
    level: 'Theoretical' as const,
    description:
      'Theoretical evidence generally reflects mechanistic speculation or limited supporting evidence.',
  },
]

export default function EvidenceLevelsPage() {
  return (
    <div className="container-page py-10 space-y-12">
      <AuthorityJsonLd
        title="Understanding Evidence Levels"
        description="Educational overview of evidence strength systems, human evidence prioritization, mechanistic evidence, and scientific interpretation methodology."
        url="https://thehippiescientist.net/education/evidence-levels"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Evidence Levels' },
        ]}
      />

      <section className="space-y-6 max-w-4xl">
        <div className="space-y-3">
          <p className="eyebrow-label">Evidence Methodology</p>

          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Understanding Evidence Levels
          </h1>
        </div>

        <p className="text-xl leading-9 text-muted">
          Educational evidence systems help contextualize how strongly a claim is supported by human trials, mechanistic neuropharmacology, ethnobotanical history, or preliminary scientific evidence.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {levels.map((item) => (
          <div key={item.level} className="card-premium p-6 space-y-5">
            <EvidenceBadge level={item.level} />

            <p className="text-base leading-8 text-muted">
              {item.description}
            </p>
          </div>
        ))}
      </section>

      <ResearchLimitations
        limitations={[
          'Human evidence quality varies substantially across herbs and compounds.',
          'Mechanistic plausibility alone does not establish clinical effectiveness.',
          'Traditional use does not guarantee safety or efficacy.',
          'Long-term safety data may be limited for many psychoactive systems.',
        ]}
      />
    </div>
  )
}
