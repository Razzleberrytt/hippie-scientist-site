import { useCallback } from 'react'
import Particles from 'react-tsparticles'
import type { Engine } from 'tsparticles-engine'
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
        background: { color: '#0c1126' },
        particles: {
          number: { value: 80, density: { enable: true, area: 800 } },
          color: { value: ['#ffffff', '#4FC1E9', '#88C057'] },
          links: {
            enable: true,
            color: '#4FC1E9',
            distance: 150,
            opacity: 0.1,
            width: 1,
          },
          move: { enable: true, speed: 0.2 },
          opacity: {
            value: 0.3,
            anim: { enable: true, speed: 0.5, opacity_min: 0.1 },
          },
          size: {
            value: { min: 1, max: 3 },
            anim: { enable: true, speed: 3, size_min: 0.5 },
          },
        },
      }}
    />
  )
}
