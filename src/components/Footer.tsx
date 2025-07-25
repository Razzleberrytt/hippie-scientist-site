import { Mail, Github, Twitter } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className='bg-white py-8 text-sm text-bark dark:bg-space-gray dark:text-sand'>
      <div className='mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row'>
        <p className='font-semibold'>&copy; {new Date().getFullYear()} The Hippie Scientist</p>
        <nav className='flex flex-wrap justify-center gap-4'>
          <Link to='/about' className='hover:text-cosmic-purple focus-visible:ring-2 focus-visible:ring-cosmic-purple'>About</Link>
          <Link to='/learn' className='hover:text-cosmic-purple focus-visible:ring-2 focus-visible:ring-cosmic-purple'>Learn</Link>
          <Link to='/database' className='hover:text-cosmic-purple focus-visible:ring-2 focus-visible:ring-cosmic-purple'>Database</Link>
        </nav>
        <div className='flex gap-4'>
          <a href='mailto:hippiescience@example.com' className='hover:text-cosmic-purple focus-visible:ring-2 focus-visible:ring-cosmic-purple'>
            <Mail className='h-5 w-5' aria-hidden='true' />
            <span className='sr-only'>Email</span>
          </a>
          <a href='https://twitter.com/HippieScience' target='_blank' rel='noopener noreferrer' className='hover:text-cosmic-purple focus-visible:ring-2 focus-visible:ring-cosmic-purple'>
            <Twitter className='h-5 w-5' aria-hidden='true' />
            <span className='sr-only'>Twitter</span>
          </a>
          <a href='https://github.com/razzleberrytt/hippie-scientist-site' target='_blank' rel='noopener noreferrer' className='hover:text-cosmic-purple focus-visible:ring-2 focus-visible:ring-cosmic-purple'>
            <Github className='h-5 w-5' aria-hidden='true' />
            <span className='sr-only'>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
