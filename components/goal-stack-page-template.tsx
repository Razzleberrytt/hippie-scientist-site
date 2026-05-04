'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { listContainer, listItem, springConfig } from '@/utils/springConfig'

type StackCompound = {
  slug: string
  name: string
  summary?: string
  bestFor?: string
  dosage?: string
  timing?: string
  evidence?: string
  safety?: string
  role: 'Anchor' | 'Amplifier' | 'Support'
  href: string
}

type Props = {
  title: string
  description: string
  slug: string
  compounds: StackCompound[]
}

const roleTone = {
  Anchor: 'border-brand/40 bg-brand/15 text-brand',
  Amplifier: 'border-info/35 bg-info/10 text-info',
  Support: 'border-evidence-limited/35 bg-evidence-limited/10 text-evidence-limited',
} as const

function StackCompoundCard({ compound, index }: { compound: StackCompound; index: number }) {
  return (
    <motion.div variants={listItem} transition={{ ...springConfig.gentle, delay: Math.min(index * 0.018, 0.18) }}>
      <Link href={compound.href} className="group block focus:outline-none">
        <GlassCard variant={compound.role === 'Anchor' ? 'glow' : 'standard'} className="min-h-[278px] p-5 sm:p-6" delay={Math.min(index * 0.012, 0.16)}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${roleTone[compound.role]}`}>
                {compound.role}
              </span>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-white transition group-hover:text-brand">{compound.name}</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-bold text-white/50">#{index + 1}</span>
          </div>

          <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/68">{compound.bestFor || compound.summary || 'Decision-ready stack component.'}</p>

          <div className="mt-5 grid gap-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Dosage</p>
              <p className="mt-1 text-sm font-bold text-white">{compound.dosage || 'See profile'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Timing</p>
              <p className="mt-1 text-sm font-bold text-white">{compound.timing || 'Goal-dependent'}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-evidence-moderate/25 bg-evidence-moderate/10 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">Evidence</p>
              <p className="mt-1 truncate text-xs font-bold text-evidence-moderate">{compound.evidence || 'Review'}</p>
            </div>
            <div className="rounded-2xl border border-safety-moderate/25 bg-safety-moderate/10 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">Safety</p>
              <p className="mt-1 truncate text-xs font-bold text-safety-moderate">{compound.safety || 'Review'}</p>
            </div>
          </div>

          <div className="mt-5 border-t border-white/10 pt-4 text-sm font-black text-brand transition group-hover:translate-x-1">Open compound →</div>
        </GlassCard>
      </Link>
    </motion.div>
  )
}

export default function GoalStackPageTemplate({ title, description, slug, compounds }: Props) {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 0.18, 1], [18, 0, -8])
  const opacity = useTransform(scrollYProgress, [0, 0.08, 1], [0.86, 1, 1])
  const scale = useTransform(scrollYProgress, [0, 0.18, 1], [0.96, 1, 1])
  const featured = compounds[0]

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 pb-[calc(6rem+env(safe-area-inset-bottom))] text-white">
      <section className="relative overflow-hidden rounded-[2rem] border border-brand/20 bg-glass-heavy p-5 shadow-glass backdrop-blur-md sm:p-8 lg:p-10">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-info/10 blur-3xl" />
        <div className="relative z-10 grid gap-7 lg:grid-cols-[1fr_0.75fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-brand/70">Goal-based stack</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[0.93] tracking-[-0.07em] text-white sm:text-7xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">{description}</p>
          </div>
          <GlassCard variant="frosted" className="p-4" enableShine={false}>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><p className="text-3xl font-black text-brand">{compounds.length}</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/40">Compounds</p></div>
              <div><p className="text-3xl font-black text-info">1</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/40">Anchor</p></div>
              <div><p className="text-3xl font-black text-evidence-limited">2+</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/40">Support</p></div>
            </div>
          </GlassCard>
        </div>
      </section>

      {featured ? (
        <GlassCard variant="heavy" className="p-5 sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-center">
            <div>
              <span className="inline-flex rounded-full border border-brand/40 bg-brand/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-brand">Featured stack anchor</span>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-white sm:text-5xl">{featured.name}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">{featured.bestFor || featured.summary || 'Primary stack anchor for this goal.'}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Dosage</p><p className="mt-1 font-bold text-white">{featured.dosage || 'See profile'}</p></div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Timing</p><p className="mt-1 font-bold text-white">{featured.timing || 'Goal-dependent'}</p></div>
            </div>
          </div>
        </GlassCard>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <GlassCard variant="standard" className="p-5" enableShine={false}>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-brand/70">How to use this stack</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-white">Anchor first, then add carefully</h2>
            <p className="mt-3 text-sm leading-6 text-white/64">Start with the anchor. Use amplifiers when the goal needs a stronger push. Keep support compounds for consistency, tolerance, or safety fit.</p>
            <div className="mt-5 grid gap-2 text-sm">
              <div className="rounded-2xl border border-brand/20 bg-brand/10 p-3"><strong className="text-brand">Anchor:</strong> default starting point.</div>
              <div className="rounded-2xl border border-info/20 bg-info/10 p-3"><strong className="text-info">Amplifier:</strong> stronger add-on.</div>
              <div className="rounded-2xl border border-evidence-limited/20 bg-evidence-limited/10 p-3"><strong className="text-evidence-limited">Support:</strong> routine-friendly helper.</div>
            </div>
          </GlassCard>
        </div>

        <motion.div variants={listContainer} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {compounds.map((compound, index) => <StackCompoundCard key={compound.slug} compound={compound} index={index} />)}
        </motion.div>
      </section>

      <motion.div style={{ y, opacity, scale }} className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 lg:right-6 lg:left-auto lg:w-80 lg:translate-x-0">
        <Link href={`/best/${slug}#stack`} className="group block rounded-3xl border border-brand/35 bg-brand/15 p-2 shadow-glow backdrop-blur-xl">
          <div className="rounded-2xl bg-brand px-5 py-4 text-center text-sm font-black text-black transition group-hover:scale-[1.01]">Review this stack →</div>
        </Link>
      </motion.div>
    </main>
  )
}
