import { motion } from 'framer-motion'

export default function NewsletterSignup() {
  return (
    <motion.section
      className='mx-auto mt-12 max-w-md rounded-md bg-white/10 p-4 text-center backdrop-blur'
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.1 }}
    >
      <h2 className='mb-2 text-lg font-semibold text-sand dark:text-sand'>Join our Newsletter</h2>
      <form className='flex flex-col gap-2'>
        <label htmlFor='email' className='sr-only'>
          Email address
        </label>
        <input
          id='email'
          type='email'
          required
          className='rounded-md px-3 py-2 text-midnight focus:outline-none focus:ring-2 focus:ring-cosmic-purple'
          placeholder='you@example.com'
        />
        <button
          type='submit'
          className='bg-cosmic-forest rounded-md px-4 py-2 text-white transition hover:bg-cosmic-purple focus:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-purple'
        >
          Subscribe
        </button>
      </form>
    </motion.section>
  )
}
