import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { focusAdhdArticles } from '@/lib/focus-adhd-articles'
import { AdhdInlineCta } from '@/components/articles/AdhdMonetizationWidgets'

const SLUG = 'adhd-supplements'
const TITLE = 'ADHD Supplements Guide: Evidence, Safety, Testing, and Practical Use'
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

export default function AdhdSupplementsHub() {
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 space-y-10">
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
          <Link href="/articles/best-supplements-for-adhd" className="text-brand-700 hover:text-brand-800 hover:underline">
            Read Pillar Review →
          </Link>
          <Link href="/articles/adhd-stack-guide" className="text-brand-700 hover:text-brand-800 hover:underline">
            View Stack Builder Guide →
          </Link>
        </div>
      </section>

      <AdhdInlineCta type="checklist" />

      {/* Evidence Hierarchy */}
      <section className="space-y-4 rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
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

      {/* FAQ Accordion */}
      <section className="rounded-2xl border border-brand-900/10 bg-white/90 p-6 space-y-4 shadow-sm">
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

      {/* Safety Cautions Block */}
      <section className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-6 text-sm leading-relaxed text-amber-950 space-y-2">
        <h2 className="font-bold text-amber-950 text-base">Clinical Safety Note &amp; Disclaimer</h2>
        <p className="text-xs text-amber-900/90">
          No supplement diagnoses, treats, cures, or prevents ADHD. Always discuss any changes with a qualified healthcare provider. This is especially critical when starting supplements in children, during pregnancy or breastfeeding, or if prescription ADHD stimulants or other medications are currently in use.
        </p>
        <div className="pt-2 flex gap-3 text-xs font-bold text-amber-900">
          <Link href="/safety-checker" className="hover:text-amber-950 hover:underline">
            Open Safety Checker →
          </Link>
          <Link href="/compare" className="hover:text-amber-950 hover:underline">
            Side-by-Side Comparison Tool →
          </Link>
        </div>
      </section>
    </div>
  )
}
