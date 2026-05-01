import Link from 'next/link'

export default function Page(){
  return (
    <main className='mx-auto max-w-3xl p-6 text-white space-y-6'>
      <h1 className='text-4xl font-bold'>Natural Alternatives to Anxiety Medication</h1>
      <p className='text-white/70'>These are not replacements for medical care, but commonly discussed supportive herbs.</p>
      <ul className='list-disc ml-5 text-white/70'>
        <li>Ashwagandha</li>
        <li>Lemon balm</li>
        <li>Passionflower</li>
      </ul>
      <div className='mt-6 flex gap-2'>
        <Link href='/top/top-3-herbs-for-anxiety'>Top anxiety herbs →</Link>
        <Link href='/compare/ashwagandha-vs-rhodiola-rosea'>Ashwagandha vs Rhodiola →</Link>
      </div>
    </main>
  )
}
