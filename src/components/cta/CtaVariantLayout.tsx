import { Fragment, type ReactNode, useEffect } from 'react'
import type { CtaSlotType, CtaVariantDefinition } from '@/config/ctaExperiments'

type CtaVariantLayoutProps = {
  variant: CtaVariantDefinition
  slots: Partial<Record<CtaSlotType, ReactNode>>
  onSlotImpression?: (slot: CtaSlotType, position: number) => void
}

export default function CtaVariantLayout({ variant, slots, onSlotImpression }: CtaVariantLayoutProps) {
  const visibleSlots = variant.slotOrder.filter(slot => Boolean(slots[slot]))

  useEffect(() => {
    visibleSlots.forEach((slot, index) => onSlotImpression?.(slot, index + 1))
  }, [onSlotImpression, visibleSlots])

  if (!visibleSlots.length) return null

  return (
    <section className='mt-5 rounded-xl border border-white/12 bg-black/20 p-3'>
      <p className='text-[11px] uppercase tracking-[0.14em] text-white/45'>CTA layout variant {variant.id}</p>
      <div className='mt-2 space-y-3'>
        {visibleSlots.map(slot => (
          <Fragment key={slot}>{slots[slot]}</Fragment>
        ))}
      </div>
    </section>
  )
}
