import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLearnPost, learnPosts } from '../data'
import RelatedDiscoveryGroups from '@/components/ui/RelatedDiscoveryGroups'
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
    <div className="container-page py-6 sm:py-10">
      <article className="space-y-10 sm:space-y-12">
        <section className="hero-shell rounded-[2rem] border p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="eyebrow-label">{post.category}</span>
            <span className="identity-meta">{post.readingTime}</span>
          </div>
          <h1 className="heading-premium mt-5 max-w-4xl">{post.title}</h1>
          <p className="text-reading mt-4 max-w-3xl">{post.hero}</p>
        </section>

        <section className="grid gap-9 lg:grid-cols-[minmax(0,1.8fr)_minmax(15rem,0.72fr)] lg:gap-12">
          <div className="min-w-0">
            {post.sections.map((section, index) => (
              <section
                key={section.heading}
                className="relative border-t border-[color:var(--hs-hairline)] py-8 first:border-t-0 first:pt-0 sm:py-10"
              >
                <div className="grid gap-3 sm:grid-cols-[3.25rem_minmax(0,1fr)] sm:gap-5">
                  <p
                    aria-hidden="true"
                    className="font-mono text-[0.66rem] font-semibold tracking-[0.16em] text-[color:var(--hs-gold-ink)] sm:pt-1.5"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <div>
                    <h2 className="max-w-2xl font-display text-[1.7rem] font-semibold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[2rem]">
                      {section.heading}
                    </h2>
                    <p className="detail-reading mt-4 max-w-[68ch] text-muted">{section.body}</p>
                    {section.bullets && section.bullets.length > 0 ? (
                      <ul className="mt-5 max-w-[68ch] space-y-2.5 border-l border-[color:var(--hs-hairline-strong)] pl-5 text-muted">
                        {section.bullets.map((bullet) => (
                          <li key={bullet} className="relative pl-3 before:absolute before:left-0 before:top-[0.72em] before:h-1 before:w-1 before:rounded-full before:bg-[color:var(--hs-gold)]">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </section>
            ))}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
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
                { href: '/guides/other/psychedelic-adjacent-herbs', label: 'Psychedelic-adjacent herbs' },
                { href: '/guides', label: 'Browse all guides' },
              ],
            },
          ]}
        />
      </article>
    </div>
  )
}
