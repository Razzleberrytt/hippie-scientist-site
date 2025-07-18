import { useEffect, useState } from 'react'
import type { Herb } from '../types'
import dataRaw from '../../Full79.json?raw'

export default function useFullHerbs() {
  const [herbs, setHerbs] = useState<Herb[]>([])

  useEffect(() => {
    try {
      const sanitized = dataRaw.replace(/\bNaN\b/g, 'null')
      setHerbs(JSON.parse(sanitized))
    } catch (err) {
      console.error('Failed to load herb data', err)
    }
  }, [])

  return herbs
}
