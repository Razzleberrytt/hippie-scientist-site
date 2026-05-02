import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCompoundBySlug, getCompounds } from '@/lib/runtime-data'
import stacksData from '@/public/data/stacks.json'
import { supplementComparisons } from '@/data/comparisons'
import { getCompoundSearchLinks } from '@/lib/affiliate'

const stacks = stacksData as any[]

const formatName = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

export async function generateStaticParams() {
  const compounds = await getCompounds()
  return compounds.map((compound: any) => ({ slug: compound.slug }))
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { slug } = await params
  const compound = await getCompoundBySlug(slug)
  const label = compound?.displayName || compound?.name || formatName(slug)
  const title = `${label} | The Hippie Scientist`
  const description = `Key facts, evidence tier, safety notes, and related stacks for ${label}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  }
}

export default async function Page({ params }: any) {
  const { slug } = await params
  const compound = await getCompoundBySlug(slug)
  if (!compound) notFound()

  const label = compound.displayName || compound.name || formatName(slug)
  const links = getCompoundSearchLinks(label)

  const relatedComparisons = supplementComparisons.filter(
    (comparison) => comparison.a.candidates.includes(slug) || comparison.b.candidates.includes(slug)
  )

  const relatedStacks = stacks.filter((stack) => stack.stack?.some((item: any) => item.compound === slug))

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-black text-white">{label}</h1>

      {relatedComparisons.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white">Related comparisons</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {relatedComparisons.map((comparison) => (
              <Link key={comparison.slug} href={`/compare/${comparison.slug}`} className="text-sm text-white/70 hover:text-white">
                {comparison.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedStacks.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white">Used in stacks</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {relatedStacks.map((stack) => (
              <Link key={stack.slug} href={`/stacks/${stack.slug}`} className="text-sm text-emerald-300 hover:text-emerald-100">
                {stack.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedStacks.length === 0 && (
        <section>
          <h2 className="text-xl font-bold text-white">Explore stacks</h2>
          <Link href="/stacks" className="text-sm text-emerald-300">
            Explore stacks using this compound
          </Link>
        </section>
      )}

      <section className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-white/70 hover:text-white">
            {link.label}
          </a>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 p-5">
        <h2 className="text-xl font-bold text-white">Explore More</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href="/stacks" className="text-sm text-white/70 hover:text-white">
            Browse stacks
          </Link>
          <Link href="/herbs" className="text-sm text-white/70 hover:text-white">
            Browse herbs
          </Link>
        </div>
      </section>
    </div>
  )
}
