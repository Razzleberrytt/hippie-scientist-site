import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import StructuredData from '@/components/StructuredData'
import { SITE_URL } from '@/lib/navigation-config'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import EmailCapture from '@/components/EmailCapture'
import References from '@/components/References'
import { buildTwitterMetadata } from '@/src/lib/seo'

const PAGE_URL = `${SITE_URL}/guides/anxiety/best-supplements-for-overthinking`

export const metadata: Metadata = {
  title: 'Racing Thoughts at Night: Supplements, Evidence & What Works',
  description:
    'Evidence-first guide to overthinking and racing thoughts at night. Compare L-theanine, magnesium and ashwagandha with direct CBT-I evidence for sleep-related worry and rumination.',
  alternates: { canonical: '/guides/anxiety/best-supplements-for-overthinking/' },
  openGraph: {
    title: 'Racing Thoughts at Night: Supplements, Evidence & What Works',
    description:
      'What actually helps bedtime overthinking? A citation-dense comparison of supplement evidence with direct research on sleep-related worry and repetitive negative thinking.',
    url: '/guides/anxiety/best-supplements-for-overthinking/',
    type: 'article',
    images: ['/images/guides/best-supplements-for-overthinking.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: 'Racing Thoughts at Night: Supplements, Evidence & What Works',
    description:
      'Supplement evidence is mostly indirect; CBT-I has direct evidence for sleep-related worry. Here is the evidence hierarchy.',
  }),
}

function Cite({ n }: { n: number }) {
  return (
    <sup className="ml-0.5 align-super text-[0.7em] font-semibold text-brand-700">
      <a href={`#ref-${n}`} aria-label={`Reference ${n}`} className="hover:underline">[{n}]</a>
    </sup>
  )
}

const FAQS = [
  {
    question: 'What supplement is best for overthinking or a racing mind?',
    answer:
      'No supplement has strong direct evidence for treating overthinking or rumination itself. L-theanine has mixed stress and anxiety evidence, magnesium has heterogeneous anxiety/sleep evidence, and ashwagandha has repeated-dose stress/anxiety evidence. Those are adjacent outcomes, not direct proof of an anti-rumination effect.',
  },
  {
    question: 'What actually helps racing thoughts before bed?',
    answer:
      'When racing thoughts are part of insomnia, cognitive behavioral therapy for insomnia (CBT-I) has the most direct evidence on this page. A meta-analysis found moderate-to-large reductions in worry, especially sleep-related repetitive negative thinking, while effects on general rumination were smaller and less reliable.',
  },
  {
    question: 'Does L-theanine stop racing thoughts?',
    answer:
      'Not proven. A 2026 meta-analysis found a modest acute stress effect that was sensitive to higher-risk-of-bias studies, and anxiety effects were inconsistent. A randomized trial in generalized anxiety disorder did not find L-theanine superior to placebo for anxiety reduction.',
  },
  {
    question: 'Does magnesium help overthinking at night?',
    answer:
      'Magnesium has some positive anxiety and sleep findings, but the evidence is heterogeneous and does not establish magnesium glycinate as a treatment for rumination. Benefits may be more plausible when magnesium intake or status is low, but baseline status is often not well characterized in trials.',
  },
  {
    question: 'Can ashwagandha help a racing mind?',
    answer:
      'Ashwagandha has meta-analytic evidence for stress and anxiety outcomes over repeated dosing, but that does not establish a same-night effect on rumination or racing thoughts. Extracts, populations and treatment durations vary.',
  },
]

const HEADINGS: Heading[] = [
  { id: 'quick-answer', text: 'Quick answer', level: 2 },
  { id: 'direct-evidence', text: 'What directly targets racing thoughts', level: 2 },
  { id: 'supplement-ranking', text: 'Supplement evidence ranking', level: 2 },
  { id: 'l-theanine', text: 'L-theanine', level: 2 },
  { id: 'magnesium', text: 'Magnesium', level: 2 },
  { id: 'ashwagandha', text: 'Ashwagandha', level: 2 },
  { id: 'bedtime', text: 'When overthinking happens at bedtime', level: 2 },
  { id: 'safety', text: 'Safety and red flags', level: 2 },
  { id: 'faq', text: 'Frequently asked questions', level: 2 },
]

const REFERENCES = [
  { n: 1, title: 'Cognitive and affective effects of L-Theanine: a systematic review and meta-analysis of 31 randomized trials', text: 'Gerolymos C, et al. Mol Psychiatry. 2026.', year: 2026, pmid: '42410082', doi: '10.1038/s41380-026-03727-9', url: 'https://pubmed.ncbi.nlm.nih.gov/42410082/' },
  { n: 2, title: 'L-theanine in the adjunctive treatment of generalized anxiety disorder: A double-blind, randomised, placebo-controlled trial', text: '46 participants with DSM-5 GAD; L-theanine did not outperform placebo for anxiety reduction.', year: 2019, pmid: '30580081', url: 'https://pubmed.ncbi.nlm.nih.gov/30580081/' },
  { n: 3, title: 'Effects of L-Theanine Administration on Stress-Related Symptoms and Cognitive Functions in Healthy Adults', text: 'Randomized double-blind crossover trial; 30 healthy adults; 200 mg/day for four weeks.', year: 2019, pmid: '31623400', doi: '10.3390/nu11102362', url: 'https://pubmed.ncbi.nlm.nih.gov/31623400/' },
  { n: 4, title: 'Examining the Effects of Supplemental Magnesium on Self-Reported Anxiety and Sleep Quality: A Systematic Review', text: '15 interventional studies; heterogeneous forms, doses, populations and co-ingredients.', year: 2024, pmid: '38817505', doi: '10.7759/cureus.59317', url: 'https://pubmed.ncbi.nlm.nih.gov/38817505/' },
  { n: 5, title: 'The Effects of Magnesium Supplementation on Subjective Anxiety and Stress—A Systematic Review', text: 'Boyle NB, et al. Nutrients. 2017.', year: 2017, pmid: '28445426', url: 'https://pubmed.ncbi.nlm.nih.gov/28445426/' },
  { n: 6, title: 'Effects of Ashwagandha (Withania Somnifera) on stress and anxiety: A systematic review and meta-analysis', text: 'Nine randomized trials / 558 participants.', year: 2024, pmid: '39348746', doi: '10.1016/j.explore.2024.103062', url: 'https://pubmed.ncbi.nlm.nih.gov/39348746/' },
  { n: 7, title: 'Does Ashwagandha supplementation have a beneficial effect on the management of anxiety and stress?', text: 'Systematic review and meta-analysis of randomized trials; certainty rated low.', year: 2022, pmid: '36017529', doi: '10.1002/ptr.7598', url: 'https://pubmed.ncbi.nlm.nih.gov/36017529/' },
  { n: 8, title: 'Does cognitive behaviour therapy for insomnia reduce repetitive negative thinking and sleep-related worry beliefs?', text: 'Systematic review and meta-analysis of 15 randomized trials.', year: 2021, pmid: '32992228', doi: '10.1016/j.smrv.2020.101378', url: 'https://pubmed.ncbi.nlm.nih.gov/32992228/' },
  { n: 9, title: 'Behavioral and psychological treatments for chronic insomnia disorder in adults: an AASM clinical practice guideline', text: 'Strong recommendation for multicomponent CBT-I.', year: 2021, pmid: '33164742', doi: '10.5664/jcsm.8986', url: 'https://pubmed.ncbi.nlm.nih.gov/33164742/' },
  { n: 10, title: 'World Sleep Society endorsement of behavioral and psychological treatments for chronic insomnia disorder', text: 'Endorses CBT-I as treatment of choice for insomnia disorder.', year: 2023, pmid: '37454606', doi: '10.1016/j.sleep.2023.07.001', url: 'https://pubmed.ncbi.nlm.nih.gov/37454606/' },
  { n: 11, title: 'Mechanisms of cognitive behavioural therapy for insomnia', text: 'Review describing roles of dysfunctional beliefs, selective attention, worry and rumination in CBT-I.', year: 2023, pmid: '36866434', doi: '10.1111/jsr.13860', url: 'https://pubmed.ncbi.nlm.nih.gov/36866434/' },
  { n: 12, title: 'Daytime rumination as a feature of Insomnia Disorder: sleep related cognition is not merely a problem of the night', text: 'Observational study of sleep-related rumination across insomnia, OSA and healthy groups.', year: 2015, pmid: '26742678', doi: '10.12871/0003982920152349', url: 'https://pubmed.ncbi.nlm.nih.gov/26742678/' },
  { n: 13, title: 'Ashwagandha: Usefulness and Safety', text: 'National Center for Complementary and Integrative Health. Current safety summary.', year: 2026, url: 'https://www.nccih.nih.gov/health/ashwagandha' },
  { n: 14, title: 'Magnesium Fact Sheet for Health Professionals', text: 'NIH Office of Dietary Supplements. Safety and medication-interaction context.', year: 2026, url: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/' },
  { n: 15, title: 'A Randomized, Triple-Blind, Placebo-Controlled, Crossover Study of a Single Dose of AlphaWave L-Theanine on Stress', text: 'Healthy moderately stressed adults; product-specific acute stress study.', year: 2021, pmid: '34562208', url: 'https://pubmed.ncbi.nlm.nih.gov/34562208/' },
]

export default function Page() {
  const toc = <TableOfContents headings={HEADINGS} />

  return (
    <ArticleLayout toc={toc} zone="supplement">
      <StructuredData
        pageUrl={PAGE_URL}
        headline="Racing Thoughts at Night: Supplements, Evidence & What Works"
        description="Evidence-first guide to racing thoughts, overthinking and bedtime rumination, comparing direct CBT-I evidence with indirect supplement evidence."
        datePublished="2026-06-18"
        dateModified="2026-08-22"
        faqs={FAQS}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides/' },
          { label: 'Anxiety Guides', href: '/guides/anxiety/' },
          { label: 'Racing Thoughts & Overthinking', href: '/guides/anxiety/best-supplements-for-overthinking/' },
        ]}
      />

      <div className="space-y-12">
        <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-10">
          <p className="eyebrow-label">Evidence hierarchy · 15-source clinical ledger</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Racing Thoughts at Night: What Actually Helps — and Where Supplements Fit
          </h1>
          <p className="mt-2 text-xs text-muted">
            Written and edited by{' '}
            <Link href="/info/author/" rel="author" className="font-medium text-brand-700 hover:underline">Willie B. Randolph III</Link>{' '}
            · Last updated August 22, 2026
          </p>
          <p className="detail-reading mt-4 max-w-3xl text-muted">
            “Overthinking,” “racing thoughts,” worry and rumination are often treated as if they were one supplement target. They are not.
            The strongest direct evidence on this page is actually behavioral: when repetitive thinking is tied to insomnia, CBT-I can reduce
            sleep-related worry.<Cite n={8} /><Cite n={9} /> Supplement studies usually measure something adjacent — stress, anxiety, sleep quality
            or attention — and should be labeled that way.
          </p>
          <figure className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
              <Image src="/images/guides/best-supplements-for-overthinking.jpg" alt="L-theanine and magnesium supplements with green tea and lavender" width={1536} height={1024} priority className="h-auto w-full" />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">The clinically useful question is whether the evidence measures rumination itself or only a neighboring outcome.</figcaption>
          </figure>
        </section>

        <section id="quick-answer" className="card-premium scroll-mt-20 border-brand-700/30 bg-brand-50/60 p-6">
          <p className="eyebrow-label">Direct answer</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">There is no proven supplement for “turning off” a racing mind</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-muted">
            <p>
              <strong className="text-ink">L-theanine:</strong> the 2026 meta-analysis found a modest acute stress effect, but it was strongly influenced by higher-risk-of-bias studies; anxiety findings were inconsistent.<Cite n={1} /> A randomized GAD trial found no anxiety benefit over placebo.<Cite n={2} />
            </p>
            <p>
              <strong className="text-ink">Magnesium:</strong> systematic reviews contain some positive anxiety and sleep findings, but forms, doses, populations and co-ingredients vary enough that a direct anti-rumination claim is not justified.<Cite n={4} /><Cite n={5} />
            </p>
            <p>
              <strong className="text-ink">Ashwagandha:</strong> repeated-dose trials support a stress/anxiety signal, but certainty and standardization remain limitations, and the evidence does not establish a same-night effect on racing thoughts.<Cite n={6} /><Cite n={7} />
            </p>
          </div>
        </section>

        <section id="direct-evidence" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">The evidence most directly matched to the query</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">What directly targets racing thoughts before bed?</h2>
          <p className="text-muted">
            A 2021 systematic review and meta-analysis examined whether CBT-I reduces repetitive negative thinking — including worry and rumination.
            Across 15 randomized trials, CBT-I produced moderate-to-large effects on worry, while effects on general rumination were small and not reliable.
            The authors found the effect was stronger for <strong className="text-ink">sleep-related</strong> repetitive thinking than for broad rumination.<Cite n={8} />
          </p>
          <p className="text-muted">
            That aligns with the AASM guideline strongly recommending multicomponent CBT-I for chronic insomnia, and the World Sleep Society's endorsement
            of CBT-I as the treatment of choice for insomnia disorder.<Cite n={9} /><Cite n={10} /> Mechanistic reviews also identify worry, rumination,
            dysfunctional sleep beliefs and selective attention as relevant cognitive treatment targets.<Cite n={11} />
          </p>
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm leading-6 text-amber-950">
            <strong>Important:</strong> this does not mean every racing thought is caused by insomnia. It means that when the query is specifically
            “my mind races when I try to sleep,” CBT-I evidence is more direct than borrowing a stress score from a supplement trial.
          </div>
        </section>

        <section id="supplement-ranking" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Ranked by directness, not hype</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">How the supplement evidence actually stacks up</h2>
          <div className="overflow-x-auto rounded-2xl border border-brand-900/10 bg-white">
            <table className="min-w-[850px] w-full text-left text-sm">
              <thead className="bg-brand-50/70">
                <tr><th className="p-3 font-semibold text-ink">Option</th><th className="p-3 font-semibold text-ink">Closest supported outcome</th><th className="p-3 font-semibold text-ink">Direct for rumination?</th><th className="p-3 font-semibold text-ink">Main limitation</th></tr>
              </thead>
              <tbody className="divide-y divide-brand-900/10">
                <tr><td className="p-3 font-semibold text-ink">L-theanine</td><td className="p-3 text-muted">Attention; modest/bias-sensitive acute stress signal<Cite n={1} /></td><td className="p-3 text-muted">No</td><td className="p-3 text-muted">Anxiety findings inconsistent; GAD trial negative<Cite n={2} /></td></tr>
                <tr><td className="p-3 font-semibold text-ink">Magnesium</td><td className="p-3 text-muted">Some anxiety/sleep outcomes<Cite n={4} /><Cite n={5} /></td><td className="p-3 text-muted">No</td><td className="p-3 text-muted">Heterogeneous studies; form superiority unresolved</td></tr>
                <tr><td className="p-3 font-semibold text-ink">Ashwagandha</td><td className="p-3 text-muted">Repeated-dose stress/anxiety outcomes<Cite n={6} /><Cite n={7} /></td><td className="p-3 text-muted">No</td><td className="p-3 text-muted">Low-certainty/heterogeneous evidence; not an acute rescue</td></tr>
                <tr><td className="p-3 font-semibold text-ink">CBT-I (not a supplement)</td><td className="p-3 text-muted">Sleep-related worry / repetitive negative thinking<Cite n={8} /></td><td className="p-3 text-muted">Yes, when tied to insomnia</td><td className="p-3 text-muted">Behavioral treatment, not a capsule</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="l-theanine" className="card-premium scroll-mt-20 p-6">
          <h2 className="text-2xl font-semibold text-ink">L-theanine: interesting for stress and attention, not proven for rumination</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-muted">
            <p>
              The July 2026 meta-analysis pooled 31 randomized placebo-controlled trials with 1,168 participants. A 200 mg acute dose improved choice reaction time,
              but the pooled acute stress reduction was modest and largely driven by higher-risk-of-bias studies; anxiety effects were inconsistent.<Cite n={1} />
            </p>
            <p>
              A separate GAD trial is an important negative result: 46 participants received adjunctive L-theanine or placebo for eight weeks, and L-theanine did not
              outperform placebo for anxiety reduction or overall insomnia severity.<Cite n={2} /> A small four-week healthy-adult crossover trial did report improvements
              in selected stress/anxiety and sleep scores, but two authors were employees of the company that supplied the intervention.<Cite n={3} />
            </p>
            <p>
              Product-specific acute stress studies also exist,<Cite n={15} /> but none of this establishes that L-theanine reliably stops intrusive thought loops or works
              within a guaranteed 30–60 minute window for “mental chatter.”
            </p>
          </div>
          <Link href="/compounds/l-theanine/" className="mt-3 inline-block font-semibold text-brand-700 hover:underline">L-theanine evidence profile →</Link>
        </section>

        <section id="magnesium" className="card-premium scroll-mt-20 p-6">
          <h2 className="text-2xl font-semibold text-ink">Magnesium: plausible when status is low, but “magnesium glycinate for overthinking” outruns the evidence</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-muted">
            <p>
              A 2024 review found 15 eligible intervention studies: eight measured sleep outcomes and seven measured anxiety outcomes. Many reported at least one positive
              result, but forms, doses, durations, populations and co-ingredients varied, limiting firm conclusions.<Cite n={4} /> An earlier review likewise described
              suggestive evidence but major methodological limitations.<Cite n={5} />
            </p>
            <p>
              Neither review establishes magnesium glycinate as the proven form for rumination. Supplemental magnesium can cause gastrointestinal effects and interact with
              some medications; kidney impairment changes the safety calculation.<Cite n={14} />
            </p>
          </div>
          <Link href="/compounds/magnesium-glycinate/" className="mt-3 inline-block font-semibold text-brand-700 hover:underline">Magnesium glycinate evidence profile →</Link>
        </section>

        <section id="ashwagandha" className="card-premium scroll-mt-20 p-6">
          <h2 className="text-2xl font-semibold text-ink">Ashwagandha: stronger for repeated-dose stress than for racing thoughts</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-muted">
            <p>
              A 2024 meta-analysis of nine randomized trials (558 participants) found improvements in perceived stress, anxiety and cortisol across specific ashwagandha
              formulations.<Cite n={6} /> A 2022 meta-analysis also found positive stress/anxiety effects but rated the certainty of evidence low and reported substantial
              heterogeneity.<Cite n={7} />
            </p>
            <p>
              Those data support a repeated-dose stress/anxiety signal, not a same-night treatment for rumination. NCCIH also notes pregnancy avoidance, thyroid/autoimmune
              cautions, medication interactions and rare liver injury reports.<Cite n={13} />
            </p>
          </div>
          <Link href="/herbs/ashwagandha/" className="mt-3 inline-block font-semibold text-brand-700 hover:underline">Ashwagandha evidence profile →</Link>
        </section>

        <section id="bedtime" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-brand-50/40 p-6">
          <h2 className="text-2xl font-semibold text-ink">When the overthinking mainly happens at bedtime</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Sleep-related rumination is not just an internet phrase. Research has found elevated sleep-related repetitive thinking in people with insomnia,<Cite n={12} />
            and CBT-I trials suggest sleep-related worry is modifiable.<Cite n={8} /> That makes a bedtime-specific page fundamentally different from a generic anxiety-supplement list.
          </p>
          <p className="mt-3 text-sm leading-7 text-muted">
            If the pattern is “I am fine until my head hits the pillow,” examine the insomnia loop itself — clock-watching, fear of not sleeping, compensatory time in bed,
            repeated checking and sleep-related worry — instead of assuming the missing ingredient is a calming supplement. For persistent insomnia, CBT-I has strong guideline support.<Cite n={9} /><Cite n={10} />
          </p>
        </section>

        <section id="safety" className="scroll-mt-20 rounded-[1.65rem] border border-amber-200 bg-amber-50/70 p-6">
          <p className="eyebrow-label">Safety boundary</p>
          <h2 className="mt-1 text-2xl font-semibold text-amber-950">When supplement experimentation is the wrong lane</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-amber-900">
            <li>• Racing or repetitive thoughts are persistent, intrusive, tied to compulsions, panic, major mood change or significant loss of function.</li>
            <li>• Symptoms began after a medication, stimulant, recreational substance or major sleep-pattern change.</li>
            <li>• You are escalating multiple “calming” products at once, making effects and interactions impossible to attribute.</li>
            <li>• Sleep disturbance is chronic or accompanied by loud snoring/gasping, severe daytime sleepiness or other signs of a separate sleep disorder.</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/safety-checker/" className="rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-950">Check interaction cautions</Link>
            <Link href="/guides/sleep/best-natural-sleep-aids-that-work/" className="rounded-full border border-amber-900/20 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-white/60">Sleep evidence guide</Link>
          </div>
        </section>

        <References refs={REFERENCES} />

        <section id="faq" className="scroll-mt-20 space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.question} className="card-premium p-5">
                <summary className="cursor-pointer text-base font-semibold text-ink">{faq.question}</summary>
                <p className="mt-2 text-sm leading-6 text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <EmailCapture location="guides-best-supplements-for-overthinking" className="mt-6" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Related guides &amp; comparisons</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/guides/anxiety/best-herbs-for-anxiety/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Best Herbs for Anxiety →</Link>
            <Link href="/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Stress &amp; Anxiety at Night →</Link>
            <Link href="/guides/best/supplements-for-stress/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Best Supplements for Stress →</Link>
            <Link href="/guides/sleep/best-supplements-for-sleep/" className="card-premium block p-4 text-sm font-semibold text-brand-700 hover:border-brand-700/40">Best Sleep Supplements →</Link>
          </div>
        </section>
      </div>
    </ArticleLayout>
  )
}
