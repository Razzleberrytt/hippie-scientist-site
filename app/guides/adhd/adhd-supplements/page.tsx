import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../src/lib/seo'
import { focusAdhdArticles } from '@/lib/focus-adhd-articles'
import { AdhdInlineCta } from '@/components/articles/AdhdMonetizationWidgets'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'

const SLUG = 'adhd-supplements'
const TITLE = 'ADHD Supplements: Evidence, Safety & Testing'
const DESCRIPTION = 'Start here for evidence-based ADHD supplement guidance, including nutrient deficiencies, sleep support, focus stacks, safety, and testing.'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/guides/${SLUG}`,
  openGraphType: 'article',
})

const FAQS = [
  {
    question: 'Can supplements replace ADHD medication?',
    answer: 'No. Clinical evidence shows that ADHD medications have substantially larger effect sizes for core symptoms (inattention, hyperactivity, impulsivity). Supplements may serve as secondary, adjunctive support for specific areas like sleep or stress under professional guidance.',
  },
  {
    question: 'What is the most effective starting supplement for ADHD?',
    answer: 'Most evidence-first protocols recommend addressing sleep quality and correcting documented nutrient gaps (such as omega-3, magnesium, or iron/ferritin) before adding complex stacks or cognitive enhancers.',
  },
  {
    question: 'Why does baseline deficiency matter so much?',
    answer: 'Correcting a confirmed nutrient gap (like iron/ferritin or magnesium deficiency) has strong clinical support. However, supplementing these same nutrients in individuals with normal baseline levels yields little to no functional benefit.',
  },
  {
    question: 'Are ADHD supplements safe for children?',
    answer: 'Some supplements (like melatonin for sleep onset or omega-3s) have been studied in children with good tolerability. However, children have unique metabolic profiles, and any supplementation must be supervised by a pediatrician.',
  },
]

const NUTRIENT_GUIDE = [
  ['Omega-3', 'Tier A / Moderate', 'Low fish intake or low omega-3 status; modest hyperactivity signal', '/guides/adhd/omega-3-and-adhd'],
  ['Iron / ferritin', 'Tier A when deficient', 'Low ferritin or iron stores confirmed by testing', '/guides/adhd/iron-ferritin-and-adhd'],
  ['Magnesium', 'Tier B / context-dependent', 'Sleep, tension, low intake, or documented low status', '/guides/adhd/best-magnesium-supplement-for-adhd'],
  ['Zinc', 'Tier B-C', 'Low intake or measured low status; mixed supplementation trials', '/guides/adhd/zinc-and-adhd'],
  ['L-theanine', 'Tier C', 'Calm focus, caffeine sensitivity, or bedtime arousal', '/guides/adhd/l-theanine-for-adhd'],
  ['Saffron', 'Tier C / promising', 'Interesting early trials, but not first-line and quality varies', '/guides/adhd/best-supplements-for-adhd'],
  ['Bacopa', 'Tier D for ADHD', 'Memory evidence does not automatically translate to ADHD', '/guides/adhd/best-supplements-for-adhd'],
] as const

const GUIDE_REFERENCES = [
  ['Nutrition in the Management of ADHD: review of recent research', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10444659/'],
  ['Iron and zinc in ADHD systematic review', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8618748/'],
  ['Mineral status in ADHD review', 'https://www.mdpi.com/1420-3049/25/19/4440'],
] as const

const HEADINGS: Heading[] = [
  { id: 'evidence-hierarchy', text: 'The Evidence Hierarchy', level: 2 },
  { id: 'ranked-nutrients', text: 'Ranked Nutrient Cards', level: 2 },
  { id: 'sleep-calm', text: 'Sleep & Calm Focus Connection', level: 2 },
  { id: 'faq', text: 'Frequently Asked Questions', level: 2 },
]

export default function AdhdSupplementsHub() {
  const magnesiumProducts = getRevenueProductSet('magnesium')
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `https://thehippiescientist.net/guides/${SLUG}/#webpage`,
        url: `https://thehippiescientist.net/guides/${SLUG}`,
        name: TITLE,
        description: DESCRIPTION,
        isPartOf: { '@type': 'WebSite', name: 'The Hippie Scientist', url: 'https://thehippiescientist.net' },
        about: { '@type': 'Thing', name: 'ADHD Supplements' },
      },
      {
        '@type': 'ItemList',
        '@id': `https://thehippiescientist.net/guides/${SLUG}/#item-list`,
        name: 'ADHD Cluster Articles',
        itemListElement: focusAdhdArticles.map((article, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `https://thehippiescientist.net/articles/${article.slug}`,
          name: article.title,
        })),
      },
    ],
  }

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
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Header */}
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 sm:p-10 shadow-sm">
        <p className="eyebrow-label">Pillar Guide</p>
        <h1 className="heading-premium mt-3 text-ink text-3xl sm:text-5xl font-black leading-tight">
          ADHD Supplements: The Evidence-First Hub
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
          Navigating natural support for focus, hyperactivity, sleep, and emotional dysregulation can be overwhelming. Rather than relying on marketing claims, this guide organizes the clinical research on common ADHD supplements using a clear hierarchy of evidence.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.14em]">
          <Link href="/guides/adhd/best-supplements-for-adhd" className="text-brand-700 hover:text-brand-800 hover:underline">
            Read Pillar Review →
          </Link>
          <Link href="/guides/adhd/adhd-stack-guide" className="text-brand-700 hover:text-brand-800 hover:underline">
            View Stack Builder Guide →
          </Link>
        </div>
      </section>

      <AdhdInlineCta type="checklist" />

      {/* Evidence Hierarchy */}
      <section id="evidence-hierarchy" className="scroll-mt-20 space-y-4 rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-ink">The Evidence Hierarchy</h2>
        <p className="text-sm leading-relaxed text-muted">
          We categorize supplements into tiers based on the volume and consistency of human randomized controlled trials (RCTs) conducted in ADHD populations.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2">
          <div className="rounded-xl border border-brand-900/5 bg-[#f4fcf6] p-4">
            <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              Tier A: Strong
            </span>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Consistent signals across multiple clinical trials or meta-analyses, particularly when deficiency is present.
            </p>
            <p className="mt-2 text-xs font-semibold text-emerald-800">Omega-3, Iron (if deficient)</p>
          </div>
          <div className="rounded-xl border border-brand-900/5 bg-brand-50/50 p-4">
            <span className="inline-flex rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-800">
              Tier B: Moderate
            </span>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Reasonable clinical trial support for specific symptom domains, such as sleep latency or physical restlessness.
            </p>
            <p className="mt-2 text-xs font-semibold text-brand-800">Melatonin, Magnesium, Zinc, Vitamin D</p>
          </div>
          <div className="rounded-xl border border-brand-900/5 bg-amber-50/30 p-4">
            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
              Tier C: Promising
            </span>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Emerging cognitive or stress-modulating data, but limited direct high-quality trials in confirmed ADHD.
            </p>
            <p className="mt-2 text-xs font-semibold text-amber-800">L-Theanine, Ashwagandha, Choline (Citicoline)</p>
          </div>
          <div className="rounded-xl border border-brand-900/5 bg-red-50/30 p-4">
            <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
              Tier D: Insufficient
            </span>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Weak, inconsistent, or strictly preclinical/traditional evidence for managing ADHD symptoms.
            </p>
            <p className="mt-2 text-xs font-semibold text-red-800">Ginkgo Biloba, Bacopa, Proprietary blends</p>
          </div>
        </div>
      </section>

      <AdhdInlineCta type="safety" />

      <section id="ranked-nutrients" className="scroll-mt-20 space-y-4 rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-ink">Ranked Nutrient Cards</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted">
          The safest ADHD supplement sequence is usually deficiency correction first, sleep support second,
          and optional focus experiments last. Supplements are adjunctive tools; they do not replace diagnosis,
          medication, therapy, coaching, sleep evaluation, or school/work accommodations.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {NUTRIENT_GUIDE.map(([name, tier, fit, href]) => (
            <Link key={name} href={href} className="rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm transition hover:border-brand-700/30">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-700">{tier}</p>
              <h3 className="mt-2 text-lg font-semibold text-ink">{name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{fit}</p>
              <span className="mt-3 inline-block text-xs font-bold text-brand-700">Read evidence review →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Adjunct vs deficiency</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Correcting a documented nutrient gap is a different decision from adding a nootropic.
            Start with diet, sleep, medication appetite effects, and testing when clinically appropriate.
          </p>
        </div>
        <div className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Kids vs adults</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Pediatric evidence is stronger for several nutrients, but children need pediatric dosing and supervision.
            Adult evidence is thinner, so adult stacks should be simpler and more carefully tracked.
          </p>
        </div>
        <div className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">What not to expect</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Do not expect supplements to produce medication-like effects, fix sleep debt, overcome under-eating,
            or work reliably when baseline nutrient status is already adequate.
          </p>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-ink">Conservative Stack Examples</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            ['Sleep-first', 'Melatonin for true sleep-onset problems, or magnesium/theanine when tension and arousal dominate.'],
            ['Deficiency-first', 'Omega-3, iron/ferritin, zinc, vitamin D, or magnesium only when intake, testing, or clinician context supports it.'],
            ['Calm-focus', 'L-theanine alone or with modest caffeine for adults who tolerate caffeine and have protected sleep.'],
          ].map(([name, copy]) => (
            <div key={name} className="rounded-2xl border border-brand-900/10 bg-brand-50/40 p-4">
              <h3 className="font-semibold text-ink">{name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Article Grid */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-ink">Explore the ADHD Content Cluster</h2>
        <p className="text-sm text-muted">Detailed, evidence-first research reviews for specific compounds and use cases.</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {focusAdhdArticles.map((article) => (
            <article key={article.slug} className="card-premium p-6 flex flex-col justify-between space-y-4 bg-white/95 rounded-2xl border border-brand-900/10 shadow-sm transition hover:border-brand-700/20">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-800 border border-brand-100/50">
                    {article.category}
                  </span>
                  <span className="text-[10px] text-muted whitespace-nowrap">{article.readingTime}</span>
                </div>
                <h3 className="mt-3 text-base font-bold text-ink hover:text-brand-800">
                  <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted line-clamp-3">
                  {article.description}
                </p>
              </div>
              <div className="pt-2 border-t border-brand-900/5">
                <Link
                  href={`/articles/${article.slug}`}
                  className="inline-flex items-center justify-between w-full text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                >
                  <span>Read evidence review</span>
                  <span>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <AdhdInlineCta type="stack" />

      {/* Sleep & Calm Focus Section */}
      <section id="sleep-calm" className="scroll-mt-20 space-y-4 rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-ink">Sleep &amp; Calm Focus Connection</h2>
        <p className="text-sm leading-relaxed text-muted">
          Sleep disturbances are highly prevalent in individuals with ADHD, often compounding challenges with daytime focus, emotional regulation, and executive function. While targeted sleep support can reduce daytime symptom burden by improving sleep quality and duration, it does not treat or cure ADHD itself and does not replace professional care.
        </p>
        <p className="text-sm leading-relaxed text-muted">
          When constructing an evening routine, compounds like magnesium and L-theanine are frequently utilized to promote calm and reduce bedtime arousal:
        </p>
        <div className="grid gap-4 sm:grid-cols-3 pt-2">
          <div className="rounded-xl border border-brand-900/5 bg-brand-50/30 p-4">
            <h3 className="font-semibold text-ink text-sm">L-Theanine for Calm</h3>
            <p className="mt-1.5 text-xs text-muted leading-relaxed">
              Promotes alpha brain wave activity to quiet a racing mind at bedtime. Learn more in our guide on <Link href="/guides/sleep/l-theanine-for-sleep" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">L-Theanine for Sleep</Link>.
            </p>
          </div>
          <div className="rounded-xl border border-brand-900/5 bg-brand-50/30 p-4">
            <h3 className="font-semibold text-ink text-sm">Magnesium Selection</h3>
            <p className="mt-1.5 text-xs text-muted leading-relaxed">
              Supports neuromuscular relaxation and GABA. It is vital to prioritize deficiency testing. Compare forms in our guide on <Link href="/guides/sleep/magnesium-types-for-sleep" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">Magnesium Types for Sleep</Link>.
            </p>
          </div>
          <div className="rounded-xl border border-brand-900/5 bg-brand-50/30 p-4">
            <h3 className="font-semibold text-ink text-sm">Botanical Sleep Support</h3>
            <p className="mt-1.5 text-xs text-muted leading-relaxed">
              Herbs like chamomile, lemon balm, or valerian are commonly used for general relaxation. Explore the research in <Link href="/guides/sleep/best-herbs-for-sleep" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">Best Herbs for Sleep</Link>.
            </p>
          </div>
        </div>
      </section>

      {magnesiumProducts && (
        <RecommendationSection products={magnesiumProducts.products} />
      )}

      {/* FAQ Accordion */}
      <section id="faq" className="scroll-mt-20 rounded-2xl border border-brand-900/10 bg-white/90 p-6 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-ink">Frequently Asked Questions</h2>
        <div className="divide-y divide-brand-900/5 space-y-4">
          {FAQS.map((faq, index) => (
            <div key={index} className="pt-4 first:pt-0">
              <h3 className="font-semibold text-ink text-sm sm:text-base">{faq.question}</h3>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-brand-900/10 bg-white/90 p-6 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-ink">References</h2>
        <ul className="space-y-2 text-sm leading-6">
          {GUIDE_REFERENCES.map(([label, href]) => (
            <li key={href}>
              <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:underline">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Safety Cautions Block */}
      <section className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-6 text-sm leading-relaxed text-amber-950 space-y-2">
        <h2 className="font-bold text-amber-950 text-base">Clinical Safety Note &amp; Disclaimer</h2>
        <p className="text-xs text-amber-900/90">
          No supplement diagnoses, treats, cures, or prevents ADHD. Always discuss any changes with a qualified healthcare provider. This is especially critical when starting supplements in children, during pregnancy or breastfeeding, or if prescription ADHD stimulants or other medications are currently in use.
        </p>
        <div className="pt-2 flex gap-3 text-xs font-bold text-amber-900">
          <Link href="/safety-checker/" className="hover:text-amber-950 hover:underline">
            Open Safety Checker →
          </Link>
          <Link href="/compare/" className="hover:text-amber-950 hover:underline">
            Side-by-Side Comparison Tool →
          </Link>
        </div>
      </section>
    </div>
    </ArticleLayout>
  )
}
