import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getStacks } from '@/lib/runtime-data'
import StackCard from '@/components/StackCard'
import AffiliateBlock from '@/components/AffiliateBlock'

export async function generateStaticParams() {
  const stacks = await getStacks()
  return stacks.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const stacks = await getStacks()
  const stack = stacks.find(s => s.slug === slug)
  return {
    title: stack?.title || 'Stack',
    description: stack?.summary || ''
  }
}

export default async function StackPage({ params }) {
  const { slug } = await params
  const stacks = await getStacks()

  const stack = stacks.find(s => s.slug === slug)
  if (!stack) return notFound()

  const items = stack.compounds || stack.stack || []

  const bundleQuery = items.map(i => i.compound_slug || i.compound).join('+')

  return (
    <div className="space-y-10">

      <section className="space-y-4">
        <h1 className="text-4xl font-black text-white">{stack.title}</h1>
        <p className="text-white/70">{stack.summary}</p>

        {/* 🔥 FULL STACK BUNDLE */}
        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-5">
          <h2 className="text-xl font-bold text-white">Buy full stack</h2>
          <a
            href={`https://www.amazon.com/s?k=${bundleQuery}+supplement&tag=razzleberry02-20`}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="mt-3 block rounded-xl bg-amber-300 py-3 text-center font-black text-black"
          >
            Shop full stack →
          </a>
        </div>

        {/* 🔥 PRIMARY CTA */}
        <div className="rounded-2xl border border-emerald-300/20 p-5 bg-emerald-300/[0.05]">
          <h2 className="text-xl font-bold text-white">Top picks from this stack</h2>
          <div className="mt-3 grid gap-3">
            {items.slice(0, 3).map((item, i) => (
              <AffiliateBlock
                key={i}
                compound={item.compound_slug || item.compound}
                intentLabel={i === 0 ? 'Primary (most effective)' : undefined}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Stack Breakdown</h2>
        <div className="grid gap-5">
          {items.map((item, i) => (
            <div key={i} className="space-y-3">
              <StackCard item={item} />

              <AffiliateBlock
                compound={item.compound_slug || item.compound}
                intentLabel={item.role === 'anchor' ? 'Core compound' : undefined}
                compact
              />
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
