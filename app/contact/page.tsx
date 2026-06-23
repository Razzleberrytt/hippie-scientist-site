import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with The Hippie Scientist — submit corrections, feedback, partnership inquiries, or research questions for our evidence-focused site.',
  alternates: {
    canonical: '/contact/',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ContactPage() {
  return (
    <div className='space-y-8'>
      <section className='compact-section section-rhythm-balanced'>
        <p className='eyebrow-label'>Contact</p>

        <h1 className='compact-heading'>Get in touch</h1>

        <p className='compact-copy max-w-3xl'>
          Questions, corrections, evidence discussions, partnership inquiries, and constructive feedback are always welcome.
        </p>
      </section>

      <section className='grid gap-4 lg:grid-cols-3'>
        <div className='compact-card'>
          <p className='eyebrow-label'>Research feedback</p>
          <h2 className='mt-3 text-2xl font-semibold tracking-tight text-ink'>Corrections and updates</h2>
          <p className='mt-3 text-sm leading-6 text-ink/75'>
            If you spot outdated claims, broken links, questionable interpretations, or evidence issues, please reach out.
          </p>
        </div>

        <div className='compact-card'>
          <p className='eyebrow-label'>Suggestions</p>
          <h2 className='mt-3 text-2xl font-semibold tracking-tight text-ink'>Feature ideas</h2>
          <p className='mt-3 text-sm leading-6 text-ink/75'>
            Suggestions for ecosystems, comparison tools, filters, visualizations, or educational features are appreciated.
          </p>
        </div>

        <div className='compact-card'>
          <p className='eyebrow-label'>Important</p>
          <h2 className='mt-3 text-2xl font-semibold tracking-tight text-ink'>Educational only</h2>
          <p className='mt-3 text-sm leading-6 text-ink/75'>
            The Hippie Scientist is an educational research platform and should not replace professional medical advice.
          </p>
        </div>
      </section>

      <section className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr]'>
        <div className='compact-card'>
          <p className='eyebrow-label'>Primary contact</p>
          <h2 className='mt-3 text-3xl font-semibold tracking-tight text-ink'>Reach The Hippie Scientist</h2>

          <div className='mt-5 space-y-4 text-sm leading-7 text-ink/75 sm:text-base'>
            <p>
              Email: randolphwillie77@gmail.com
            </p>

            <p>
              The project focuses on evidence-informed summaries of herbs, compounds, pathways, mechanisms, and related wellness research topics.
            </p>

            <div className='rounded-2xl border border-brand-900/10 bg-brand-50/40 p-4'>
              <p className='font-medium text-ink'>Best types of messages</p>
              <ul className='mt-3 list-disc space-y-2 pl-5 text-ink/75'>
                <li>Research corrections or updated evidence</li>
                <li>Broken page reports or technical issues</li>
                <li>Ecosystem or compare-page suggestions</li>
                <li>Thoughtful partnership inquiries</li>
              </ul>
            </div>
          </div>
        </div>

        <aside className='compact-card h-fit'>
          <p className='eyebrow-label'>Explore</p>

          <div className='mt-4 space-y-3'>
            <Link href='/about' className='compact-card block transition motion-safe:hover:-translate-y-0.5'>
              <p className='text-sm font-semibold text-ink'>About</p>
              <p className='mt-1 text-sm leading-6 text-ink/65'>Learn how the project approaches evidence and semantic exploration.</p>
            </Link>

            <Link href='/herbs' className='compact-card block transition motion-safe:hover:-translate-y-0.5'>
              <p className='text-sm font-semibold text-ink'>Herbs</p>
              <p className='mt-1 text-sm leading-6 text-ink/65'>Browse research-oriented herb profiles and summaries.</p>
            </Link>

            <Link href='/compounds' className='compact-card block transition motion-safe:hover:-translate-y-0.5'>
              <p className='text-sm font-semibold text-ink'>Compounds</p>
              <p className='mt-1 text-sm leading-6 text-ink/65'>Review mechanisms, evidence layers, and comparison pathways.</p>
            </Link>
          </div>
        </aside>
      </section>
    </div>
  )
}
