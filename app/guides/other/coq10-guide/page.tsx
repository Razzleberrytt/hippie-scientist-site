import type { Metadata } from 'next'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'
import Link from 'next/link'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import LegacyGuideFAQ from '@/components/LegacyGuideFAQ'
import LegacyGuideQuickAnswer from '@/components/LegacyGuideQuickAnswer'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'CoQ10: Heart Failure, Statin Symptoms & Forms (2026)',
  description:
    'Current CoQ10 evidence for heart failure and statin-associated muscle symptoms, plus ubiquinone-vs-ubiquinol pharmacokinetics, safety, interactions, and limits of general-wellness claims.',
  path: '/guides/other/coq10-guide/',
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Does CoQ10 help heart failure?',
    answer:
      'There is a positive evidence signal, but it should not be translated into a replacement for guideline-directed heart-failure therapy. Q-SYMBIO reported favorable long-term outcomes, and a 2024 meta-analysis of 33 randomized trials reported lower all-cause mortality and heart-failure hospitalization with moderate GRADE certainty for those outcomes. NCCIH nevertheless continues to characterize the overall heart-failure evidence as inconclusive, reflecting limitations and variation across the literature.',
  },
  {
    question: 'Does CoQ10 help statin-associated muscle pain?',
    answer:
      'The evidence remains mixed. A 2025 meta-analysis of seven randomized trials found a small pooled reduction in pain intensity, while older meta-analyses have been negative and NCCIH states that the overall evidence does not firmly support CoQ10 for statin muscle pain. Muscle symptoms should be evaluated rather than used as a reason to stop, lower, or change a statin without the prescribing clinician.',
  },
  {
    question: 'Is ubiquinol better than ubiquinone?',
    answer:
      'Some small crossover studies show higher blood CoQ10 exposure with particular ubiquinol formulations than with particular ubiquinone comparators. That is a formulation-specific pharmacokinetic finding, not proof that ubiquinol produces better heart-failure, statin-muscle, migraine, fertility, or general-wellness outcomes for everyone. Product formulation can affect absorption for both forms.',
  },
  {
    question: 'Should people over 40 automatically take ubiquinol?',
    answer:
      'No age threshold establishes a universal need for CoQ10 or a universal preference for ubiquinol. Small studies in older adults can inform pharmacokinetics, but age alone does not establish a patient-important clinical benefit from supplementation or from choosing one CoQ10 form over another.',
  },
  {
    question: 'Does CoQ10 interact with medications?',
    answer:
      'It can. NCCIH notes possible interactions with warfarin and insulin and advises discussing CoQ10 with health-care providers when medications are involved. Heart-failure treatment, statins, anticoagulants, and diabetes therapy should not be independently changed on the basis of a supplement trial.',
  },
] as const

const COQ10_REFS = [
  {
    n: 1,
    text: 'Mortensen SA, et al. The Effect of Coenzyme Q10 on Morbidity and Mortality in Chronic Heart Failure: Results from Q-SYMBIO. JACC Heart Fail. 2014;2(6):641-649. PMID 25282031.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/25282031/',
    pmid: '25282031',
  },
  {
    n: 2,
    text: 'Xu J, et al. Efficacy and safety of coenzyme Q10 in heart failure: a meta-analysis of randomized controlled trials. BMC Cardiovasc Disord. 2024;24:592. PMID 39462324.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/39462324/',
    pmid: '39462324',
  },
  {
    n: 3,
    text: 'National Center for Complementary and Integrative Health. Coenzyme Q10. Current evidence, safety, and medication-interaction summary.',
    url: 'https://www.nccih.nih.gov/health/coenzyme-q10',
  },
  {
    n: 4,
    text: 'Effects of coenzyme Q10 supplementation on myopathy in statin-treated patients: a systematic review and meta-analysis. 2025. PMID 41158831.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41158831/',
    pmid: '41158831',
  },
  {
    n: 5,
    text: 'Banach M, et al. Effects of Coenzyme Q10 on Statin-Induced Myopathy: a meta-analysis of randomized controlled trials. Mayo Clin Proc. 2015. PMID 25440725.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/25440725/',
    pmid: '25440725',
  },
  {
    n: 6,
    text: 'Zhang Y, et al. Ubiquinol is superior to ubiquinone to enhance Coenzyme Q10 status in older men. Food Funct. 2018. PMID 30302465.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/30302465/',
    pmid: '30302465',
  },
  {
    n: 7,
    text: 'Randomized crossover study comparing systemic bioavailability of a novel cocrystal ubiquinol formulation with a ubiquinone formulation in healthy adults. 2026. PMID 41789786.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41789786/',
    pmid: '41789786',
  },
  {
    n: 8,
    text: 'Mantle D, et al. Bioavailability of Coenzyme Q10: An Overview of the Absorption Process and Subsequent Metabolism. Antioxidants (Basel). 2020;9(5):386. PMID 32380795.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/32380795/',
    pmid: '32380795',
  },
]

export default function CoQ10Page() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="CoQ10: Heart Failure, Statin Symptoms and Forms"
        description="Evidence-calibrated review of CoQ10 for heart failure, statin-associated muscle symptoms, formulation pharmacokinetics, safety, and medication interactions."
        url="https://thehippiescientist.net/guides/other/coq10-guide/"
        type="MedicalWebPage"
        citationUrls={COQ10_REFS.map(reference => reference.url)}
      />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'CoQ10' }]} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review · 8 References · Updated August 16, 2026</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">CoQ10: Positive Signals, Mixed Conclusions, and No Universal Protocol</h1>
        <p className="text-lg leading-8 text-muted">
          Coenzyme Q10 is biologically important, but that does not make supplementation broadly beneficial. The most useful evidence questions are indication-specific: <strong>heart failure, statin-associated muscle symptoms, formulation pharmacokinetics, and medication interactions</strong>. Those questions have different levels of certainty.
        </p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/coq10-guide.jpg" alt="CoQ10 softgels beside a heart-health concept" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">CoQ10 has disease-specific research; mitochondrial importance alone is not a supplement indication.</figcaption></figure>
      </section>

      <LegacyGuideQuickAnswer referencesHref="#references">
        <p>
          Heart failure has the strongest positive clinical signal on this page. Q-SYMBIO reported favorable long-term outcomes in 420 patients [1], and a 2024 meta-analysis of 33 randomized trials reported lower all-cause mortality and heart-failure hospitalization with <strong>moderate GRADE certainty</strong> for those outcomes [2]. But NCCIH still describes the overall heart-failure research as inconclusive [3]. That disagreement should be visible rather than collapsed into a “Strong” supplement grade.
        </p>
        <p className="mt-3">
          Statin-associated muscle symptoms are even less settled. A 2025 meta-analysis of seven RCTs found a small pooled pain reduction [4], while an older meta-analysis found no significant effect [5] and NCCIH says the overall evidence does not support a firm benefit [3]. CoQ10 therefore should not be presented as a default statin-side-effect treatment or a reason to alter statin therapy independently.
        </p>
      </LegacyGuideQuickAnswer>

      <section id="coq10-indication-ledger" data-answer-engine-table="true" className="card-premium scroll-mt-24 p-6 space-y-4 max-w-5xl border-l-4 border-brand-700 bg-brand-50/30">
        <p className="eyebrow-label">Indication-specific evidence ledger</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">What each CoQ10 claim can actually support</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full text-sm">
            <caption className="sr-only">CoQ10 evidence by indication and claim type</caption>
            <thead><tr className="border-b border-brand-900/10"><th scope="col" className="text-left py-2 pr-4 font-semibold text-ink">Question</th><th scope="col" className="text-left py-2 pr-4 font-semibold text-ink">Evidence signal</th><th scope="col" className="text-left py-2 pr-4 font-semibold text-ink">What it supports</th><th scope="col" className="text-left py-2 font-semibold text-ink">What it does not support</th></tr></thead>
            <tbody className="text-muted">
              <tr className="border-b border-brand-900/5 align-top"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Chronic heart failure</th><td className="py-3 pr-4">Positive Q-SYMBIO outcomes plus favorable 2024 RCT meta-analysis [1,2]</td><td className="py-3 pr-4">A clinically relevant adjunctive-research signal worth discussing in context</td><td className="py-3">Replacing guideline-directed heart-failure therapy or assuming every HF population/formulation has the same effect; NCCIH remains cautious [3]</td></tr>
              <tr className="border-b border-brand-900/5 align-top"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Statin-associated muscle symptoms</th><td className="py-3 pr-4">Conflicting meta-analyses; 2025 synthesis found a small pooled pain signal [4,5]</td><td className="py-3 pr-4">Continued research and clinician-patient discussion when symptoms are present</td><td className="py-3">A guaranteed response, a fixed self-trial duration, or stopping/changing a statin independently</td></tr>
              <tr className="border-b border-brand-900/5 align-top"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Ubiquinol vs ubiquinone</th><td className="py-3 pr-4">Some small crossover studies show higher exposure for selected ubiquinol formulations [6,7]</td><td className="py-3 pr-4">Formulation can materially affect pharmacokinetics</td><td className="py-3">Universal clinical superiority of ubiquinol, or an age cutoff after which everyone should switch forms</td></tr>
              <tr className="border-b border-brand-900/5 align-top"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">General “energy” / healthy aging</th><td className="py-3 pr-4">Biologic plausibility exceeds outcome evidence [3]</td><td className="py-3 pr-4">A rationale for research</td><td className="py-3">A blanket recommendation for healthy adults</td></tr>
              <tr className="align-top"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Safety / interactions</th><td className="py-3 pr-4">Generally well tolerated in studies, but medication interactions are relevant [3]</td><td className="py-3 pr-4">Reviewing CoQ10 in the context of the medication list</td><td className="py-3">Assuming a supplement is interaction-free because serious adverse events are uncommon</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <p className="eyebrow-label">Heart failure</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Keep the positive signal—and the treatment boundary</h2>
        <p className="text-sm leading-7 text-muted">
          Q-SYMBIO is important because it measured clinical outcomes rather than only a biomarker [1]. The 2024 meta-analysis likewise reported lower mortality and hospitalization, although several other outcomes were supported by lower-certainty evidence [2]. That is meaningfully stronger than a mitochondrial-mechanism argument.
        </p>
        <p className="text-sm leading-7 text-muted">
          It still does not justify telling a person with heart failure to add a fixed retail CoQ10 dose on their own. Heart failure is a high-risk syndrome with established therapies, changing clinical status, kidney/electrolyte considerations, and complex medication regimens. CoQ10 evidence belongs inside that clinical context rather than as a replacement for it.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <p className="eyebrow-label">Statin-associated muscle symptoms</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Mixed evidence should stay mixed</h2>
        <p className="text-sm leading-7 text-muted">
          The 2025 synthesis included seven RCTs and 389 participants and found a statistically significant but small pooled reduction in pain intensity, with four trials positive and three not significantly changed [4]. Earlier pooled work has been negative [5]. Different statins, symptom definitions, CoQ10 products, doses, trial sizes, and durations make a one-line “works/doesn’t work” verdict unstable.
        </p>
        <p className="text-sm leading-7 text-muted">
          More importantly, muscle symptoms during statin therapy deserve evaluation. CoQ10 use should not become a workaround that delays assessment of symptom severity, alternative causes, CK when clinically indicated, drug interactions, or an evidence-based statin-management plan.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <p className="eyebrow-label">Formulation</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Higher blood levels are not the same as better clinical outcomes</h2>
        <p className="text-sm leading-7 text-muted">
          Ubiquinone and ubiquinol are interconvertible forms of CoQ10. Small crossover trials in selected formulations have reported higher systemic exposure with ubiquinol [6,7], and formulation characteristics affect absorption for CoQ10 generally [8]. But these pharmacokinetic studies do not establish that every ubiquinol product improves heart-failure outcomes, statin symptoms, or healthy aging more than every ubiquinone product.
        </p>
        <p className="text-sm leading-7 text-muted">
          The old “ubiquinol if over 40, ubiquinone if younger” rule therefore has been removed. The relevant evidence is product- and indication-specific, not a universal age cutoff.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <p className="eyebrow-label">Safety and medication context</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Generally tolerated does not mean medication-neutral</h2>
        <p className="text-sm leading-7 text-muted">
          NCCIH describes CoQ10 as generally well tolerated but notes possible interactions with <strong>warfarin</strong> and <strong>insulin</strong> and possible incompatibility with some cancer treatments [3]. For the populations most likely to consider CoQ10—heart-failure patients, statin users, and people with cardiometabolic disease—the medication list is part of the evidence decision.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2>
        <p className="text-sm leading-7 text-muted">
          CoQ10 is not just “mitochondrial marketing”: heart-failure trials and meta-analyses contain clinically meaningful positive signals [1,2]. But that does not make it a universal heart supplement, a proven statin-muscle remedy, or an age-based ubiquinol requirement. The evidence is strongest when the <strong>indication, formulation, outcome, uncertainty, and medication context</strong> stay attached to the claim [1-8].
        </p>
      </section>

      <LegacyGuideFAQ questions={[...FAQS]} pagePath="/guides/other/coq10-guide/" />

      <div className="max-w-4xl rounded-xl border border-brand-900/10 bg-brand-50/40 p-4 text-xs leading-6 text-muted">
        <strong className="text-ink">Commercial-links boundary:</strong> optional products below are sourcing examples, not a treatment recommendation or evidence that one CoQ10 form is clinically superior for a specific condition.
      </div>
      <div className="max-w-4xl">
        <RecommendationSection
          title="CoQ10 product examples"
          description="If you are comparing products, note the specific form and formulation rather than assuming an age-based winner. Medication and indication context matters more than a generic 'heart health' label."
          products={getRevenueProductSet('coenzyme-q10')?.products ?? []}
        />
      </div>

      <References refs={COQ10_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="CoQ10, heart failure, statins, and formulation — evidence with the uncertainty intact." ctaLabel="Get the evidence" location="guide-coq10" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}
