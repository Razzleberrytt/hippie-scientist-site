import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLearnPost, learnPosts } from '../data'
import RelatedDiscoveryGroups from '@/components/ui/RelatedDiscoveryGroups'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { compactMetaTitle } from '../../../src/lib/seo'

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
      title: 'Learn',
      description: 'Evidence-informed educational content and practical learning guides.',
    }
  }

  return {
    title: compactMetaTitle(post.title),
    description: post.description,
    alternates: { canonical: `/learn/${post.slug}/` },
  }
}

export default async function Page({ params }: LearnRouteProps) {
  const { slug } = await params
  const post = getLearnPost(slug)

  if (!post) notFound()

  const relatedArticles = learnPosts.filter((item) => item.slug !== post.slug).slice(0, 3).map((item) => ({ href: `/learn/${item.slug}`, label: item.title }))

  return (
    <div className="container-page py-10 sm:py-14">
      <article className="space-y-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Guides', href: '/guides' },
            { label: post.title },
          ]}
        />
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

        <RelatedDiscoveryGroups
          eyebrow="Continue exploring"
          title="Choose your next educational step"
          groups={[
            {
              title: 'Related concepts',
              description: 'Educational deep-dives that connect to this topic.',
              links: relatedArticles,
            },
            {
              title: 'Apply what you learned',
              description: 'Move from concepts into profiles.',
              links: post.relatedLinks,
            },
            {
              title: 'Read safety context',
              description: 'Use safety-first pages before trialing new compounds.',
              links: [
                { href: '/guides/sleep-herbs-vs-melatonin', label: 'Sleep herbs vs melatonin' },
                { href: '/guides/psychedelic-adjacent-herbs', label: 'Psychedelic-adjacent herbs' },
                { href: '/guides', label: 'Browse all guides' },
              ],
            },
          ]}
        />
      </article>
    </div>
  )
}
