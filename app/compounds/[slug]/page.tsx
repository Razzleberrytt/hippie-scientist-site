import { getCompoundBySlug } from '@/lib/runtime-data'

type Params = Promise<{ slug: string }>

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params

  const compound = await getCompoundBySlug(slug)

  if (!compound) return null

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{compound.name}</h1>
      <p className="text-muted max-w-2xl">{compound.summary}</p>
    </div>
  )
}
