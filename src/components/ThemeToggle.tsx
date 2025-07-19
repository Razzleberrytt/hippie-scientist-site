import { useContext } from 'react'
import { ThemeContext } from '../contexts/theme'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext)
  return (
    <button
      onClick={toggleTheme}
      className='rounded-md p-2 text-sand transition-shadow hover:shadow-glow'
      aria-label='Toggle theme'
    >
      {theme === 'dark' ? <Sun /> : <Moon />}
    </button>
  )
}
