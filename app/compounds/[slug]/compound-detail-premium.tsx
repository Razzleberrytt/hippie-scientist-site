'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import clsx from 'clsx'
import { ChevronDown, ShieldAlert, FlaskConical, Sparkles } from 'lucide-react'

type CompoundDetailData = {
  slug: string
  headline: string
  category: string
  oneLiner: string
  verdict: string
  bestFor: string[]
  tags: string[]
  stats: Array<{ label: string; value: string; hint?: string }>
  comparisons: Array<{ metric: string; thisCompound: string; alternative: string; note?: string }>
  science: Array<{ title: string; body: string }>
  safety: string
  ctaHref: string
}

type GlassVariant = 'light' | 'standard' | 'heavy' | 'glow' | 'frosted'

const glassTone: Record<GlassVariant, string> = {
  light: 'bg-[#121821]/70 border-white/10 backdrop-blur-[4px] md:backdrop-blur-[8px]',
  standard: 'bg-[#121821]/84 border-white/15 backdrop-blur-[6px] md:backdrop-blur-[12px]',
  heavy: 'bg-[#121821]/92 border-white/20 backdrop-blur-[8px] md:backdrop-blur-[18px]',
  glow: 'bg-[#18202B]/90 border-[oklch(72%_0.19_145_/_.4)] shadow-[0_0_38px_-10px_oklch(72%_0.19_145_/_.45)] backdrop-blur-[8px] md:backdrop-blur-[16px]',
  frosted: 'bg-gradient-to-b from-white/[0.12] to-white/[0.04] border-white/20 backdrop-blur-[8px] md:backdrop-blur-[14px]',
}

function GlassCard({ variant = 'standard', className, children }: { variant?: GlassVariant; className?: string; children: React.ReactNode }) {
  return (
    <div className={clsx('relative overflow-hidden rounded-3xl border p-4 sm:p-5', glassTone[variant], className)}>
      <div className='pointer-events-none absolute inset-0 bg-[#0B0F14]/25' />
      <div className='relative z-10'>{children}</div>
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className='rounded-2xl border border-white/10 bg-[#0B0F14]/50 p-3'>
      <p className='text-[11px] uppercase tracking-[0.18em] text-white/60'>{label}</p>
      <p className='mt-1 text-base font-semibold text-white'>{value}</p>
      {hint ? <p className='mt-1 text-xs text-white/60'>{hint}</p> : null}
    </div>
  )
}

function SafetyBadge({ text }: { text: string }) {
  return <span className='inline-flex items-center gap-1.5 rounded-full border border-amber-300/35 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100'><ShieldAlert className='h-3.5 w-3.5' />{text}</span>
}

export default function CompoundDetailPremium({ data }: { data: CompoundDetailData }) {
  const reduceMotion = useReducedMotion()
  const [open, setOpen] = useState<string | null>(data.science[0]?.title ?? null)
  const spring = useMemo(() => reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 24 }, [reduceMotion])

  return (
    <main className='bg-[#0B0F14] text-white'>
      <div className='mx-auto grid max-w-7xl gap-6 px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:pb-12'>
        <section className='space-y-5'>
          <GlassCard variant='light'>
            <p className='text-xs uppercase tracking-[0.2em] text-[oklch(72%_0.19_145)]'>{data.category}</p>
            <h1 className='mt-2 text-5xl font-black tracking-tighter sm:text-6xl'>{data.headline}</h1>
            <p className='mt-3 text-[17px] leading-relaxed text-white/78'>{data.oneLiner}</p>
          </GlassCard>

          <motion.div transition={spring} whileHover={reduceMotion ? undefined : { y: -4 }}>
            <GlassCard variant='heavy'>
              <p className='text-xs uppercase tracking-[0.2em] text-white/70'>Verdict</p>
              <p className='mt-2 text-xl font-semibold text-[oklch(78%_0.16_145)]'>{data.verdict}</p>
              <div className='mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4'>
                {data.stats.map(item => <Stat key={item.label} {...item} />)}
              </div>
            </GlassCard>
          </motion.div>

          <div className='grid gap-3 md:grid-cols-3'>
            {data.bestFor.map((item, idx) => (
              <motion.div key={item} initial={reduceMotion ? undefined : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: idx * 0.03 }}>
                <GlassCard variant='standard'><p className='text-sm text-white/60'>Best for</p><p className='mt-1 text-lg font-semibold'>{item}</p></GlassCard>
              </motion.div>
            ))}
          </div>

          <div className='flex flex-wrap gap-2'>
            {data.tags.map(tag => <span key={tag} className='rounded-full border border-white/15 bg-[#18202B]/75 px-3 py-1.5 text-xs font-medium text-white/80'>{tag}</span>)}
          </div>

          <GlassCard variant='frosted' className='overflow-x-auto'>
            <table className='min-w-[680px] w-full text-left text-sm'>
              <thead><tr className='text-white/70'><th className='pb-2'>Metric</th><th className='pb-2'>This compound</th><th className='pb-2'>Alternative</th><th className='pb-2'>Note</th></tr></thead>
              <tbody className='divide-y divide-white/10'>
                {data.comparisons.map(row => <tr key={row.metric}><td className='py-3 font-medium'>{row.metric}</td><td className='py-3 text-[oklch(78%_0.16_145)]'>{row.thisCompound}</td><td className='py-3 text-white/85'>{row.alternative}</td><td className='py-3 text-white/65'>{row.note || '-'}</td></tr>)}
              </tbody>
            </table>
          </GlassCard>

          <section className='space-y-3'>
            <h2 className='text-2xl font-bold'>Science</h2>
            {data.science.map(item => {
              const active = open === item.title
              return (
                <motion.div key={item.title} transition={spring} whileHover={reduceMotion ? undefined : { scale: 1.01 }}>
                  <GlassCard variant='standard' className='p-0'>
                    <button className='flex w-full items-center justify-between px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(72%_0.19_145)]' onClick={() => setOpen(active ? null : item.title)}>
                      <span className='font-semibold'>{item.title}</span>
                      <ChevronDown className={clsx('h-5 w-5 transition-transform', active && 'rotate-180')} />
                    </button>
                    <AnimatePresence initial={false}>{active ? <motion.p initial={reduceMotion ? undefined : { height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={reduceMotion ? undefined : { height: 0, opacity: 0 }} className='overflow-hidden px-4 pb-4 text-[15px] leading-relaxed text-white/72'>{item.body}</motion.p> : null}</AnimatePresence>
                  </GlassCard>
                </motion.div>
              )
            })}
          </section>
        </section>

        <aside className='hidden lg:block'>
          <div className='sticky top-6 space-y-4'>
            <GlassCard variant='glow'>
              <p className='text-xs uppercase tracking-[0.2em] text-white/65'>Assessment</p>
              <SafetyBadge text={data.safety} />
              <div className='mt-4 space-y-2'>{data.stats.slice(0, 3).map(item => <Stat key={item.label} {...item} />)}</div>
              <Link href={data.ctaHref} className='mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-[oklch(72%_0.19_145)] px-4 py-3 font-semibold text-[#06210f] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121821] focus-visible:ring-[oklch(72%_0.19_145)]'>Compare safer options</Link>
            </GlassCard>
          </div>
        </aside>
      </div>

      <motion.div initial={reduceMotion ? undefined : { y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={spring} className='fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden'>
        <GlassCard variant='glow' className='p-3'>
          <Link href={data.ctaHref} className='flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[oklch(72%_0.19_145)] px-4 py-3 text-sm font-bold text-[#07200f]'><FlaskConical className='h-4 w-4' />Start assessment <Sparkles className='h-4 w-4' /></Link>
        </GlassCard>
      </motion.div>
    </main>
  )
}
