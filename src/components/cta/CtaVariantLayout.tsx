import { Fragment, type ReactNode, useEffect } from 'react'
import type { CtaSlotType, CtaVariantDefinition } from '@/config/ctaExperiments'

type CtaVariantLayoutProps = {
  variant: CtaVariantDefinition
  slots: Partial<Record<CtaSlotType, ReactNode>>
  slotOrderOverride?: CtaSlotType[]
  onSlotImpression?: (slot: CtaSlotType, position: number) => void
}

export default function CtaVariantLayout({
  variant,
  slots,
  slotOrderOverride,
  onSlotImpression,
}: CtaVariantLayoutProps) {
  const slotOrder = slotOrderOverride?.length ? slotOrderOverride : variant.slotOrder
  const visibleSlots = slotOrder.filter(slot => Boolean(slots[slot]))

  useEffect(() => {
    visibleSlots.forEach((slot, index) => onSlotImpression?.(slot, index + 1))
  }, [onSlotImpression, visibleSlots])

  if (!visibleSlots.length) return null

  return (
    <section className='border-white/12 mt-5 rounded-xl border bg-black/20 p-3'>
      <div className='space-y-3'>
        {visibleSlots.map(slot => (
          <Fragment key={slot}>{slots[slot]}</Fragment>
        ))}
      </div>
    </section>
  )
}
