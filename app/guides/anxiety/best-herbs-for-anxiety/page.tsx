import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import StructuredData from '@/components/StructuredData'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/navigation-config'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import EmailCapture from '@/components/EmailCapture'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'

const PAGE_URL = `${SITE_URL}/guides/anxiety/best-herbs-for-anxiety`
const DATE = '2026-08-11'

export const metadata: Metadata = {
  title: 'Best Herbs for Anxiety: What the Evidence Supports in 2026',
  description:
    'Evidence-first comparison of ashwagandha, oral Silexan lavender oil, passionflower, kava, lemon balm, and chamomile for anxiety, with directness and safety limits.',
  alternates: { canonical: '/guides/anxiety/best-herbs-for-anxiety/' },
  openGraph: {
    title: 'Best Herbs for Anxiety: What the Evidence Supports in 2026',
    description:
      'Compare anxiety herbs by direct human evidence, formulation, duration, and safety instead of same-day rankings or universal winners.',
    url: '/guides/anxiety/best-herbs-for-anxiety/',
    type: 'article',
    images: ['/og-default.jpg'],
  },
}

const FAQS = [
  {
    question: 'Which herb has the strongest direct anxiety evidence?',
    answer:
      'There is no universal best herb. Among the options on this page, the most direct anxiety-disorder trial program belongs to Silexan, a proprietary oral lavender-oil preparation studied at defined doses over 10 weeks. That evidence does not automatically apply to lavender tea, aromatherapy, raw essential oil, or every lavender supplement. Ashwagandha has a repeated-dose stress/anxiety signal, but its evidence is formulation-specific and often comes from adults with elevated stress rather than a single anxiety diagnosis.',
  },
  {
    question: 'Is passionflower proven to work as well as oxazepam?',
    answer:
      'No. The often-cited trial enrolled only 36 outpatients with generalized anxiety disorder for 4 weeks and compared passionflower extract with oxazepam. The small study found no significant difference at the end of the trial, but it was a pilot and was not designed to establish equivalence. NCCIH still describes the overall passionflower evidence as limited and inconclusive.',
  },
  {
    question: 'Is kava a good option for acute anxiety?',
    answer:
      'Current evidence does not support presenting kava as a reliable acute-anxiety choice. A 16-week placebo-controlled trial in 171 non-medicated adults with diagnosed generalized anxiety disorder did not find a significant anxiety benefit over placebo. Kava products have also been linked to rare severe and sometimes fatal liver injury, and kava should not be combined with alcohol or other sedatives.',
  },
  {
    question: 'Can anxiety herbs replace medication or therapy?',
    answer:
      'No. Supplements should not replace prescribed medication, psychotherapy, or evaluation of persistent or impairing anxiety. Do not stop or reduce psychiatric medication based on this guide, and review herb–drug interactions with a clinician or pharmacist.',
  },
  {
    question: 'What if anxiety is severe or I do not feel safe?',
    answer:
      'Severe panic, rapidly worsening symptoms, suicidal thoughts, thoughts of self-harm, inability to stay safe, or imminent danger require immediate emergency or crisis care rather than supplement experimentation.',
  },
]

const SOURCES = [
  {
    label: 'Silexan meta-analysis of randomized placebo-controlled anxiety trials (2023)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/36717399/',
    note: 'Five double-blind placebo-controlled trials; 1,213 adult outpatients received the proprietary oral lavender-oil preparation Silexan 80 mg/day or placebo for 10 weeks.',
  },
  {
    label: 'Silexan randomized trial in generalized anxiety disorder (2014)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/24456909/',
    note: '539 adults with GAD were randomized to Silexan 160 mg, Silexan 80 mg, paroxetine 20 mg, or placebo for 10 weeks.',
  },
  {
    label: 'Ashwagandha stress and anxiety systematic review and meta-analysis (2024)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/39348746/',
    note: 'Nine randomized placebo-controlled trials and 558 participants; repeated-dose evidence using specific ashwagandha formulations.',
  },
  {
    label: 'Passionflower versus oxazepam pilot trial in generalized anxiety disorder (2001)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/11679026/',
    note: '36 outpatients with DSM-IV GAD; passionflower extract 45 drops/day versus oxazepam 30 mg/day for 4 weeks. A small pilot cannot establish equivalence.',
  },
  {
    label: 'Kava randomized placebo-controlled trial in generalized anxiety disorder (2020)',
    href: 'https://pubmed.ncbi.nlm.nih.gov/31813230/',
    note: '171 non-medicated adults with diagnosed GAD; aqueous dried-root extract standardized to 120 mg kavalactones twice daily for 16 weeks did not significantly outperform placebo.',
  },
  {
    label: 'NCCIH: Kava usefulness and safety',
    href: 'https://www.nccih.nih.gov/health/kava',
    note: 'Current safety summary includes rare severe or fatal liver injury reports and cautions against combining kava with benzodiazepines or alcohol.',
  },
  {
    label: 'NCCIH: Passionflower usefulness and safety',
    href: 'https://www.nccih.nih.gov/health/passionflower',
    note: 'Overall human evidence is limited; anxiety conclusions are not definite. Drowsiness, dizziness, confusion, pregnancy, and anesthesia cautions matter.',
  },
]

const HEADINGS: Heading[] = [
  { id: 'bottom-line', text: 'Bottom line', level: 2 },
  { id: 'directness', text: 'Compare by evidence directness', level: 2 },
  { id: 'evidence', text: 'Herb-by-herb evidence', level: 2 },
  { id: 'safety', text: 'Safety can outrank efficacy', level: 2 },
  { id: 'limits', text: 'What not to infer', level: 2 },
  { id: 'sources', text: 'Sources', level: 2 },
  { id: 'faq', text: 'Frequently asked questions', level: 2 },
]

export default function BestHerbsForAnxietyPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  const toc = <TableOfContents headings={HEADINGS} />

  return (
    <ArticleLayout toc={toc} zone="supplement">
      <StructuredData
        pageUrl={PAGE_URL}
        headline="Best Herbs for Anxiety: What the Evidence Supports in 2026"
        description="Evidence-first comparison of ashwagandha, Silexan lavender oil, passionflower, kava, lemon balm, and chamomile for anxiety."
        datePublished="2026-06-16"
        dateModified={DATE}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'Anxiety', href: '/guides/anxiety/' },
          { label: 'Best Herbs for Anxiety', href: '/guides/anxiety/best-herbs-for-anxiety' },
        ]}
      />
      <JsonLd schema={faqSchema} />

      <div className="space-y-10">
        <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
          <p className="eyebrow-label">Anxiety herb evidence guide</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Best Herbs for Anxiety
          </h1>
          <p className="mt-2 text-xs text-muted">Last evidence review August 11, 2026</p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
            “Best” is the wrong first question for anxiety herbs. The useful comparison is what was studied
            directly, in whom, with which preparation, for how long, and what safety limits come with it.
            This guide keeps formulation-specific evidence separate from broad herb-category claims and does
            not turn study timing into a same-day treatment promise.
          </p>

          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-950">
            <strong>Care boundary:</strong> Persistent or impairing anxiety deserves established mental-health
            care rather than supplement escalation. Suicidal thoughts, thoughts of self-harm, inability to stay
            safe, or imminent danger require immediate emergency or crisis care.
          </div>

          <figure className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
              <Image
                src="/images/guides/best-herbs-for-anxiety.jpg"
                alt="Passionflower, lavender, lemon balm, kava root, and ashwagandha arranged for an evidence comparison"
                width={1536}
                height={1024}
                priority
                className="h-auto w-full"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">
              Anxiety evidence is preparation-specific: a studied extract or oral oil cannot be generalized to every product made from the same plant.
            </figcaption>
          </figure>
        </section>

        <section id="bottom-line" className="scroll-mt-20 rounded-[1.65rem] border border-brand-700/25 bg-brand-50/60 p-6 shadow-sm">
          <p className="eyebrow-label">Bottom line</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            The evidence hierarchy is not the same as a “best herb” ranking
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-muted sm:text-base">
            <p>
              <strong>Oral Silexan</strong> has the most direct anxiety-disorder trial program among the
              options compared here, but the evidence belongs to a proprietary oral lavender-oil preparation
              studied for 10 weeks. It should not be generalized to lavender tea, aromatherapy, or raw essential oil.
            </p>
            <p>
              <strong>Ashwagandha</strong> has a meaningful repeated-dose stress/anxiety signal across randomized
              trials, but studies use specific formulations and multi-week exposure. <strong>Passionflower</strong>
              remains supported mainly by small studies, while <strong>kava</strong> combines mixed efficacy with a
              safety ceiling serious enough that it should not be promoted as the fast or obvious choice.
            </p>
          </div>
        </section>

        <section id="directness" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Compare directness, not popularity</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">What was actually studied?</h2>
          <div className="overflow-x-auto rounded-[1.65rem] border border-brand-900/10 bg-white shadow-sm">
            <table className="min-w-[820px] w-full text-sm">
              <thead className="border-b border-brand-900/10 bg-brand-50/50">
                <tr>
                  <th className="p-4 text-left font-semibold text-ink">Option</th>
                  <th className="p-4 text-left font-semibold text-ink">Direct human evidence</th>
                  <th className="p-4 text-left font-semibold text-ink">Main limit</th>
                  <th className="p-4 text-left font-semibold text-ink">Safety ceiling</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/10">
                <tr className="align-top">
                  <td className="p-4 font-semibold text-ink">Silexan oral lavender oil</td>
                  <td className="p-4 text-muted">Five placebo-controlled anxiety trials in 1,213 adult outpatients at 80 mg/day for 10 weeks; additional GAD dose-ranging data exist.</td>
                  <td className="p-4 text-muted">Evidence is for a proprietary oral preparation, not “lavender” as a class.</td>
                  <td className="p-4 text-muted">Do not ingest raw essential oil as if it were the studied product.</td>
                </tr>
                <tr className="align-top">
                  <td className="p-4 font-semibold text-ink">Ashwagandha</td>
                  <td className="p-4 text-muted">Nine randomized placebo-controlled trials / 558 participants in the 2024 meta-analysis using specific formulations over repeated dosing.</td>
                  <td className="p-4 text-muted">Heterogeneous extracts, populations, and outcome measures; not a class effect for every powder or capsule.</td>
                  <td className="p-4 text-muted">Pregnancy, thyroid, autoimmune, medication, and rare liver-injury concerns require individual review.</td>
                </tr>
                <tr className="align-top">
                  <td className="p-4 font-semibold text-ink">Passionflower</td>
                  <td className="p-4 text-muted">One often-cited pilot enrolled 36 GAD outpatients for 4 weeks: passionflower extract 45 drops/day versus oxazepam 30 mg/day.</td>
                  <td className="p-4 text-muted">Tiny active-comparator pilot; no basis for declaring equivalence, and NCCIH still calls the overall evidence inconclusive.</td>
                  <td className="p-4 text-muted">Drowsiness, dizziness, confusion, pregnancy, and anesthesia interactions matter.</td>
                </tr>
                <tr className="align-top">
                  <td className="p-4 font-semibold text-ink">Kava</td>
                  <td className="p-4 text-muted">A 16-week placebo-controlled GAD trial in 171 non-medicated adults used aqueous dried-root extract standardized to 120 mg kavalactones twice daily.</td>
                  <td className="p-4 text-muted">The trial did not significantly outperform placebo; the broader efficacy literature is mixed.</td>
                  <td className="p-4 text-muted">Rare severe or fatal liver injury has been linked to kava products; avoid combining kava with benzodiazepines or alcohol.</td>
                </tr>
                <tr className="align-top">
                  <td className="p-4 font-semibold text-ink">Lemon balm / chamomile</td>
                  <td className="p-4 text-muted">Small or preliminary anxiety studies and traditional-use context exist, but the evidence base is much thinner than the options above.</td>
                  <td className="p-4 text-muted">Do not convert “calming” plausibility or a tea ritual into evidence for an anxiety disorder.</td>
                  <td className="p-4 text-muted">Sedation, allergy, medication, and product-specific cautions still apply.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="evidence" className="scroll-mt-20 space-y-5">
          <p className="eyebrow-label">Herb-by-herb evidence</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">How to interpret each option without overclaiming it</h2>

          <article className="rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-ink">Silexan: direct anxiety evidence, narrow formulation claim</h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              The 2023 meta-analysis pooled five double-blind randomized placebo-controlled trials in 1,213 adult
              outpatients who received Silexan 80 mg/day or placebo for 10 weeks. A separate 539-person GAD trial
              compared 80 mg and 160 mg Silexan with paroxetine and placebo. This is comparatively direct anxiety
              evidence, but it supports the studied oral preparation—not every lavender product.
            </p>
            <Link href="/compounds/lavender/" className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline">
              Lavender evidence profile →
            </Link>
          </article>

          <article className="rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-ink">Ashwagandha: repeated-dose signal, not an acute anxiolytic</h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              The 2024 meta-analysis included nine randomized placebo-controlled trials and 558 participants and
              found pooled improvements in stress/anxiety measures and cortisol. The key directness limit is that
              trials used defined formulations over repeated dosing, often in adults with stress or anxiety symptoms.
              That supports a multi-week extract signal, not a same-day calming promise or a guarantee for every product.
            </p>
            <Link href="/guides/anxiety/ashwagandha-for-anxiety/" className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline">
              Ashwagandha for anxiety →
            </Link>
          </article>

          <article className="rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-ink">Passionflower: a small signal, not benzodiazepine equivalence</h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              The trial most often cited for generalized anxiety enrolled only 36 outpatients for 4 weeks. Eighteen
              received passionflower extract 45 drops/day and 18 received oxazepam 30 mg/day. No significant
              difference appeared at the end of the small pilot, while oxazepam acted faster. That result is not
              evidence that passionflower is equivalent to oxazepam, and NCCIH still considers the broader anxiety
              evidence too limited for definite conclusions.
            </p>
            <Link href="/herbs/passionflower/" className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline">
              Passionflower profile →
            </Link>
          </article>

          <article className="rounded-[1.65rem] border border-red-200 bg-red-50/70 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-red-950">Kava: mixed efficacy plus a high-consequence safety caveat</h3>
            <p className="mt-3 text-sm leading-7 text-red-900">
              In the larger 2020 GAD trial, 171 non-medicated adults received an aqueous dried-root extract
              standardized to 120 mg kavalactones twice daily or placebo for 16 weeks. Kava did not significantly
              outperform placebo. NCCIH also notes rare severe and sometimes fatal liver injury linked to kava
              products and advises against combining kava with benzodiazepines or alcohol. That combination of
              uncertain benefit and potentially serious harm makes a rapid-use kava ranking inappropriate.
            </p>
            <Link href="/guides/kava/" className="mt-3 inline-block text-sm font-semibold text-red-900 hover:underline">
              Kava safety guide →
            </Link>
          </article>
        </section>

        <section id="safety" className="scroll-mt-20 rounded-[1.65rem] border border-amber-200 bg-amber-50/70 p-6 shadow-sm">
          <p className="eyebrow-label text-amber-900">Safety can outrank efficacy</p>
          <h2 className="mt-2 text-xl font-semibold text-amber-950">A stronger signal is not automatically a better personal choice</h2>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-amber-950">
            <li>• Do not stop, reduce, or replace prescribed anxiety medication based on supplement evidence.</li>
            <li>• Sedating herbs can add to alcohol, benzodiazepines, sleep medicines, opioids, or anesthesia.</li>
            <li>• Kava deserves a separate liver-risk discussion before use; “water extract” does not erase all reported liver concerns.</li>
            <li>• Passionflower should be avoided during pregnancy and discussed around surgery/anesthesia.</li>
            <li>• Ashwagandha requires extra caution with pregnancy, thyroid disease/medication, autoimmune conditions, and liver concerns.</li>
            <li>• Persistent or impairing anxiety is a care question, not a reason to keep escalating supplement complexity.</li>
          </ul>
        </section>

        <section id="limits" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-ink">What not to infer from this evidence</h2>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-muted">
            <li>• A studied proprietary extract or oral oil does not validate every product sold under the same plant name.</li>
            <li>• Study dose and timing describe the trial; they are not automatically personal dosing instructions.</li>
            <li>• A non-significant difference between two small groups does not prove two treatments are equivalent.</li>
            <li>• Traditional use, mechanism plausibility, or online popularity does not establish treatment efficacy for an anxiety disorder.</li>
            <li>• Evidence for a single ingredient does not prove a multi-herb “anxiety stack” works better.</li>
          </ul>
        </section>

        <section id="sources" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-ink">Sources and directness notes</h2>
          <ol className="mt-4 space-y-4">
            {SOURCES.map((source, index) => (
              <li key={source.href} className="text-sm leading-7 text-muted">
                <span className="font-semibold text-ink">{index + 1}. </span>
                <a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:underline">
                  {source.label}
                </a>
                <span> — {source.note}</span>
              </li>
            ))}
          </ol>
        </section>

        <section id="faq" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-ink">Frequently asked questions</h2>
          <div className="mt-4 divide-y divide-brand-900/10">
            {FAQS.map((faq) => (
              <div key={faq.question} className="py-4 first:pt-0 last:pb-0">
                <h3 className="font-semibold text-ink">{faq.question}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-[1.65rem] border border-brand-900/10 bg-brand-50/50 p-6">
          <p className="text-sm leading-7 text-muted">
            <strong className="text-ink">Product sourcing:</strong> this broad comparison intentionally does not
            rank affiliate products. Follow the ingredient-specific evidence guides for formulation and sourcing
            context so monetization does not silently decide which herb appears to be the winner.
          </p>
        </div>

        <div className="space-y-6">
          <NewsletterCtaBlock />
          <EmailCapture />
        </div>

        <nav className="flex flex-wrap gap-4 text-sm font-semibold text-brand-700">
          <Link href="/guides/anxiety/" className="hover:text-brand-800">Anxiety goal hub →</Link>
          <Link href="/guides/anxiety/natural-anxiety-relief/" className="hover:text-brand-800">Natural anxiety relief →</Link>
          <Link href="/guides/anxiety/anxiety-stack-guide/" className="hover:text-brand-800">Anxiety stack evidence guide →</Link>
          <Link href="/guides/anxiety/l-theanine-for-anxiety/" className="hover:text-brand-800">L-theanine for anxiety →</Link>
          <Link href="/guides/anxiety/ashwagandha-for-anxiety/" className="hover:text-brand-800">Ashwagandha for anxiety →</Link>
          <Link href="/guides/kava/" className="hover:text-brand-800">Kava safety guide →</Link>
          <Link href="/guides/" className="hover:text-brand-800">All guides →</Link>
        </nav>
      </div>
    </ArticleLayout>
  )
}
