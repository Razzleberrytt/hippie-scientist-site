'use client'

import Link from 'next/link'

export default function HomepageV2() {
  return (
    <main className="bg-white min-h-screen">

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-10">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
          Find supplements that actually work
        </h1>
        <p className="mt-4 text-neutral-600 text-lg">
          Evidence-based breakdowns of herbs and compounds — what they do, who they’re for, and what to buy.
        </p>
      </section>

      {/* SEARCH */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <input
          placeholder="Search what you want to fix (sleep, anxiety, focus)"
          className="w-full p-4 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* QUICK NAV */}
      <div className="max-w-4xl mx-auto px-4 mt-10 grid grid-cols-2 gap-4">
        {['Sleep','Anxiety','Focus','Testosterone'].map(item => (
          <Link key={item} href={`/best/${item.toLowerCase()}`}>
            <div className="p-4 border border-neutral-200 rounded-xl hover:border-neutral-400 transition">
              <span className="text-sm font-medium text-neutral-900">{item}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* BEST FOR GOALS */}
      <section className="max-w-4xl mx-auto px-4 mt-14">
        <h2 className="text-lg font-semibold text-neutral-900">
          Best supplements for common goals
        </h2>
        <div className="mt-4 grid gap-4">
          {[
            { title: 'Better sleep', slug: 'sleep' },
            { title: 'Reduce anxiety', slug: 'anxiety' },
            { title: 'Improve focus', slug: 'focus' }
          ].map(item => (
            <Link key={item.slug} href={`/best/${item.slug}`}>
              <div className="p-4 border border-neutral-200 rounded-xl hover:border-neutral-400 transition">
                <div className="text-sm font-semibold text-neutral-900">
                  {item.title}
                </div>
                <div className="text-xs text-neutral-600 mt-1">
                  See top evidence-based options →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TOP PICKS */}
      <section className="max-w-4xl mx-auto px-4 mt-14">
        <h2 className="text-lg font-semibold text-neutral-900">
          Top evidence-backed picks
        </h2>
        <div className="mt-4 grid gap-4">
          {[
            { name: 'Ashwagandha', slug: 'ashwagandha' },
            { name: 'Magnesium', slug: 'magnesium' },
            { name: 'L-Theanine', slug: 'l-theanine' }
          ].map(item => (
            <Link key={item.slug} href={`/compounds/${item.slug}`}>
              <div className="p-4 border border-neutral-200 rounded-xl hover:border-neutral-400 transition">
                <div className="text-sm font-semibold text-neutral-900">
                  {item.name}
                </div>
                <div className="text-xs text-neutral-600 mt-1">
                  View evidence + best options →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA STRIP */}
      <div className="max-w-4xl mx-auto px-4 mt-16">
        <div className="rounded-2xl bg-neutral-900 text-white p-6">
          <div className="text-lg font-semibold">
            Not sure what to take?
          </div>
          <div className="text-sm text-neutral-300 mt-2">
            Start with proven compounds used in most stacks.
          </div>
          <Link href="/compounds/ashwagandha">
            <button className="mt-4 w-full py-3 bg-green-500 text-black rounded-xl font-semibold">
              Start with top options
            </button>
          </Link>
        </div>
      </div>

      {/* TRUST */}
      <section className="max-w-4xl mx-auto px-4 mt-16 pb-16">
        <p className="text-sm text-neutral-600">
          All content is based on human studies and conservative evidence standards.
          No hype. No filler. Just what actually works.
        </p>
      </section>

    </main>
  )
}
