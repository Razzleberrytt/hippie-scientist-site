'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { springConfig } from '@/utils/springConfig'

export function PremiumDetailV2({
  title,
  category,
  oneLiner,
  verdict,
  stats,
  bestFor,
  tags,
  comparisons,
  science,
  sidebarCta,
}: any) {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 text-white">

      {/* HERO */}
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-widest text-brand/70">{category}</p>
        <h1 className="text-4xl font-black sm:text-6xl">{title}</h1>
        <p className="text-base text-white/70 max-w-2xl">{oneLiner}</p>
      </section>

      {/* VERDICT */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={springConfig.card} className="mt-6">
        <GlassCard variant="heavy" className="p-5">
          <p className="text-sm text-white/80">{verdict}</p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s: any) => (
              <div key={s.label} className="text-xs">
                <p className="text-white/50 uppercase">{s.label}</p>
                <p className="font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.section>

      {/* BEST FOR */}
      <section className="mt-6 grid sm:grid-cols-3 gap-3">
        {bestFor.map((item: string) => (
          <GlassCard key={item} variant="light" className="p-4">
            <p>{item}</p>
          </GlassCard>
        ))}
      </section>

      {/* TAGS */}
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((t: string) => (
          <span key={t} className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5">{t}</span>
        ))}
      </div>

      {/* TABLE */}
      <GlassCard variant="frosted" className="mt-6 p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {comparisons.map((c: any) => (
              <tr key={c.factor} className="border-b border-white/10">
                <td className="py-2 text-white/60">{c.factor}</td>
                <td className="py-2">{c.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {/* SCIENCE */}
      <section className="mt-6 space-y-3">
        {science.map((s: any) => (
          <motion.details key={s.title} className="rounded-2xl border border-white/10 p-4 bg-white/5" whileHover={{ y: -2 }} transition={springConfig.gentle}>
            <summary className="cursor-pointer font-semibold">{s.title}</summary>
            <p className="mt-2 text-sm text-white/70">{s.body}</p>
          </motion.details>
        ))}
      </section>

      {/* SIDEBAR */}
      <aside className="hidden lg:block mt-6">
        <GlassCard variant="standard" className="p-4">
          {sidebarCta}
        </GlassCard>
      </aside>

      {/* MOBILE CTA */}
      <motion.div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] lg:hidden" whileHover={{ scale: 1.02 }} transition={springConfig.cta}>
        <div className="text-center bg-brand text-black rounded-xl py-3 font-bold shadow-glow">
          Start Assessment
        </div>
      </motion.div>

    </main>
  )
}
