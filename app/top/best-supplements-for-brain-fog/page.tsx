import type { Metadata } from 'next'
import Link from 'next/link'
import { getCompounds } from '@/lib/runtime-data'
import { buildAmazonSearchUrl } from '@/lib/affiliate'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import { EmailCaptureBox } from '@/components/monetization/EmailCaptureBox'
import { MoneyPageCTAStack } from '@/components/monetization/MoneyPageCTAStack'
import { RecommendationGrid } from '@/components/monetization/RecommendationGrid'
import { SafetyDisclaimerBox } from '@/components/monetization/SafetyDisclaimerBox'
import { TrustMethodologyCallout } from '@/components/monetization/TrustMethodologyCallout'

type Compound = { slug: string; name?: string; displayName?: string; summary?: string }

const PICKS = ['creatine', 'caffeine', 'l-theanine']
const label = (c: Compound) => c.displayName || c.name || c.slug

export const metadata: Metadata = {
  title: 'Best Supplements for Brain Fog (2026 Guide)',
  description: 'Educational breakdown of supplements frequently discussed for brain fog and clearer mental performance.',
}

export default async function Page() {
  const compounds = (await getCompounds()) as Compound[]
  const map = new Map(compounds.map((c) => [c.slug, c]))
  const picks = PICKS.map((slug) => map.get(slug)).filter(Boolean) as Compound[]

  return (
    <main className="container-page py-10 space-y-8">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <p className="eyebrow-label">Top list · educational</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Best Supplements for Brain Fog</h1>
        <p className="detail-reading mt-4 text-muted">Brain fog can have many causes. This list is for educational exploration, not diagnosis or treatment.</p>
      </section>
      <div className='grid gap-4 lg:grid-cols-[1.1fr_0.9fr]'>
        <TrustMethodologyCallout />
        <SafetyDisclaimerBox compact />
      </div>

      <MoneyPageCTAStack goal='brain-fog' />

      {picks.map((c, i) => (
        <article key={c.slug} className="card-premium p-6">
          <h2 className="text-2xl font-semibold text-ink">#{i + 1} {label(c)}</h2>
          <p className="mt-2 text-muted">{c.summary || 'Review this compound for use-cases, safety considerations, and evidence context.'}</p>
          <div className="mt-3 flex gap-4">
            <Link href={`/compounds/${c.slug}`} className="text-sm font-medium text-emerald-700 hover:underline">Read profile</Link>
            <a href={buildAmazonSearchUrl(c.slug)} target="_blank" rel="noopener noreferrer nofollow sponsored" className="text-sm font-medium text-emerald-700 hover:underline">Compare products</a>
          </div>
        </article>
      ))}
      <div className='space-y-3'>
        <AffiliateDisclosure variant='compact' />
        <section className='card-premium p-6'>
          <h2 className='text-2xl font-semibold text-ink'>Brain fog recommendation cards</h2>
          <p className='mt-3 text-sm leading-7 text-muted'>
            Brain fog can reflect sleep loss, anemia, thyroid issues, medication effects, sleep apnea, and other causes. These cards are comparison aids, not a diagnosis or treatment plan.
          </p>
          <RecommendationGrid goal='brain-fog' className='mt-6' />
        </section>
      </div>

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>How to choose cautiously</h2>
        <ul className='mt-3 space-y-2 text-sm leading-6 text-muted'>
          <li>Look for obvious context first: sleep quality, nutrition, medication changes, alcohol, stress load, and illness recovery.</li>
          <li>Do not assume a supplement will solve new, severe, or worsening cognitive symptoms.</li>
          <li>Avoid stacking stimulants to override fatigue or poor sleep.</li>
          <li>Ask a clinician if brain fog persists, worsens, or arrives with neurological, mood, or medical symptoms.</li>
        </ul>
      </section>

      <EmailCaptureBox goal='brain-fog' variant='wide' />

      <div className="flex flex-wrap gap-4">
        <Link href="/top/focus" className="text-sm font-medium text-emerald-700 hover:underline">Best supplements for focus</Link>
        <Link href="/guides/supplements-for-brain-fog-and-fatigue" className="text-sm font-medium text-emerald-700 hover:underline">Brain fog + fatigue guide</Link>
        <Link href="/methodology" className="text-sm font-medium text-emerald-700 hover:underline">Methodology</Link>
        <Link href="/affiliate-disclosure" className="text-sm font-medium text-emerald-700 hover:underline">Affiliate disclosure</Link>
        <Link href="/free-guide" className="text-sm font-medium text-emerald-700 hover:underline">Free guide</Link>
      </div>
    </main>
  )
}
