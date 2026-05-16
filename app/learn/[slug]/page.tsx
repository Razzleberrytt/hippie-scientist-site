import { getAllCompounds } from '@/lib/server/runtime-data'

type LearnRouteParams = Promise<{ slug: string }>

type LearnRouteProps = {
  params: LearnRouteParams
}

export async function generateStaticParams() {
  const compounds = await getAllCompounds()
  return (compounds as any[]).slice(0, 50).map((c) => ({ slug: c.slug }))
}

export default async function Page({ params }: LearnRouteProps) {
  const resolvedParams = await params
  return (
    <main className="max-w-3xl mx-auto px-4">
      <h1 className="text-2xl font-bold">Learn: {resolvedParams.slug}</h1>
    </main>
  )
}
