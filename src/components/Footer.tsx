export default function Footer() {
  return (
    <footer className='relative py-6 text-center text-sm text-gray-600 dark:text-gray-400'>
      <div
        className='absolute inset-0 mx-auto my-0 h-full w-11/12 rounded-full border border-comet/40 blur-sm'
        aria-hidden='true'
      />
      <span className='text-gradient relative'>
        © {new Date().getFullYear()} The Hippie Scientist
      </span>
    </footer>
  )
}
