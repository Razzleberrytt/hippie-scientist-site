import { useLocalStorage } from './useLocalStorage'

export interface UserPrefs {
  favoriteHerbs: string[]
  preferredEffects: string[]
  regions: string[]
}

const defaultPrefs: UserPrefs = {
  favoriteHerbs: [],
  preferredEffects: [],
  regions: [],
}

export function useUserPrefs() {
  const [prefs, setPrefs] = useLocalStorage<UserPrefs>('hippiePrefs', defaultPrefs)

  return {
    prefs,
    setPrefs,
  }
}
