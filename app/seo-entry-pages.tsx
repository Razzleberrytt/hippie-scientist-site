import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { goalConfigs } from '@/data/goals'
import { getCompounds } from '@/lib/runtime-data'
import ConversionAffiliateCard from '@/components/conversion-affiliate-card'

// (rest of file unchanged above this line)

// --- keep existing content ---

export async function SeoEntryPage({ route }: { route: string }) {
  const page = seoEntryPages.find((item) => item.route === route)
  if (!page) return notFound()

  const goal = goalConfigs.find((item) => item.slug === page.goalSlug)
  if (!goal) return notFound()

  const compounds = (await getCompounds()) as CompoundRecord[]
  const candidateTerms = [page.searchIntent, ...goal.compoundCandidates, goal.title]
  const linkedCompounds = compounds
    .filter((compound) => matchesAny(compound, candidateTerms))
    .slice(0, 8)

  const faqs = buildFaqs(page, goal.title)
  const relatedGuides = seoEntryPages
    .filter((item) => item.route !== page.route && item.goalSlug === page.goalSlug)
    .slice(0, 6)

  return (
    <main className="space-y-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(page)) }} />

      {/* HERO */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Supplement guide</p>
        <h1 className="mt-3 text-4xl font-black text-white">{page.h1}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-white/75">{page.intro}</p>
        <p className="mt-3 text-xs text-white/45">Search intent: {page.searchIntent}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/goals/${goal.slug}`} className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-bold text-black hover:bg-emerald-200">View ranked picks</Link>
          <Link href="/compounds" className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/75 hover:bg-white/10">Browse compounds</Link>
        </div>
      </section>

      {/* BULLETS */}
      <section className="grid gap-4 md:grid-cols-3">
        {page.bullets.map((bullet) => (
          <div key={bullet} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-white/70">{bullet}</div>
        ))}
      </section>

      {/* RELATED COMPOUNDS (existing) */}
      {linkedCompounds.length > 0 ? (
        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-bold text-white">Related compounds</h2>
          <p className="max-w-3xl text-sm leading-6 text-white/70">These links are generated from the current compound dataset and goal mapping.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {linkedCompounds.map((compound) => (
              <Link key={compound.slug} href={`/compounds/${compound.slug}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-emerald-300/40">
                <h3 className="font-bold text-white">{compoundLabel(compound)}</h3>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/60">{clean(compound.summary || compound.mechanism || compound.evidence)}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* 🔥 NEW: TOP PICKS + CONVERSION */}
      {linkedCompounds.length > 0 && (
        <section className="space-y-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800/80">Top picks</p>
          <h2 className="text-2xl font-black text-slate-950">Start with these compounds</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {linkedCompounds.map((compound) => (
              <div key={compound.slug} className="space-y-3">
                <Link href={`/compounds/${compound.slug}`} className="font-bold text-slate-900">
                  {compoundLabel(compound)}
                </Link>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {clean(compound.summary || compound.mechanism || compound.evidence)}
                </p>

                <ConversionAffiliateCard
                  name={compoundLabel(compound)}
                  slug={compound.slug}
                  intent={page.searchIntent}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* HOW TO CHOOSE */}
      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-2xl font-bold text-white">How to choose supplements</h2>
        <p className="max-w-3xl leading-7 text-white/75">Match compound, timing, and safety profile to your actual problem.</p>
      </section>

      {/* SAFETY */}
      <section className="rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-5">
        <h2 className="font-bold text-amber-100">Safety considerations</h2>
        <p className="mt-2 text-sm leading-6 text-white/75">{sentence(goal.safetyNote)}</p>
      </section>

      {/* 🔥 NEW: GLOBAL CTA */}
      <ConversionAffiliateCard
        name={page.h1}
        intent={page.searchIntent}
      />

      {/* FAQ */}
      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-2xl font-bold text-white">Frequently asked questions</h2>
        {faqs.map((faq) => (
          <div key={faq.question} className="rounded-2xl border border-white/10 p-4">
            <h3 className="font-semibold text-white">{faq.question}</h3>
            <p className="mt-2 text-sm text-white/70">{faq.answer}</p>
          </div>
        ))}
      </section>

      {/* RELATED GUIDES */}
      {relatedGuides.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white">Related guides</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {relatedGuides.map((guide) => (
              <Link key={guide.route} href={`/${guide.route}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="font-bold text-white">{guide.h1}</h3>
                <p className="mt-2 text-sm text-white/65">{guide.intro}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
