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

export default async function ProtocolPage({ params }: ProtocolPageProps) {
  const resolvedParams = await params
  const slug = String(resolvedParams.slug || '').toLowerCase()

  const records = await getBestForRankings(slug, 12)

  return (
    <ProtocolTemplate
      title={`${titleize(slug)} Protocol`}
      summary="Evidence-aware protocol guidance generated from semantic overlap, mechanism continuity, and research maturity systems."
      records={records}
    />
  )
}
