import { Link } from 'react-router-dom'
import Meta from '@/components/Meta'
import GuideDownloadCard from '@/components/GuideDownloadCard'

const GUIDE_FILE_PATH = '/downloads/unknown-compound-survival-guide.pdf'

export default function UnknownCompoundSurvivalGuide() {
  return (
    <>
      <Meta
        title='Unknown Compound Survival Guide | The Hippie Scientist'
        description='A practical guide for handling unknown or uncertain compounds, including a decision tree, checklist, and common confusion patterns.'
        path='/guides/unknown-compound-survival-guide'
      />

      <main className='container mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14'>
        <section className='ds-card-lg border border-white/15 bg-gradient-to-b from-violet-500/10 to-slate-900/70'>
          <p className='text-xs font-semibold uppercase tracking-[0.25em] text-white/65'>
            Free safety guide
          </p>
          <h1 className='mt-3 text-3xl font-semibold leading-tight text-white sm:text-5xl'>
            You don&apos;t take dangerous compounds on purpose.
            <br className='hidden sm:block' />
            You take something you think you understand.
          </h1>
          <p className='mt-4 max-w-3xl text-sm leading-relaxed text-white/75 sm:text-base'>
            A practical guide for handling unknown or uncertain compounds, based on recurring
            real-world confusion patterns.
          </p>
          <div className='mt-6 flex flex-wrap gap-2'>
            <span className='ds-pill text-xs text-violet-100/90'>Practical checklist</span>
            <span className='ds-pill text-xs text-violet-100/90'>Decision tree</span>
            <span className='ds-pill text-xs text-violet-100/90'>Stop/go framing</span>
          </div>
        </section>

        <section className='ds-section'>
          <div className='ds-card p-5 sm:p-6'>
            <h2 className='text-xl font-semibold text-white sm:text-2xl'>The core problem</h2>
            <p className='mt-3 text-sm leading-relaxed text-white/75 sm:text-base'>
              Most mistakes are not intentional. People assume they made the right compound. They
              trust appearance over verification. They underestimate contamination. The result is
              uncertainty disguised as confidence.
            </p>
          </div>
        </section>

        <section className='ds-section grid gap-4 sm:grid-cols-2'>
          <article className='ds-card p-5 sm:p-6'>
            <h2 className='text-xl font-semibold text-white sm:text-2xl'>What&apos;s inside</h2>
            <ul className='mt-3 space-y-2 text-sm text-white/75 sm:text-base'>
              <li>• A decision tree for unknown compounds</li>
              <li>• A practical checklist before trusting a sample</li>
              <li>• Common confusion patterns and uncertainty questions</li>
              <li>• Clear stop/go framing</li>
            </ul>
          </article>

          <article className='ds-card p-5 sm:p-6'>
            <h2 className='text-xl font-semibold text-white sm:text-2xl'>Who it&apos;s for</h2>
            <ul className='mt-3 space-y-2 text-sm text-white/75 sm:text-base'>
              <li>• Curious beginners</li>
              <li>• People dealing with uncertain samples or results</li>
              <li>• Anyone who needs a practical framework instead of guesswork</li>
            </ul>
          </article>
        </section>

        <section className='ds-section'>
          <GuideDownloadCard
            eyebrow='Primary download'
            title='Unknown Compound Survival Guide'
            description='Keep this PDF handy whenever details are uncertain. Start with the decision tree, run the checklist, and use the stop/go framing before moving forward.'
            buttonText='Download the Free Guide'
            fileUrl={GUIDE_FILE_PATH}
            footer={
              <p>
                {/* Email capture placeholder: insert email form component here before download CTA. */}
                Want updates when this guide is revised? Add an email capture module in this slot.
              </p>
            }
          />
        </section>

        <section className='ds-section'>
          <div className='ds-card-lg border border-amber-200/20 bg-amber-500/5'>
            <p className='text-sm font-semibold text-amber-100'>
              If you&apos;re not certain, you&apos;re guessing.
            </p>
            <p className='mt-2 text-sm text-white/75'>
              Review the framework first, then move forward only when uncertainty is reduced.
            </p>
            <div className='mt-4 flex flex-wrap gap-3'>
              <a href={GUIDE_FILE_PATH} download className='btn-primary'>
                Download the Free Guide
              </a>
              <Link to='/safety' className='btn-secondary'>
                Review safety resources
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
