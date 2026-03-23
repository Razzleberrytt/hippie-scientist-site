import Particles from '@tsparticles/react'

export default function StarfieldBackground() {
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null
  }
  return (
    <Particles
      id='starfield'
      options={{
        fullScreen: { enable: true, zIndex: -10 },
        background: { color: 'transparent' },
        particles: {
          number: { value: 100, density: { enable: true } },
          color: { value: ['#ffffff', '#ffaadf', '#c1ffdd'] },
          size: { value: { min: 0.5, max: 1.5 } },
          move: { enable: true, speed: 0.15 },
          opacity: { value: { min: 0.1, max: 0.6 } },
        },
      }}
    />
  )
}
