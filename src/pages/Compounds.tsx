import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useCompounds } from '../hooks/useCompounds'
import { useHerbs } from '../hooks/useHerbs'
import CompoundCard from '../components/CompoundCard'
import TagFilterBar from '../components/TagFilterBar'
import CompoundTagFilter from '../components/CompoundTagFilter'

export default function Compounds() {
  const compoundList = useCompounds()
  const herbs = useHerbs()
  const classes = React.useMemo(
    () => Array.from(new Set(compoundList.map(c => c.class.toLowerCase()))),
    [compoundList]
  )
  const herbMap = React.useMemo(() => {
    const map: Record<string, string> = {}
    herbs.forEach(h => {
      map[h.id] = h.name
    })
    return map
  }, [herbs])
  const herbOptions = React.useMemo(
    () =>
      Array.from(new Set(compoundList.flatMap(c => c.sourceHerbs))).map(h => ({
        value: h,
        label: herbMap[h] || h.replace(/-/g, ' '),
      })),
    [compoundList, herbMap]
  )

  const [selectedClasses, setSelectedClasses] = React.useState<string[]>([])
  const [selectedHerbs, setSelectedHerbs] = React.useState<string[]>([])
  const types = React.useMemo(
    () =>
      Array.from(
        new Set(compoundList.flatMap(c => c.effects.map(e => e.toLowerCase())))
      ),
    [compoundList]
  )
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([])

  const filtered = React.useMemo(() => {
    let res = compoundList
    if (selectedClasses.length)
      res = res.filter(c =>
        selectedClasses.every(s => c.class.toLowerCase().includes(s.toLowerCase())),
      )
    if (selectedTypes.length)
      res = res.filter(c =>
        selectedTypes.every(t => c.effects.map(e => e.toLowerCase()).includes(t))
      )
    if (selectedHerbs.length)
      res = res.filter(c =>
        selectedHerbs.every(h => c.sourceHerbs.includes(h) || c.foundInHerbs?.includes(h)),
      )
    return res
  }, [compoundList, selectedClasses, selectedHerbs, selectedTypes])

  return (
    <>
      <Helmet>
        <title>Psychoactive Compounds - The Hippie Scientist</title>
      </Helmet>
      <div className='min-h-screen px-4 pb-12 pt-20'>
        <div className='mx-auto max-w-4xl text-center'>
          <h1 className='text-gradient mb-6 text-5xl font-bold'>Psychoactive Compounds</h1>
          <p className='mb-8 text-sand'>List of notable active constituents and their source herbs.</p>
          <TagFilterBar tags={classes} onChange={setSelectedClasses} />
          <TagFilterBar tags={types} onChange={setSelectedTypes} />
          <CompoundTagFilter
            options={herbOptions}
            onChange={vals => setSelectedHerbs(vals)}
          />
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
