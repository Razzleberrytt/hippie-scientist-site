import Meta from '@/components/Meta'

export default function PrivacyPolicy() {
  return (
    <>
      <Meta
        title='Privacy Policy | The Hippie Scientist'
        description='Privacy policy for The Hippie Scientist website.'
        path='/privacy-policy'
      />
      <section className='container-page py-12 text-white'>
        <h1 className='text-3xl font-semibold'>Privacy Policy</h1>
        <p className='mt-4 max-w-3xl text-white/80'>
          We collect limited analytics and optional newsletter form data to operate and improve this
          site. We do not sell personal information. If you submit contact details, they are only
          used for responses and optional updates.
        </p>
        <div className='mt-6 max-w-3xl space-y-3 text-sm text-white/75'>
          <p>
            You can control non-essential tracking preferences at any time through the cookie and
            consent settings link in the footer.
          </p>
          <p>
            Questions or data requests can be sent from the contact page. This policy may be updated
            as site features evolve.
          </p>
        </div>
      </section>
    </>
  )
}
