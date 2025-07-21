import React from 'react'
import { Helmet } from 'react-helmet-async'
import { compounds } from '../data/compounds'
import CompoundCard from '../components/CompoundCard'
import TagFilterBar from '../components/TagFilterBar'

export default function Compounds() {
  const classes = React.useMemo(
    () => Array.from(new Set(compounds.map(c => c.class.toLowerCase()))),
    []
  )
  const [selected, setSelected] = React.useState<string[]>([])
  const filtered = React.useMemo(() => {
    if (selected.length === 0) return compounds
    return compounds.filter(c =>
      selected.every(s => c.class.toLowerCase().includes(s.toLowerCase()))
    )
  }, [selected])

  return (
    <>
      <Helmet>
        <title>Psychoactive Compounds - The Hippie Scientist</title>
      </Helmet>
      <div className='min-h-screen px-4 pb-12 pt-20'>
        <div className='mx-auto max-w-4xl text-center'>
          <h1 className='text-gradient mb-6 text-5xl font-bold'>Psychoactive Compounds</h1>
          <p className='mb-8 text-sand'>List of notable active constituents and their source herbs.</p>
          <TagFilterBar tags={classes} onChange={setSelected} />
          <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
            {filtered.map(c => (
              <CompoundCard key={c.name} compound={c} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
