import compounds from '../../../public/data/compounds.json'
import ConversionStickyCTA from '@/components/conversion-sticky-cta'
import { getProductPicks, groupProductPicks } from '@/lib/product-ranking'
import { generateAmazonProductPicks } from '@/lib/amazon-auto'

export async function generateStaticParams() {
  return [{ slug: 'best-supplements-for-focus' }]
}

export default function Page({ params }: any) {
  const ranked = (compounds as any[]).slice(0, 10)

  const first = ranked[0]
  let topPick: any = null

  if (first) {
    let picks = groupProductPicks(getProductPicks(first.slug))
    if (!picks.top) picks = generateAmazonProductPicks(first.slug)
    topPick = picks.top || picks.budget || picks.premium
  }

  return (
    <main className="mx-auto max-w-5xl space-y-10 px-4 pb-32">
      <h1 className="text-3xl font-bold">Best Supplements for Focus</h1>

      {topPick && (
        <div className="rounded-2xl border bg-green-50 p-6">
          <p className="text-sm font-semibold">Best overall</p>
          <h2 className="text-xl font-bold">{topPick.brand} — {topPick.name}</h2>
          <p className="text-sm text-muted">{topPick.notes}</p>
          <a href={topPick.url} className="mt-3 inline-block rounded-xl bg-black px-4 py-2 text-white">View top pick</a>
        </div>
      )}

      {ranked.map((c, i) => {
        let picks = groupProductPicks(getProductPicks(c.slug))
        if (!picks.top) picks = generateAmazonProductPicks(c.slug)

        return (
          <div key={c.slug} className="space-y-3 rounded-xl border p-5">
            <h2 className="text-xl font-semibold">#{i + 1} {c.name}</h2>
            <p className="text-sm text-muted">{c.summary}</p>

            {picks.top && (
              <div className="rounded-xl bg-green-50 p-3">
                ⭐ {picks.top.brand}
                <div className="text-xs">{picks.top.notes}</div>
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
