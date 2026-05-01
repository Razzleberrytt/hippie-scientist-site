import type { Metadata } from 'next'
import Link from 'next/link'
import { getCompounds, getHerbs } from '@/lib/runtime-data'

type LibraryRecord = {
  slug: string
  displayName?: string | null
  name?: string | null
  summary?: string | null
  description?: string | null
}

const pickFeatured = (items: LibraryRecord[], preferred: string[], count: number): LibraryRecord[] => {
  const bySlug = new Map(items.map(item => [item.slug, item]))
  const selected = preferred
    .map(slug => bySlug.get(slug))
    .filter((item): item is LibraryRecord => Boolean(item))

  const fallback = items
    .filter(item => !selected.some(selectedItem => selectedItem.slug === item.slug))
    .slice(0, count - selected.length)

  return [...selected, ...fallback].slice(0, count)
}

const getTitle = (item: LibraryRecord): string =>
  item.displayName?.trim() ||
  item.name?.trim() ||
  item.slug
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const getSummary = (item: LibraryRecord): string => {
  const text = item.summary?.trim() || item.description?.trim() || 'Profile summary coming soon.'
  return text.length > 116 ? `${text.slice(0, 115).trimEnd()}…` : text
}

export const metadata: Metadata = {
  title: 'The Hippie Scientist',
  description:
    'A searchable herb and compound library built for evidence-aware supplement research, safety context, and practical discovery.',
}

export default async function HomePage() {
  const [herbs, compounds] = await Promise.all([getHerbs(), getCompounds()])

  const featuredHerbs = pickFeatured(
    herbs as LibraryRecord[],
    ['ashwagandha', 'rhodiola-rosea', 'bacopa', 'turmeric', 'lion-s-mane'],
    5,
  )
  const featuredCompounds = pickFeatured(
    compounds as LibraryRecord[],
    ['creatine', 'l-theanine', 'magnesium', 'nac', 'berberine'],
    5,
  )

  return (
    <div className='space-y-5 sm:space-y-8'>
      <section className='relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_20%_15%,rgba(16,185,129,0.22),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.16),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-5 shadow-2xl shadow-black/30 sm:p-8 lg:p-10'>
        <div className='absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent' />

        <div className='grid gap-7 lg:grid-cols-[1.25fr_0.75fr] lg:items-center'>
          <div>
            <span className='inline-flex rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-emerald-100'>
              Evidence-aware plant intelligence
            </span>

            <h1 className='mt-4 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl'>
              Find what actually matters in herbs and compounds.
            </h1>

            <p className='mt-4 max-w-2xl text-base leading-7 text-white/72 sm:text-lg'>
              Browse a workbook-built research library with plain-English summaries,
              safety context, active constituents, and practical discovery paths.
            </p>

            <div className='mt-6 grid gap-3 sm:flex sm:flex-wrap'>
              <Link href='/herbs' className='rounded-2xl bg-emerald-300 px-6 py-3 text-center text-sm font-black text-slate-950 shadow-lg shadow-emerald-950/20 transition hover:-translate-y-0.5 hover:bg-emerald-200'>Browse herbs</Link>
              <Link href='/compounds' className='rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-3 text-center text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.08]'>Browse compounds</Link>
            </div>
          </div>

          <div className='grid gap-3 rounded-3xl border border-white/10 bg-black/20 p-4 backdrop-blur'>
            <div className='grid grid-cols-2 gap-3'>
              <div className='rounded-2xl border border-white/10 bg-white/[0.04] p-4'>
                <p className='text-xs uppercase tracking-[0.18em] text-white/45'>Herbs</p>
                <p className='mt-2 text-3xl font-black text-white'>{herbs.length}</p>
              </div>
              <div className='rounded-2xl border border-white/10 bg-white/[0.04] p-4'>
                <p className='text-xs uppercase tracking-[0.18em] text-white/45'>Compounds</p>
                <p className='mt-2 text-3xl font-black text-white'>{compounds.length}</p>
              </div>
            </div>

            <div className='rounded-2xl border border-white/10 bg-white/[0.04] p-4'>
              <p className='text-xs uppercase tracking-[0.18em] text-white/45'>Core promise</p>
              <p className='mt-2 text-sm leading-6 text-white/70'>No miracle-cure hype. Mechanisms, context, and safety signals stay separated from personal medical advice.</p>
            </div>
          </div>
        </div>
      </section>

      <section className='grid gap-3 md:grid-cols-3'>
        <Link href='/herbs' className='group rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.025] p-5 transition hover:-translate-y-0.5 hover:border-emerald-300/35 hover:bg-white/[0.07]'>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/65'>Start here</p>
          <h2 className='mt-3 text-2xl font-bold text-white'>Herb library</h2>
          <p className='mt-2 text-sm leading-6 text-white/62'>Plant profiles you can search, scan, and compare without digging through messy notes.</p>
          <span className='mt-4 inline-flex text-sm font-bold text-emerald-200 transition group-hover:translate-x-1'>Open herbs →</span>
        </Link>

        <Link href='/compounds' className='group rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.025] p-5 transition hover:-translate-y-0.5 hover:border-blue-300/35 hover:bg-white/[0.07]'>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-blue-100/65'>Dig deeper</p>
          <h2 className='mt-3 text-2xl font-bold text-white'>Compound index</h2>
          <p className='mt-2 text-sm leading-6 text-white/62'>Follow active constituents, mechanisms, and research notes across the library.</p>
          <span className='mt-4 inline-flex text-sm font-bold text-blue-200 transition group-hover:translate-x-1'>Open compounds →</span>
        </Link>

        <Link href='/top/sleep' className='group rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.025] p-5 transition hover:-translate-y-0.5 hover:border-violet-300/35 hover:bg-white/[0.07]'>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-violet-100/65'>Use case</p>
          <h2 className='mt-3 text-2xl font-bold text-white'>Sleep support</h2>
          <p className='mt-2 text-sm leading-6 text-white/62'>A focused path for people who want practical discovery instead of endless browsing.</p>
          <span className='mt-4 inline-flex text-sm font-bold text-violet-200 transition group-hover:translate-x-1'>Explore sleep →</span>
        </Link>
      </section>

      <section className='rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5 sm:p-6'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-amber-100/70'>Curated picks</p>
            <h2 className='mt-1 text-2xl font-bold text-white'>Want the strongest profiles first?</h2>
            <p className='mt-2 max-w-2xl text-sm leading-6 text-white/65'>After browsing the library, use A-tier picks to focus on the cleanest, highest-confidence entries.</p>
          </div>
          <Link href='/a-tier' className='rounded-2xl border border-amber-300/30 bg-black/20 px-5 py-3 text-center text-sm font-bold text-amber-100 transition hover:bg-amber-300/15'>See A-tier picks</Link>
        </div>
      </section>

      <section className='rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-white/45'>Explore by goal</p>
            <h2 className='mt-1 text-2xl font-bold text-white'>Start with what you want help with</h2>
          </div>
        </div>
        <div className='mt-4 grid gap-3 md:grid-cols-3'>
          <Link href='/top/sleep' className='rounded-2xl border border-violet-300/20 bg-violet-300/10 p-4 transition hover:bg-violet-300/15'>
            <h3 className='font-bold text-white'>Sleep support</h3>
            <p className='mt-1 text-sm leading-6 text-white/60'>Ranked herbs connected to rest, calm, and sleep context.</p>
          </Link>
          <Link href='/top/stress' className='rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 transition hover:bg-emerald-300/15'>
            <h3 className='font-bold text-white'>Stress support</h3>
            <p className='mt-1 text-sm leading-6 text-white/60'>Herbs connected to stress, calm, cortisol, and adaptogen context.</p>
          </Link>
          <Link href='/top/focus' className='rounded-2xl border border-blue-300/20 bg-blue-300/10 p-4 transition hover:bg-blue-300/15'>
            <h3 className='font-bold text-white'>Focus support</h3>
            <p className='mt-1 text-sm leading-6 text-white/60'>Compounds and research anchors for cognition and focus discovery.</p>
          </Link>
        </div>
      </section>

      <section className='grid gap-4 lg:grid-cols-2'>
        <div className='rounded-3xl border border-white/10 bg-white/[0.035] p-5'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-white/45'>Featured herbs</p>
              <h2 className='mt-1 text-2xl font-bold text-white'>High-interest plant profiles</h2>
            </div>
            <Link href='/herbs' className='shrink-0 text-sm font-bold text-emerald-200'>View all →</Link>
          </div>

          <div className='mt-4 grid gap-2'>
            {featuredHerbs.map(item => (
              <Link key={item.slug} href={`/herbs/${item.slug}/`} className='group rounded-2xl border border-white/10 bg-black/15 p-3 transition hover:border-emerald-300/30 hover:bg-white/[0.055]'>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <h3 className='font-semibold text-white group-hover:text-emerald-100'>{getTitle(item)}</h3>
                    <p className='mt-1 text-sm leading-5 text-white/55'>{getSummary(item)}</p>
                  </div>
                  <span className='text-emerald-200'>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className='rounded-3xl border border-white/10 bg-white/[0.035] p-5'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-white/45'>Featured compounds</p>
              <h2 className='mt-1 text-2xl font-bold text-white'>Useful research anchors</h2>
            </div>
            <Link href='/compounds' className='shrink-0 text-sm font-bold text-blue-200'>View all →</Link>
          </div>

          <div className='mt-4 grid gap-2'>
            {featuredCompounds.map(item => (
              <Link key={item.slug} href={`/compounds/${item.slug}/`} className='group rounded-2xl border border-white/10 bg-black/15 p-3 transition hover:border-blue-300/30 hover:bg-white/[0.055]'>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <h3 className='font-semibold text-white group-hover:text-blue-100'>{getTitle(item)}</h3>
                    <p className='mt-1 text-sm leading-5 text-white/55'>{getSummary(item)}</p>
                  </div>
                  <span className='text-blue-200'>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className='rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.10),rgba(255,255,255,0.03))] p-5 sm:p-6'>
        <div className='grid gap-5 md:grid-cols-[1fr_1fr] md:items-center'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-white/45'>Harm-reduction mindset</p>
            <h2 className='mt-2 text-2xl font-bold text-white sm:text-3xl'>Useful does not mean risk-free.</h2>
            <p className='mt-3 text-sm leading-6 text-white/65'>This site is educational. Check interactions, safety notes, medications, pregnancy, surgery, and health conditions before treating any herb or compound as personally appropriate.</p>
          </div>
          <div className='grid gap-2 text-sm text-white/68'>
            <div className='rounded-2xl border border-white/10 bg-black/15 p-3'>Mechanisms are context, not proof.</div>
            <div className='rounded-2xl border border-white/10 bg-black/15 p-3'>Human evidence matters more than hype.</div>
            <div className='rounded-2xl border border-white/10 bg-black/15 p-3'>Workbook data drives the public library.</div>
          </div>
        </div>
      </section>
    </div>
  )
}
