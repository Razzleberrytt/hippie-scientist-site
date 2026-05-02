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

  const title = `${label} Benefits, Facts, and Safety`
  const description = `Evidence-backed facts, safety notes, and related stacks for ${label.toLowerCase()}.`

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

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-black text-white">{label}</h1>

      <section className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-white/70 hover:text-white">
            {link.label}
          </a>
        ))}
      </section>
    </div>
  )
}
