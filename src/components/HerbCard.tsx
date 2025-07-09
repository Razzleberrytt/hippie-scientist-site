import React from 'react'
import { motion } from 'framer-motion'
import { Leaf, Shield, AlertTriangle, CheckCircle } from 'lucide-react'

interface Herb {
  id: string
  name: string
  scientificName: string
  category: string
  effects: string[]
  description: string
  image?: string
  tags: string[]
  safetyRating: 'low' | 'medium' | 'high'
  legalStatus: 'legal' | 'regulated' | 'illegal'
}

interface HerbCardProps {
  herb: Herb
  isCompact?: boolean
  onClick?: () => void
}

const HerbCard: React.FC<HerbCardProps> = ({ herb, isCompact = false, onClick }) => {
  const getSafetyIcon = (rating: string) => {
    switch (rating) {
      case 'high':
        return <CheckCircle className="w-4 h-4 text-psychedelic-green" aria-label="High Safety" />
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-psychedelic-orange" aria-label="Medium Safety" />
      case 'low':
        return <Shield className="w-4 h-4 text-psychedelic-pink" aria-label="Low Safety" />
      default:
        return <Shield className="w-4 h-4 text-gray-400" aria-label="Unknown Safety" />
    }
  }

  const getLegalStatusColor = (status: string) => {
    switch (status) {
      case 'legal':
        return 'text-psychedelic-green'
      case 'regulated':
        return 'text-psychedelic-orange'
      case 'illegal':
        return 'text-psychedelic-pink'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <motion.div
      className={`glass-card p-6 cursor-pointer group hover:glow-medium transition-all duration-300 ${
        isCompact ? 'flex items-center space-x-4' : ''
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.()
      }}
      aria-label={`View details for ${herb.name}`}
    >
      {!isCompact && (
        <div className="relative mb-4 overflow-hidden rounded-lg">
          {herb.image ? (
            <img
              src={herb.image}
              alt={herb.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-psychedelic-purple/20 to-psychedelic-pink/20 flex items-center justify-center">
              <Leaf className="w-16 h-16 text-psychedelic-cyan animate-float" aria-label="Herb" />
            </div>
          )}
          <div className="absolute top-2 right-2 flex items-center space-x-1">
            {getSafetyIcon(herb.safetyRating)}
            <span className={`text-xs font-medium ${getLegalStatusColor(herb.legalStatus)}`}>
              {herb.legalStatus.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      <div className={isCompact ? 'flex-1' : ''}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold psychedelic-text">{herb.name}</h3>
          {isCompact && (
            <div className="flex items-center space-x-2">
              {getSafetyIcon(herb.safetyRating)}
              <span className={`text-xs font-medium ${getLegalStatusColor(herb.legalStatus)}`}>
                {herb.legalStatus.toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-400 italic mb-3">{herb.scientificName}</p>
        <div className="mb-3">
          <span className="inline-block bg-psychedelic-purple/20 text-psychedelic-purple px-2 py-1 rounded-full text-xs font-medium">
            {herb.category}
          </span>
        </div>
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{herb.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {herb.effects.slice(0, 3).map(effect => (
            <span
              key={effect}
              className="bg-psychedelic-cyan/20 text-psychedelic-cyan px-2 py-1 rounded-full text-xs"
            >
              {effect}
            </span>
          ))}
          {herb.effects.length > 3 && (
            <span className="text-xs text-gray-400">+{herb.effects.length - 3} more</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {herb.tags.slice(0, 4).map(tag => (
            <span
              key={tag}
              className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default HerbCard
