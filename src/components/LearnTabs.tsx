import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

export interface LearnSection {
  id: string
  title: string
  content: string
}

interface Props {
  sections: readonly LearnSection[]
}

export default function LearnTabs({ sections }: Props) {
  const [active, setActive] = React.useState(0)
  const [mobile, setMobile] = React.useState(false)

  React.useEffect(() => {
    const check = () => setMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // handle deep linking on mount
  React.useEffect(() => {
    const hash = window.location.hash.slice(1)
    const index = sections.findIndex((s) => s.id === hash)
    if (index >= 0) setActive(index)
  }, [sections])

  React.useEffect(() => {
    const id = sections[active]?.id
    if (id) {
      history.replaceState(null, '', `#${id}`)
    }
  }, [active, sections])

  const content = (
    <motion.div
      key={sections[active].id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      id={sections[active].id}
      className='prose prose-lg max-w-[80ch]'
    >
      <ReactMarkdown>{sections[active].content}</ReactMarkdown>
    </motion.div>
  )

  if (mobile) {
    return (
      <div className='space-y-4'>
        {sections.map((s, i) => (
          <details
            key={s.id}
            open={i === active}
            onClick={() => setActive(i)}
            className='rounded-md bg-black/20 p-2'
            id={s.id}
          >
            <summary className='cursor-pointer font-semibold'>{s.title}</summary>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className='mt-2'
            >
              <ReactMarkdown className='prose prose-lg max-w-[80ch]'>
                {s.content}
              </ReactMarkdown>
            </motion.div>
          </details>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className='mb-4 flex flex-wrap gap-2 border-b border-comet/30'>
        {sections.map((s, i) => (
          <button
            key={s.id}
            type='button'
            onClick={() => setActive(i)}
            className={`px-3 py-2 text-sm transition-colors ${
              i === active
                ? 'border-b-2 border-psychedelic-purple text-psychedelic-purple shadow-glow'
                : 'text-sand hover:text-psychedelic-purple'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>
      <AnimatePresence mode='wait'>{content}</AnimatePresence>
    </div>
  )
}
