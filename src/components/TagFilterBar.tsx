import { motion } from 'framer-motion'
import clsx from 'clsx'

interface Props {
  tags: string[]
  active: string[]
  toggle: (tag: string) => void
}

export default function TagFilterBar({ tags, active, toggle }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className='sticky top-16 z-20 flex w-full gap-2 overflow-x-auto bg-midnight-blue/80 px-4 py-2 backdrop-blur'
    >
      {tags.map(tag => (
        <motion.button
          key={tag}
          whileTap={{ scale: 0.95 }}
          onClick={() => toggle(tag)}
          className={clsx(
            'whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium transition-colors',
            active.includes(tag)
              ? 'bg-lichen text-midnight-blue shadow'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          )}
        >
          {tag}
        </motion.button>
      ))}
    </motion.div>
  )
}
