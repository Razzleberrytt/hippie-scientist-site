import { motion } from 'framer-motion'
import type { Herb } from '../types'

interface Props {
  herb: Herb
}

export default function HerbCard({ herb }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className='overflow-hidden rounded-xl border border-white/10 bg-midnight/50 shadow-lg backdrop-blur-md'
    >
      {herb.image ? (
        <img src={herb.image} alt={herb.name} className='h-40 w-full object-cover' />
      ) : (
        <div className='h-40 w-full bg-opal/20' />
      )}
      <div className='space-y-1 p-4'>
        <h3 className='font-display text-xl text-gold'>{herb.name}</h3>
        {herb.effects && (
          <p className='text-sm text-sand'>{herb.effects.join(', ')}</p>
        )}
        <p className='text-sm text-sand/80'>
          <span className='font-medium text-gold'>Preparation:</span> {herb.preparation}
        </p>
      </div>
    </motion.div>
  )
}
