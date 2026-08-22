import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import StructuredData from '@/components/StructuredData'
import { SITE_URL } from '@/lib/navigation-config'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import EmailCapture from '@/components/EmailCapture'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import References from '@/components/References'
import { buildTwitterMetadata } from '@/src/lib/seo'

const PAGE_URL = `${SITE_URL}/guides/sleep/best-supplements-for-sleep`
const UPDATED_DATE = '2026-08-22'

export const metadata: Metadata = {
  title: 'Best Supplements for Sleep: Evidence-Ranked Shortlist',
  description:
    'Compare the best-studied sleep supplements by evidence strength, directness, safety and limitations: melatonin, L-theanine, magnesium, ashwagandha, valerian and passionflower.',
  alternates: { canonical: '/guides/sleep/best-supplements-for-sleep/' },
  openGraph: {
    title: 'Best Supplements for Sleep: Evidence-Ranked Shortlist',
    description:
      'A decision-focused comparison of the best-studied sleep supplements, with 18 clinical sources, safety context and clear reasons not to overrank weak evidence.',
    url: '/guides/sleep/best-supplements-for-sleep/',
    type: 'article',
    images: ['/images/guides/best-supplements-for-sleep.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: 'Best Supplements for Sleep: Evidence-Ranked Shortlist',
    description: 'A decision-focused comparison of sleep supplements by evidence strength, directness and safety.',
  }),
}

function Cite({ n }: { n: number }) {
  return (
    <sup className="ml-0.5 align-super text-[0.7em] font-semibold text-brand-700">
      <a href={`#ref-${n}`} aria-label={`Reference ${n}`} className="hover:underline">[{n}]</a>
    </sup>
  )
}

const REFS = [
  { n: 1, title: 'Management of Chronic Insomnia Disorder in Adults: A Clinical Practice Guideline From the American College of Physicians', text: 'Qaseem A, et al. Ann Intern Med. 2016.', year: 2016, pmid: '27136449', doi: '10.7326/M15-2175', url: 'https://pubmed.ncbi.nlm.nih.gov/27136449/' },
  { n: 2, title: 'Behavioral and psychological treatments for chronic insomnia disorder in adults: an AASM clinical practice guideline', text: 'Edinger JD, et al. J Clin Sleep Med. 2021.', year: 2021, pmid: '33164742', doi: '10.5664/jcsm.8986', url: 'https://pubmed.ncbi.nlm.nih.gov/33164742/' },
  { n: 3, title: 'Combination treatment for chronic insomnia disorder in adults: an AASM clinical practice guideline', text: 'AASM guideline. 2026.', year: 2026, pmid: '41975142', url: 'https://pubmed.ncbi.nlm.nih.gov/41975142/' },
  { n: 4, title: 'Clinical Practice Guideline for the Pharmacologic Treatment of Chronic Insomnia in Adults', text: 'Sateia MJ, et al. J Clin Sleep Med. 2017.', year: 2017, pmid: '27998379', url: 'https://pubmed.ncbi.nlm.nih.gov/27998379/' },
  { n: 5, title: 'Meta-analysis: melatonin for the treatment of primary sleep disorders', text: 'Ferracioli-Oda E, Qawasmi A, Bloch MH. PLoS One. 2013.', year: 2013, pmid: '23691095', doi: '10.1371/journal.pone.0063773', url: 'https://pubmed.ncbi.nlm.nih.gov/23691095/' },
  { n: 6, title: 'Evidence for the efficacy of melatonin in the treatment of primary adult sleep disorders', text: 'Systematic review and meta-analysis.', year: 2017, pmid: '28648359', url: 'https://pubmed.ncbi.nlm.nih.gov/28648359/' },
  { n: 7, title: 'Melatonin: What You Need To Know', text: 'National Center for Complementary and Integrative Health. Current evidence and safety overview.', year: 2026, url: 'https://www.nccih.nih.gov/health/melatonin-what-you-need-to-know' },
  { n: 8, title: 'The effects of L-theanine consumption on sleep outcomes: A systematic review and meta-analysis', text: 'Bulman A, et al. Sleep Med Rev. 2025.', year: 2025, pmid: '40056718', doi: '10.1016/j.smrv.2025.102076', url: 'https://pubmed.ncbi.nlm.nih.gov/40056718/' },
  { n: 9, title: 'Examining the effect of L-theanine on sleep: a systematic review of dietary supplementation trials', text: 'Systematic review of 13 standalone L-theanine trials.', year: 2026, pmid: '41176609', url: 'https://pubmed.ncbi.nlm.nih.gov/41176609/' },
  { n: 10, title: 'Oral magnesium supplementation for insomnia in older adults: a Systematic Review & Meta-Analysis', text: 'Mah J, Pitre T. BMC Complement Med Ther. 2021.', year: 2021, pmid: '33865376', doi: '10.1186/s12906-021-03297-z', url: 'https://pubmed.ncbi.nlm.nih.gov/33865376/' },
  { n: 11, title: 'Magnesium Bisglycinate Supplementation in Healthy Adults Reporting Poor Sleep: A Randomized, Placebo-Controlled Trial', text: 'Schuster J, et al. Nat Sci Sleep. 2025; 155 adults, 250 mg elemental magnesium daily for 4 weeks.', year: 2025, pmid: '40918053', doi: '10.2147/NSS.S524348', url: 'https://pubmed.ncbi.nlm.nih.gov/40918053/' },
  { n: 12, title: 'Magnesium Fact Sheet for Consumers', text: 'NIH Office of Dietary Supplements. Safety and supplemental upper-limit context.', year: 2024, url: 'https://ods.od.nih.gov/factsheets/Magnesium-Consumer/' },
  { n: 13, title: 'Effect of Ashwagandha (Withania somnifera) extract on sleep: A systematic review and meta-analysis', text: 'Cheah KL, et al. PLoS One. 2021; five randomized trials, 400 adults.', year: 2021, pmid: '34559859', doi: '10.1371/journal.pone.0257843', url: 'https://pubmed.ncbi.nlm.nih.gov/34559859/' },
  { n: 14, title: 'Ashwagandha: Usefulness and Safety', text: 'National Center for Complementary and Integrative Health. Current safety overview.', year: 2026, url: 'https://www.nccih.nih.gov/health/ashwagandha' },
  { n: 15, title: 'Does valerian work for insomnia? An umbrella review of the evidence', text: 'Valente V, et al. Eur Neuropsychopharmacol. 2024.', year: 2024, pmid: '38359657', doi: '10.1016/j.euroneuro.2024.01.008', url: 'https://pubmed.ncbi.nlm.nih.gov/38359657/' },
  { n: 16, title: 'Effects of Passiflora incarnata on polysomnographic sleep parameters in subjects with insomnia disorder', text: 'Double-blind randomized placebo-controlled study in 110 adults.', year: 2020, pmid: '31714321', doi: '10.1097/YIC.0000000000000291', url: 'https://pubmed.ncbi.nlm.nih.gov/31714321/' },
  { n: 17, title: 'Passionflower: Usefulness and Safety', text: 'National Center for Complementary and Integrative Health. Current safety overview.', year: 2026, url: 'https://www.nccih.nih.gov/health/passionflower' },
  { n: 18, title: 'Over-the-counter products for insomnia in adults: A scoping review of randomised controlled trials', text: 'Scoping review of 51 randomized trials.', year: 2025, pmid: '40054227', url: 'https://pubmed.ncbi.nlm.nih.gov/40054227/' },
]

const HEADINGS: Heading[] = [
  { id: 'quick-answer', text: 'Quick answer', level: 2 },
  { id: 'shortlist', text: 'Evidence-ranked shortlist', level: 2 },
  { id: 'melatonin', text: 'Melatonin', level: 2 },
  { id: 'theanine', text: 'L-theanine', level: 2 },
  { id: 'magnesium', text: 'Magnesium', level: 2 },
  { id: 'ashwagandha', text: 'Ashwagandha', level: 2 },
  { id: 'valerian', text: 'Valerian', level: 2 },
  { id: 'passionflower', text: 'Passionflower', level: 2 },
  { id: 'stacking', text: 'Why stacks overreach', level: 2 },
  { id: 'safety', text: 'Safety boundaries', level: 2 },
  { id: 'insomnia', text: 'Chronic insomnia', level: 2 },
  { id: 'faq', text: 'Decision FAQ', level: 2 },
]

const FAQS = [
  { question: 'What is the best supplement for sleep overall?', answer: 'There is no evidence-based universal winner. Melatonin has the clearest role when circadian timing is the issue. L-theanine has promising recent sleep-quality data. Magnesium has low-certainty evidence plus one newer small-effect trial. Ashwagandha has a small positive pooled signal. Valerian and passionflower have weaker evidence. Chronic insomnia is better served by CBT-I than by ranking supplements.' },
  { question: 'Which sleep supplement has the strongest direct evidence?', answer: 'For a clearly defined use case, melatonin has the most established circadian role. For chronic insomnia specifically, none of these supplements has evidence comparable with CBT-I. Evidence directness is more important than simply counting positive studies.' },
  { question: 'Is magnesium glycinate one of the best sleep supplements?', answer: 'The evidence is not strong enough to call it one of the best universally. A 2025 magnesium bisglycinate trial found a statistically significant but small improvement in insomnia severity, while a prior systematic review found low to very-low certainty evidence in older adults.' },
  { question: 'Is L-theanine better than melatonin?', answer: 'They answer different questions. Melatonin is a circadian signal and fits timing problems better. L-theanine has newer evidence for subjective sleep-quality outcomes but is not established as a treatment for clinical insomnia.' },
  { question: 'Should I choose valerian or passionflower?', answer: 'Neither has strong evidence. Valerian has a larger review literature but a 2024 umbrella review found no demonstrated insomnia efficacy. Passionflower has a small randomized evidence base with some positive signals, including total sleep time in one trial, but remains preliminary.' },
  { question: 'Can I stack several sleep supplements?', answer: 'Separate positive studies do not establish synergy when ingredients are combined. A stack is a new intervention with new interaction and attribution problems. Combining sedating products may also increase impairment.' },
]

export default function BestSupplementsForSleepPage() {
  const toc = <TableOfContents headings={HEADINGS} />

  return (
    <>
      <StructuredData
        pageUrl={PAGE_URL}
        headline="Best Supplements for Sleep: Evidence-Ranked Shortlist"
        description="Decision-focused comparison of common sleep supplements by human evidence, directness, safety and chronic-insomnia limits."
        datePublished="2026-06-16"
        dateModified={UPDATED_DATE}
        faqs={FAQS}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'Sleep', href: '/guides/sleep' },
          { label: 'Best Supplements for Sleep', href: '/guides/sleep/best-supplements-for-sleep' },
        ]}
      />

      <ArticleLayout toc={toc} zone="supplement">
        <div className="space-y-12">
          <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
            <p className="eyebrow-label">Decision guide · 18-source evidence ledger</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Best Supplements for Sleep: An Evidence-Ranked Shortlist</h1>
            <p className="mt-2 text-xs text-muted">
              Written and edited by{' '}
              <Link href="/info/author/" rel="author" className="font-medium text-brand-700 hover:underline">Willie B. Randolph III</Link>{' '}
              · Last evidence review August 22, 2026
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
              This is the decision page, not the encyclopedia. It compares the six most commonly considered sleep supplements
              by <strong className="text-ink">directness of human evidence, effect size, formulation match and safety</strong>.
              “Best” here means “most defensible for a clearly defined question,” not “strongest sedative.”
            </p>
            <div className="mt-5 rounded-xl border border-brand-900/10 bg-brand-50/50 p-4 text-sm leading-6 text-muted">
              Want the broader catalog including glycine, chamomile, tryptophan and tart cherry? Use the{' '}
              <Link href="/guides/other/sleep-supplements-guide/" className="font-semibold text-brand-700 hover:underline">sleep supplements evidence hub</Link>.
              Want non-supplement options too? Use the{' '}
              <Link href="/guides/sleep/best-natural-sleep-aids-that-work/" className="font-semibold text-brand-700 hover:underline">natural sleep aids flagship</Link>.
            </div>
            <figure className="mt-6">
              <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
                <Image src="/images/guides/best-supplements-for-sleep.jpg" alt="Common sleep supplements arranged for an evidence-based comparison" width={1536} height={1024} priority className="h-auto w-full" />
              </div>
            </figure>
          </section>

          <section id="quick-answer" className="scroll-mt-20 rounded-[1.65rem] border border-brand-700/20 bg-brand-50/60 p-6 shadow-sm">
            <p className="eyebrow-label">Quick answer</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">There is no universal “best” sleep supplement</h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-muted sm:text-base">
              <p>
                <strong className="text-ink">Melatonin</strong> has the clearest role when sleep timing is shifted and has modest average benefits across some primary sleep disorders.<Cite n={5} /><Cite n={6} />
                <strong className="text-ink"> L-theanine</strong> has promising recent evidence for several subjective sleep outcomes, but clinical-insomnia evidence remains limited.<Cite n={8} /><Cite n={9} />
              </p>
              <p>
                <strong className="text-ink">Magnesium</strong> remains low-certainty overall, despite a 2025 bisglycinate trial with a statistically significant but small effect on insomnia severity.<Cite n={10} /><Cite n={11} />
                <strong className="text-ink"> Ashwagandha</strong> has a small positive pooled sleep signal.<Cite n={13} />
                <strong className="text-ink"> Valerian</strong> has no demonstrated efficacy for insomnia in a 2024 umbrella review,<Cite n={15} /> while <strong className="text-ink">passionflower</strong> has preliminary randomized evidence.<Cite n={16} />
              </p>
              <p>
                For <strong className="text-ink">chronic insomnia</strong>, the evidence hierarchy changes completely: CBT-I is recommended as initial treatment in major guidelines.<Cite n={1} /><Cite n={2} />
              </p>
            </div>
          </section>

          <section id="shortlist" className="scroll-mt-20 space-y-4">
            <p className="eyebrow-label">Shortlist</p>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Evidence-ranked sleep supplement comparison</h2>
            <ResponsiveTable label="Sleep supplement evidence shortlist">
              <table className="min-w-[980px] w-full text-sm">
                <thead><tr className="border-b border-brand-900/10"><th className="pb-3 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Option</th><th className="pb-3 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Why it makes the shortlist</th><th className="pb-3 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Why it is not #1 for everyone</th><th className="pb-3 text-left text-xs font-bold uppercase tracking-wider text-muted">Verdict</th></tr></thead>
                <tbody className="divide-y divide-brand-900/5">
                  <tr className="align-top"><td className="py-4 pr-4 font-semibold text-ink">Melatonin</td><td className="py-4 pr-4 text-muted">Best-defined circadian role; multiple reviews.</td><td className="py-4 pr-4 text-muted">Chronic-insomnia evidence is not strong enough for a blanket recommendation; timing and disorder matter.</td><td className="py-4 text-muted">Best-defined use case</td></tr>
                  <tr className="align-top"><td className="py-4 pr-4 font-semibold text-ink">L-theanine</td><td className="py-4 pr-4 text-muted">Recent systematic reviews show small sleep-quality signals.</td><td className="py-4 pr-4 text-muted">Dose, duration, pure-product evidence and clinical-insomnia efficacy remain unsettled.</td><td className="py-4 text-muted">Most promising newer signal</td></tr>
                  <tr className="align-top"><td className="py-4 pr-4 font-semibold text-ink">Magnesium</td><td className="py-4 pr-4 text-muted">Biologically plausible; older RCTs plus a newer bisglycinate trial.</td><td className="py-4 pr-4 text-muted">Overall certainty remains low; newer trial effect was small and objective sleep was not measured.</td><td className="py-4 text-muted">Plausible, overmarketed</td></tr>
                  <tr className="align-top"><td className="py-4 pr-4 font-semibold text-ink">Ashwagandha</td><td className="py-4 pr-4 text-muted">Five-trial meta-analysis found a small overall sleep benefit.</td><td className="py-4 pr-4 text-muted">Small heterogeneous evidence base; extracts vary; long-term safety is uncertain.</td><td className="py-4 text-muted">Useful signal, more caveats</td></tr>
                  <tr className="align-top"><td className="py-4 pr-4 font-semibold text-ink">Valerian</td><td className="py-4 pr-4 text-muted">Large historical use and review literature.</td><td className="py-4 pr-4 text-muted">Umbrella review found no demonstrated insomnia efficacy despite subjective signals.</td><td className="py-4 text-muted">Not evidence-leading</td></tr>
                  <tr className="align-top"><td className="py-4 pr-4 font-semibold text-ink">Passionflower</td><td className="py-4 pr-4 text-muted">Randomized insomnia trial found a total-sleep-time signal.</td><td className="py-4 pr-4 text-muted">Small evidence base; several outcomes were not different from placebo; pregnancy warning.</td><td className="py-4 text-muted">Preliminary</td></tr>
                </tbody>
              </table>
            </ResponsiveTable>
            <p className="text-sm leading-7 text-muted">A 2025 scoping review of OTC insomnia products found many positive trials but still characterized the overall findings as promising rather than conclusive, which is a good summary of this category as a whole.<Cite n={18} /></p>
          </section>

          <section id="melatonin" className="scroll-mt-20 card-premium p-6 space-y-3">
            <h2 className="text-2xl font-semibold text-ink">1. Melatonin — strongest when the question is circadian timing</h2>
            <p className="text-sm leading-7 text-muted">A meta-analysis of 19 randomized placebo-controlled studies found modest improvements in sleep latency, total sleep time and sleep quality across primary sleep disorders.<Cite n={5} /> Another adult review found some of the clearest evidence in delayed sleep phase and circadian-related problems.<Cite n={6} /></p>
            <p className="text-sm leading-7 text-muted">The counterweight is important: the AASM chronic-insomnia pharmacologic guideline suggested against melatonin for adult sleep-onset or sleep-maintenance insomnia based on the evidence available for that indication.<Cite n={4} /> NCCIH likewise notes insufficient evidence for recommending it as a chronic-insomnia treatment and that long-term safety is not established.<Cite n={7} /></p>
            <p className="text-sm font-semibold text-ink">Decision: shortlist melatonin when timing is plausibly part of the problem; do not treat it as the generic #1 sleeping pill.</p>
          </section>

          <section id="theanine" className="scroll-mt-20 card-premium p-6 space-y-3">
            <h2 className="text-2xl font-semibold text-ink">2. L-theanine — the most interesting newer evidence signal</h2>
            <p className="text-sm leading-7 text-muted">The 2025 meta-analysis included 19 articles and 897 participants and found statistically significant improvements in several subjective sleep outcomes, while emphasizing the shortage of pure L-theanine studies and uncertainty around dose and duration.<Cite n={8} /> A 2026 review of 13 standalone trials found beneficial signals but still called for higher-quality trials, especially in clinical insomnia.<Cite n={9} /></p>
            <p className="text-sm font-semibold text-ink">Decision: reasonable to call promising; too early to call proven or symptom-specific.</p>
          </section>

          <section id="magnesium" className="scroll-mt-20 card-premium p-6 space-y-3">
            <h2 className="text-2xl font-semibold text-ink">3. Magnesium — better evidence than before, still not a universal winner</h2>
            <p className="text-sm leading-7 text-muted">A 2021 systematic review found only three randomized trials in 151 older adults, with low to very-low certainty despite a pooled sleep-onset-latency signal.<Cite n={10} /> A 2025 randomized trial then tested 250 mg elemental magnesium as bisglycinate in 155 adults with self-reported poor sleep. Insomnia Severity Index scores improved more than placebo, but the effect was small (Cohen d=0.2), a separate sleep-quality measure was not significantly different, and objective sleep was not measured.<Cite n={11} /></p>
            <p className="text-sm leading-7 text-muted">The 2025 trial also deserves transparency: one coauthor led a contract research organization receiving nutraceutical-company research funding and honoraria; the study supplement was manufactured by Biogena.<Cite n={11} /></p>
            <p className="text-sm leading-7 text-muted">Safety matters too: NIH notes GI effects from supplemental magnesium and greater toxicity risk with impaired kidney function.<Cite n={12} /></p>
            <p className="text-sm font-semibold text-ink">Decision: plausible option, especially where low magnesium intake is relevant, but “magnesium glycinate is the best sleep supplement” remains too strong.</p>
          </section>

          <section id="ashwagandha" className="scroll-mt-20 card-premium p-6 space-y-3">
            <h2 className="text-2xl font-semibold text-ink">4. Ashwagandha — small pooled benefit with extract and safety caveats</h2>
            <p className="text-sm leading-7 text-muted">A meta-analysis of five randomized trials containing 400 adults found a small but significant overall sleep benefit, with larger effects in some insomnia, higher-dose and longer-duration subgroups.<Cite n={13} /> The trials used different standardized extracts, which limits transfer to generic retail powders or gummies.</p>
            <p className="text-sm leading-7 text-muted">NCCIH notes that some preparations may help insomnia or stress, but long-term safety is not established; pregnancy, breastfeeding, thyroid and autoimmune disorders, surgery, rare liver injury and multiple medication-interaction categories matter.<Cite n={14} /></p>
            <p className="text-sm font-semibold text-ink">Decision: legitimate sleep signal, but product matching and safety deserve more weight than “adaptogen” marketing.</p>
          </section>

          <section id="valerian" className="scroll-mt-20 card-premium p-6 space-y-3">
            <h2 className="text-2xl font-semibold text-ink">5. Valerian — too inconsistent to rank near the top</h2>
            <p className="text-sm leading-7 text-muted">A 2024 umbrella review of eight systematic reviews found no evidence of efficacy for treating insomnia, although subjective sleep-quality improvements appeared in some reviews. Objective and quantitative results were inconsistent and the underlying evidence was heterogeneous and often low quality.<Cite n={15} /></p>
            <p className="text-sm font-semibold text-ink">Decision: possible subjective benefit, not an evidence-based “best” insomnia supplement.</p>
          </section>

          <section id="passionflower" className="scroll-mt-20 card-premium p-6 space-y-3">
            <h2 className="text-2xl font-semibold text-ink">6. Passionflower — a real trial, but still preliminary</h2>
            <p className="text-sm leading-7 text-muted">A randomized placebo-controlled study in 110 adults with insomnia found that total sleep time improved by about 23 minutes relative to placebo over two weeks, while between-group differences in sleep efficiency and wake-after-sleep-onset were not significant.<Cite n={16} /></p>
            <p className="text-sm leading-7 text-muted">NCCIH advises against passionflower during pregnancy because it may induce uterine contractions.<Cite n={17} /></p>
            <p className="text-sm font-semibold text-ink">Decision: enough evidence to watch; not enough to rank as an established insomnia treatment.</p>
          </section>

          <section id="stacking" className="scroll-mt-20 rounded-[1.65rem] border border-amber-200 bg-amber-50/60 p-6">
            <h2 className="text-2xl font-semibold tracking-tight text-amber-950">Why the “best stack” question is harder than the “best supplement” question</h2>
            <p className="mt-3 text-sm leading-7 text-amber-900">Separate studies of melatonin, magnesium, L-theanine, ashwagandha, valerian or passionflower do not prove that combining them creates synergy, works faster or remains equally safe. A stack is a new intervention. It also makes it harder to identify which ingredient helped or caused next-day impairment.</p>
            <Link href="/guides/sleep/sleep-stack-guide/" className="mt-3 inline-block text-sm font-semibold text-amber-950 hover:underline">Read the sleep-stack evidence guide →</Link>
          </section>

          <section id="safety" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
            <p className="eyebrow-label">Safety is part of the ranking</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">A “best” list should penalize uncertainty and interaction risk</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 text-sm leading-7 text-muted">
              <div className="rounded-xl border border-brand-900/10 bg-brand-50/35 p-4"><strong className="text-ink">Melatonin:</strong> long-term safety is uncertain; drowsiness and medication interactions matter; product-label accuracy can also vary.<Cite n={7} /></div>
              <div className="rounded-xl border border-brand-900/10 bg-brand-50/35 p-4"><strong className="text-ink">Ashwagandha:</strong> pregnancy/breastfeeding avoidance, thyroid/autoimmune cautions, rare liver injury and drug interactions deserve explicit attention.<Cite n={14} /></div>
              <div className="rounded-xl border border-brand-900/10 bg-brand-50/35 p-4"><strong className="text-ink">Magnesium:</strong> GI effects are common at higher supplemental intakes; impaired kidney function raises toxicity risk.<Cite n={12} /></div>
              <div className="rounded-xl border border-brand-900/10 bg-brand-50/35 p-4"><strong className="text-ink">Passionflower:</strong> can cause sedating effects and should not be used during pregnancy.<Cite n={17} /></div>
            </div>
          </section>

          <section id="insomnia" className="scroll-mt-20 rounded-[1.65rem] border border-red-100 bg-red-50/60 p-6">
            <h2 className="text-2xl font-semibold tracking-tight text-red-950">Chronic insomnia changes the answer</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-red-900">
              <p>ACP recommends CBT-I as initial treatment for adults with chronic insomnia, and AASM separately recommends multicomponent CBT-I.<Cite n={1} /><Cite n={2} /></p>
              <p>A 2026 AASM guideline on combined treatment suggested CBT-I plus medication over medication alone, but suggested against the combination over CBT-I alone.<Cite n={3} /> That is strong context against treating a supplement ranking as the main solution for persistent insomnia.</p>
            </div>
          </section>

          <References refs={REFS} />

          <section id="faq" className="scroll-mt-20 space-y-4">
            <h2 className="text-2xl font-semibold text-ink">Decision FAQ</h2>
            <div className="space-y-3">
              {FAQS.map((faq) => (
                <details key={faq.question} className="card-premium p-5"><summary className="cursor-pointer font-semibold text-ink">{faq.question}</summary><p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p></details>
              ))}
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <Link href="/guides/other/sleep-supplements-guide/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-700 hover:underline">Full sleep supplements evidence hub →</Link>
            <Link href="/guides/sleep/best-natural-sleep-aids-that-work/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-700 hover:underline">Natural sleep aids flagship →</Link>
            <Link href="/guides/sleep/glycine-for-sleep/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-700 hover:underline">Glycine for sleep →</Link>
            <Link href="/guides/sleep/magnesium-for-sleep/" className="rounded-xl border border-brand-900/10 bg-white p-4 text-sm font-semibold text-brand-700 hover:underline">Magnesium for sleep →</Link>
          </section>

          <EmailCapture headline="Get future sleep research notes by email" description="Evidence-first supplement updates, safety context, and new guide announcements." location="best-supplements-for-sleep" />
          <NewsletterCtaBlock title="Continue with the newsletter archive" description="Short notes built for cautious supplement decisions." location="best-supplements-for-sleep-newsletter" />
        </div>
      </ArticleLayout>
    </>
  )
}
