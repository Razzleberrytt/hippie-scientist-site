import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getLearnPost } from '../data'

export default function LearnPost({ params }: { params: { slug: string } }) {
  const post = getLearnPost(params.slug)
  if (!post) return notFound()

  return (
    <article className="space-y-8">
      <div>
        <p className="text-xs uppercase text-muted">{post.category} • {post.readingTime}</p>
        <h1 className="text-3xl font-bold mt-1">{post.title}</h1>
        <p className="text-muted mt-3 max-w-2xl">{post.hero}</p>
      </div>

      {post.keyStack && (
        <section className="border rounded-xl p-5">
          <h2 className="font-semibold">Core Stack</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {post.keyStack.map(i => (
              <li key={i.name}><strong>{i.name}</strong> — {i.dose} ({i.timing}) — {i.note}</li>
            ))}
          </ul>
        </section>
      )}

      {post.sections.map(s => (
        <section key={s.heading}>
          <h2 className="text-xl font-semibold">{s.heading}</h2>
          <p className="text-muted mt-2">{s.body}</p>
          {s.bullets && (
            <ul className="list-disc pl-5 mt-2 text-sm text-muted">
              {s.bullets.map(b => <li key={b}>{b}</li>)}
            </ul>
          )}
        </section>
      ))}

      {post.buyingCriteria && (
        <section className="border rounded-xl p-5">
          <h2 className="font-semibold">What to look for</h2>
          <ul className="list-disc pl-5 mt-2 text-sm text-muted">
            {post.buyingCriteria.map(b => <li key={b}>{b}</li>)}
          </ul>
        </section>
      )}

      {post.safetyNotes && (
        <section className="border rounded-xl p-5 bg-yellow-50">
          <h2 className="font-semibold">Safety notes</h2>
          <ul className="list-disc pl-5 mt-2 text-sm">
            {post.safetyNotes.map(b => <li key={b}>{b}</li>)}
          </ul>
        </section>
      )}

      <section>
        <h3 className="font-semibold">Explore more</h3>
        <div className="flex gap-3 mt-2 flex-wrap">
          {post.relatedLinks.map(l => (
            <Link key={l.href} href={l.href} className="text-sm underline">{l.label}</Link>
          ))}
        </div>
      </section>
    </article>
  )
}
