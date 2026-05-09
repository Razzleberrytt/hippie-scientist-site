import ProtocolTemplate from '@/components/protocols/ProtocolTemplate'
import { getBestForRankings } from '@/lib/authority-runtime'

function titleize(slug: string) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default async function ProtocolPage({ params }: any) {
  const slug = String(params?.slug || '').toLowerCase()

  const records = await getBestForRankings(slug, 12)

  return (
    <ProtocolTemplate
      title={`${titleize(slug)} Protocol`}
      summary="Evidence-aware protocol guidance generated from semantic overlap, mechanism continuity, and research maturity systems."
      records={records}
    />
  )
}
