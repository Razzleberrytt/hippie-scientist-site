import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStacks, getCompounds } from '@/lib/runtime-data'
import StackCard from '@/components/StackCard'
import AffiliateBlock from '@/components/AffiliateBlock'

type Params = { params: Promise<{ slug: string }> }

export default async function StackPage({ params }: Params) {
  const { slug } = await params

  const stacks = await getStacks()
  const compounds = await getCompounds()

  const stack = stacks.find((item) => item.slug === slug)
  if (!stack) return notFound()

  const items = stack.compounds || stack.stack || []

  return (
    <div className="space-y-10">

      <section className="space-y-4">
        <h1 className="text-4xl font-black text-white">{stack.title}</h1>
        <p className="text-white/70">{stack.summary || stack.short_description}</p>

        {/* 🔥 PRIMARY MONETIZATION BLOCK */}
        <div className="mt-4 rounded-2xl border border-emerald-300/20 p-5 bg-emerald-300/[0.05]">
          <h2 className="text-xl font-bold text-white">Buy this stack</h2>
          <p className="text-sm text-white/60">Top supplements used in this stack.</p>

          <div className="mt-4 grid gap-3">
            {items.slice(0, 3).map((item, i) => (
              <AffiliateBlock key={i} compound={item.compound_slug || item.compound} />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Stack Breakdown</h2>
        <div className="grid gap-5">
          {items.map((item, index) => (
            <div key={index} className="space-y-3">
              <StackCard item={item} />

              {/* 🔥 INLINE CTA */}
              <AffiliateBlock compound={item.compound_slug || item.compound} />
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
