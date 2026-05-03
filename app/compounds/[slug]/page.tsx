import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCompoundBySlug, getCompounds } from '@/lib/runtime-data'
import stacksData from '@/public/data/stacks.json'
import { supplementComparisons } from '@/data/comparisons'
import { goalConfigs } from '@/data/goals'
import { getCompoundSearchLinks } from '@/lib/affiliate'

const stacks = stacksData as any[]

// ... (unchanged helpers above)

export default async function Page({ params }: any) {
  const { slug } = await params
  const compound = await getCompoundBySlug(slug)
  if (!compound) notFound()

  const label = compound.displayName || compound.name
  const links = getCompoundSearchLinks(label).slice(0, 2)

  const evidence = compound?.evidence_grade || compound?.summary_quality || 'limited'
  const bestFor = compound?.best_for || 'General use based on goal fit'
  const avoid = compound?.avoid_if || 'Medical conditions, medications, or sensitivity'
  const form = compound?.oral_form || 'Capsules (default), powder if dosing flexibility needed'

  return (
    <main className="space-y-8">

      {/* AUTHORITY BLOCK */}
      <section className="soft-section">
        <h2 className="text-2xl font-black">Evidence clarity</h2>
        <p className="mt-2 text-sm">Current level: <strong>{evidence}</strong></p>
        <p className="text-sm text-slate-600">This reflects available human evidence strength, not marketing claims.</p>
      </section>

      {/* WHO FOR / AVOID */}
      <section className="grid md:grid-cols-2 gap-4">
        <div className="soft-section">
          <h3 className="font-black">Best for</h3>
          <p className="text-sm mt-2">{bestFor}</p>
        </div>
        <div className="soft-section bg-amber-50">
          <h3 className="font-black">Avoid if</h3>
          <p className="text-sm mt-2">{avoid}</p>
        </div>
      </section>

      {/* BEST FORM */}
      <section className="soft-section">
        <h2 className="font-black">Best form</h2>
        <p className="text-sm mt-2">{form}</p>
      </section>

      {/* PRODUCT CTA */}
      <section className="soft-section">
        <h2 className="font-black">Find a good option</h2>
        <div className="mt-3 flex flex-col gap-2">
          {links.map(l => (
            <a key={l.label} href={l.url} target="_blank" className="premium-button text-center">
              View {l.label} options →
            </a>
          ))}
        </div>
      </section>

    </main>
  )
}
