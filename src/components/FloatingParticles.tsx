import { useCallback } from 'react'
import Particles from '@tsparticles/react'
import type { Engine } from '@tsparticles/engine'
import { loadFull } from 'tsparticles'

export default function FloatingParticles() {
  const init = useCallback(async (engine: Engine) => {
    await loadFull(engine)
  }, [])

  return (
    <Particles
      id='floating-particles'
      init={init}
      options={{
        fullScreen: { enable: true, zIndex: -10 },
        background: { color: 'transparent' },
        particles: {
          color: { value: '#ffffff' },
          number: { value: 20, density: { enable: true, area: 800 } },
          size: { value: 2 },
          move: { enable: true, speed: 0.2 },
          opacity: { value: 0.15 },
        },
      }}
    />
  )
}
