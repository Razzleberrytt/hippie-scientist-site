import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

interface Node {
  id: string
  label: string
  slug?: string
  x: number
  y: number
  type: 'herb' | 'neuro'
}

const nodes: Node[] = [
  { id: 'sero', label: 'Serotonin', x: 0, y: 0, type: 'neuro' },
  { id: 'dopa', label: 'Dopamine', x: 80, y: 0, type: 'neuro' },
  { id: 'psilo', label: 'Psilocybin', slug: 'psilocybe-cubensis', x: -40, y: -80, type: 'herb' },
  { id: 'kratom', label: 'Kratom', slug: 'kratom-hybrids', x: 120, y: -60, type: 'herb' },
  { id: 'caapi', label: 'Caapi', slug: 'banisteriopsis-caapi', x: -60, y: 80, type: 'herb' },
]

export default function NeuroHerbGraph() {
  const navigate = useNavigate()
  return (
    <div className='relative h-64 w-full bg-[#0f0f0f]'>
      {nodes.map(n => (
        <motion.div
          key={n.id}
          className={`absolute flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600/60 text-white text-xs cursor-pointer select-none ${n.type === 'neuro' ? 'ring-2 ring-emerald-300' : ''}`}
          style={{ left: `calc(50% + ${n.x}px)`, top: `calc(50% + ${n.y}px)` }}
          whileHover={{ scale: 1.1 }}
          onClick={() => n.slug && navigate(`/herbs/${n.slug}`)}
        >
          {n.label}
        </motion.div>
      ))}
    </div>
  )
}
