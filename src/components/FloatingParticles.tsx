import Particles from '@tsparticles/react'

export default function FloatingParticles() {
  return (
    <Particles
      id='floating-particles'
      options={{
        fullScreen: { enable: true, zIndex: -10 },
        background: { color: 'transparent' },
        particles: {
          color: { value: '#ffffff' },
          number: { value: 20, density: { enable: true } },
          size: { value: 2 },
          move: { enable: true, speed: 0.2 },
          opacity: { value: 0.15 },
        },
      }}
    />
  )
}
