import type { Metadata } from 'next'
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
  title: 'Nootropic Stacking: Direct Evidence, Interactions & Safety (2026)',
  description:
    'Evidence-first nootropic combination guide: caffeine plus L-theanine, why single-ingredient trials do not prove stack synergy, caffeine safety, supplement interactions, and multi-ingredient product risk.',
  path: '/guides/other/nootropic-stacking-guide/',
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'What is the best nootropic stack for beginners?',
    answer:
      'There is no evidence-based universal beginner stack. Caffeine plus L-theanine has direct randomized combination evidence and may produce small, task-specific acute benefits in attention or mood, but effect estimates remain uncertain and individual caffeine sensitivity varies [1]. Evidence for one ingredient cannot be added to evidence for another ingredient to prove that their combination is better.',
  },
  {
    question: 'Is caffeine plus L-theanine proven to improve focus?',
    answer:
      'It has more direct combination evidence than most marketed stacks. A 2025 systematic review and meta-analysis found small-to-moderate differences favoring the combination for selected cognitive and mood tasks within the first two hours, while several confidence intervals showed uncertainty [1]. That is not proof of a universal 1:2 caffeine-to-theanine ratio or a guaranteed real-world productivity benefit.',
  },
  {
    question: 'Does creatine plus bacopa have proven synergy?',
    answer:
      'No direct synergy can be inferred from separate creatine and bacopa studies. Creatine has mixed-to-positive single-agent cognitive evidence [3,4], and bacopa has its own single-agent trials [5]. Unless a combination is directly tested, the efficacy, optimal amounts, interaction profile, and additive value of the stack remain unknown.',
  },
  {
    question: 'Can I combine nootropics with prescription medications?',
    answer:
      'That depends on the exact supplement, medication, dose, medical condition, and product. Supplements can have pharmacodynamic or pharmacokinetic interactions, and multi-ingredient products make attribution harder. People taking prescription stimulants, antidepressants, anticoagulants, sedatives, seizure medicines, or other regular medications should have a proposed combination reviewed rather than relying on a generic stack chart [7,8].',
  },
  {
    question: 'How much caffeine is safe?',
    answer:
      'FDA cites 400 mg/day as an amount not generally associated with negative effects for most adults, but sensitivity varies substantially and that number is not a recommended nootropic target [2]. Pure or highly concentrated caffeine powders and liquids can be dangerous or fatal and FDA advises consumers to avoid them [2].',
  },
] as const

const NOOTROPIC_REFS = [
  {
    n: 1,
    text: 'Payne ER, et al. Effects of Tea or Its Bioactive Compounds L-Theanine or L-Theanine Plus Caffeine on Cognition, Sleep, and Mood in Healthy Participants: A Systematic Review and Meta-Analysis of Randomized Controlled Trials. Nutr Rev. 2025. PMID 40314930.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40314930/',
  },
  {
    n: 2,
    text: 'U.S. Food and Drug Administration. Spilling the Beans: How Much Caffeine Is Too Much? and FDA warning on pure/highly concentrated caffeine.',
    url: 'https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much',
  },
  {
    n: 3,
    text: 'Xu C, et al. The effects of creatine supplementation on cognitive function in adults: a systematic review and meta-analysis. Front Nutr. 2024. PMID 39070254.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/39070254/',
  },
  {
    n: 4,
    text: 'McMorris T, et al. Creatine supplementation research fails to support the theoretical basis for an effect on cognition: Evidence from a systematic review. Behav Brain Res. 2024. PMID 38582412.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/38582412/',
  },
  {
    n: 5,
    text: 'Lopresti AL, Smith SJ. The Effects of a Bacopa monnieri Extract on Cognition, Stress, and Fatigue in Healthy Adults: A Randomized, Double-Blind, Placebo-Controlled Trial. Clin Drug Investig. 2025. PMID 41091332.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41091332/',
  },
  {
    n: 6,
    text: 'Menon A, et al. Benefits, side effects, and uses of Hericium erinaceus as a supplement: a systematic review. 2025. PMID 40959699.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40959699/',
  },
  {
    n: 7,
    text: 'Jędrejko K, et al. Unauthorized ingredients in “nootropic” dietary supplements: history, pharmacology, prevalence, regulations, and doping potential. Drug Test Anal. 2023. PMID 37357012.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/37357012/',
  },
  {
    n: 8,
    text: 'Asher GN, Corbett AH, Hawke RL. Common Herbal Dietary Supplement-Drug Interactions. Am Fam Physician. 2017. PMID 28762712.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/28762712/',
  },
]

const combinationRows = [
  {
    combination: 'Caffeine + L-theanine',
    directEvidence: 'Yes — randomized combination trials are included in a 2025 meta-analysis [1].',
    result: 'Small, task-specific acute attention/mood signals; some estimates remain uncertain.',
    boundary: 'Does not establish a universal dose ratio, daily-use protocol, or benefit for every person.',
  },
  {
    combination: 'Creatine + bacopa',
    directEvidence: 'Not established by the retained evidence. Creatine and bacopa are studied separately [3-5].',
    result: 'Single-agent evidence cannot be arithmetically combined into proof of synergy.',
    boundary: 'Combination efficacy, tolerability, and additive value require direct testing.',
  },
  {
    combination: 'Lion’s mane + rhodiola',
    directEvidence: 'Not established by the retained evidence. Lion’s mane has emerging single-agent human data [6].',
    result: 'A mechanistic story about neurotrophic plus adaptogenic effects is not a clinical outcome.',
    boundary: 'Do not label an untested pair a “brain longevity stack.”',
  },
  {
    combination: 'L-theanine + ashwagandha',
    directEvidence: 'Not established by the retained evidence as a cognitive stack.',
    result: 'Separate calming/stress evidence does not prove improved focus when combined.',
    boundary: 'Sedation, medications, and individual response can change the risk-benefit balance.',
  },
]

const decisionRows = [
  {
    question: 'Is the combination itself tested?',
    why: 'If not, any claim of synergy, optimal ratio, or superior efficacy is extrapolation rather than direct evidence.',
  },
  {
    question: 'What is the total stimulant exposure?',
    why: 'Coffee, tea, energy drinks, pre-workouts, medications, and supplements can all contribute caffeine or stimulant effects. FDA’s 400 mg/day figure is a population safety reference for most adults, not a performance target [2].',
  },
  {
    question: 'Are prescription medicines involved?',
    why: 'Central-nervous-system, cardiovascular, anticoagulant, and other medicines can create clinically meaningful supplement interactions [8].',
  },
  {
    question: 'Can you verify the product identity?',
    why: 'Nootropic products are a category with documented unauthorized or unapproved ingredients, making multi-ingredient labels an additional source of uncertainty [7].',
  },
]

export default function NootropicStackingPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Nootropic Stacking: Direct Evidence, Interactions and Safety"
        description="Evidence-calibrated review of nootropic combinations, direct versus extrapolated evidence, caffeine safety, medication interactions, and multi-ingredient product risk."
        url="https://thehippiescientist.net/guides/other/nootropic-stacking-guide/"
        type="MedicalWebPage"
        citationUrls={NOOTROPIC_REFS.map((ref) => ref.url)}
      />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Nootropic Stacking' }]} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review · Updated August 16, 2026</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">Nootropic Stacking: Evidence for Ingredients Is Not Evidence for a Stack</h1>
        <p className="text-lg leading-8 text-muted">
          Combining two plausible cognitive ingredients does not automatically create a proven combination. A real stack claim needs direct testing of the combination itself, at defined exposures, in a relevant population, with safety and outcome data. Most internet stack charts skip that step.
        </p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/lions-mane.jpg" alt="Several nootropic supplements beside an evidence-review notebook" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">A list of individually studied ingredients is not automatically a studied combination.</figcaption></figure>
      </section>

      <LegacyGuideQuickAnswer referencesHref="#references">
        <p>
          <strong>Caffeine + L-theanine has direct combination evidence; most popular “stacks” do not.</strong> A 2025 meta-analysis found small-to-moderate, task-specific acute cognitive and mood signals for caffeine plus L-theanine, with uncertainty around several estimates [1]. By contrast, separate creatine, bacopa, lion’s mane, rhodiola, or ashwagandha studies do not prove that pairing those ingredients creates synergy. This page therefore does not provide stack recipes, cycling schedules, or a week-by-week escalation protocol.
        </p>
      </LegacyGuideQuickAnswer>

      <section id="nootropic-combination-evidence" data-answer-engine-table="true" className="card-premium scroll-mt-24 p-6 space-y-4 max-w-5xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Direct combination evidence vs extrapolation</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-sm">
            <caption className="sr-only">Nootropic combinations compared by direct evidence, result, and evidence boundary</caption>
            <thead><tr className="border-b border-brand-900/10"><th scope="col" className="py-3 pr-4 text-left font-semibold text-ink">Combination</th><th scope="col" className="py-3 pr-4 text-left font-semibold text-ink">Direct combination evidence?</th><th scope="col" className="py-3 pr-4 text-left font-semibold text-ink">What can be said</th><th scope="col" className="py-3 text-left font-semibold text-ink">Boundary</th></tr></thead>
            <tbody className="text-muted">
              {combinationRows.map((row) => (
                <tr key={row.combination} className="border-b border-brand-900/5 last:border-b-0 align-top"><th scope="row" className="py-3 pr-4 text-left font-semibold text-ink">{row.combination}</th><td className="py-3 pr-4 leading-6">{row.directEvidence}</td><td className="py-3 pr-4 leading-6">{row.result}</td><td className="py-3 leading-6">{row.boundary}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Caffeine + L-theanine: useful evidence, smaller claim</h2>
        <p className="text-sm leading-7 text-muted">
          The 2025 systematic review included randomized trials of the combination and found favorable differences for selected tasks such as digit-vigilance and attention-switching accuracy at certain time points [1]. Several estimates had confidence intervals compatible with little or uncertain benefit. The defensible conclusion is that the pair has direct acute combination evidence for selected outcomes—not that a fixed caffeine/theanine ratio is the safest or most effective daily stack for every adult.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2 max-w-5xl">
        <article className="card-premium p-6 space-y-4">
          <h2 className="text-xl font-semibold text-ink">Creatine: single-agent evidence is mixed</h2>
          <p className="text-sm leading-7 text-muted">
            One 2024 meta-analysis reported modest benefits for memory and selected attention/processing-speed measures, with moderate certainty for memory and lower certainty for several other domains [3]. Another 2024 systematic review judged cognitive findings equivocal [4]. Neither result proves that adding bacopa improves creatine’s effect.
          </p>
        </article>
        <article className="card-premium p-6 space-y-4">
          <h2 className="text-xl font-semibold text-ink">Bacopa and lion’s mane: study the actual product and outcome</h2>
          <p className="text-sm leading-7 text-muted">
            Bacopa and lion’s mane each have human research [5,6], but extracts, populations, durations, and outcomes vary. Those single-agent data should remain in their own evidence lanes unless a combination is directly tested.
          </p>
        </article>
      </section>

      <section id="nootropic-stacking-safety" data-answer-engine-table="true" className="space-y-4 max-w-5xl scroll-mt-24">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">Before combining anything, answer these questions</h2>
        <div className="overflow-x-auto rounded-2xl border border-brand-900/10 bg-white/90 dark:border-white/10 dark:bg-white/5">
          <table className="min-w-[820px] w-full text-left text-sm">
            <caption className="sr-only">Nootropic combination safety questions and why they matter</caption>
            <thead><tr className="border-b border-brand-900/10 text-ink"><th scope="col" className="p-4">Question</th><th scope="col" className="p-4">Why it matters</th></tr></thead>
            <tbody className="divide-y divide-brand-900/10 text-muted">
              {decisionRows.map((row) => (
                <tr key={row.question}><th scope="row" className="p-4 font-semibold text-left text-ink">{row.question}</th><td className="p-4 leading-6">{row.why}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-rose-900/15 bg-rose-50/80 p-6 text-rose-950 dark:border-rose-200/20 dark:bg-rose-950/20 dark:text-rose-50 max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em]">Stimulant boundary</p>
        <h2 className="mt-2 text-2xl font-semibold">Total caffeine matters more than the stack label</h2>
        <p className="mt-3 text-sm leading-7">
          FDA cites 400 mg/day as an amount not generally associated with negative effects for most adults, while emphasizing wide differences in sensitivity and metabolism [2]. That number is not a recommended performance dose. Count caffeine from coffee, tea, energy drinks, pre-workouts, medicines, and supplements together. FDA also advises avoiding pure or highly concentrated caffeine powders and liquids because measurement errors can be dangerous or fatal [2].
        </p>
      </section>

      <section className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-6 text-amber-950 dark:border-amber-200/20 dark:bg-amber-950/20 dark:text-amber-50 max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em]">Medication and product boundary</p>
        <h2 className="mt-2 text-2xl font-semibold">More ingredients create more uncertainty</h2>
        <p className="mt-3 text-sm leading-7">
          Supplement-drug interactions can involve central-nervous-system, cardiovascular, anticoagulant, and metabolic pathways [8]. Multi-ingredient nootropic products add another problem: a 2023 review documented unauthorized or unapproved ingredients in products marketed for cognitive enhancement [7]. If regular medication is involved, the useful safety question is the exact ingredient-product-medication combination—not whether a generic internet stack is labeled “safe.”
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/safety-checker/" className="rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-950 dark:bg-amber-100 dark:text-amber-950">Check supplement interactions</Link>
          <Link href="/info/supplement-safety-checklist/" className="rounded-full border border-amber-900/20 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-white/60 dark:border-amber-100/30 dark:text-amber-50">Safety checklist</Link>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2>
        <p className="text-sm leading-7 text-muted">
          A plausible mechanism is not synergy, and two individually studied ingredients do not become an evidence-based stack when placed in the same capsule. Caffeine plus L-theanine has direct combination research, but even there the effects are task-specific and not a universal dosing recipe [1]. For other combinations, keep single-agent evidence separate until the combination itself has been tested.
        </p>
      </section>

      <References refs={NOOTROPIC_REFS} />
      <LegacyGuideFAQ pagePath="/guides/other/nootropic-stacking-guide/" questions={[...FAQS]} />
      <EmailCapture headline="Get evidence reviews like this" description="Nootropic evidence, interactions, and product safety — without invented stack synergy." ctaLabel="Get the evidence" location="guide-nootropic-stacking" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/info/supplement-safety-checklist/" className="text-sm font-bold text-brand-800 hover:underline">Safety checklist →</Link></div>
    </div>
  )
}
