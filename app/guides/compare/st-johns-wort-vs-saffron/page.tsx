import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import CitationReadySummary from '@/components/seo/CitationReadySummary'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import Disclaimer from '../../../../src/components/Disclaimer'

export const metadata: Metadata = buildPageMetadata({
  title: "St. John's Wort vs Saffron: Mood Evidence & Safety Compared",
  description: "Evidence-informed comparison of St. John's wort and saffron for mood-related research, with emphasis on evidence limits, drug interactions, and safety.",
  path: '/guides/compare/st-johns-wort-vs-saffron/',
})

const REFS = [
  { n: 1, text: 'Nobakht SZ, et al. (2022). Hypericum perforatum: Traditional uses, clinical trials, and drug interactions.', url: 'https://pubmed.ncbi.nlm.nih.gov/36246064/' },
  { n: 2, text: "Kholghi G, et al. (2022). St. John's wort (Hypericum perforatum) and depression: what happens to the neurotransmitter systems?", url: 'https://pubmed.ncbi.nlm.nih.gov/35294606/' },
  { n: 3, text: 'Yeung KS, et al. (2018). Herbal medicine for depression and anxiety: A systematic review with assessment of potential psycho-oncologic relevance.', url: 'https://pubmed.ncbi.nlm.nih.gov/29464801/' },
  { n: 4, text: 'Fugh-Berman A. (2000). Herb-drug interactions.', url: 'https://pubmed.ncbi.nlm.nih.gov/10675182/' },
]

const ROWS = [
  { dimension: 'Research focus', hypericum: 'Substantial clinical literature in depressive symptoms, with preparation-specific results.', saffron: 'Growing clinical literature in mood and anxiety-related outcomes, but a smaller evidence base.' },
  { dimension: 'Key practical difference', hypericum: 'Major drug-interaction burden due to CYP/P-gp effects and serotonergic concerns.', saffron: 'Lower interaction burden overall, but serotonergic, anticoagulant, pregnancy, and high-dose cautions still matter.' },
  { dimension: 'Active-constituent context', hypericum: 'Hyperforin and other constituents are implicated in neurotransmitter and drug-metabolism effects.', saffron: 'Crocin, crocetin, picrocrocin, and safranal are prominent research constituents.' },
  { dimension: 'Medication compatibility', hypericum: 'Often unsuitable without medication review because it can lower or alter exposure to many prescription drugs.', saffron: 'Still warrants medication review, especially with serotonergic or anticoagulant drugs, but the interaction profile is generally less extensive.' },
  { dimension: 'Best comparison frame', hypericum: 'Evidence-rich botanical with unusually high interaction complexity.', saffron: 'Promising mood-focused botanical with a simpler but not risk-free safety profile.' },
]

export default function StJohnsWortVsSaffronPage() {
  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd title="St. John's Wort vs Saffron" description="Evidence-informed comparison of St. John's wort and saffron for mood-related research and safety." url="https://thehippiescientist.net/guides/compare/st-johns-wort-vs-saffron/" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Compare', href: '/guides/compare/' }, { label: "St. John's Wort vs Saffron" }]} />

      <section className="max-w-4xl space-y-5">
        <p className="eyebrow-label">Educational Comparison · Mood Research</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">St. John&apos;s Wort vs Saffron: Evidence Is Only Half the Decision</h1>
        <p className="text-lg leading-8 text-muted">Both appear in mood-related research, but they are not interchangeable. The biggest practical difference is safety: St. John&apos;s wort has one of the most consequential herb–drug interaction profiles in common supplement use, while saffron has a narrower but still meaningful set of cautions.</p>
      </section>

      <CitationReadySummary
        answer="St. John's wort has a larger clinical literature in depressive symptoms, but its major CYP/P-gp and serotonergic interaction burden can make it inappropriate alongside many medications. Saffron has a smaller but growing mood-related evidence base and generally fewer interaction concerns, although serotonergic drugs, anticoagulants, pregnancy, and high doses still require caution. Evidence strength should therefore be considered together with medication compatibility—not in isolation."
        bestFor={[
          "St. John's wort: only when medication interaction screening has been taken seriously and the preparation matches the evidence context.",
          'Saffron: when a mood-focused botanical is being evaluated and its narrower safety profile better fits the person’s medication context.',
          'Neither: as a reason to delay assessment or treatment for persistent, severe, or worsening mood symptoms.',
        ]}
        evidenceLevel="St. John's wort has the larger clinical evidence base; saffron has promising but smaller systematic-review and clinical literature. Neither should be framed as a universal substitute for professional mental-health care."
        safetyNote="St. John's wort can interact with antidepressants, oral contraceptives, anticoagulants, antiretrovirals, transplant medicines, and many CYP/P-gp substrates. Saffron also warrants caution with serotonergic drugs and anticoagulants and should not be used at medicinal doses in pregnancy without clinician supervision."
        notClaiming="This page does not diagnose depression or anxiety and does not claim either botanical is appropriate for a specific person or a replacement for prescribed treatment."
        referencesHref="#references"
      />

      <section className="card-premium p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Side by side</h2>
        <div className="mt-6 overflow-x-auto"><table className="min-w-full border-collapse text-left text-sm"><thead><tr className="border-b border-brand-900/10"><th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">Dimension</th><th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">St. John&apos;s wort</th><th className="py-3 text-xs font-bold uppercase tracking-wider text-ink">Saffron</th></tr></thead><tbody>{ROWS.map((row) => <tr key={row.dimension} className="border-b border-brand-900/5 align-top last:border-0"><td className="py-3 pr-4 font-semibold text-ink">{row.dimension}</td><td className="py-3 pr-4 text-muted">{row.hypericum}</td><td className="py-3 text-muted">{row.saffron}</td></tr>)}</tbody></table></div>
      </section>

      <section className="card-premium space-y-4 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Why interaction burden changes the comparison</h2>
        <div className="space-y-4 text-sm leading-7 text-muted">
          <p>St. John&apos;s wort has meaningful clinical evidence, but it also affects drug-metabolizing and transport pathways. That makes a simple “which works better?” framing incomplete: a botanical can have evidence and still be a poor fit because of medication interactions.<sup>[1][2][4]</sup></p>
          <p>Saffron has encouraging mood-related evidence, including systematic-review coverage, but the research base is smaller and product standardization matters. Its safety profile is simpler than St. John&apos;s wort, not trivial.<sup>[3]</sup></p>
        </div>
      </section>

      <section className="card-premium space-y-4 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Read the full profiles</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/herbs/hypericum-perforatum/" className="rounded-2xl border border-brand-900/10 bg-white/70 p-4 font-semibold text-brand-800">St. John&apos;s Wort →</Link>
          <Link href="/herbs/saffron/" className="rounded-2xl border border-brand-900/10 bg-white/70 p-4 font-semibold text-brand-800">Saffron →</Link>
        </div>
      </section>

      <FAQSchema pagePath="/guides/compare/st-johns-wort-vs-saffron/" questions={[
        { question: "Is St. John's wort better studied than saffron for mood?", answer: "St. John's wort has a larger clinical literature, especially in depressive symptoms. Saffron has a smaller but growing body of mood-related clinical research." },
        { question: "Which has more drug interactions?", answer: "St. John's wort has the much broader and more consequential interaction profile because it can affect CYP enzymes, P-glycoprotein, serotonergic medicines, oral contraceptives, anticoagulants, transplant drugs, and other medications." },
        { question: 'Can either be combined with antidepressants?', answer: 'That should not be assumed safe. Both warrant clinician or pharmacist review with serotonergic medication, and St. John’s wort has especially significant interaction concerns.' },
      ]} />
      <Disclaimer />
      <References refs={REFS} />
    </div>
  )
}
