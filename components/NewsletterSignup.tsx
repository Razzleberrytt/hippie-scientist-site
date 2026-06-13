import Link from 'next/link'
import { safetyChecklistLeadMagnet } from '@/lib/lead-magnet'
import { mailchimpSignupConfig } from '@/lib/mailchimp-integration'

type NewsletterSignupProps = {
  title?: string
  description?: string
  ctaLabel?: string
  location?: string
  variant?: 'card' | 'inline' | 'footer' | 'compact'
  className?: string
}

const variantClasses: Record<NonNullable<NewsletterSignupProps['variant']>, string> = {
  card: 'rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8',
  inline: 'rounded-[1.25rem] border border-brand-900/10 bg-white/85 p-5',
  footer: 'rounded-xl border border-white/10 bg-white/5 p-4',
  compact: 'rounded-2xl border border-emerald-800/15 bg-emerald-50/80 p-4',
}

export default function NewsletterSignup({
  title = safetyChecklistLeadMagnet.title,
  description = safetyChecklistLeadMagnet.description,
  ctaLabel = safetyChecklistLeadMagnet.ctaLabel,
  location = 'newsletter-signup',
  variant = 'card',
  className = '',
}: NewsletterSignupProps) {
  const isFooter = variant === 'footer'
  const textColor = isFooter ? 'text-white' : 'text-ink'
  const mutedColor = isFooter ? 'text-white/65' : 'text-muted'
  const inputClass = isFooter
    ? 'min-h-11 flex-1 rounded-full border border-white/15 bg-white/10 px-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
    : 'min-h-11 flex-1 rounded-full border border-brand-900/15 bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand-700 focus:ring-2 focus:ring-brand-700/15'
  const buttonClass = isFooter
    ? 'min-h-11 rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-500'
    : 'min-h-11 rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-900'

  return (
    <section className={`${variantClasses[variant]} ${className}`} data-signup-location={location}>
      <div className='grid gap-5 lg:grid-cols-[1fr_0.9fr] lg:items-center'>
        <div>
          <p className={`text-xs font-bold uppercase tracking-[0.18em] ${isFooter ? 'text-emerald-300' : 'text-brand-700'}`}>
            Free safety checklist
          </p>
          <h2 className={`mt-2 text-xl font-semibold ${textColor} sm:text-2xl`}>{title}</h2>
          <p className={`mt-3 text-sm leading-7 ${mutedColor}`}>{description}</p>
          <p className={`mt-2 text-xs leading-5 ${mutedColor}`}>
            {safetyChecklistLeadMagnet.privacyNote}{' '}
            <Link href='/privacy' className={isFooter ? 'text-emerald-300 hover:underline' : 'text-brand-800 hover:underline'}>
              Privacy policy
            </Link>
            .
          </p>
        </div>

        <form
          action={mailchimpSignupConfig.action}
          method={mailchimpSignupConfig.method}
          className='flex flex-col gap-3'
        >
          <input type='hidden' name='SOURCE' value={location} />
          <input type='hidden' name='LEAD_MAGNET' value={safetyChecklistLeadMagnet.slug} />
          <div aria-hidden='true' className='absolute left-[-5000px]'>
            <label htmlFor={`newsletter-honeypot-${location}`}>Leave this field empty</label>
            <input
              id={`newsletter-honeypot-${location}`}
              name={mailchimpSignupConfig.honeypotName}
              tabIndex={-1}
              autoComplete='off'
            />
          </div>
          <div className='flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row'>
            <label className='sr-only' htmlFor={`newsletter-email-${location}`}>
              Email address
            </label>
            <input
              id={`newsletter-email-${location}`}
              name={mailchimpSignupConfig.emailFieldName}
              type='email'
              required
              inputMode='email'
              autoComplete='email'
              placeholder='you@example.com'
              className={inputClass}
            />
            <button type='submit' className={buttonClass}>
              {ctaLabel}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
