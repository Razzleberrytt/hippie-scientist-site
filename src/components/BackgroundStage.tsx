'use client'

type EffectName = 'aura' | 'nebula' | 'vapor' | 'plasma'

type BackgroundStageProps = {
  effect?: EffectName
  enabled?: boolean
}

const EFFECT_CLASS: Record<EffectName, string> = {
  aura: 'galaxy--aura',
  nebula: 'galaxy--nebula',
  vapor: 'galaxy--vapor',
  plasma: 'galaxy--plasma'
}

export default function BackgroundStage({ effect = 'aura', enabled = true }: BackgroundStageProps) {
  const effectClass = EFFECT_CLASS[effect] ?? EFFECT_CLASS.aura

  return (
    <div aria-hidden className={`galaxy-stage ${enabled ? 'is-animated' : 'is-static'} ${effectClass}`}>
      <div className='galaxy-layer galaxy-base' />
      <div className='galaxy-layer galaxy-nebula galaxy-nebula--one' />
      <div className='galaxy-layer galaxy-nebula galaxy-nebula--two' />
      <div className='galaxy-layer galaxy-stars galaxy-stars--near' />
      <div className='galaxy-layer galaxy-stars galaxy-stars--far' />
      <div className='galaxy-layer galaxy-vignette' />
      <div className='galaxy-layer galaxy-overlay' />
    </div>
  )
}
