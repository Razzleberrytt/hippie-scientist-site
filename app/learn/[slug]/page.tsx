import compounds from '../../../public/data/compounds.json'

export async function generateStaticParams() {
  return (compounds as any[]).slice(0,50).map((c)=>({slug:c.slug}))
}

export default function Page({ params }: any) {
  return (
    <main className="max-w-3xl mx-auto px-4">
      <h1 className="text-2xl font-bold">Learn: {params.slug}</h1>
    </main>
  )
}
