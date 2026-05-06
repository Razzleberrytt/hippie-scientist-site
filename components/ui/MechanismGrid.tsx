export default function MechanismGrid({ mechanisms = [] }: any) {
  if (!mechanisms?.length) return null

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {mechanisms.slice(0, 6).map((m: any, i: number) => (
        <div
          key={i}
          className="surface-depth card-spacing space-y-4"
        >
          <div className="eyebrow-label">
            Mechanism
          </div>

          <div className="text-sm leading-7 text-[#435246]">
            {typeof m === 'string' ? m : JSON.stringify(m)}
          </div>
        </div>
      ))}
    </div>
  )
}
