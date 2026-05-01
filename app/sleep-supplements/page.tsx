import Link from 'next/link'

export default function Page() {
  return (
    <div className='space-y-6'>
      <h1 className='text-4xl font-black text-white'>Best Supplements for Sleep</h1>
      <p className='text-white/70'>Explore a science-backed sleep supplement stack with dosage and safety guidance.</p>
      <Link href='/stacks/sleep' className='text-emerald-300'>View stack</Link>
    </div>
  )
}
