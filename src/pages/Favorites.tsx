import React from 'react'
import { Link } from 'react-router-dom'
import HerbList from '../components/HerbList'
import { useHerbs } from '../hooks/useHerbs'
import { useHerbFavorites } from '../hooks/useHerbFavorites'
import { motion } from 'framer-motion'
import SEO from '../components/SEO'

export default function Favorites() {
  const herbs = useHerbs()
  const { favorites } = useHerbFavorites()

  const favoriteHerbs = React.useMemo(
    () => herbs.filter(h => favorites.includes(h.id)),
    [herbs, favorites]
  )

  return (
    <div className='relative min-h-screen px-4 pt-20'>
      <SEO
        title='Favorite Herbs | The Hippie Scientist'
        description='Review the psychoactive herbs you have starred for quick reference.'
        canonical='https://thehippiescientist.net/favorites'
      />
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
