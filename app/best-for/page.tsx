import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import { bestExploredTopics } from '@/lib/best-explored-topics'

export default function BestForIndexPage() {
  return (
    <main className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Best For"
        description="Goal-oriented best-for hubs organized by evidence and pathway context."
        url="https://thehippiescientist.net/best-for"
        type="CollectionPage"
      />
      <section className="space-y-4 max-w-4xl">
        <p className="eyebrow-label">Discovery Layer</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">Best For Hubs</h1>
        <p className="text-lg leading-8 text-[#46574d]">Use these pages to start with a goal, then branch into herbs, compounds, protocols, and comparisons.</p>
      </section>
      <section className="grid gap-5 md:grid-cols-2">
        {bestExploredTopics.map((topic) => (
          <Link key={topic.slug} href={`/best-for/${topic.slug}`} className="card-premium p-6 space-y-3 transition hover:-translate-y-0.5">
            <p className="eyebrow-label">Best For</p>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">{topic.title}</h2>
            <p className="text-sm leading-7 text-[#46574d]">{topic.description}</p>
          </Link>
        ))}
      </section>
    </main>
  )
}
