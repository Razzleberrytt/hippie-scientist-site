export default function Footer() {
  return (
    <footer className='relative space-y-2 bg-space-dark/70 px-4 py-6 text-center text-sm text-sand backdrop-blur-md'>
      <div
        className='absolute inset-0 mx-auto my-0 h-full w-11/12 rounded-full border border-comet/40 blur-sm'
        aria-hidden='true'
      />
      <p className='relative mx-auto max-w-3xl'>
        <strong>The Hippie Scientist</strong> is an interactive, educational database of psychoactive herbs, natural nootropics, and traditional plant medicines. It helps users explore effects, preparation, safety, active compounds, and cultural context — with research-backed entries for over 200 botanicals.
      </p>
      <p className='relative mx-auto max-w-3xl'>
        As an Amazon Associate, I earn from qualifying purchases. Some links on this site may be affiliate links.
      </p>
      <a
        href='https://www.buymeacoffee.com/hippiescientist'
        target='_blank'
        rel='noopener noreferrer'
        className='relative inline-block rounded-md bg-amber-600 px-3 py-2 font-medium text-white hover:bg-amber-500'
      >
        ☕ Buy Me a Coffee
      </a>
      <span className='text-gradient relative block pt-2'>
        © {new Date().getFullYear()} The Hippie Scientist
      </span>
    </footer>
  )
}
