import type { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { getCompoundData, getAllCompoundSlugs, type CompoundData } from '../../lib/api'

interface CompoundPageProps {
  compound: CompoundData | null
}

export default function CompoundPage({ compound }: CompoundPageProps) {
  if (!compound) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-slate-50 p-4'>
        <p className='text-slate-600'>Compound not found</p>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{compound.name} | The Hippie Scientist</title>
        <meta name='description' content={compound.description || `Research details on ${compound.name}`} />
      </Head>
      <main className='mx-auto max-w-4xl px-4 py-12'>
        <article className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8'>
          <h1 className='text-3xl font-bold text-slate-900'>{compound.name}</h1>
          
          {compound.description && (
            <section className='mt-6 border-t border-slate-100 pt-6'>
              <h2 className='text-lg font-semibold text-slate-800'>Description</h2>
              <p className='mt-2 leading-relaxed text-slate-600'>{compound.description}</p>
            </section>
          )}

          {compound.mechanism && (
            <section className='mt-6 border-t border-slate-100 pt-6'>
              <h2 className='text-lg font-semibold text-slate-800'>Mechanism of Action</h2>
              <p className='mt-2 leading-relaxed text-slate-600'>{compound.mechanism}</p>
            </section>
          )}

          {compound.safety && (
            <section className='mt-6 border-t border-slate-100 pt-6'>
              <h2 className='text-lg font-semibold text-slate-800'>Safety Profile</h2>
              <p className='mt-2 leading-relaxed text-slate-600'>{compound.safety}</p>
            </section>
          )}
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getAllCompoundSlugs()
  const paths = slugs.map((slug) => ({
    params: { slug },
  }))

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<CompoundPageProps> = async ({ params }) => {
  const slug = params?.slug as string
  const compound = getCompoundData(slug)

  return {
    props: {
      compound,
    },
  }
}
