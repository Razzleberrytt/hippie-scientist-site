import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Medical Disclaimer',
  description:
    'The Hippie Scientist is an educational resource only. Nothing on this site is medical advice, diagnosis, or treatment. Always consult a professional.',
  alternates: {
    canonical: '/disclaimer/',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function DisclaimerPage() {
  return (
    <div className='space-y-8 max-w-5xl mx-auto px-4 py-8'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Disclaimer</p>

        <h1 className='mt-2 text-3xl font-semibold text-ink sm:text-4xl'>
          Educational &amp; Medical Disclaimer
        </h1>

        <p className='mt-4 max-w-3xl text-base leading-7 text-ink/80 sm:text-lg'>
          The Hippie Scientist is an educational website. It is not medical
          advice, diagnosis, or treatment.
        </p>

        <p className='mt-3 max-w-3xl text-sm leading-6 text-muted sm:text-base'>
          Use the information here as a starting point for learning, not as a
          substitute for professional judgment or personal healthcare guidance.
        </p>
      </section>

      <section className='grid gap-4 lg:grid-cols-3'>
        <div className='card-premium p-6'>
          <p className='text-xs font-semibold uppercase tracking-wider text-emerald-700'>
            Not healthcare
          </p>

          <h2 className='mt-3 text-xl font-semibold text-ink'>No personal advice</h2>

          <p className='mt-3 text-sm leading-6 text-muted'>
            Nothing on this site should be treated as personal medical advice or
            a recommendation for your specific situation.
          </p>
        </div>

        <div className='card-premium p-6'>
          <p className='text-xs font-semibold uppercase tracking-wider text-emerald-700'>
            Use caution
          </p>

          <h2 className='mt-3 text-xl font-semibold text-ink'>Safety matters</h2>

          <p className='mt-3 text-sm leading-6 text-muted'>
            Herbs and compounds may have side effects, contraindications, or
            interactions with medications and health conditions.
          </p>
        </div>

        <div className='card-premium p-6'>
          <p className='text-xs font-semibold uppercase tracking-wider text-emerald-700'>
            Urgent issues
          </p>

          <h2 className='mt-3 text-xl font-semibold text-ink'>Get real help</h2>

          <p className='mt-3 text-sm leading-6 text-muted'>
            For urgent or serious symptoms, contact a qualified medical
            professional or emergency service instead of relying on website
            content.
          </p>
        </div>
      </section>

      <section className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr]'>
        <div className='card-premium p-6 sm:p-8'>
          <p className='text-xs font-semibold uppercase tracking-wider text-emerald-700'>
            What this means in practice
          </p>

          <h2 className='mt-3 text-2xl font-semibold text-ink'>
            Read carefully and verify important decisions
          </h2>

          <div className='mt-4 space-y-4 text-sm leading-7 text-muted sm:text-base'>
            <p>
              This site is meant to help you browse topics, understand basic
              terms, and organize research.
            </p>

            <p>
              It is not a replacement for licensed medical care, pharmacist
              guidance, poison control, emergency help, or personalized clinical
              evaluation.
            </p>

            <p>
              Before acting on anything important, especially around pregnancy,
              chronic illness, medication use, or serious symptoms, verify it
              with a qualified professional.
            </p>
          </div>
        </div>

        <aside className='card-premium h-fit p-6'>
          <p className='text-xs font-semibold uppercase tracking-wider text-emerald-700'>
            Helpful links
          </p>

          <div className='mt-4 space-y-3'>
            <Link
              href='/about'
              className='block rounded-2xl border border-brand-900/10 px-4 py-4 transition hover:bg-stone-50/50 hover:border-brand-900/20'
            >
              <p className='text-sm font-semibold text-ink'>About</p>
              <p className='mt-1 text-sm leading-6 text-muted'>
                Learn what the project is for.
              </p>
            </Link>

            <Link
              href='/contact'
              className='block rounded-2xl border border-brand-900/10 px-4 py-4 transition hover:bg-stone-50/50 hover:border-brand-900/20'
            >
              <p className='text-sm font-semibold text-ink'>Contact</p>
              <p className='mt-1 text-sm leading-6 text-muted'>
                Send corrections, feedback, or questions.
              </p>
            </Link>

            <Link
              href='/herbs'
              className='block rounded-2xl border border-brand-900/10 px-4 py-4 transition hover:bg-stone-50/50 hover:border-brand-900/20'
            >
              <p className='text-sm font-semibold text-ink'>Herbs</p>
              <p className='mt-1 text-sm leading-6 text-muted'>
                Browse plant profiles and summaries.
              </p>
            </Link>

            <Link
              href='/compounds'
              className='block rounded-2xl border border-brand-900/10 px-4 py-4 transition hover:bg-stone-50/50 hover:border-brand-900/20'
            >
              <p className='text-sm font-semibold text-ink'>Compounds</p>
              <p className='mt-1 text-sm leading-6 text-muted'>
                Review constituents and research notes.
              </p>
            </Link>
          </div>
        </aside>
      </section>
    </div>
  )
}

