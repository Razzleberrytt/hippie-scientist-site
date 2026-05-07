import { formatDisplayLabel, isClean } from '@/lib/display-utils'

export default function MechanismGrid({ mechanisms = [] }: any) {
  const visibleMechanisms = mechanisms.map(formatDisplayLabel).filter(isClean).slice(0, 6)

  if (!visibleMechanisms.length) return null

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {visibleMechanisms.map((m: string, i: number) => (
        <div
          key={i}
          className="surface-depth card-spacing space-y-4"
        >
          <div className="eyebrow-label">
            Mechanism
          </div>

          <div className="text-sm leading-7 text-[#435246]">
            {m}
          </div>
        </div>
      ))}
    </div>
  )
}
