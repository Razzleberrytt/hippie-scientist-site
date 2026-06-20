import type { Metadata } from 'next'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import StudyDesignSnapshot from '@/components/evidence/StudyDesignSnapshot'

export const metadata: Metadata = {
  title: 'Study Design Snapshots: Reading an Evidence Grade',
  description:
    'How evidence grades are assigned and which clinical trial design factors matter — shown through embeddable Study Design Snapshots that keep the practical takeaway prominent.',
  alternates: { canonical: '/education/study-design-snapshot/' },
  openGraph: {
    title: 'Study Design Snapshots: Reading an Evidence Grade',
    description:
      'How evidence grades are assigned and which clinical trial design factors matter, shown through embeddable Study Design Snapshots.',
    url: '/education/study-design-snapshot',
  },
}

export default function StudyDesignSnapshotHubPage() {
  return (
    <main className="container-page space-y-12 py-10">
      <AuthorityJsonLd
        title="Study Design Snapshots: Reading an Evidence Grade"
        description="How evidence grades are assigned and which clinical trial design factors matter, shown through embeddable Study Design Snapshots."
        url="https://thehippiescientist.net/education/study-design-snapshot"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
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
        <p className="text-lg leading-8 text-[#46574d]">
          Every grade on this site is shorthand for the quality of the human evidence behind a
          claim. The <strong>Study Design Snapshot</strong> keeps the practical takeaway prominent
          and tucks the &ldquo;why&rdquo; — trial design and limitations — into an optional,
          expandable panel. The same component is embeddable inside our structured education
          content. For the full methodology guide, see{' '}
          <Link href="/education/evidence-literacy" className="font-semibold text-brand-700 hover:text-brand-800">
            Evidence Literacy
          </Link>
          .
        </p>
      </section>

      <section className="max-w-4xl space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          What each grade looks like
        </h2>

        <StudyDesignSnapshot
          grade="Strong"
          summary="When several large, well-run human trials agree, a claim earns the strongest grade — you can act on it with reasonable confidence."
          gradeRationale="Multiple large randomized controlled trials and meta-analyses converge on the same direction and rough size of effect."
          studyType="Multiple RCTs + meta-analysis"
          population="Large, varied adult samples"
          participants="Hundreds to thousands pooled"
          duration="Weeks to months"
          comparator="Placebo and/or active control"
          limitations={[
            'Even strong evidence describes averages, not individual response.',
            'Effect sizes can still be modest in practical terms.',
          ]}
          context="A strong grade means the effect is real and replicated — not that it will be large for everyone."
        />

        <StudyDesignSnapshot
          grade="Moderate"
          summary="A handful of small human trials point the same way, but the evidence is thinner — promising, not settled."
          gradeRationale="A few randomized trials show a consistent signal, but small samples, short durations, or funding concerns limit confidence."
          studyType="Several small RCTs"
          population="Modest adult samples"
          participants="Dozens per trial"
          duration="4–8 weeks"
          comparator="Placebo"
          limitations={[
            'Small samples widen the uncertainty around the true effect.',
            'Short trials cannot speak to long-term use.',
            'Some trials are industry-funded.',
          ]}
        />

        <StudyDesignSnapshot
          grade="Preliminary"
          summary="The rationale is mostly mechanistic or traditional. Treat it as a hypothesis worth watching, not a recommendation."
          gradeRationale="Support comes largely from lab, animal, or traditional-use evidence with little or no controlled human data."
          studyType="Mechanistic / animal / traditional use"
          population="Pre-clinical or anecdotal"
          limitations={[
            'Mechanistic plausibility frequently fails to translate to human benefit.',
            'No controlled human trials means effect and safety are unestablished.',
          ]}
          context="A low grade is not a verdict that something does not work — it means the human evidence is not there yet."
        />
      </section>

      <section className="max-w-4xl space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Why design factors matter
        </h2>
        <p className="text-base leading-8 text-[#5c6b63]">
          Blinding, a placebo comparator, sample size, and duration are what separate a persuasive
          trial from a misleading one. The snapshot surfaces these so a grade is never a black box —
          and so you can judge the evidence for yourself.
        </p>
      </section>
    </main>
  )
}
