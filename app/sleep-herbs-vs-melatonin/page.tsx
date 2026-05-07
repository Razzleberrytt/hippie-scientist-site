import Link from 'next/link'

export const metadata = {
  title: 'Sleep Herbs vs Melatonin | Hippie Scientist',
  description: 'A safe discovery entry point for sleep-support herbs, compounds, and comparison research.',
}

export default function SleepHerbsVsMelatoninPage() {
  return (
    <main className="container-page py-12 sm:py-16">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
        <p className="eyebrow-label">Discovery path</p>
        <h1 className="mt-3 max-w-3xl text-ink">Sleep herbs vs melatonin</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#46574d]">
          Compare sleep support by relaxation, circadian timing, recovery context, and safety profile.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/sleep-supplements" className="button-primary rounded-full">Open sleep guide</Link>
          <Link href="/explore/sleep" className="button-secondary rounded-full">Explore sleep compounds</Link>
        </div>
      </section>
    </main>
  )
}
