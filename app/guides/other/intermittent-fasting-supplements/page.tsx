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
  title: 'Intermittent Fasting Supplements: Protocol, Evidence & Safety (2026)',
  description: 'Evidence review of supplements during intermittent fasting, separating protocol fidelity, weight-loss evidence, autophagy uncertainty, hydration and medication safety.',
  path: '/guides/other/intermittent-fasting-supplements/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'What does it mean for a supplement to “break a fast”?', answer: 'There is no single biochemical definition that fits every fasting goal. For a research protocol, an intake breaks the fast if it violates that protocol’s allowed intake. A calorie-containing product clearly changes a zero-calorie fast, but claims about one small intake “turning off autophagy” or erasing all fasting benefits are not established by human outcome trials.' },
  { question: 'Do I need electrolytes during ordinary intermittent fasting?', answer: 'Not automatically. Hydration and electrolyte needs depend on fasting duration, diet, climate, exercise, medications, kidney function and health conditions. Routine time-restricted eating does not establish a universal sodium, potassium or magnesium supplement recipe.' },
  { question: 'Does black coffee increase autophagy during fasting?', answer: 'That is not established as a human clinical benefit. Human autophagy measurement during intermittent fasting is still exploratory. A 2025 study found a between-group signal after six months but no significant increase from baseline within the fasting group.' },
  { question: 'Does creatine break a fast?', answer: 'The practical answer depends on the protocol. Creatine is not a meaningful calorie source, but there is no validated human rule saying it preserves or disrupts every fasting mechanism. If strict protocol fidelity matters, take only what that protocol permits.' },
  { question: 'Who should be especially careful with fasting?', answer: 'Medication use and medical context matter. Diabetes treated with insulin or sulfonylureas, SGLT2 inhibitors, diuretics, kidney disease, pregnancy, a history of eating disorders, dehydration risk and other conditions can change fasting safety. These situations should not be managed with a generic electrolyte recipe.' },
]

const IF_REFS = [
  { n: 1, text: 'Garegnani LI, et al. (2026). Intermittent fasting for adults with overweight or obesity. Cochrane Database Syst Rev. PMID 41692034.', url: 'https://pubmed.ncbi.nlm.nih.gov/41692034/' },
  { n: 2, text: 'Bensalem J, et al. (2025). Intermittent time-restricted eating may increase autophagic flux in humans: an exploratory analysis. J Physiol. PMID 40345145.', url: 'https://pubmed.ncbi.nlm.nih.gov/40345145/' },
  { n: 3, text: 'NIDDK. Fasting Safely with Diabetes. Professional guidance on hypoglycemia, hyperglycemia, dehydration and medication adjustment during fasting.', url: 'https://www.niddk.nih.gov/health-information/professionals/diabetes-discoveries-practice/fasting-safely-with-diabetes' },
  { n: 4, text: 'Varady KA, et al. (2022). Clinical application of intermittent fasting for weight loss: progress and future directions. Nat Rev Endocrinol. PMID 35194134.', url: 'https://pubmed.ncbi.nlm.nih.gov/35194134/' },
]

export default function IntermittentFastingPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Intermittent Fasting Supplements: Protocol, Evidence & Safety" description="Protocol-first evidence review of supplements during intermittent fasting." url="https://thehippiescientist.net/guides/other/intermittent-fasting-supplements" type="Article" citationUrls={IF_REFS.map((ref) => ref.url)} />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Intermittent Fasting & Supplements' }]} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 4 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Intermittent Fasting Supplements: Define the Protocol Before the Supplement</h1><p className="text-lg leading-8 text-muted">Time-restricted eating, alternate-day fasting, modified fasting and prolonged fasting are not the same intervention. Neither are the goals: weight loss, religious practice, glucose management and mechanistic research can impose different rules. That means “Does this supplement break my fast?” cannot be answered responsibly without defining the protocol first.</p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/intermittent-fasting-supplements.jpg" alt="Kitchen timer and water beside supplements during a fasting discussion" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">Protocol fidelity is clearer than trying to guess one universal biochemical definition of a “broken fast.”</figcaption></figure></section>

      <LegacyGuideQuickAnswer referencesHref="#references"><p><strong>Most people doing ordinary time-restricted eating do not need a special “fasting supplement stack.”</strong> The 2026 Cochrane review found intermittent fasting produced little to no additional weight-loss benefit versus traditional dietary advice in adults with overweight or obesity [1]. If you are following a defined fasting protocol, use that protocol’s allowed intake rather than internet rules about coffee, creatine or autophagy. Hydration and electrolyte needs are individual, and diabetes medications, SGLT2 inhibitors, diuretics, kidney disease and dehydration risk can make fasting a medical-management issue rather than a supplement issue [3].</p></LegacyGuideQuickAnswer>

      <section id="fasting-decision-map" data-answer-engine-table="true" className="card-premium scroll-mt-24 p-6 space-y-4 max-w-5xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Ask Which Protocol You Are Following</p><div className="overflow-x-auto"><table className="min-w-[900px] text-sm"><caption className="sr-only">Fasting questions by goal, evidence boundary and supplement implication</caption><thead><tr className="border-b"><th scope="col" className="text-left py-3 pr-4 font-semibold text-ink">Goal / protocol</th><th scope="col" className="text-left py-3 pr-4 font-semibold text-ink">What the evidence says</th><th scope="col" className="text-left py-3 pr-4 font-semibold text-ink">Supplement implication</th><th scope="col" className="text-left py-3 font-semibold text-ink">Main caution</th></tr></thead><tbody className="text-muted">
        <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Weight-loss intermittent fasting</th><td className="py-3 pr-4">Current Cochrane evidence shows little to no extra weight-loss advantage over conventional dietary advice [1].</td><td className="py-3 pr-4">No dedicated supplement category is required to reproduce that evidence.</td><td className="py-3">Do not add protocol complexity without a defined reason.</td></tr>
        <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Strict zero-calorie research protocol</th><td className="py-3 pr-4">Study validity depends on following the intervention as designed.</td><td className="py-3 pr-4">Any calorie-containing intake changes a zero-calorie protocol; noncaloric products still need to follow study rules.</td><td className="py-3">Do not substitute influencer definitions for protocol criteria.</td></tr>
        <tr className="border-b"><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Autophagy goal</th><td className="py-3 pr-4">Human evidence remains exploratory; a 2025 study reported a between-group signal without a significant within-group increase from baseline [2].</td><td className="py-3 pr-4">There is no validated supplement-by-supplement “autophagy safe list.”</td><td className="py-3">Avoid hour-by-hour or ingredient-by-ingredient certainty.</td></tr>
        <tr><th scope="row" className="py-3 pr-4 text-left font-medium text-ink">Fasting with diabetes or relevant medication</th><td className="py-3 pr-4">Hypoglycemia, hyperglycemia, dehydration and medication adjustment can become the dominant safety issues [3].</td><td className="py-3 pr-4">This is not solved by a generic sodium/potassium/magnesium drink.</td><td className="py-3">Medication management and clinical context come first.</td></tr>
      </tbody></table></div></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Why the old electrolyte recipe was the wrong answer</h2><p className="text-sm leading-7 text-muted">Fasting can change fluid balance, but that does not create one internet mineral formula for everyone. Sodium and potassium needs depend on dietary intake, fasting duration, sweat losses, medications, kidney function and disease state. Potassium supplementation in particular should not be handed out as a blanket recipe. For routine daily time-restricted eating with normal food and fluid intake, the evidence does not establish a special electrolyte supplement as mandatory.</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Coffee, creatine and “breaking” the fast</h2><p className="text-sm leading-7 text-muted">A useful operational rule is simpler than biochemical speculation: if an intake violates the protocol you are following, you are no longer following that protocol. Calorie-containing protein, amino-acid, fat or carbohydrate products plainly change a zero-calorie fast. For noncaloric products such as plain coffee or creatine, there is not enough human evidence to claim that they universally preserve or abolish every proposed fasting mechanism. If the goal is a trial, procedure or strict religious fast, follow that protocol—not a generic supplement chart.</p></section>

      <section className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-6 text-amber-950 dark:border-amber-200/20 dark:bg-amber-950/20 dark:text-amber-50"><p className="text-xs font-bold uppercase tracking-[0.16em]">Safety boundary</p><h2 className="mt-2 text-2xl font-semibold">Medication and health context can matter more than the fasting window</h2><p className="mt-3 text-sm leading-7">NIDDK highlights hypoglycemia, hyperglycemia, dehydration and medication-adjustment concerns for people with diabetes who fast [3]. Insulin, sulfonylureas, SGLT2 inhibitors and diuretics are examples where the risk cannot be managed by supplement timing alone. Pregnancy, eating-disorder history, kidney disease, frailty and prolonged fasting also deserve individualized review.</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold">Bottom line</h2><p className="text-sm leading-7 text-muted">Intermittent fasting is an eating-pattern strategy, not a supplement category. Define the protocol, define the outcome and preserve the study conditions before asking whether a product “breaks” anything. For routine time-restricted eating, there is no evidence-based need for a special fasting supplement stack, DIY potassium recipe or autophagy-enhancing coffee rule.</p></section>
      <LegacyGuideFAQ questions={FAQS} pagePath="/guides/other/intermittent-fasting-supplements/" />
      <section id="references" className="scroll-mt-24"><References refs={IF_REFS} /></section>
      <EmailCapture headline="Get evidence reviews like this" description="Fasting protocols and supplements — evidence before biohacking rules." ctaLabel="Get the evidence" location="guide-intermittent-fasting" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/safety-checker/" className="text-sm font-bold text-brand-800 hover:underline">Safety checker →</Link></div>
    </div>
  )
}
