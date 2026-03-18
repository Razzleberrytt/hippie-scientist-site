import { FormEvent, useState } from 'react'

export default function EmailCapture() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setSuccess(false)

    if (!email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    setError('')
    // eslint-disable-next-line no-console
    console.log('Email capture submit:', email.trim())

    const guideUrl = '/blend-guide.txt'
    const guideLink = document.createElement('a')
    guideLink.href = guideUrl
    guideLink.download = 'blend-guide.txt'
    guideLink.rel = 'noopener noreferrer'
    document.body.appendChild(guideLink)
    guideLink.click()
    document.body.removeChild(guideLink)

    setSuccess(true)
    setEmail('')
  }

  return (
    <section
      aria-label='Email capture'
      className='container mx-auto max-w-3xl px-4 pb-10 sm:px-6 sm:pb-12'
    >
      <div className='shadow-halo relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:rounded-[24px] sm:p-5'>
        <div
          aria-hidden
          className='pointer-events-none absolute -top-16 left-0 right-0 h-28 bg-gradient-to-b from-white/10 to-transparent'
        />

        <div className='relative space-y-3'>
          <h2 className='text-xl font-semibold tracking-tight text-white sm:text-2xl'>
            Stay in the loop
          </h2>
          <p className='text-sm text-white/75 sm:text-[0.95rem]'>
            Get a free beginner blend guide + new herbs and research drops.
          </p>

          <form
            onSubmit={handleSubmit}
            className='flex flex-col gap-2.5 sm:flex-row sm:items-center'
          >
            <label htmlFor='email-capture-input' className='sr-only'>
              Email address
            </label>
            <input
              id='email-capture-input'
              type='email'
              inputMode='email'
              autoComplete='email'
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder='you@example.com'
              className='border-white/12 w-full rounded-xl border bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/50 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-emerald-300/35 sm:flex-1'
            />
            <button
              type='submit'
              className='rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/80'
            >
              Get the Guide
            </button>
          </form>

          {error ? <p className='text-xs text-rose-300'>{error}</p> : null}
          {success ? (
            <p className='text-xs text-emerald-300 motion-safe:animate-pulse'>Guide downloaded ✓</p>
          ) : null}

          <p className='text-xs text-white/55'>No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  )
}
