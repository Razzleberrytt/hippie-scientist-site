'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { springConfig } from '@/utils/springConfig'

const GENERIC_BEST_FOR = /^(best\s*for:?|general\s+(wellness|support)|overall\s+wellness|wellness\s+support|daily\s+support|supports\s+general)/i

function cleanBestFor(items: string[] = []) {
  const seen = new Set<string>()

  return items
    .map((item) => item.replace(/^best\s*for:\s*/i, '').trim())
    .filter((item) => item && !GENERIC_BEST_FOR.test(item))
    .filter((item) => {
      const key = item.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 3)
}

export function PremiumDetailV2({
  title,
  category,
  oneLiner,
  verdict,
  stats = [],
  bestFor = [],
  tags = [],
  comparisons = [],
  science = [],
  sidebarCta,
}: any) {
  const reduceMotion = useReducedMotion()
  const focusedBestFor = cleanBestFor(bestFor)
  const isDetailedProfile = science.length >= 3 && comparisons.length >= 4 && focusedBestFor.length >= 2
  const showFloatingCta = Boolean(sidebarCta) && !isDetailedProfile

  return (
    <main className="mx-auto max-w-6xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 text-stone-950">

      {/* HERO */}
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-widest text-brand/80">{category}</p>
        <h1 className="text-4xl font-black tracking-tight text-stone-950 sm:text-6xl">{title}</h1>
        <p className="max-w-2xl text-base leading-7 text-stone-700">{oneLiner}</p>
      </section>

      {/* VERDICT */}
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig.card}
        className="mt-6"
      >
        <GlassCard variant="heavy" className="p-5">
          <p className="text-sm leading-6 text-stone-800">{verdict}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s: any) => (
              <div key={s.label} className="text-xs">
                <p className="text-[0.68rem] uppercase tracking-wide text-stone-500">{s.label}</p>
                <p className="mt-1 font-bold text-stone-950">{s.value}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.section>

      {/* BEST FOR */}
      {focusedBestFor.length ? (
        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          {focusedBestFor.map((item: string) => (
            <GlassCard key={item} variant="light" className="p-4" enableShine={false}>
              <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-brand/80">Best fit</p>
              <p className="mt-1 text-sm leading-6 text-stone-800">{item}</p>
            </GlassCard>
          ))}
        </section>
      ) : null}

      {/* TAGS */}
      {tags.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((t: string) => (
            <span key={t} className="rounded-full border border-brand/15 bg-white/45 px-3 py-1 text-xs text-stone-700 shadow-sm">{t}</span>
          ))}
        </div>
      ) : null}

      {/* TABLE */}
      {comparisons.length ? (
        <GlassCard variant="frosted" className="mt-6 overflow-x-auto p-4" enableShine={false}>
          <table className="w-full text-sm">
            <tbody>
              {comparisons.map((c: any) => (
                <tr key={c.factor} className="border-b border-stone-900/10 last:border-0">
                  <td className="py-3 pr-4 font-medium text-stone-600">{c.factor}</td>
                  <td className="py-3 leading-6 text-stone-900">{c.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      ) : null}

      {/* SCIENCE */}
      {science.length ? (
        <section className="mt-6 space-y-3">
          {science.map((s: any) => (
            <motion.details
              key={s.title}
              className="group rounded-2xl border border-stone-900/10 bg-white/50 p-4 shadow-sm backdrop-blur-md open:bg-white/65"
              whileHover={reduceMotion ? undefined : { y: -2 }}
              transition={springConfig.gentle}
            >
              <summary className="cursor-pointer list-none font-semibold text-stone-950 marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  <span>{s.title}</span>
                  <span className="text-lg leading-none text-brand/80 group-open:rotate-45 motion-safe:transition-transform">+</span>
                </span>
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-700">{s.body}</p>
            </motion.details>
          ))}
        </section>
      ) : null}

      {/* SIDEBAR */}
      {sidebarCta ? (
        <aside className="mt-6 hidden lg:block">
          <GlassCard variant="standard" className="p-4" enableShine={false}>
            {sidebarCta}
          </GlassCard>
        </aside>
      ) : null}

      {/* MOBILE CTA */}
      {showFloatingCta ? (
        <motion.div
          className="fixed bottom-4 left-1/2 w-[90%] -translate-x-1/2 lg:hidden"
          whileHover={reduceMotion ? undefined : { scale: 1.01 }}
          transition={springConfig.cta}
        >
          <div className="rounded-xl border border-brand/25 bg-white/90 py-3 text-center text-sm font-bold text-stone-950 shadow-glass backdrop-blur-xl">
            Start Assessment
          </div>
        </motion.div>
      ) : null}

    </main>
  )
}
