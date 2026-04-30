import Link from 'next/link'

export default function Page(){
  return (
    <main className='mx-auto max-w-3xl p-6 text-white space-y-6'>
      <h1 className='text-4xl font-bold'>How to Lower Cortisol Naturally</h1>
      <p className='text-white/70'>Cortisol is the body’s stress hormone. Chronic elevation is linked to fatigue and burnout.</p>
      <ul className='list-disc ml-5 text-white/70'>
        <li>Ashwagandha</li>
        <li>Rhodiola</li>
        <li>Holy basil</li>
      </ul>
      <div className='mt-6 flex gap-2'>
        <Link href='/top/best-herbs-for-cortisol'>Best cortisol herbs →</Link>
        <Link href='/compare/ashwagandha-vs-rhodiola-rosea'>Ashwagandha vs Rhodiola →</Link>
      </div>
    </main>
  )
}
