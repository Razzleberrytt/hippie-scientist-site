import { useCallback } from 'react'
import Particles from '@tsparticles/react'
import type { Engine } from '@tsparticles/engine'
import { loadFull } from 'tsparticles'

export default function StarfieldBackground() {
  const init = useCallback(async (engine: Engine) => {
    await loadFull(engine)
  }, [])

  return (
    <Particles
      id='starfield'
      init={init}
      options={{
        fullScreen: { enable: true, zIndex: -10 },
        background: { color: 'transparent' },
        particles: {
          number: { value: 100, density: { enable: true, area: 800 } },
          color: { value: ['#ffffff', '#ffaadf', '#c1ffdd'] },
          size: { value: { min: 0.5, max: 1.5 } },
          move: { enable: true, speed: 0.15 },
          opacity: { value: { min: 0.1, max: 0.6 } },
        },
      }}
    />
  )
}
