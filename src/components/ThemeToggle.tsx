import { useContext } from 'react'
import { ThemeContext } from '../contexts/theme'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext)
  return (
    <motion.button
      onClick={toggleTheme}
      className={`rounded-md p-2 text-sand transition-shadow hover:shadow-glow ${theme === 'dark' ? 'shadow-psychedelic-pink/40' : 'shadow-cosmic-purple/40'}`}
      aria-label='Toggle theme'
      whileTap={{ scale: 0.9 }}
      animate={{ rotate: theme === 'dark' ? 180 : 0 }}
      transition={{ duration: 0.4 }}
    >
      {theme === 'dark' ? <Sun /> : <Moon />}
    </motion.button>
  )
}
