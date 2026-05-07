import Link from 'next/link'

export const metadata = {
  title: 'Psychedelic-Adjacent Herbs | Hippie Scientist',
  description: 'A harm-reduction-oriented discovery entry point for ritual, dream, and perception-adjacent botanicals.',
}

export default function PsychedelicAdjacentHerbsPage() {
  return (
    <main className="container-page py-12 sm:py-16">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
        <p className="eyebrow-label">Safety-led discovery</p>
        <h1 className="mt-3 max-w-3xl text-ink">Psychedelic-adjacent herbs</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#46574d]">
          Start from conservative botanical profiles and keep safety, interactions, and uncertainty visible.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/herbs" className="button-primary rounded-full">Browse herb profiles</Link>
          <Link href="/disclaimer" className="button-secondary rounded-full">Read educational scope</Link>
        </div>
      </section>
    </main>
  )
}
