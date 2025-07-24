import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import HerbList from '../components/HerbList'
import { useHerbs } from '../hooks/useHerbs'
import { LoadingScreen } from '../components/LoadingScreen'
import { useHerbFavorites } from '../hooks/useHerbFavorites'
import { motion } from 'framer-motion'

export default function Favorites() {
  const { herbs, loading, error } = useHerbs()
  const { favorites } = useHerbFavorites()

  if (loading) return <LoadingScreen />
  if (error)
    return (
      <div className='min-h-screen px-4 pt-20 text-center'>
        <p className='text-red-500'>Failed to load herb data.</p>
      </div>
    )

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
          <motion.p
            className='text-center text-sand text-xl'
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            🌱 No favorites yet!
          </motion.p>
        )}
      </div>
    </div>
  )
}
