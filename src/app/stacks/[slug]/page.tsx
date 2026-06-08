import StackTemplate from '@/components/stacks/StackTemplate'
import { getAuthorityStacks } from '@/lib/authority-runtime'

function titleize(slug: string) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

type StackPageProps = {
  params: Promise<{ slug: string }>
}

export default async function StackPage({ params }: StackPageProps) {
  const resolvedParams = await params
  const slug = String(resolvedParams.slug || '').toLowerCase()

  const records = await getAuthorityStacks(slug, 12)

  return (
    <StackTemplate
      title={`${titleize(slug)} Stack`}
      summary="Mechanism-aware stack recommendations generated from ecosystem overlap and semantic continuity systems."
      records={records}
    />
  )
}
