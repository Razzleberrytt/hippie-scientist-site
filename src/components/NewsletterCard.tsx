import Magnetic from './Magnetic'

export default function NewsletterCard() {
  return (
    <section className='animated-border mt-10'>
      <div className='glass rounded-[27px] p-6 md:p-8'>
        <h2 className='text-2xl font-semibold tracking-tight md:text-3xl'>Stay in the loop</h2>
        <p className='mt-2 text-sm text-white/80 md:text-base'>
          Get field notes on new psychoactive herbs, blends, and research drops.
        </p>
        <form
          className='mt-5 flex flex-col gap-3 sm:flex-row sm:items-center'
          aria-label='Newsletter signup form'
        >
          <label htmlFor='newsletter-card-email' className='sr-only'>
            Email address
          </label>
          <input
            id='newsletter-card-email'
            type='email'
            placeholder='you@example.com'
            className='bg-white/14 w-full rounded-2xl px-4 py-3 text-base text-white/90 placeholder-white/60 ring-1 ring-white/20 backdrop-blur-xl focus:ring-white/40 sm:flex-1'
          />
          <Magnetic strength={12}>
            <button type='submit' className='btn-primary rounded-2xl px-6 py-3'>
              Join the newsletter
            </button>
          </Magnetic>
        </form>
      </div>
    </section>
  )
}
