import compounds from '../../../public/data/compounds.json'
import ConversionStickyCTA from '@/components/conversion-sticky-cta'
import SectionBlock from '@/components/ui/SectionBlock'
import { getProductPicks, groupProductPicks } from '@/lib/product-ranking'
import { generateAmazonProductPicks } from '@/lib/amazon-auto'

export async function generateStaticParams() {
  return [{ slug: 'best-supplements-for-focus' }]
}

export default function Page() {
  const ranked = (compounds as any[]).slice(0, 10)

  const first = ranked[0]
  let topPick:any = null

  if (first) {
    let picks = groupProductPicks(getProductPicks(first.slug))
    if (!picks.top) picks = generateAmazonProductPicks(first.slug)
    topPick = picks.top || picks.budget || picks.premium
  }

  return (
    <main className="max-w-5xl mx-auto px-4 space-y-12 pb-32">

      <h1 className="text-3xl font-bold">Best Supplements for Focus</h1>

      {topPick && (
        <div className="bg-green-50 border rounded-2xl p-6 space-y-2">
          <p className="text-xs font-semibold uppercase">Best overall</p>
          <h2 className="text-xl font-bold">{topPick.brand} — {topPick.name}</h2>
          <p className="text-sm text-neutral-600">{topPick.notes}</p>
          <a href={topPick.url} className="inline-block bg-black text-white px-4 py-2 rounded-xl">
            Check price
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
              {c.summary}
            </SectionBlock>

            <p className="text-xs text-neutral-500">
              Ranked based on evidence strength, safety profile, and user selection trends.
            </p>

            {picks.top && (
              <div className="bg-green-50 p-3 rounded-xl text-sm">
                ⭐ {picks.top.brand} — {picks.top.notes}
              </div>
            )}

          </div>
        )
      })}

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
