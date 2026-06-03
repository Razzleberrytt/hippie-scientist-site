import { Link } from '@/lib/router-compat'

type DisclaimerProps = {
  className?: string
}

export default function Disclaimer({ className = '' }: DisclaimerProps) {
  return (
    <section
      className={`rounded-2xl border border-amber-300/40 bg-amber-200/10 p-4 text-sm text-amber-100 ${className}`.trim()}
      aria-label='Safety disclaimer'
    >
      <p className='font-semibold uppercase tracking-wide'>Safety first · Harm reduction</p>
      <p className='mt-2 text-amber-50/90'>
        This information is educational and not medical advice. Start low, avoid risky combinations,
        and consult a licensed clinician before making health decisions—especially if you use
        medications, have diagnosed conditions, or are pregnant/breastfeeding.
      </p>
      <p className='mt-2 text-amber-50/85'>
        Learn how we evaluate confidence, safety, and intensity on the{' '}
        <Link to='/methodology' className='underline decoration-dotted underline-offset-4'>
          methodology page
        </Link>
        .
      </p>
    </section>
  )
}
