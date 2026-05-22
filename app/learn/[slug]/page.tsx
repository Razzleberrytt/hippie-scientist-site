import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLearnPost, learnPosts } from '../data'

type LearnRouteParams = Promise<{ slug: string }>

type LearnRouteProps = {
  params: LearnRouteParams
}

export async function generateStaticParams() {
  return learnPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: LearnRouteProps): Promise<Metadata> {
  const { slug } = await params
  const post = getLearnPost(slug)

  if (!post) {
    return {
      title: 'Learn | The Hippie Scientist',
      description: 'Evidence-aware educational content and practical learning guides.',
    }
  }

  return {
    title: `${post.title} | Learn`,
    description: post.description,
  }
}

export default async function Page({ params }: LearnRouteProps) {
  const { slug } = await params
  const post = getLearnPost(slug)

  if (!post) notFound()

  return (
    <main className="container-page py-10 sm:py-14">
      <article className="space-y-8">
        <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
          <p className="eyebrow-label">{post.category} · {post.readingTime}</p>
          <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">{post.title}</h1>
          <p className="detail-reading mt-4 text-muted">{post.hero}</p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
          <div className="space-y-6">
            {post.sections.map((section) => (
              <section key={section.heading} className="card-premium p-6">
                <h2 className="text-2xl font-semibold text-ink">{section.heading}</h2>
                <p className="detail-reading mt-3 text-muted">{section.body}</p>
                {section.bullets && section.bullets.length > 0 ? (
                  <ul className="mt-4 space-y-2 pl-5 text-muted list-disc">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          <aside className="space-y-5">
            <section className="card-premium p-5">
              <p className="eyebrow-label">Best fit goals</p>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                {post.bestFor.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </section>

            {post.safetyNotes?.length ? (
              <section className="card-premium p-5">
                <p className="eyebrow-label">Safety reminder</p>
                <p className="mt-3 text-sm text-muted">
                  This page is educational and is not medical advice. Discuss supplement decisions with a licensed clinician, especially for medications, pregnancy, or chronic conditions.
                </p>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  {post.safetyNotes.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </aside>
        </section>

        <section className="card-premium p-6">
          <p className="eyebrow-label">Continue exploring</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {post.relatedLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-emerald-700 underline-offset-4 hover:underline">
                {link.label}
              </Link>
            ))}
            <Link href="/learn" className="text-sm font-medium text-emerald-700 underline-offset-4 hover:underline">
              Browse all learn guides
            </Link>
          </div>
        </section>
      </article>
    </main>
  )
}
