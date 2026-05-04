'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type GlassVariant = 'light' | 'standard' | 'heavy' | 'glow' | 'frosted'

const glassClasses: Record<GlassVariant, string> = {
  light: 'border-white/10 bg-white/[0.04] backdrop-blur-md',
  standard: 'border-white/15 bg-white/[0.06] backdrop-blur-lg',
  heavy: 'border-white/20 bg-[#18202B]/85 shadow-[0_10px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl',
  glow: 'border-[oklch(72%_0.19_145/.55)] bg-[oklch(72%_0.19_145/.08)] shadow-[0_0_30px_oklch(72%_0.19_145/.22)] backdrop-blur-lg',
  frosted: 'border-white/15 bg-[#121821]/70 backdrop-blur-md',
}

export function GlassCard({ children, variant = 'standard', className = '' }: { children: ReactNode; variant?: GlassVariant; className?: string }) {
  return <div className={`rounded-2xl border ${glassClasses[variant]} p-4 sm:p-5 ${className}`}><div className='rounded-xl bg-black/20 p-0'>{children}</div></div>
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-xl border border-white/10 bg-white/[0.03] p-3'>
      <p className='text-[10px] uppercase tracking-[0.18em] text-slate-400'>{label}</p>
      <p className='mt-1 text-sm font-semibold text-slate-100'>{value}</p>
    </div>
  )
}

export function SafetyBadge({ value }: { value: string }) {
  const tone = /avoid|severe|contraindicat/i.test(value) ? 'bg-red-500/15 text-red-200 border-red-400/30' : 'bg-amber-500/15 text-amber-100 border-amber-400/30'
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}>{value}</span>
}

export function PremiumDetailV2({ title, category, oneLiner, verdict, stats, bestFor, tags, comparisons, science, sidebarCta }: any) {
  return (
    <main className='mx-auto max-w-6xl bg-[#0B0F14] px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-4 text-slate-100 sm:px-6'>
      <section className='space-y-3'>
        <p className='inline-flex rounded-full border border-[oklch(72%_0.19_145/.35)] bg-[oklch(72%_0.19_145/.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[oklch(84%_0.14_145)]'>{category}</p>
        <h1 className='text-5xl font-black tracking-tighter sm:text-6xl'>{title}</h1>
        <p className='max-w-3xl text-[17px] leading-relaxed text-slate-300'>{oneLiner}</p>
      </section>

      <motion.section initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ stiffness: 320, damping: 24, type: 'spring' }} className='mt-4'>
        <GlassCard variant='heavy'>
          <p className='text-sm text-slate-300'>{verdict}</p>
          <div className='mt-3 grid gap-2 sm:grid-cols-4'>{stats.map((s: any) => <Stat key={s.label} label={s.label} value={s.value} />)}</div>
        </GlassCard>
      </motion.section>

      <section className='mt-4 grid gap-3 sm:grid-cols-3'>
        {bestFor.map((item: string) => <GlassCard key={item} variant='light'><p className='text-sm font-semibold text-slate-100'>{item}</p></GlassCard>)}
      </section>

      <section className='mt-3 flex flex-wrap gap-2'>{tags.map((t: string) => <SafetyBadge key={t} value={t} />)}</section>

      <GlassCard variant='frosted' className='mt-4 overflow-x-auto'>
        <table className='min-w-[560px] w-full text-left text-sm'>
          <thead><tr className='text-slate-300'><th className='pb-2'>Factor</th><th>Snapshot</th></tr></thead>
          <tbody>{comparisons.map((row: any) => <tr key={row.factor} className='border-t border-white/10'><td className='py-2 pr-4 text-slate-400'>{row.factor}</td><td className='py-2'>{row.value}</td></tr>)}</tbody>
        </table>
      </GlassCard>

      <div className='mt-4 grid gap-4 lg:grid-cols-[1fr_300px]'>
        <section className='space-y-3'>
          {science.map((s: any) => (
            <motion.details key={s.title} className='rounded-2xl border border-white/10 bg-[#121821]/85 p-4' whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
              <summary className='cursor-pointer list-none text-base font-semibold'>{s.title}</summary>
              <p className='mt-2 text-[15px] leading-relaxed text-slate-300'>{s.body}</p>
            </motion.details>
          ))}
        </section>
        <aside className='hidden lg:block'>
          <div className='sticky top-6 space-y-3'>
            <GlassCard variant='standard'>
              <p className='text-sm text-slate-300'>Quick assessment</p>
              <div className='mt-3'>{sidebarCta}</div>
            </GlassCard>
          </div>
        </aside>
      </div>

      <motion.div className='fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-30 w-[calc(100%-2rem)] -translate-x-1/2 lg:hidden' whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 360, damping: 26 }}>
        <Link href='/compare' className='block rounded-2xl border border-[oklch(72%_0.19_145/.55)] bg-[oklch(72%_0.19_145/.15)] px-4 py-3 text-center text-sm font-semibold shadow-[0_0_20px_oklch(72%_0.19_145/.22)] backdrop-blur-[8px]'>Run my safety assessment</Link>
      </motion.div>
    </main>
  )
}
