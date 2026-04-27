import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Disclaimer',
  description:
    'Important educational and medical disclaimer for The Hippie Scientist.',
  alternates: {
    canonical: '/disclaimer',
  },
}

export default function DisclaimerPage() {
  return (
    <div className='space-y-8'>
      <section className='rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8'>
        <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
          Disclaimer
        </p>

        <h1 className='mt-2 text-4xl font-bold tracking-tight sm:text-5xl'>
          Educational use only
        </h1>

        <p className='mt-4 max-w-3xl text-base leading-7 text-white/75 sm:text-lg'>
          The Hippie Scientist is an educational website. It is not medical
          advice, diagnosis, or treatment.
        </p>

        <p className='mt-3 max-w-3xl text-sm leading-6 text-white/65 sm:text-base'>
          Use the information here as a starting point for learning, not as a
          substitute for professional judgment or personal healthcare guidance.
        </p>
      </section>

      <section className='grid gap-4 lg:grid-cols-3'>
        <div className='ds-card'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            Not healthcare
          </p>

          <h2 className='mt-3 text-2xl font-semibold'>No personal advice</h2>

          <p className='mt-3 text-sm leading-6 text-white/70'>
            Nothing on this site should be treated as personal medical advice or
            a recommendation for your specific situation.
          </p>
        </div>

        <div className='ds-card'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            Use caution
          </p>

          <h2 className='mt-3 text-2xl font-semibold'>Safety matters</h2>

          <p className='mt-3 text-sm leading-6 text-white/70'>
            Herbs and compounds may have side effects, contraindications, or
            interactions with medications and health conditions.
          </p>
        </div>

        <div className='ds-card'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            Urgent issues
          </p>

          <h2 className='mt-3 text-2xl font-semibold'>Get real help</h2>

          <p className='mt-3 text-sm leading-6 text-white/70'>
            For urgent or serious symptoms, contact a qualified medical
            professional or emergency service instead of relying on website
            content.
          </p>
        </div>
      </section>

      <section className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr]'>
        <div className='ds-card'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            What this means in practice
          </p>

          <h2 className='mt-3 text-3xl font-semibold'>
            Read carefully and verify important decisions
          </h2>

          <div className='mt-4 space-y-4 text-sm leading-7 text-white/75 sm:text-base'>
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

        <aside className='ds-card h-fit'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            Helpful links
          </p>

          <div className='mt-4 space-y-3'>
            <Link
              href='/about'
              className='block rounded-2xl border border-white/10 px-4 py-4 transition hover:border-white/25 hover:bg-white/5'
            >
              <p className='text-sm font-semibold text-white'>About</p>
              <p className='mt-1 text-sm leading-6 text-white/65'>
                Learn what the project is for.
              </p>
            </Link>

            <Link
              href='/contact'
              className='block rounded-2xl border border-white/10 px-4 py-4 transition hover:border-white/25 hover:bg-white/5'
            >
              <p className='text-sm font-semibold text-white'>Contact</p>
              <p className='mt-1 text-sm leading-6 text-white/65'>
                Send corrections, feedback, or questions.
              </p>
            </Link>

            <Link
              href='/herbs'
              className='block rounded-2xl border border-white/10 px-4 py-4 transition hover:border-white/25 hover:bg-white/5'
            >
              <p className='text-sm font-semibold text-white'>Herbs</p>
              <p className='mt-1 text-sm leading-6 text-white/65'>
                Browse plant profiles and summaries.
              </p>
            </Link>

            <Link
              href='/compounds'
              className='block rounded-2xl border border-white/10 px-4 py-4 transition hover:border-white/25 hover:bg-white/5'
            >
              <p className='text-sm font-semibold text-white'>Compounds</p>
              <p className='mt-1 text-sm leading-6 text-white/65'>
                Review constituents and research notes.
              </p>
            </Link>
          </div>
        </aside>
      </section>
    </div>
  )
}
