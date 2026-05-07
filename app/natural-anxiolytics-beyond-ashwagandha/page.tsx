import Link from 'next/link'

export const metadata = {
  title: 'Natural Anxiolytics Beyond Ashwagandha | Hippie Scientist',
  description: 'A safe discovery entry point for calm-support botanicals and related research profiles.',
}

export default function NaturalAnxiolyticsPage() {
  return (
    <main className="container-page py-12 sm:py-16">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
        <p className="eyebrow-label">Discovery path</p>
        <h1 className="mt-3 max-w-3xl text-ink">Natural anxiolytics beyond ashwagandha</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#46574d]">
          Explore calming botanicals through evidence-aware profiles instead of one-size-fits-all recommendations.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/herbs" className="button-primary rounded-full">Browse herbs</Link>
          <Link href="/explore/anxiety" className="button-secondary rounded-full">Explore stress & mood compounds</Link>
        </div>
      </section>
    </main>
  )
}
