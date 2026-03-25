import Meta from '@/components/Meta'

export default function DisclaimerPage() {
  return (
    <>
      <Meta
        title='Disclaimer | The Hippie Scientist'
        description='Educational and safety disclaimer for The Hippie Scientist.'
        path='/disclaimer'
      />
      <section className='container-page py-12 text-white'>
        <h1 className='text-3xl font-semibold'>Disclaimer</h1>
        <p className='mt-4 max-w-3xl text-white/80'>
          Content on this website is educational only and is not medical advice, diagnosis, or
          treatment. Always consult a qualified healthcare professional before changing supplements,
          medications, or health practices.
        </p>
        <div className='mt-6 max-w-3xl space-y-3 text-sm text-white/75'>
          <p>
            Information may be incomplete, simplified, or not suitable for your personal situation.
            Use of the site is at your own risk.
          </p>
          <p>
            If you are in immediate danger or medical distress, contact emergency services right
            away.
          </p>
        </div>
      </section>
    </>
  )
}
