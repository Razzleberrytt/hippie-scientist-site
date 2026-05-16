import { Suspense } from 'react'
import { getCompounds } from '@/lib/runtime-data'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import CompoundsIndexClient from './CompoundsIndexClient'

export default async function CompoundsPage() {
  const runtimeCompounds = await getCompounds()
  const compounds = runtimeCompounds.filter((compound: any) => {
    try {
      return getRuntimeVisibility(compound).canRender
    } catch {
      return true
    }
  })

  return (
    <Suspense fallback={null}>
      <CompoundsIndexClient compounds={compounds} />
    </Suspense>
  )
}
