import Link from 'next/link'
import { learnPosts } from './data'

const educationHubs = [
  {
    title: 'Scientific But Human Neuroscience',
    href: '/education/scientific-but-human-neuroscience',
  },
  {
    title: 'Cognitive Resilience Systems',
    href: '/education/cognitive-resilience-systems',
  },
  {
    title: 'Stress and Cognition Continuity',
    href: '/education/stress-and-cognition-continuity',
  },
]

export default function LearnPage() {
  return (
    <div className="space-y-12">
      <section className="space-y-4 max-w-4xl">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Education Ecosystem</p>
          <h1 className="text-3xl font-bold mt-2">Learn</h1>
        </div>

        <p className="text-muted text-lg leading-8">
          Evidence-aware educational systems exploring contextual neurobiology, sustainable cognition, recovery-oriented neuroscience, emotional regulation, and scientific literacy.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/education"
            className="rounded-full border px-4 py-2 text-sm hover:bg-black hover:text-white transition"
          >
            Explore Education Hub
          </Link>

          <Link
            href="/education/neuroscience-glossary"
            className="rounded-full border px-4 py-2 text-sm hover:bg-black hover:text-white transition"
          >
            Neuroscience Glossary
          </Link>
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Authority Hubs</p>
          <h2 className="text-2xl font-semibold mt-2">Core Educational Systems</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {educationHubs.map(hub => (
            <Link
              key={hub.href}
              href={hub.href}
              className="rounded-2xl border p-5 hover:shadow-sm transition"
            >
              <p className="text-xs uppercase text-muted">Educational Hub</p>
              <h3 className="text-lg font-semibold mt-2">{hub.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Featured Guides</p>
          <h2 className="text-2xl font-semibold mt-2">Practical Evidence-Aware Learning</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {learnPosts.map(post => (
            <Link
              key={post.slug}
              href={`/learn/${post.slug}`}
              className="rounded-2xl border p-5 hover:shadow-sm transition"
            >
              <p className="text-xs uppercase text-muted">
                {post.category} • {post.readingTime}
              </p>

              <h2 className="text-xl font-semibold mt-1">{post.title}</h2>

              <p className="text-sm text-muted mt-2">{post.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
