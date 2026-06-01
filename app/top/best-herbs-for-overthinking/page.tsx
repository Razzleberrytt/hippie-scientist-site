import type { Metadata } from 'next'
import Link from 'next/link'
import { getHerbs } from '@/lib/runtime-data'
import { getHerbSearchLinks } from '@/lib/affiliate'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import { EmailCaptureBox } from '@/components/monetization/EmailCaptureBox'
import { MoneyPageCTAStack } from '@/components/monetization/MoneyPageCTAStack'
import { RecommendationGrid } from '@/components/monetization/RecommendationGrid'
import { SafetyDisclaimerBox } from '@/components/monetization/SafetyDisclaimerBox'
import { TrustMethodologyCallout } from '@/components/monetization/TrustMethodologyCallout'

type Herb = { slug: string; name?: string; displayName?: string; summary?: string }

const PICKS = ['lemon-balm', 'ashwagandha', 'passionflower']

const label = (h: Herb) => h.displayName || h.name || h.slug

export const metadata: Metadata = {
  title: 'Best Herbs for Overthinking (2026 Guide)',
  description: 'Evidence-informed educational guide to herbs often used in overthinking and racing-thought contexts.',
}

export default async function Page() {
  const herbs = (await getHerbs()) as Herb[]
  const map = new Map(herbs.map((h) => [h.slug, h]))
  const picks = PICKS.map((slug) => map.get(slug)).filter(Boolean) as Herb[]

  return (
    <main className="container-page py-10 space-y-8">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <p className="eyebrow-label">Top list · educational</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Best Herbs for Overthinking</h1>
        <p className="detail-reading mt-4 text-muted">Use this list as a starting point for research. It is not diagnosis or treatment guidance.</p>
      </section>
      <div className='grid gap-4 lg:grid-cols-[1.1fr_0.9fr]'>
        <TrustMethodologyCallout />
        <SafetyDisclaimerBox compact />
      </div>

      <MoneyPageCTAStack goal='overthinking' />

      {picks.map((h, i) => {
        const links = getHerbSearchLinks(label(h))
        return (
          <article key={h.slug} className="card-premium p-6">
            <h2 className="text-2xl font-semibold text-ink">#{i + 1} {label(h)}</h2>
            <p className="mt-2 text-muted">{h.summary || 'Explore this profile for effects, safety, and selection context.'}</p>
            <div className="mt-3 flex gap-4">
              <Link href={`/herbs/${h.slug}`} className="text-sm font-medium text-emerald-700 hover:underline">Read profile</Link>
              {links[0] ? <a href={links[0].url} target="_blank" rel="noopener noreferrer nofollow sponsored" className="text-sm font-medium text-emerald-700 hover:underline">Compare products</a> : null}
            </div>
          </article>
        )
      })}
      <div className='space-y-3'>
        <AffiliateDisclosure variant='compact' />
        <section className='card-premium p-6'>
          <h2 className='text-2xl font-semibold text-ink'>Calming-support recommendation cards</h2>
          <p className='mt-3 text-sm leading-7 text-muted'>
            These cards are framed as calming support, not anxiety, OCD, or mental health diagnosis or treatment. Be cautious with sedative combinations and alcohol.
          </p>
          <RecommendationGrid goal='overthinking' className='mt-6' />
        </section>
      </div>

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>How to choose cautiously</h2>
        <ul className='mt-3 space-y-2 text-sm leading-6 text-muted'>
          <li>Use calming herbs as support for general tension or wind-down, not as a diagnosis-specific treatment plan.</li>
          <li>Avoid combining multiple sedating herbs, alcohol, sleep aids, or sedative medications casually.</li>
          <li>Ask a clinician if anxious thoughts are severe, persistent, worsening, compulsive, or interfering with daily function.</li>
          <li>Pregnancy, nursing, medications, and health conditions can change fit.</li>
        </ul>
      </section>

      <EmailCaptureBox goal='overthinking' variant='wide' />

      <div className='flex flex-wrap gap-4'>
        <Link href="/top/stress" className="text-sm font-medium text-emerald-700 hover:underline">Best herbs for stress</Link>
        <Link href="/methodology" className="text-sm font-medium text-emerald-700 hover:underline">Methodology</Link>
        <Link href="/affiliate-disclosure" className="text-sm font-medium text-emerald-700 hover:underline">Affiliate disclosure</Link>
        <Link href="/free-guide" className="text-sm font-medium text-emerald-700 hover:underline">Free guide</Link>
      </div>
    </main>
  )
}
