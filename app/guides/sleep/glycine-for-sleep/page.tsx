import type { Metadata } from 'next'
import Link from 'next/link'
import StructuredData from '@/components/StructuredData'
import References from '@/components/References'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import { SITE_URL, buildTwitterMetadata } from '@/src/lib/seo'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'

const path = '/guides/sleep/glycine-for-sleep/'
const pageUrl = `${SITE_URL}${path}`

export const metadata: Metadata = {
  title: 'Glycine for Sleep: Does 3 g Actually Work? Evidence Review',
  description:
    'Evidence-first review of glycine for sleep: the small 3 g bedtime trials, systematic-review limits, objective sleep findings, next-day fatigue, mechanisms, safety, and magnesium glycinate confusion.',
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'Glycine for Sleep: Does 3 g Actually Work?',
    description:
      'A citation-dense review of glycine for sleep quality, sleep latency, next-day fatigue, the 3 g study dose, evidence limitations, and safety.',
    url: pageUrl,
    type: 'article',
    images: ['/og-default.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: 'Glycine for Sleep: Does 3 g Actually Work?',
    description:
      'What small human trials and a 2024 systematic review actually say about glycine for sleep.',
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
  {
    n: 1,
    title: 'The effect of glycine administration on the characteristics of physiological systems in human adults: A systematic review',
    text: 'Soh J, et al. Geroscience. 2024;46(1):219-239.',
    year: 2024,
    pmid: '37851316',
    doi: '10.1007/s11357-023-00970-8',
    url: 'https://pubmed.ncbi.nlm.nih.gov/37851316/',
  },
  {
    n: 2,
    title: 'Subjective effects of glycine ingestion before bedtime on sleep quality',
    text: 'Inagawa K, et al. Sleep Biol Rhythms. 2006;4:75-77.',
    year: 2006,
    doi: '10.1111/j.1479-8425.2006.00193.x',
    url: 'https://doi.org/10.1111/j.1479-8425.2006.00193.x',
  },
  {
    n: 3,
    title: 'Glycine ingestion improves subjective sleep quality in human volunteers, correlating with polysomnographic changes',
    text: 'Yamadera W, et al. Sleep Biol Rhythms. 2007;5:126-131.',
    year: 2007,
    doi: '10.1111/j.1479-8425.2007.00262.x',
    url: 'https://doi.org/10.1111/j.1479-8425.2007.00262.x',
  },
  {
    n: 4,
    title: 'The effects of glycine on subjective daytime performance in partially sleep-restricted healthy volunteers',
    text: 'Bannai M, et al. Front Neurol. 2012;3:61.',
    year: 2012,
    pmid: '22529837',
    doi: '10.3389/fneur.2012.00061',
    url: 'https://pubmed.ncbi.nlm.nih.gov/22529837/',
  },
  {
    n: 5,
    title: 'New therapeutic strategy for amino acid medicine: glycine improves the quality of sleep',
    text: 'Bannai M, Kawai N. J Pharmacol Sci. 2012;118(2):145-148.',
    year: 2012,
    pmid: '22293292',
    doi: '10.1254/jphs.11r04fm',
    url: 'https://pubmed.ncbi.nlm.nih.gov/22293292/',
  },
  {
    n: 6,
    title: 'The sleep-promoting and hypothermic effects of glycine are mediated by NMDA receptors in the suprachiasmatic nucleus',
    text: 'Kawai N, et al. Neuropsychopharmacology. 2015; preclinical mechanistic study.',
    year: 2015,
    pmid: '25533534',
    url: 'https://pubmed.ncbi.nlm.nih.gov/25533534/',
  },
  {
    n: 7,
    title: 'Nutritional Modulation of Sleep Latency, Duration, and Efficiency: A Randomized, Repeated-Measures, Double-Blind Deception Study',
    text: 'Langan-Evans C, et al. Med Sci Sports Exerc. 2023;55(2):289-300. Multi-ingredient formulation; not glycine-alone evidence.',
    year: 2023,
    pmid: '36094342',
    doi: '10.1249/MSS.0000000000003040',
    url: 'https://pubmed.ncbi.nlm.nih.gov/36094342/',
  },
  {
    n: 8,
    title: 'The nature of human hazards associated with excessive intake of amino acids',
    text: 'Garlick PJ. J Nutr. 2004;134(6 Suppl):1633S-1639S.',
    year: 2004,
    pmid: '15173443',
    doi: '10.1093/jn/134.6.1633S',
    url: 'https://pubmed.ncbi.nlm.nih.gov/15173443/',
  },
  {
    n: 9,
    title: 'Management of Chronic Insomnia Disorder in Adults: A Clinical Practice Guideline From the American College of Physicians',
    text: 'Qaseem A, et al. Ann Intern Med. 2016;165(2):125-133.',
    year: 2016,
    pmid: '27136449',
    doi: '10.7326/M15-2175',
    url: 'https://pubmed.ncbi.nlm.nih.gov/27136449/',
  },
  {
    n: 10,
    title: 'Behavioral and psychological treatments for chronic insomnia disorder in adults: an American Academy of Sleep Medicine clinical practice guideline',
    text: 'Edinger JD, et al. J Clin Sleep Med. 2021;17(2):255-262.',
    year: 2021,
    pmid: '33164742',
    doi: '10.5664/jcsm.8986',
    url: 'https://pubmed.ncbi.nlm.nih.gov/33164742/',
  },
  {
    n: 11,
    title: 'Clinical Practice Guideline for the Pharmacologic Treatment of Chronic Insomnia in Adults',
    text: 'Sateia MJ, et al. J Clin Sleep Med. 2017;13(2):307-349.',
    year: 2017,
    pmid: '27998379',
    url: 'https://pubmed.ncbi.nlm.nih.gov/27998379/',
  },
]

const FAQS = [
  {
    q: 'Does glycine actually help sleep?',
    a: 'Possibly, but confidence is low. Small crossover studies reported improvements in subjective sleep quality and selected objective measures after bedtime glycine, while a 2024 systematic review concluded that the sleep studies were small and at high risk of bias.',
  },
  {
    q: 'Is 3 grams of glycine the proven sleep dose?',
    a: 'No. Three grams is the dose repeatedly used in several small sleep studies, which makes it the best-known research dose—not a validated optimal dose or a universal personal recommendation.',
  },
  {
    q: 'How long before bed should glycine be taken?',
    a: 'The small trials used pre-bedtime administration, but the evidence does not establish a precise universal onset window. Study timing should not be converted into a guaranteed 30–60 minute effect.',
  },
  {
    q: 'Is glycine the same as magnesium glycinate?',
    a: 'No. Magnesium glycinate is magnesium bound to glycine. A serving designed to deliver magnesium does not automatically provide the same standalone glycine exposure studied in the 3 g glycine trials.',
  },
  {
    q: 'Is glycine a treatment for insomnia?',
    a: 'No established guideline treats glycine as a first-line chronic-insomnia therapy. Major insomnia guidelines prioritize cognitive behavioral therapy for insomnia (CBT-I), and glycine has not been established as a treatment for chronic insomnia disorder.',
  },
]

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <StructuredData
        pageUrl={pageUrl}
        headline="Glycine for Sleep: Does 3 g Actually Work? Evidence Review"
        description="Evidence-first review of glycine for sleep quality, sleep latency, next-day fatigue, dosing uncertainty, safety, and magnesium glycinate confusion."
        datePublished="2026-07-08"
        dateModified="2026-08-22"
        faqs={FAQS.map((faq) => ({ question: faq.q, answer: faq.a }))}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides/' },
          { label: 'Sleep', href: '/guides/sleep/' },
          { label: 'Glycine for Sleep', href: path },
        ]}
      />

      <nav className="mb-6 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/guides/" className="hover:text-ink">Guides</Link>
        <span className="mx-1.5">/</span>
        <Link href="/guides/sleep/" className="hover:text-ink">Sleep</Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-ink">Glycine for Sleep</span>
      </nav>

      <article className="space-y-10">
        <header className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10 dark:border-white/10 dark:bg-[var(--surface-card)]">
          <p className="eyebrow-label">Evidence review · 11-source clinical & mechanistic ledger</p>
          <h1 className="heading-premium mt-3 text-ink dark:text-[var(--text-primary)]">
            Glycine for Sleep: Does the 3 g Bedtime Dose Actually Work?
          </h1>
          <p className="mt-2 text-xs text-muted">Last evidence review August 22, 2026</p>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted dark:text-[var(--text-secondary)]">
            Glycine has a much smaller sleep evidence base than its online reputation suggests. A few small human studies using
            <strong className="text-ink"> 3 g before bedtime</strong> reported better subjective sleep, selected polysomnographic changes,
            and less next-day fatigue. But a 2024 systematic review judged the sleep evidence to be based on small studies with
            a high risk of bias.<Cite n={1} /> The right conclusion is <strong className="text-ink">interesting, preliminary, and worth separating from hype</strong>.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-brand-900/10 bg-brand-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Human sleep evidence</p>
              <p className="mt-1 font-semibold text-ink">Small & preliminary</p>
            </div>
            <div className="rounded-xl border border-brand-900/10 bg-brand-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Best-known study dose</p>
              <p className="mt-1 font-semibold text-ink">3 g before bedtime</p>
            </div>
            <div className="rounded-xl border border-brand-900/10 bg-brand-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Biggest evidence problem</p>
              <p className="mt-1 font-semibold text-ink">Few small, related studies</p>
            </div>
          </div>
        </header>

        <section className="card-premium p-6 sm:p-8">
          <p className="eyebrow-label">Direct answer</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">Does glycine help sleep?</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-muted sm:text-base">
            <p>
              <strong className="text-ink">There is a positive signal, but the evidence is not strong enough to call glycine a proven sleep aid.</strong>{' '}
              A 2006 randomized double-blind crossover study found that 3 g before bedtime improved next-morning ratings such as fatigue,
              liveliness and clear-headedness in volunteers dissatisfied with their sleep.<Cite n={2} />
            </p>
            <p>
              A 2007 crossover study using 3 g reported better subjective sleep quality and sleep efficiency, shorter polysomnographic
              latency to sleep onset and slow-wave sleep, and no major change in overall sleep architecture.<Cite n={3} /> A 2012 sleep-restriction
              study also reported less next-day fatigue and better psychomotor-vigilance performance after 3 g before bed.<Cite n={4} />
            </p>
            <p>
              The problem is scale and independence: the 2024 systematic review explicitly characterized glycine's sleep studies in healthy
              populations as <strong className="text-ink">small and at high risk of bias</strong>.<Cite n={1} /> Several foundational glycine-sleep papers
              also include investigators affiliated with Ajinomoto, which had an active amino-acid research program.<Cite n={2} /><Cite n={3} /><Cite n={5} />
              That does not invalidate the findings, but it makes independent replication especially valuable.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <p className="eyebrow-label">Evidence map</p>
          <h2 className="text-2xl font-semibold text-ink">What each line of evidence can actually tell us</h2>
          <ResponsiveTable label="Glycine sleep evidence table">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-900/10">
                  <th className="p-3 font-semibold text-ink">Evidence</th>
                  <th className="p-3 font-semibold text-ink">What it found</th>
                  <th className="p-3 font-semibold text-ink">What it does not prove</th>
                  <th className="p-3 font-semibold text-ink">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/10">
                <tr className="align-top">
                  <td className="p-3 font-semibold text-ink">2024 systematic review<Cite n={1} /></td>
                  <td className="p-3 text-muted">Sleep improvement signal in healthy populations.</td>
                  <td className="p-3 text-muted">Does not establish robust efficacy; review flagged small samples and high risk of bias.</td>
                  <td className="p-3 text-muted">Low</td>
                </tr>
                <tr className="align-top">
                  <td className="p-3 font-semibold text-ink">2006 crossover study<Cite n={2} /></td>
                  <td className="p-3 text-muted">Improved selected subjective next-morning sleep/alertness ratings after 3 g.</td>
                  <td className="p-3 text-muted">Does not establish chronic-insomnia treatment or an optimal dose.</td>
                  <td className="p-3 text-muted">Low</td>
                </tr>
                <tr className="align-top">
                  <td className="p-3 font-semibold text-ink">2007 PSG crossover study<Cite n={3} /></td>
                  <td className="p-3 text-muted">Subjective improvement plus selected PSG changes after 3 g.</td>
                  <td className="p-3 text-muted">Does not establish a class-wide effect in larger, independent samples.</td>
                  <td className="p-3 text-muted">Low</td>
                </tr>
                <tr className="align-top">
                  <td className="p-3 font-semibold text-ink">2012 sleep-restriction study<Cite n={4} /></td>
                  <td className="p-3 text-muted">Less next-day fatigue and improved vigilance under partial sleep restriction.</td>
                  <td className="p-3 text-muted">Does not show glycine reverses chronic sleep debt or treats insomnia.</td>
                  <td className="p-3 text-muted">Low</td>
                </tr>
                <tr className="align-top">
                  <td className="p-3 font-semibold text-ink">Mechanistic work<Cite n={5} /><Cite n={6} /></td>
                  <td className="p-3 text-muted">Supports thermoregulation / heat-dissipation hypotheses and SCN/NMDA involvement.</td>
                  <td className="p-3 text-muted">Animal mechanism cannot prove the human clinical effect or mediate it.</td>
                  <td className="p-3 text-muted">Mechanistic only</td>
                </tr>
              </tbody>
            </table>
          </ResponsiveTable>
        </section>

        <section className="card-premium p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-ink">The 3 g question: research dose, not gospel</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-muted sm:text-base">
            <p>
              Three grams appears repeatedly because that is what several foundational glycine-sleep studies tested.<Cite n={2} /><Cite n={3} /><Cite n={4} />
              That makes <strong className="text-ink">3 g a recognizable research dose</strong>, not a validated minimum, maximum, optimal dose, or personalized prescription.
            </p>
            <p>
              The evidence also does not establish a universal “take it 30–60 minutes before bed” onset rule. Pre-bedtime administration describes
              the study design. It does not prove when an individual should feel an effect, whether the effect should be noticeable the first night,
              or whether higher doses work better.
            </p>
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-950">
              <strong>Search-result trap:</strong> “3 g was studied” is not the same claim as “3 g is the scientifically proven dose.”
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="card-premium p-6">
            <h2 className="text-xl font-semibold text-ink">Subjective sleep vs objective sleep</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Glycine is unusual in that the 2007 study reported both subjective improvement and selected polysomnographic changes.<Cite n={3} />
              That is more informative than questionnaire-only evidence, but the sample was still small. A single PSG study is a reason to replicate,
              not a reason to promise “deeper sleep” or a predictable change in sleep stages.
            </p>
          </div>
          <div className="card-premium p-6">
            <h2 className="text-xl font-semibold text-ink">Next-day fatigue may be the more interesting signal</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              The 2006 and 2012 studies both reported favorable next-morning or next-day outcomes.<Cite n={2} /><Cite n={4} /> That suggests the
              most defensible hypothesis may involve perceived recovery or alertness as much as sedation. It still does not justify using glycine
              to compensate for insufficient sleep.
            </p>
          </div>
        </section>

        <section className="card-premium p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-ink">Mechanism: thermoregulation is plausible, but mostly preclinical</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-muted sm:text-base">
            <p>
              Glycine participates in inhibitory glycine-receptor signaling and also acts at NMDA receptors. Researchers have proposed that oral glycine
              may facilitate heat loss and the normal pre-sleep decline in core temperature.<Cite n={5} /> In rats, glycine increased cutaneous blood flow,
              lowered core temperature and promoted sleep through NMDA-receptor signaling in the suprachiasmatic nucleus.<Cite n={6} />
            </p>
            <p>
              That mechanism is biologically interesting, but it should stay below the human outcomes in the evidence hierarchy. The animal data do not
              prove that thermoregulation explains the human benefit, and they do not establish a retail-product dose-response relationship.
            </p>
          </div>
        </section>

        <section className="card-premium p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-ink">Glycine vs magnesium glycinate: same word, different question</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-muted sm:text-base">
            <p>
              <strong className="text-ink">Standalone glycine</strong> is the amino acid studied at 3 g in the small sleep trials. <strong className="text-ink">Magnesium glycinate</strong>
              is a magnesium salt in which magnesium is bound to glycine. A label that delivers a useful amount of elemental magnesium does not automatically
              recreate the standalone 3 g glycine intervention.
            </p>
            <p>
              This matters for AI and search answers because “glycine for sleep” and “magnesium glycinate for sleep” are often collapsed into one recommendation.
              They have different evidence bases and should be evaluated separately.
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              <Link href="/guides/sleep/magnesium-for-sleep/" className="text-brand-800 hover:underline">Magnesium for sleep →</Link>
              <Link href="/guides/sleep/best-magnesium-for-sleep/" className="text-brand-800 hover:underline">Best magnesium for sleep evidence guide →</Link>
            </div>
          </div>
        </section>

        <section className="rounded-[1.65rem] border border-amber-200 bg-amber-50/70 p-6">
          <h2 className="text-2xl font-semibold text-amber-950">Safety: reassuring short studies do not equal established long-term safety</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-amber-950">
            <p>
              The small sleep trials did not identify a strong next-day sedative signal, and the 2007 paper reported no serious adverse effects during its study period.<Cite n={3} />
              A broader review of amino-acid safety noted historical human exposure to substantially larger glycine amounts without serious effects, but also emphasized the limited quality of human toxicity data for isolated amino acids.<Cite n={8} />
            </p>
            <p>
              That is not enough to declare indefinite nightly supplementation risk-free. Sleep-specific studies are brief and small, and there is little evidence
              addressing long-term nightly use, pregnancy/breastfeeding, complex disease states, or medication-specific interactions. Product purity also matters.
            </p>
          </div>
        </section>

        <section className="card-premium p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-ink">Glycine is not an established treatment for chronic insomnia</h2>
          <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
            The glycine trials are mostly small studies in people with subjective sleep dissatisfaction or experimentally restricted sleep—not a mature trial program
            in chronic insomnia disorder.<Cite n={1} /> Major guidelines recommend cognitive behavioral therapy for insomnia (CBT-I) as initial treatment for chronic
            insomnia.<Cite n={9} /><Cite n={10} /> Glycine does not have an evidence base comparable to established insomnia treatment and is not a recommended
            pharmacologic insomnia therapy in the AASM guideline.<Cite n={11} />
          </p>
        </section>

        <section className="card-premium p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-ink">What about glycine in sleep stacks?</h2>
          <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
            A 2023 randomized study tested a <strong className="text-ink">multi-ingredient blend</strong> containing glycine alongside tryptophan, magnesium,
            tart cherry and L-theanine.<Cite n={7} /> That kind of study can tell us something about the formula as a whole; it cannot tell us which ingredient
            caused the effect or prove that glycine combines synergistically with magnesium or L-theanine. Separate ingredient trials do not validate a stack.
          </p>
        </section>

        <section className="card-premium p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-ink">Frequently asked questions</h2>
          <div className="mt-4 space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.q} className="rounded-xl border border-brand-900/10 bg-brand-50/30 p-4">
                <summary className="cursor-pointer font-semibold text-ink">{faq.q}</summary>
                <p className="mt-2 text-sm leading-7 text-muted">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-800/15 bg-emerald-50/70 p-6 shadow-sm dark:border-white/10 dark:bg-[var(--surface-subtle)]">
          <h2 className="text-xl font-semibold text-ink dark:text-[var(--text-primary)]">The Hippie Scientist verdict</h2>
          <p className="mt-2 text-sm leading-7 text-muted dark:text-[var(--text-secondary)]">
            <strong className="text-ink">Glycine is interesting, inexpensive, and under-proven.</strong> The 3 g bedtime studies are real, and they include both
            subjective and objective signals. But the human sleep literature is tiny, concentrated in a related research lineage, and rated high-risk-of-bias in the
            recent systematic review. Treat 3 g as a <em>studied intervention</em>, not as a universal sleep prescription.
          </p>
        </section>

        <section className="space-y-3">
          <p className="text-sm leading-7 text-muted">
            <strong className="text-ink">Product-quality note:</strong> if glycine is being considered, the evidence does not establish that one powder, capsule,
            flavor, or brand is clinically superior. Product links are sourcing examples, not efficacy rankings.
          </p>
          <RecommendationSection products={getRevenueProductSet('glycine')?.products ?? []} />
        </section>

        <References refs={REFS} />

        <nav className="flex flex-wrap gap-4 border-t border-brand-900/10 pt-6 text-sm font-semibold text-brand-700">
          <Link href="/guides/sleep/best-natural-sleep-aids-that-work/" className="hover:underline">Natural sleep aids flagship →</Link>
          <Link href="/guides/other/sleep-supplements-guide/" className="hover:underline">Sleep supplements evidence hub →</Link>
          <Link href="/guides/sleep/best-supplements-for-sleep/" className="hover:underline">Best sleep supplements decision guide →</Link>
        </nav>
      </article>
    </main>
  )
}
