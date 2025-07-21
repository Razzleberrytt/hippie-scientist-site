import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import HerbList from '../components/HerbList'
import { useHerbs } from '../hooks/useHerbs'
import { useHerbFavorites } from '../hooks/useHerbFavorites'

export default function Favorites() {
  const herbs = useHerbs()
  const { favorites } = useHerbFavorites()

  const favoriteHerbs = React.useMemo(
    () => herbs.filter(h => favorites.includes(h.id)),
    [herbs, favorites]
  )

  return (
    <div className='relative min-h-screen px-4 pt-20'>
      <Helmet>
        <title>My Herbs - The Hippie Scientist</title>
        <meta
          name='description'
          content='View herbs you have starred as favorites.'
        />
      </Helmet>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-4'>
          <Link to='/database' className='text-comet underline'>
            ← Back to All Herbs
          </Link>
        </div>
        <h1 className='text-gradient mb-6 text-center text-5xl font-bold'>My Herbs</h1>
        {favoriteHerbs.length ? (
          <HerbList herbs={favoriteHerbs} />
        ) : (
          <p className='text-center text-sand'>No favorites yet.</p>
        )}
      </div>
    </div>
  )
}
