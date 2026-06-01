import {
  emailCaptureProviderAction,
  emailCaptureProviderConfigured,
  type EmailCaptureGoal,
  getLeadMagnet,
} from '@/content/emailCapture'

type EmailCaptureBoxProps = {
  variant?: 'inline' | 'card' | 'wide'
  goal?: EmailCaptureGoal
  title?: string
  description?: string
  className?: string
}

const variantClasses: Record<NonNullable<EmailCaptureBoxProps['variant']>, string> = {
  inline: 'rounded-[1.25rem] border border-brand-900/10 bg-white/85 p-5',
  card: 'rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm',
  wide: 'rounded-[1.5rem] border border-brand-900/10 bg-brand-50/70 p-6 shadow-sm sm:p-8',
}

export function EmailCaptureBox({
  variant = 'card',
  goal = 'default',
  title,
  description,
  className = '',
}: EmailCaptureBoxProps) {
  const leadMagnet = getLeadMagnet(goal)
  const disabled = !emailCaptureProviderConfigured

  return (
    <section className={`${variantClasses[variant]} ${className}`}>
      <div className='grid gap-5 lg:grid-cols-[1fr_0.9fr] lg:items-center'>
        <div>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-700'>Free guide</p>
          <h2 className='mt-2 text-2xl font-semibold text-ink'>{title || leadMagnet.title}</h2>
          <p className='mt-3 text-sm leading-7 text-muted'>{description || leadMagnet.description}</p>
          {disabled ? (
            <p className='mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-amber-800'>
              Email signup coming soon. Provider not connected yet.
            </p>
          ) : null}
        </div>

        <form
          action={disabled ? undefined : emailCaptureProviderAction}
          method='post'
          className='flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row'
        >
          <label className='sr-only' htmlFor={`email-capture-${leadMagnet.goal}`}>
            Email address
          </label>
          <input
            id={`email-capture-${leadMagnet.goal}`}
            name='email'
            type='email'
            required={!disabled}
            disabled={disabled}
            placeholder='you@example.com'
            className='min-h-11 flex-1 rounded-full border border-brand-900/15 bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand-700 focus:ring-2 focus:ring-brand-700/15 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-muted'
          />
          <button
            type='submit'
            disabled={disabled}
            className='min-h-11 rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:bg-stone-400'
          >
            {disabled ? 'Email signup coming soon' : leadMagnet.ctaLabel}
          </button>
        </form>
      </div>
    </section>
  )
}
