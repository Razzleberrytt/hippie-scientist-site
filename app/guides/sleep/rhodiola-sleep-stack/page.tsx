import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import References from '@/components/References'

const SLUG = 'rhodiola-sleep-stack'

export const metadata: Metadata = buildPageMetadata({
  title: 'Rhodiola + Magnesium for Sleep: Evidence, Limits, and Safety (2026)',
  description: 'Evidence-first review of rhodiola plus magnesium for sleep: no direct combination trial, mixed magnesium sleep evidence, indirect rhodiola evidence, and safety limits.',
  path: `/guides/sleep/${SLUG}`,
  openGraphType: 'article',
})

const HEADINGS: Heading[] = [
  { id: 'answer', text: 'Does the Combination Work?', level: 2 },
  { id: 'rhodiola', text: 'What Rhodiola Evidence Shows', level: 2 },
  { id: 'magnesium', text: 'What Magnesium Evidence Shows', level: 2 },
  { id: 'combination', text: 'What We Know About the Combination', level: 2 },
  { id: 'safety', text: 'Safety and Decision Context', level: 2 },
  { id: 'bottom-line', text: 'Bottom Line', level: 2 },
]

const REFS = [
  {
    n: 1,
    text: 'Ishaque S, et al. Rhodiola rosea for physical and mental fatigue: a systematic review. BMC Complement Altern Med. 2012;12:70.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/22643043/',
  },
  {
    n: 2,
    text: 'Punja S, et al. Rhodiola rosea for mental and physical fatigue in nursing students: a randomized controlled trial. PLoS One. 2014;9:e108416.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/25268803/',
  },
  {
    n: 3,
    text: 'Mah J, et al. Oral magnesium supplementation for insomnia in older adults: a systematic review and meta-analysis. BMC Complement Med Ther. 2021;21:125.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/33865376/',
  },
  {
    n: 4,
    text: 'Abbasi B, et al. The effect of magnesium supplementation on primary insomnia in elderly: a double-blind placebo-controlled clinical trial. J Res Med Sci. 2012;17:1161-1169.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/23853635/',
  },
  {
    n: 5,
    text: 'Magnesium bisglycinate supplementation in healthy adults reporting poor sleep: a randomized, placebo-controlled trial. Nat Sci Sleep. 2025.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40918053/',
  },
  {
    n: 6,
    text: 'NIH Office of Dietary Supplements. Magnesium: Fact Sheet for Health Professionals.',
    url: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/',
  },
]

export default function RhodiolaSleepStackGuidePage() {
  const toc = <TableOfContents headings={HEADINGS} />

  return (
    <ArticleLayout toc={toc} zone="supplement">
      <div className="space-y-8">
        <AuthorityBreadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Guides', href: '/guides/' },
            { label: 'Rhodiola + Magnesium for Sleep' },
          ]}
        />

        <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-sm sm:p-8 lg:p-10">
          <p className="eyebrow-label">Combination Evidence Review</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
            Rhodiola + Magnesium for Sleep: What Is Actually Known?
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg">
            There is a plausible reason someone might consider rhodiola for daytime stress or fatigue and magnesium for sleep-related symptoms, but that is not the same as evidence for a validated “sleep stack.” No randomized trial identified for this review directly tested rhodiola plus magnesium as a sleep combination.
          </p>

          <figure className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
              <Image
                src="/images/guides/rhodiola-sleep-stack.jpg"
                alt="Rhodiola root and magnesium capsules shown together for an evidence review"
                width={1536}
                height={1024}
                priority
                className="h-auto w-full"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              Pairing two separately studied ingredients does not create combination evidence.
            </figcaption>
          </figure>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-sm leading-6 text-amber-950">
          <p className="font-bold">Direct answer</p>
          <p className="mt-2">
            <strong>The combination is unproven for sleep.</strong> Rhodiola has mostly been studied for fatigue, stress, and related symptoms rather than as a primary insomnia treatment. Magnesium has some randomized sleep data, but the overall evidence has historically been low quality and newer positive results are modest. The pair should therefore be described as an untested combination, not a protocol with established timing, synergy, or expected week-by-week effects.
          </p>
        </section>

        <section id="answer" className="card-premium scroll-mt-20 p-6 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Does the Combination Work?</h2>
          <p className="text-sm leading-7 text-muted">
            We do not have direct randomized evidence showing that taking rhodiola and magnesium together improves insomnia, sleep duration, sleep efficiency, or another validated sleep outcome more than either ingredient alone. A proposed rationale—daytime stress support from rhodiola plus a possible sleep effect from magnesium—is a hypothesis assembled from separate literatures.
          </p>
          <p className="text-sm leading-7 text-muted">
            That distinction matters. “Different mechanisms” does not prove complementary benefit, and the absence of a known pairwise interaction does not prove the combination has been established as safe for every user.
          </p>
        </section>

        <section id="rhodiola" className="card-premium scroll-mt-20 p-6 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">What Rhodiola Evidence Shows</h2>
          <div className="space-y-3 text-sm leading-7 text-muted">
            <p>
              Rhodiola research is mainly centered on fatigue, stress, mood, and performance rather than primary sleep treatment. A systematic review found substantial heterogeneity and methodological limitations across fatigue studies, making broad efficacy conclusions difficult [1].
            </p>
            <p>
              Individual trials do not point in one direction. In a randomized placebo-controlled study of nursing students working shifts, rhodiola did not improve the primary fatigue outcome and the between-group result favored placebo [2]. Other studies have reported benefits for stress- or fatigue-related outcomes, but many are small, open-label, or use different extracts and populations.
            </p>
            <p>
              Sleep should therefore be treated as <strong>indirect or exploratory context</strong> for rhodiola, not as an established indication. The literature also contains reports of insomnia or alerting effects in some users, which argues against a universal timing rule.
            </p>
          </div>
          <Link href="/guides/rhodiola-complete-guide/" className="inline-flex text-sm font-bold text-brand-800 hover:underline">
            Read the full rhodiola evidence guide →
          </Link>
        </section>

        <section id="magnesium" className="card-premium scroll-mt-20 p-6 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">What Magnesium Evidence Shows</h2>
          <div className="space-y-3 text-sm leading-7 text-muted">
            <p>
              Magnesium has more direct sleep research than rhodiola, but the evidence is not strong enough to turn it into a universal sleep protocol. A 2021 systematic review found only three randomized trials in 151 older adults with insomnia; sleep-onset latency improved in the pooled estimate, but the trials had moderate-to-high risk of bias and the evidence quality was rated low to very low [3].
            </p>
            <p>
              One small 2012 trial in older adults reported improvements in several subjective insomnia measures [4]. More recently, a 2025 randomized trial of 155 adults with self-reported poor sleep found a statistically significant but <strong>small</strong> improvement in insomnia severity with magnesium bisglycinate over four weeks [5]. Exploratory findings suggested baseline magnesium intake might influence response, but that needs confirmation.
            </p>
            <p>
              So the fairest summary is <strong>possible modest benefit in some populations, with uncertainty about who benefits most</strong>—not “magnesium glycinate is the safest or best sleep form” and not a fixed bedtime dose for everyone.
            </p>
          </div>
          <Link href="/guides/sleep/magnesium-for-sleep/" className="inline-flex text-sm font-bold text-brand-800 hover:underline">
            Read the magnesium-for-sleep evidence guide →
          </Link>
        </section>

        <section id="combination" className="card-premium scroll-mt-20 p-6 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">What We Know About the Combination</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-brand-900/10 bg-white/80 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Supported</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
                <li>The ingredients have separate human research literatures.</li>
                <li>Magnesium has some direct sleep trials.</li>
                <li>Rhodiola has human studies in stress and fatigue contexts.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-rose-800">Not established</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-rose-950">
                <li>Superior sleep benefit from combining them.</li>
                <li>A required morning/evening timing schedule.</li>
                <li>A universal three- or four-week trial period.</li>
                <li>Predictable week-by-week changes in sleep or energy.</li>
                <li>Long-term safety of the pair across populations and medication regimens.</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="safety" className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 space-y-4 scroll-mt-20">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Safety and Decision Context</h2>
          <div className="space-y-3 text-sm leading-7 text-amber-950">
            <p>
              Magnesium supplements can cause diarrhea, nausea, and abdominal cramping at higher supplemental intakes, and risk from excess magnesium is greater when kidney function is impaired. Magnesium can also interact with several medication classes, including certain antibiotics and bisphosphonates [6].
            </p>
            <p>
              Rhodiola’s safety and interaction evidence is less complete than the certainty of many commercial claims suggests. Because products differ in extract composition and because direct rhodiola-magnesium combination trials are absent, safety should be checked at the ingredient and medication level rather than inferred from the word “adaptogen.”
            </p>
            <p>
              If sleep problems are persistent, severe, or accompanied by another medical or psychiatric condition, a supplement combination is not a substitute for evaluating the cause of the sleep problem.
            </p>
          </div>
          <Link href="/safety-checker/" className="inline-flex text-sm font-bold text-brand-800 hover:underline">
            Check mapped interactions and cautions →
          </Link>
        </section>

        <section id="bottom-line" className="card-premium scroll-mt-20 p-6 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom Line</h2>
          <p className="text-sm leading-7 text-muted">
            Rhodiola plus magnesium is better described as an <strong>untested combination of two separately studied ingredients</strong> than as an evidence-based sleep stack. Magnesium has limited direct sleep evidence with modest effects in some trials; rhodiola’s evidence is primarily about fatigue and stress. Until direct combination research exists, claims about synergy, required timing, dosing protocols, or predictable long-term benefit should stay off the page.
          </p>
        </section>

        <References refs={REFS} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-900/10 pt-4">
          <Link href="/guides/" className="text-sm font-bold text-brand-800 hover:underline">← Back to guides</Link>
          <Link href="/guides/other/supplement-stacking-safety/" className="text-sm font-bold text-brand-800 hover:underline">Combination safety guide →</Link>
        </div>
      </div>
    </ArticleLayout>
  )
}
