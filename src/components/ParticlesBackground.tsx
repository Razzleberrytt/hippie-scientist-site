import Particles from '@tsparticles/react'

export default function ParticlesBackground() {
  return (
    <Particles
      id='tsparticles'
      options={{
        fullScreen: { enable: true, zIndex: -1 },
        particles: {
          color: { value: '#ffffff' },
          number: { value: 40, density: { enable: true } },
          size: { value: 1 },
          move: { enable: true, speed: 0.3 },
          opacity: { value: 0.2 },
        },
        background: { color: '#0c0c1a' },
      }}
    />
  )
}
