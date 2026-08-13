import type { Metadata } from 'next'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import StudyDesignSnapshot from '@/components/evidence/StudyDesignSnapshot'
import References from '@/components/References'

export const metadata: Metadata = {
  title: 'Study Design Snapshots: Reading an Evidence Grade',
  description:
    'How evidence grades are assigned and which clinical trial design factors matter — shown through embeddable Study Design Snapshots that keep the practical takeaway prominent.',
  alternates: { canonical: '/learn/study-design-snapshot/' },
  openGraph: {
    title: 'Study Design Snapshots: Reading an Evidence Grade',
    description:
      'How evidence grades are assigned and which clinical trial design factors matter, shown through embeddable Study Design Snapshots.',
    url: '/learn/study-design-snapshot/',
    images: ['/og-default.jpg'],
  },
}

const STUDY_DESIGN_SNAPSHOT_REFS = [
  { n: 1, text: 'Concato J, et al. (2000). RCTs vs observational studies. N Engl J Med, 342(25): 1887-1892.', url: 'https://pubmed.ncbi.nlm.nih.gov/10861325/' },
]

export default function StudyDesignSnapshotHubPage() {
  return (
    <div className="container-page space-y-12 py-10">
      <AuthorityJsonLd
        title="Study Design Snapshots: Reading an Evidence Grade"
        description="How evidence grades are assigned and which clinical trial design factors matter, shown through embeddable Study Design Snapshots."
        url="https://thehippiescientist.net/learn/study-design-snapshot"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/learn' },
          { label: 'Study Design Snapshots' },
        ]}
      />

      <section className="max-w-4xl space-y-5">
        <div className="space-y-3">
          <p className="eyebrow-label">Evidence Literacy</p>
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            How to read an evidence grade
          </h1>
        </div>
        <p className="text-lg leading-8 text-muted">
          A grade on this site is shorthand for editorial confidence in the evidence behind a claim or profile. The <strong>Study Design Snapshot</strong> keeps the practical takeaway prominent and tucks the “why” — design, population, comparator, duration, precision, and limitations — into an expandable panel. A grade should make the evidence easier to inspect, not replace that inspection. For the broader framework, see{' '}
          <Link href="/learn/evidence-hierarchy/" className="font-semibold text-brand-700 hover:text-brand-800">
            Evidence Hierarchy
          </Link>
          .
        </p>
      </section>

      <section className="max-w-4xl space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          What different confidence levels can look like
        </h2>

        <StudyDesignSnapshot
          grade="Strong"
          summary="When several well-run human studies point in a similar direction and important limitations are small enough, confidence can be comparatively high — while uncertainty and individual variation still remain."
          gradeRationale="Multiple direct human studies, ideally including independent replication or trustworthy synthesis, show reasonably consistent and precise findings without a major unresolved risk-of-bias or applicability problem."
          studyType="Multiple human trials and/or systematic synthesis"
          population="Relevant human populations"
          participants="Adequate for the effect and design studied"
          duration="Long enough for the outcome being claimed"
          comparator="Appropriate to the research question"
          limitations={[
            'Higher confidence still describes evidence about populations, not a guaranteed individual response.',
            'A statistically detectable effect can still be small or unimportant in practice.',
            'Formulation, population, follow-up, and outcome choice can limit how broadly the result applies.',
          ]}
          context="A strong grade means the current evidence supports more confidence in a specific claim; it does not make the effect certain, universal, large, or automatically relevant to every product."
        />

        <StudyDesignSnapshot
          grade="Moderate"
          summary="Human evidence points in a useful direction, but replication, precision, duration, formulation, or study quality still leaves meaningful uncertainty."
          gradeRationale="Direct human evidence exists, but the body of evidence is not yet as mature or consistent as a higher-confidence grade would require."
          studyType="One or more relevant human studies"
          population="Study-specific human samples"
          participants="Variable; adequacy depends on the design and expected effect"
          duration="Study-specific"
          comparator="Depends on the research question"
          limitations={[
            'Imprecise estimates can leave clinically important uncertainty even when a result is statistically significant.',
            'Short trials generally cannot establish durability or uncommon long-term harms.',
            'Funding, preparation-specific evidence, or lack of independent replication can affect confidence.',
          ]}
        />

        <StudyDesignSnapshot
          grade="Preliminary"
          summary="The rationale is early, indirect, mechanistic, traditional, or based on limited human evidence. Treat the claim as uncertain rather than as a recommendation."
          gradeRationale="Support is dominated by preclinical evidence, uncontrolled observations, traditional-use context, or exploratory human findings that are not sufficient for a confident practical conclusion."
          studyType="Preclinical, observational, traditional, or exploratory human evidence"
          population="Depends on the evidence source"
          limitations={[
            'Mechanistic plausibility often does not translate into a meaningful human benefit.',
            'Sparse or uncontrolled human evidence cannot reliably separate an intervention effect from bias, confounding, or chance.',
          ]}
          context="A preliminary grade is not proof that something does not work. It means the available evidence does not yet support a confident efficacy claim."
        />
      </section>

      <section className="max-w-4xl space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Why design factors matter
        </h2>
        <p className="text-base leading-8 text-[#5c6b63]">
          Randomization, blinding where relevant, comparators, sample-size adequacy, follow-up, missing data, outcome selection, effect estimates, and applicability can all change how much confidence a study deserves. No single checkbox separates a persuasive trial from a misleading one; the snapshot surfaces the factors so the grade is never a black box.
        </p>
      </section>
      <References refs={STUDY_DESIGN_SNAPSHOT_REFS} />
    </div>
  )
}
