import { useState, useEffect } from 'react'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('favorites')
    if (stored) setFavorites(JSON.parse(stored))
  }, [])

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  const toggle = (id: string) => {
    setFavorites(f =>
      f.includes(id) ? f.filter(x => x !== id) : [...f, id]
    )
  }

  const isFavorite = (id: string) => favorites.includes(id)

  return { favorites, toggle, isFavorite }
}
