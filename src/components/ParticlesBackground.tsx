import { useCallback } from 'react'
import Particles from '@tsparticles/react'
import type { Engine } from '@tsparticles/engine'
import { loadFull } from 'tsparticles'

export default function ParticlesBackground() {
  const init = useCallback(async (engine: Engine) => {
    await loadFull(engine)
  }, [])

  return (
    <Particles
      id='tsparticles'
      init={init}
      options={{
        fullScreen: { enable: true, zIndex: -1 },
        particles: {
          color: { value: '#ffffff' },
          number: { value: 40, density: { enable: true, area: 800 } },
          size: { value: 1 },
          move: { enable: true, speed: 0.3 },
          opacity: { value: 0.2 },
        },
        background: { color: '#0c0c1a' },
      }}
    />
  )
}
