import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import stacksData from '@/public/data/stacks.json'
import compoundsData from '@/public/data/compounds.json'
import { supplementComparisons } from '@/data/comparisons'
import { goalConfigs } from '@/data/goals'
import StackCard from '@/components/StackCard'
import { getCompoundSearchLinks } from '@/lib/affiliate'

const stacks = stacksData as any[]
const compounds = ((compoundsData as any[]) || []).filter(Boolean)

const compoundMap = new Map(
  compounds
    .filter((compound) => compound?.slug)
    .map((compound) => [compound.slug as string, compound])
)

const formatName = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

export function generateStaticParams() {
  return stacks.map((stack) => ({ slug: stack.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const stack = stacks.find((item) => item.slug === params.slug)
  if (!stack) return { title: 'Stack Guide | Benefits, Facts, Safety' }

  const name = stack.title
  const title = `${name} Stack Guide | Benefits, Facts, Safety`
  const description = `Explore compounds, key facts, safety notes, and comparisons for the ${name.toLowerCase()} stack.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  }
}

export default function StackPage({ params }: { params: { slug: string } }) {
  const stack = stacks.find((item) => item.slug === params.slug)
  if (!stack) return notFound()

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-4xl font-black text-white">{stack.title}</h1>
        <p className="mt-3 max-w-3xl text-white/80">{stack.short_description}</p>
      </section>
    </div>
  )
}
