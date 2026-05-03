import { notFound } from 'next/navigation'
import LibraryBrowser from '@/components/library-browser'
import { bestPages } from '@/data/best'
import { getCompounds } from '@/lib/runtime-data'

export async function generateStaticParams() {
  return bestPages.map((page) => ({ slug: page.slug }))
}

export default async function Page({ params }: any) {
  const { slug } = await params
  const config = bestPages.find((p) => p.slug === slug)
  if (!config) return notFound()

  const compounds = await getCompounds()

  const items = compounds
    .filter((c: any) => config.compoundCandidates.includes(c.slug))
    .map((c: any) => ({
      slug: c.slug,
      title: c.displayName || c.name,
      summary: c.summary,
      href: `/compounds/${c.slug}`,
      domain: c.category,
      isATier: c.isATier,
      meta: c.meta,
    }))

  return (
    <LibraryBrowser
      title={config.title}
      description={config.description}
      items={items}
    />
  )
}
