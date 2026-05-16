import { getAllCompounds } from '@/lib/server/runtime-data'
import ConversionStickyCTA from '@/components/conversion-sticky-cta'
import SectionBlock from '@/components/ui/SectionBlock'
import { getProductPicks, groupProductPicks } from '@/lib/product-ranking'
import { generateAmazonProductPicks } from '@/lib/amazon-auto'
import Link from 'next/link'
import { cleanSummary } from '@/lib/display-utils'
import FaqJsonLd from '@/components/seo/FaqJsonLd'

type BestRouteParams = Promise<{ slug: string }>

type BestRouteProps = {
  params: BestRouteParams
}

export async function generateStaticParams() {
  return [{ slug: 'best-supplements-for-focus' }]
}

function getAuthorityLinks(slug: string) {
  const normalized = String(slug || '').toLowerCase()

  return [
    {
      href: '/topics/stress-response',
      label: 'Stress Response Hub',
    },
    {
      href: '/ecosystems/cognitive-longevity',
      label: 'Cognitive Longevity Ecosystem',
    },
    {
      href: '/protocols/morning-focus',
      label: 'Morning Focus Protocol',
    },
    {
      href: '/stacks/focus-support',
      label: 'Focus Support Stack',
    },
  ].filter((item) => {
    if (normalized.includes('focus')) return true
    return !item.href.includes('focus')
  })
}

export default async function Page({ params }: BestRouteProps) {
  const resolvedParams = await params
  const compounds = await getAllCompounds()
  const ranked = (compounds as any[]).slice(0, 10)
  const slug = String(resolvedParams?.slug || '')

  const faqItems = [
    {
      question: 'What should I look for in a focus supplement?',
      answer: 'Evidence quality, safety considerations, mechanism relevance, and transparent formulation are all important when evaluating focus supplements.',
    },
    {
      question: 'Are focus supplements backed by human evidence?',
      answer: 'Some compounds and herbs have stronger human evidence than others. The site attempts to separate mechanistic hypotheses from stronger clinical evidence whenever possible.',
    },
    {
      question: 'What is the difference between stacks and single compounds?',
      answer: 'Stacks combine multiple ingredients intended to support complementary mechanisms or pathways, while single compounds isolate one primary ingredient or constituent.',
    },
  ]

  const first = ranked[0]
  let topPick:any = null

  if (first) {
    let picks = groupProductPicks(getProductPicks(first.slug))
    if (!picks.top) picks = generateAmazonProductPicks(first.slug)
    topPick = picks.top || picks.budget || picks.premium
  }

  const authorityLinks = getAuthorityLinks(slug)

  return (
    <main className="max-w-5xl mx-auto px-4 space-y-12 pb-32">

      <FaqJsonLd items={faqItems} />

      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Best Supplements for Focus</h1>

        <p className="text-neutral-600 leading-7 max-w-3xl">
          Evidence-aware rankings connected into semantic authority hubs, ecosystem pathways, protocol systems, and mechanism-aware stack discovery.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {authorityLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="border rounded-2xl p-4 bg-neutral-50 hover:bg-neutral-100 transition"
          >
            <div className="space-y-2">
              <p className="text-xs uppercase font-semibold tracking-wide text-neutral-500">
                Authority System
              </p>

              <h2 className="font-semibold leading-tight">
                {item.label}
              </h2>
            </div>
          </Link>
        ))}
      </section>

      {topPick && (
        <div className="bg-green-50 border rounded-2xl p-6 space-y-3">
          <p className="text-xs font-semibold uppercase">Best overall</p>
          <h2 className="text-xl font-bold">{topPick.brand} — {topPick.name}</h2>
          <p className="text-sm text-neutral-600">{topPick.notes}</p>
          <a href={topPick.url} className="inline-block bg-black text-white px-5 py-2 rounded-xl font-semibold">
            Check price on Amazon
          </a>
        </div>
      )}

      {ranked.map((c, i) => {
        let picks = groupProductPicks(getProductPicks(c.slug))
        if (!picks.top) picks = generateAmazonProductPicks(c.slug)

        return (
          <div key={c.slug} className="border rounded-xl p-5 space-y-4">

            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="text-xs bg-black text-white px-2 py-1 rounded">
                #{i + 1}
              </span>
              {c.name}
            </h2>

            <SectionBlock title="Summary">
              {cleanSummary(c.summary, 'compound')}
            </SectionBlock>

            <p className="text-xs text-neutral-500">
              Ranked based on evidence strength, safety profile, and user selection trends.
            </p>

            <div className="flex flex-wrap gap-3 text-sm">
              <Link href={`/compounds/${c.slug}`} className="underline">
                View full breakdown
              </Link>

              <Link href={`/compare/${c.slug}-vs-rhodiola`} className="underline">
                Related comparisons
              </Link>
            </div>

            {picks.top && (
              <div className="bg-green-50 p-3 rounded-xl text-sm">
                ⭐ {picks.top.brand} — {picks.top.notes}
              </div>
            )}

          </div>
        )
      })}

      <section className="border rounded-2xl p-6 bg-neutral-50 space-y-5">
        <div className="space-y-2">
          <p className="text-xs uppercase font-semibold tracking-wide text-neutral-500">
            Frequently Asked Questions
          </p>

          <h2 className="text-2xl font-bold">
            Focus supplement questions
          </h2>
        </div>

        <div className="space-y-5">
          {faqItems.map((item) => (
            <div key={item.question} className="space-y-2">
              <h3 className="font-semibold leading-tight">
                {item.question}
              </h3>

              <p className="text-sm leading-7 text-neutral-700">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {topPick && (
        <ConversionStickyCTA
          brand={topPick.brand}
          name={topPick.name}
          href={topPick.url}
        />
      )}

    </main>
  )
}
