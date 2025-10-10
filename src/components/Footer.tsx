export default function Footer() {
  return (
    <footer className='relative py-6 text-center text-sm text-sub'>
      <div
        className='absolute inset-0 mx-auto my-0 h-full w-11/12 rounded-full border border-[rgb(var(--border))/0.4] blur-sm'
        aria-hidden='true'
      />
      <span className='relative text-[rgb(var(--accent))]'>
        © {new Date().getFullYear()} The Hippie Scientist
      </span>
    </footer>
  )
}
