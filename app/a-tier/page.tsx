import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import Card from '@/components/ui/Card'

type Domain = 'cognition' | 'sleep' | 'metabolic' | 'inflammation' | 'performance'
const DOMAIN_ORDER: Domain[] = ['cognition', 'sleep', 'metabolic', 'inflammation', 'performance']

const DOMAIN_LABELS: Record<Domain, string> = {
  cognition: 'Cognition',
  sleep: 'Sleep',
  metabolic: 'Metabolic',
  inflammation: 'Inflammation',
  performance: 'Performance',
}

type TierItem = {
  slug: string
  name?: string
  domain?: string
  confidenceScore?: number
}

type TierPayload = {
  generatedAt?: string
  count?: number
  items?: TierItem[]
}

export default function ATierPage() {
  const filePath = path.join(process.cwd(), 'public/data/a-tier-index.json')
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as TierPayload
  const allItems = (data.items ?? []).filter(item => item.slug)

  const grouped = DOMAIN_ORDER.reduce<Record<Domain, TierItem[]>>((acc, domain) => {
    acc[domain] = allItems
      .filter(item => item.domain === domain)
      .sort((a, b) => (b.confidenceScore ?? 0) - (a.confidenceScore ?? 0))
    return acc
  }, {
    cognition: [],
    sleep: [],
    metabolic: [],
    inflammation: [],
    performance: [],
  })

  return (
    <main className='mx-auto max-w-6xl space-y-9 px-4 py-10 text-ink sm:px-6'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Evidence explorer</p>
        <h1 className='heading-premium mt-3 text-ink'>A-Tier Compounds</h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-[#46574d]'>Curated, higher-trust compounds grouped by domain for conservative comparison.</p>
      </section>

      <div className='space-y-8'>
        {DOMAIN_ORDER.map(domain => (
          <section key={domain}>
            <h2 className='mb-4 text-xl font-semibold text-ink'>{DOMAIN_LABELS[domain]}</h2>
            {grouped[domain].length === 0 ? (
              <p className='text-sm text-[#46574d]'>No A-tier entries surfaced yet.</p>
            ) : (
              <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                {grouped[domain].map(item => (
                  <Card key={`${domain}-${item.slug}`} className='p-4'>
                    <Link href={`/compounds/${item.slug}`} className='block'>
                      <h3 className='text-base font-semibold text-ink'>{item.name ?? item.slug}</h3>
                      <p className='mt-1 text-sm text-[#46574d]'>/{item.slug}</p>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  )
}
