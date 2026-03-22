import clsx from 'clsx'
import Magnetic from './Magnetic'

type NewsletterSignupProps = {
  compact?: boolean
  className?: string
}

export default function NewsletterSignup({ compact = false, className }: NewsletterSignupProps) {
  const baseClasses = compact ? 'flex flex-col gap-2 sm:flex-row sm:items-center' : 'grid gap-3'

  return (
    <form className={clsx(baseClasses, className)} aria-label='Newsletter signup form'>
      {!compact && <h3 className='text-lg font-semibold text-white'>Join our Newsletter</h3>}
      <div className='flex flex-col gap-2 sm:flex-row'>
        <label htmlFor='newsletter-signup-email' className='sr-only'>
          Email address
        </label>
        <input
          id='newsletter-signup-email'
          className='flex-1 rounded-full border border-white/25 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/40'
          placeholder='you@example.com'
          type='email'
          required
        />
        <Magnetic strength={12}>
          <button className='btn-primary whitespace-nowrap' type='submit'>
            Subscribe
          </button>
        </Magnetic>
      </div>
    </form>
  )
}
