import { motion } from 'framer-motion'

const features = [
  {
    title: 'Guided Lessons',
    description: 'Learn the science and tradition behind visionary plants.'
  },
  {
    title: 'Research Library',
    description: 'Dive into studies, articles and herbal monographs.'
  },
  {
    title: 'Community',
    description: 'Connect with explorers and share safe practices.'
  }
]

export default function FeatureSection() {
  return (
    <motion.section
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, amount: 0.2 }}
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className='bg-gray-50 py-16 dark:bg-space-gray/50'
    >
      <div className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
        <h2 className='text-center text-3xl font-bold'>Explore New Heights</h2>
        <div className='mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
          {features.map((feature) => (
            <div
              key={feature.title}
              className='rounded-lg border border-comet/20 bg-white p-6 text-center shadow transition hover:shadow-glow dark:bg-space-dark'
            >
              <h3 className='text-lg font-semibold'>{feature.title}</h3>
              <p className='mt-2 text-sm text-opal'>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
