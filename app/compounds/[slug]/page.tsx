import { getCompoundBySlug } from '@/lib/runtime-data'

export default async function Page({ params }: { params: { slug: string } }) {
  const compound = await getCompoundBySlug(params.slug)

  if (!compound) return null

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{compound.name}</h1>
      <p className="text-muted max-w-2xl">{compound.summary}</p>
    </div>
  )
}
