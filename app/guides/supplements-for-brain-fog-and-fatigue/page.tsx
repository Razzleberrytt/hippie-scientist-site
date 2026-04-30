import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Supplements for Brain Fog and Fatigue | The Hippie Scientist',
  description: 'A practical guide to supplements commonly discussed for brain fog, low energy, fatigue, and focus support.',
  alternates: { canonical: '/guides/supplements-for-brain-fog-and-fatigue' },
}

export default function Page() {
  return (
    <main className='mx-auto max-w-3xl space-y-6 px-4 py-10 text-white'>
      <section className='rounded-[2rem] border border-white/10 bg-white/[0.04] p-6'>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/70'>Guide</p>
        <h1 className='mt-3 text-4xl font-black'>Supplements for Brain Fog and Fatigue</h1>
        <p className='mt-4 text-white/70'>Brain fog and fatigue can overlap with poor sleep, stress, low energy availability, or inconsistent focus. This guide points you toward research pages, not medical advice.</p>
      </section>

      <section className='rounded-3xl border border-white/10 bg-white/[0.035] p-5'>
        <h2 className='text-2xl font-bold'>Fast answer</h2>
        <ul className='mt-4 list-disc space-y-2 pl-5 text-white/70'>
          <li><strong className='text-white'>Creatine</strong> is commonly discussed for energy metabolism and performance context.</li>
          <li><strong className='text-white'>Rhodiola</strong> is often framed around stress-linked fatigue.</li>
          <li><strong className='text-white'>Caffeine + L-theanine</strong> is a popular focus stack when stimulation needs smoothing.</li>
        </ul>
      </section>

      <section className='rounded-3xl border border-white/10 bg-white/[0.035] p-5'>
        <h2 className='text-2xl font-bold'>Where to go next</h2>
        <div className='mt-4 flex flex-wrap gap-2'>
          <Link href='/top/best-supplements-for-brain-fog' className='rounded-2xl bg-emerald-300 px-4 py-2 text-sm font-bold text-slate-950'>Best supplements for brain fog</Link>
          <Link href='/top/best-supplements-for-fatigue' className='rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/75'>Best supplements for fatigue</Link>
          <Link href='/compare/creatine-vs-caffeine' className='rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/75'>Creatine vs caffeine</Link>
        </div>
      </section>
    </main>
  )
}
