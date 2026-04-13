type CosmicBackgroundProps = {
  animated?: boolean
}

export default function CosmicBackground({ animated = true }: CosmicBackgroundProps) {
  return (
    <div aria-hidden className={`cosmic-background ${animated ? 'is-animated' : 'is-static'}`}>
      <div className='cosmic-layer cosmic-base' />
      <div className='cosmic-layer cosmic-aurora cosmic-aurora--one' />
      <div className='cosmic-layer cosmic-aurora cosmic-aurora--two' />
      <div className='cosmic-layer cosmic-glow' />
      <div className='cosmic-layer cosmic-vignette' />
    </div>
  )
}
