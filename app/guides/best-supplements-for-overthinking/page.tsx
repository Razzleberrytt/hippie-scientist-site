import Link from 'next/link'

export default function Page(){
  return (
    <main className='mx-auto max-w-3xl p-6 text-white space-y-6'>
      <h1 className='text-4xl font-bold'>Best Supplements for Overthinking</h1>
      <p className='text-white/70'>Overthinking is often tied to stress and nervous system activation rather than a single deficiency.</p>
      <ul className='list-disc ml-5 text-white/70'>
        <li>L-theanine → calm focus</li>
        <li>Magnesium → relaxation</li>
        <li>Lemon balm → calming</li>
      </ul>
      <div className='mt-6 flex gap-2'>
        <Link href='/top/top-3-herbs-for-anxiety'>Anxiety herbs →</Link>
        <Link href='/compare/caffeine-vs-l-theanine'>Caffeine vs L-theanine →</Link>
      </div>
    </main>
  )
}
