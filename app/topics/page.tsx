import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'

const topicLinks = [
  { slug: 'stress-response', title: 'Stress Response', description: 'Explore stress-load patterns, recovery sequencing, and adaptogenic context.' },
  { slug: 'sleep-recovery', title: 'Sleep Recovery', description: 'Understand sleep-support pathways, evening sequencing, and next-day carryover.' },
  { slug: 'cognitive-longevity', title: 'Cognitive Longevity', description: 'Review long-horizon cognition support with evidence and safety framing.' },
]

export default function TopicsIndexPage() {
  return (
    <main className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Topic Hubs"
        description="Topic-level hubs connecting herbs, compounds, protocols, and comparisons."
        url="https://thehippiescientist.net/topics"
        type="CollectionPage"
      />
      <section className="space-y-4 max-w-4xl">
        <p className="eyebrow-label">Discovery Layer</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">Topic Hubs</h1>
        <p className="text-lg leading-8 text-[#46574d]">Start with a topic hub to navigate connected profiles, protocol systems, and comparison pages without jumping straight into isolated ingredient claims.</p>
      </section>
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {topicLinks.map((topic) => (
          <Link key={topic.slug} href={`/topics/${topic.slug}`} className="card-premium p-6 space-y-3 transition hover:-translate-y-0.5">
            <p className="eyebrow-label">Topic Hub</p>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">{topic.title}</h2>
            <p className="text-sm leading-7 text-[#46574d]">{topic.description}</p>
          </Link>
        ))}
      </section>
    </main>
  )
}
