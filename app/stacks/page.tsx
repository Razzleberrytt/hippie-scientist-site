import Link from 'next/link'
import stacks from '@/public/data/stacks.json'

type StackItem = {
  slug: string
  title: string
  goal?: string
  short_description?: string
  stack?: Array<{ compound?: string; dosage?: string; timing?: string; role?: string }>
  who_for?: string
  avoid_if?: string
  cta?: string
}

const stackItems = stacks as StackItem[]

const formatLabel = (value?: string) =>
  (value ?? '')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const stackTone = (slug: string) => {
  if (slug.includes('sleep')) return 'from-indigo-300/18 via-sky-300/8 to-white/[0.025]'
  if (slug.includes('stress')) return 'from-emerald-300/18 via-teal-300/8 to-white/[0.025]'
  if (slug.includes('fat')) return 'from-amber-300/18 via-orange-300/8 to-white/[0.025]'
  if (slug.includes('cognition')) return 'from-violet-300/18 via-fuchsia-300/8 to-white/[0.025]'
  if (slug.includes('performance')) return 'from-rose-300/18 via-red-300/8 to-white/[0.025]'
  return 'from-emerald-300/14 via-white/[0.055] to-white/[0.025]'
}

const roleBadge = (role?: string) => {
  if (role === 'anchor') return 'bg-emerald-300/14 text-emerald-100 border-emerald-300/22'
  if (role === 'amplifier') return 'bg-amber-300/14 text-amber-100 border-amber-300/22'
  if (role === 'finisher') return 'bg-indigo-300/14 text-indigo-100 border-indigo-300/22'
  return 'bg-white/7 text-white/58 border-white/10'
}

export default function StacksPage() {
  const featured = stackItems[0]
  const remaining = stackItems.slice(1)

  return (
    <main className='space-y-8'>
      <section className='relative overflow-hidden rounded-[2rem] border border-emerald-300/15 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-5 shadow-2xl shadow-emerald-950/20 sm:p-8'>
        <div className='absolute -right-10 -top-10 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl' />
        <div className='relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end'>
          <div>
            <p className='text-xs font-black uppercase tracking-[0.26em] text-emerald-200/75'>Decision guides</p>
            <h1 className='mt-3 text-4xl font-black tracking-tight text-white sm:text-6xl'>Supplement stacks</h1>
            <p className='mt-4 max-w-3xl text-sm leading-7 text-white/72 sm:text-base'>
              Start from a goal, then drill into compounds, timing, safety notes, and product-search paths without scrolling through the whole database.
            </p>
          </div>

          <div className='grid grid-cols-3 gap-2 rounded-3xl border border-white/10 bg-black/25 p-2 text-center backdrop-blur'>
            <div className='rounded-2xl bg-white/[0.055] px-3 py-3'>
              <div className='text-2xl font-black text-white'>{stackItems.length}</div>
              <div className='text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/45'>Stacks</div>
            </div>
            <div className='rounded-2xl bg-emerald-300/10 px-3 py-3'>
              <div className='text-2xl font-black text-emerald-100'>3</div>
              <div className='text-[0.68rem] font-bold uppercase tracking-[0.16em] text-emerald-100/55'>Steps</div>
            </div>
            <div className='rounded-2xl bg-amber-300/10 px-3 py-3'>
              <div className='text-2xl font-black text-amber-100'>Safety</div>
              <div className='text-[0.68rem] font-bold uppercase tracking-[0.16em] text-amber-100/55'>First</div>
            </div>
          </div>
        </div>
      </section>

      {featured ? (
        <Link
          href={`/stacks/${featured.slug}`}
          className={`group block overflow-hidden rounded-[2rem] border border-emerald-300/25 bg-gradient-to-br ${stackTone(featured.slug)} p-5 transition hover:-translate-y-0.5 hover:border-emerald-300/45 sm:p-7`}
        >
          <div className='grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center'>
            <div>
              <p className='text-xs font-black uppercase tracking-[0.22em] text-emerald-100/70'>Featured stack</p>
              <h2 className='mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl'>{featured.title}</h2>
              <p className='mt-3 max-w-2xl text-sm leading-7 text-white/68'>{featured.short_description}</p>
              {featured.who_for ? <p className='mt-4 text-sm leading-6 text-emerald-50/72'><span className='font-black text-emerald-100'>Best for:</span> {featured.who_for}</p> : null}
              <span className='mt-5 inline-flex rounded-full bg-emerald-300 px-4 py-2 text-sm font-black text-slate-950 transition group-hover:bg-emerald-200'>Open full stack →</span>
            </div>

            <div className='grid gap-3'>
              {(featured.stack ?? []).slice(0, 3).map((item, index) => (
                <div key={`${featured.slug}-${item.compound}-${index}`} className='rounded-3xl border border-white/10 bg-black/24 p-4'>
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <p className='text-lg font-black text-white'>{formatLabel(item.compound)}</p>
                      <p className='mt-1 text-xs text-white/52'>{item.dosage} · {item.timing}</p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.14em] ${roleBadge(item.role)}`}>{formatLabel(item.role)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Link>
      ) : null}

      <section>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-2xl font-black text-white'>Browse by goal</h2>
            <p className='mt-1 text-sm text-white/55'>Each card shows the actual stack pattern before the click.</p>
          </div>
          <Link href='/goals/sleep' className='text-sm font-black text-emerald-200 hover:text-emerald-100'>Explore goal guides →</Link>
        </div>

        <div className='mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {remaining.map((s) => (
            <Link
              key={s.slug}
              href={`/stacks/${s.slug}`}
              className={`group flex min-h-72 flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br ${stackTone(s.slug)} p-5 transition hover:-translate-y-0.5 hover:border-emerald-300/35`}
            >
              <div className='flex items-center justify-between gap-3'>
                <span className='rounded-full border border-white/10 bg-black/18 px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white/55'>{formatLabel(s.goal)}</span>
                <span className='text-xs font-bold text-white/38'>{(s.stack ?? []).length} compounds</span>
              </div>

              <h3 className='mt-4 text-2xl font-black tracking-tight text-white group-hover:text-emerald-100'>{s.title}</h3>
              <p className='mt-3 text-sm leading-6 text-white/66'>{s.short_description}</p>

              <div className='mt-4 space-y-2'>
                {(s.stack ?? []).slice(0, 3).map((item, index) => (
                  <div key={`${s.slug}-${item.compound}-${index}`} className='flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-black/18 px-3 py-2'>
                    <span className='min-w-0 truncate text-sm font-bold text-white/82'>{formatLabel(item.compound)}</span>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-[0.12em] ${roleBadge(item.role)}`}>{formatLabel(item.role)}</span>
                  </div>
                ))}
              </div>

              <div className='mt-auto pt-5'>
                {s.avoid_if ? <p className='line-clamp-2 text-xs leading-5 text-amber-100/62'><span className='font-black'>Avoid if:</span> {s.avoid_if}</p> : null}
                <span className='mt-4 inline-flex text-sm font-black text-emerald-200 transition group-hover:translate-x-1'>See dosage, timing & risks →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
