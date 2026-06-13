import ProtocolTemplate from '@/components/protocols/ProtocolTemplate'
import { getBestForRankings } from '@/lib/authority-runtime'

function titleize(slug: string) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

type ProtocolPageProps = {
  params: Promise<{ slug: string }>
}

function protocolJsonLd(slug: string, title: string, summary: string) {
  const url = `https://thehippiescientist.net/protocols/${slug}`

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://thehippiescientist.net/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Protocols',
          item: 'https://thehippiescientist.net/protocols',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: title,
          item: url,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: title,
      headline: title,
      description: summary,
      url,
      isPartOf: {
        '@type': 'WebSite',
        name: 'The Hippie Scientist',
        url: 'https://thehippiescientist.net/',
      },
      about: {
        '@type': 'Thing',
        name: title.replace(/ Protocol$/, ''),
      },
    },
  ]
}

export default async function ProtocolPage({ params }: ProtocolPageProps) {
  const resolvedParams = await params
  const slug = String(resolvedParams.slug || '').toLowerCase()
  const title = `${titleize(slug)} Protocol`
  const summary = 'Evidence-aware protocol guidance generated from semantic overlap, mechanism continuity, and research maturity systems.'

  const records = await getBestForRankings(slug, 12)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(protocolJsonLd(slug, title, summary)) }}
      />
      <ProtocolTemplate
        title={title}
        summary={summary}
        records={records}
      />
    </>
  )
}
