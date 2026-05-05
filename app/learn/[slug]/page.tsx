import { notFound } from 'next/navigation'
import Link from 'next/link'
import { generateLearnPage } from '@/lib/learn-generator'

export default async function LearnPost({ params }: { params: { slug: string } }) {
  const post = await generateLearnPage(params.slug)
  if (!post) return notFound()

  return (
    <article className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <p className="text-muted mt-3 max-w-2xl">{post.intro}</p>
      </div>

      <section>
        <h2 className="text-xl font-semibold">Core Compounds</h2>
        <div className="grid gap-4 md:grid-cols-2 mt-4">
          {post.compounds.map((c:any) => (
            <div key={c.slug} className="border rounded-xl p-4">
              <h3 className="font-semibold">{c.name}</h3>
              <p className="text-sm text-muted">{c.summary}</p>
              <Link href={`/compounds/${c.slug}`} className="text-sm underline mt-2 inline-block">View details →</Link>
            </div>
          ))}
        </div>
      </section>
    </article>
  )
}
