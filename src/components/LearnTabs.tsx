import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

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
    const index = sections.findIndex(s => s.id === hash)
    if (index >= 0) setActive(index)
  }, [sections])

  React.useEffect(() => {
    const id = sections[active]?.id
    if (id) {
      history.replaceState(null, '', `#${id}`)
    }
  }, [active, sections])

  const content = (
    <motion.article
      key={sections[active].id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4 }}
      id={sections[active].id}
      className='learn-section mx-auto'
    >
      <h2 className='learn-title'>{sections[active].title}</h2>
      <div className='learn-prose prose prose-lg max-w-none'>
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{sections[active].content}</ReactMarkdown>
      </div>
    </motion.article>
  )

  if (mobile) {
    return (
      <div className='space-y-4'>
        {sections.map((s, i) => (
          <details
            key={s.id}
            open={i === active}
            onClick={() => setActive(i)}
            className='learn-section learn-accordion mx-auto'
            id={s.id}
          >
            <summary className='accordion-summary'>
              <span className='flex items-center gap-2 text-xl md:text-2xl'>{s.title}</span>
            </summary>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className='accordion-content mt-4 overflow-hidden'
            >
              <ReactMarkdown
                className='learn-prose prose prose-base max-w-none'
                rehypePlugins={[rehypeRaw]}
              >
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
