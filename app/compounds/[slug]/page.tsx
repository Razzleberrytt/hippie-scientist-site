import DecisionCard from '@/components/ui/DecisionCard'
import EvidenceBadge from '@/components/ui/EvidenceBadge'
import SafetyBadge from '@/components/ui/SafetyBadge'
import SectionBlock from '@/components/ui/SectionBlock'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import data from '../../../public/data/compounds.json'
import Link from 'next/link'

export async function generateStaticParams() {
  return (data as any[]).map((c)=>({ slug:c.slug }))
}

export function generateMetadata({ params }: any) {
  const compound = (data as any[]).find(c => c.slug === params.slug)
  if (!compound) return {}

  return {
    title: `${compound.name} Benefits, Effects & Safety | Hippie Scientist`,
    description: compound.summary || 'Detailed breakdown of effects, safety, and usage.'
  }
}

export default function Page({ params }: any) {
  const compounds = data as any[]
  const compound = compounds.find(c => c.slug === params.slug)
  if (!compound) return null

  const sources = compound.sources || []
  const related = compounds.filter(c => c.slug !== compound.slug).slice(0,5)

  const faq = [
    {
      q: `What is ${compound.name} used for?`,
      a: compound.summary || 'Used for various health-related purposes depending on context.'
    },
    {
      q: `Is ${compound.name} safe?`,
      a: compound.safety || 'Generally well tolerated, but individual response may vary.'
    }
  ]

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  }

  return (
    <main className="max-w-3xl mx-auto px-4 space-y-10 pb-28">

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Compounds', href: '/compounds' },
        { label: compound.name }
      ]} />

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{compound.name}</h1>
        <p className="text-sm text-neutral-600">{compound.summary}</p>

        <div className="flex gap-2">
          <EvidenceBadge level="moderate" />
          <SafetyBadge level="safe" />
        </div>
      </div>

      <DecisionCard
        bestFor={compound.effects || []}
        avoid={compound.avoid || []}
        time="Varies"
        evidence="Human data available"
      />

      <div className="bg-neutral-100 rounded-xl p-4 text-sm">
        <strong>Quick Verdict:</strong> 
        {compound.summary || 'Likely useful depending on context.'}
      </div>

      <SectionBlock title="Primary Effects">
        <ul className="space-y-1">
          {(compound.effects?.length ? compound.effects : ['No strong effects established']).slice(0,5).map((e:any,i:number)=>(
            <li key={i}>• {e}</li>
          ))}
        </ul>
      </SectionBlock>

      <SectionBlock title="Safety">
        <p>{compound.safety || 'Generally well tolerated for most users. Monitor individual response.'}</p>
      </SectionBlock>

      {sources.length > 0 && (
        <SectionBlock title="Sources">
          <ul className="space-y-1 text-xs">
            {sources.slice(0,10).map((s:any,i:number)=>(
              <li key={i}>• {typeof s === 'string' ? s : JSON.stringify(s)}</li>
            ))}
          </ul>
        </SectionBlock>
      )}

      <SectionBlock title="FAQ">
        <div className="space-y-3">
          {faq.map((f,i)=>(
            <div key={i}>
              <p className="font-semibold text-sm">{f.q}</p>
              <p className="text-sm text-neutral-600">{f.a}</p>
            </div>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock title="Related Compounds">
        <div className="flex flex-wrap gap-2">
          {related.map((r:any)=>(
            <Link key={r.slug} href={`/compounds/${r.slug}`} className="text-xs bg-neutral-200 px-2 py-1 rounded">
              {r.name}
            </Link>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock title="Research Note">
        <p className="text-neutral-500">
          Based on available human and mechanistic evidence. Interpret cautiously.
        </p>
      </SectionBlock>

    </main>
  )
}
