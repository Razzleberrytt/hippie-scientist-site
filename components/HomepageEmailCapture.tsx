import NewsletterSignup from '@/components/NewsletterSignup'

export default function HomepageEmailCapture() {
  return (
    <section
      aria-label='Free supplement safety checklist'
      className='border-t border-brand-900/10 bg-[#f5f1e8] py-12 dark:border-white/10 dark:bg-[#0d1713] sm:py-16'
    >
      <div className='mx-auto max-w-6xl px-5 sm:px-8 lg:px-10'>
        <NewsletterSignup
          title='Get the free 5-point supplement safety checklist'
          description='Use it to screen dose clarity, interactions, product testing, and marketing red flags before you buy—plus get occasional evidence notes when important guides publish.'
          ctaLabel='Send me the checklist'
          location='homepage-safety-checklist'
          variant='editorial'
          className='mb-0'
        />
      </div>
    </section>
  )
}
