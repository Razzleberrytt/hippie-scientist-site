import { Link } from '../lib/router-compat'

type DisclaimerProps = {
  className?: string
}

export default function Disclaimer({ className = '' }: DisclaimerProps) {
  return (
    <section
      className={`safety-disclaimer border-l-2 border-amber-600/50 bg-amber-50/70 px-4 py-3 text-sm ${className}`.trim()}
      aria-label='Safety disclaimer'
    >
      <p className='font-semibold uppercase tracking-wide'>Safety first · Harm reduction</p>
      <p className='mt-2 opacity-90'>
        This information is educational and not medical advice. Start low, avoid risky combinations,
        and consult a licensed clinician before making health decisions—especially if you use
        medications, have diagnosed conditions, or are pregnant/breastfeeding.
      </p>
      <p className='mt-2 opacity-90'>
        Learn how we evaluate confidence, safety, and intensity on the{' '}
        <Link to='/info/methodology' className='font-semibold underline decoration-dotted underline-offset-4'>
          methodology page
        </Link>
        .
      </p>
    </section>
  )
}
