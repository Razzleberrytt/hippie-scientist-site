import Link from 'next/link'
import { EmailCaptureBox } from '@/components/monetization/EmailCaptureBox'
import type { EmailCaptureGoal } from '@/content/emailCapture'

type SafetyChecklistPromoProps = {
  goal?: EmailCaptureGoal
  variant?: 'hero' | 'compact'
  className?: string
}

const checklistBullets = [
  'Medication and supplement interaction red flags',
  'Dose, form, and standardization checks before you buy',
  'Stacking risks (sedatives, stimulants, liver, blood pressure)',
]

export default function SafetyChecklistPromo({
  goal = 'safety-checklist',
  variant = 'hero',
  className = '',
}: SafetyChecklistPromoProps) {
  if (variant === 'compact') {
    return (
      <section
        className={`rounded-[1.25rem] border-2 border-emerald-700/25 bg-gradient-to-br from-emerald-50/90 to-white p-5 shadow-sm sm:p-6 ${className}`}
      >
        <p className='text-xs font-bold uppercase tracking-[0.18em] text-emerald-800'>Free checklist</p>
        <h2 className='mt-2 text-lg font-semibold text-ink sm:text-xl'>
          Avoid costly supplement mistakes before you buy
        </h2>
        <p className='mt-2 text-sm leading-6 text-muted'>
          One-page safety workflow: meds, dose, form, and stacking — not medical advice.
        </p>
        <Link
          href='/supplement-safety-checklist'
          className='mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-900'
        >
          Get the free safety checklist →
        </Link>
      </section>
    )
  }

  return (
    <section
      className={`rounded-[1.5rem] border-2 border-emerald-700/30 bg-gradient-to-br from-emerald-50 via-white to-brand-50/40 p-6 shadow-md sm:p-8 lg:p-10 ${className}`}
    >
      <div className='grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-start'>
        <div>
          <p className='inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-900'>
            Free · Evidence-based
          </p>
          <h2 className='mt-4 text-2xl font-bold tracking-tight text-ink sm:text-3xl'>
            Get the supplement safety checklist before your next purchase
          </h2>
          <p className='mt-4 text-sm leading-7 text-muted sm:text-base'>
            Stop guessing on dose, form, and stack risk. Use the same safety-first checklist we apply before
            linking any Amazon pick — built for comparison, not hype.
          </p>
          <ul className='mt-5 space-y-2.5 text-sm leading-6 text-ink'>
            {checklistBullets.map((item) => (
              <li key={item} className='flex gap-2.5'>
                <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600' aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href='/supplement-safety-checklist'
            className='mt-5 inline-flex text-sm font-bold text-emerald-800 hover:underline'
          >
            See what&apos;s inside the checklist →
          </Link>
        </div>
        <EmailCaptureBox
          goal={goal}
          variant='card'
          title='Send me the free safety checklist'
          description='Join for the checklist PDF path plus occasional evidence-first notes. Unsubscribe anytime.'
          className='border-emerald-900/15 bg-white/95 shadow-sm'
        />
      </div>
    </section>
  )
}