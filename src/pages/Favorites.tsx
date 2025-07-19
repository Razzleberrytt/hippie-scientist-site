import React from 'react'
import { Helmet } from 'react-helmet-async'
import HerbList from '../components/HerbList'
import { useHerbs } from '../hooks/useHerbs'
import { useHerbFavorites } from '../hooks/useHerbFavorites'

export default function Favorites() {
  const herbs = useHerbs()
  const { favorites } = useHerbFavorites()
  const saved = React.useMemo(
    () => (herbs ? herbs.filter(h => favorites.includes(h.id)) : []),
    [herbs, favorites]
  )

  if (herbs === undefined) {
    return (
      <div className='min-h-screen px-4 pt-20 pb-12 text-center text-sand'>
        <Helmet>
          <title>My Herbs - The Hippie Scientist</title>
        </Helmet>
        <p>Loading herb data…</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen px-4 pt-20 pb-12'>
      <Helmet>
        <title>My Herbs - The Hippie Scientist</title>
      </Helmet>
      <div className='mx-auto max-w-6xl'>
        <h1 className='text-gradient mb-6 text-center text-5xl font-bold'>My Herbs</h1>
        {saved.length === 0 ? (
          <p className='text-center text-sand'>No saved herbs yet.</p>
        ) : (
          <HerbList herbs={saved} />
        )}
      </div>
    </div>
  )
}
