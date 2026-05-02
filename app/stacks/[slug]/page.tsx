import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStacks, getCompounds } from '@/lib/runtime-data'
import { supplementComparisons } from '@/data/comparisons'
import { goalConfigs } from '@/data/goals'
import StackCard from '@/components/StackCard'
import { getCompoundSearchLinks } from '@/lib/affiliate'

type Params = { params: Promise<{ slug: string }> }

const normalizeGoal = (goal?: string) => (goal || '').replace(/_/g, '-').toLowerCase()

export async function generateStaticParams() {
  const stacks = await getStacks()
  return stacks.map((stack) => ({ slug: stack.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const stacks = await getStacks()
  const stack = stacks.find((item) => item.slug === slug)
  if (!stack) return { title: 'Stack Guide | Benefits, Facts, Safety' }

  return {
    title: `${stack.title} Stack Guide`,
    description: stack.summary || stack.short_description,
  }
}

export default async function StackPage({ params }: Params) {
  const { slug } = await params

  const stacks = await getStacks()
  const compounds = await getCompounds()

  const stack = stacks.find((item) => item.slug === slug)
  if (!stack) return notFound()

  const compoundMap = new Map(
    (compounds || [])
      .filter((compound) => compound?.slug)
      .map((compound) => [compound.slug, compound])
  )

  const items = Array.isArray(stack.compounds)
    ? stack.compounds.map((c: any) => ({
        compound_slug: c.compound_slug,
        display_name: c.display_name,
        dosage: c.dosage,
        timing: c.timing,
        role: c.role,
        evidence_tier: c.evidence_tier,
        safety_flags: c.safety_flags,
      }))
    : (stack.stack || [])

  const compoundSlugs = new Set(items.map((item: any) => item.compound_slug || item.compound).filter(Boolean))

  const relatedComparisons = supplementComparisons.filter((comparison) =>
    comparison.a.candidates.some((c) => compoundSlugs.has(c)) ||
    comparison.b.candidates.some((c) => compoundSlugs.has(c))
  )

  const relatedStacks = stacks
    .filter((s) => s.slug !== stack.slug && normalizeGoal(s.goal || s.goal_slug) === normalizeGoal(stack.goal || stack.goal_slug))

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-4xl font-black text-white">{stack.title}</h1>
        <p className="mt-3 text-white/75">{stack.summary || stack.short_description}</p>
        {stack.variant && (
          <p className="mt-2 text-sm text-emerald-300 uppercase">Variant: {stack.variant}</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white">Stack Breakdown</h2>
        <div className="grid gap-5">
          {items.map((item: any, index: number) => {
            const slug = item.compound_slug || item.compound
            const compound = compoundMap.get(slug)
            const name = item.display_name || compound?.name || slug
            const links = getCompoundSearchLinks(name)

            return (
              <div key={`${slug}-${index}`} className="space-y-4">
                <StackCard item={item} />
                <div className="flex flex-wrap gap-2">
                  {links.map((link) => (
                    <a key={link.label} href={link.url} className="text-xs text-white/70" target="_blank">
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {relatedStacks.length > 0 && (
        <section>
          <h2 className="font-bold text-white">Related stacks</h2>
          <div className="flex flex-wrap gap-3">
            {relatedStacks.map((s) => (
              <Link key={s.slug} href={`/stacks/${s.slug}`} className="text-emerald-300">
                {s.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
