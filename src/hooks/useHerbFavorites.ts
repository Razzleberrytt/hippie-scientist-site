import { useLocalStorage } from './useLocalStorage'

export function useHerbFavorites() {
  const [favorites, setFavorites] = useLocalStorage<string[]>(
    'herbFavorites',
    []
  )

  const toggle = (id: string) => {
    setFavorites(f => (f.includes(id) ? f.filter(x => x !== id) : [...f, id]))
  }

  const isFavorite = (id: string) => favorites.includes(id)

  return { favorites, toggle, isFavorite }
}
