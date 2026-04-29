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
  global?: TierItem[]
  contextual?: TierItem[]
}

export default function ATierPage() {
  const filePath = path.join(process.cwd(), 'public/data/a-tier-index.json')
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as TierPayload
  const allItems = [...(data.global ?? []), ...(data.contextual ?? [])]

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
    <main className='mx-auto max-w-6xl px-6 py-10 text-white'>
      <h1 className='mb-2 text-3xl font-semibold'>A-Tier Compounds</h1>
      <p className='mb-8 text-white/75'>Curated, high-trust compounds grouped by domain.</p>

      <div className='space-y-10'>
        {DOMAIN_ORDER.map(domain => (
          <section key={domain}>
            <h2 className='mb-4 text-xl font-semibold'>{DOMAIN_LABELS[domain]}</h2>
            {grouped[domain].length === 0 ? (
              <p className='text-sm text-white/60'>No A-tier entries yet.</p>
            ) : (
              <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                {grouped[domain].map(item => (
                  <Card key={`${domain}-${item.slug}`} className='p-4'>
                    <Link href={`/compounds/${item.slug}`} className='block'>
                      <h3 className='text-base font-medium text-white'>{item.name ?? item.slug}</h3>
                      <p className='mt-1 text-sm text-white/65'>/{item.slug}</p>
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
