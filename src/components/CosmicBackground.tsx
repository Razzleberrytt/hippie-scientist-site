type CosmicBackgroundProps = {
  animated?: boolean
}

export default function CosmicBackground({ animated = true }: CosmicBackgroundProps) {
  return (
    <div aria-hidden className={`cosmic-background ${animated ? 'is-animated' : 'is-static'}`}>
      <div className='cosmic-layer cosmic-base' />
      <div className='cosmic-layer cosmic-nebula cosmic-nebula--one' />
      <div className='cosmic-layer cosmic-nebula cosmic-nebula--two' />
      <div className='cosmic-layer cosmic-stars' />
      <div className='cosmic-layer cosmic-vignette' />
    </div>
  )
}
