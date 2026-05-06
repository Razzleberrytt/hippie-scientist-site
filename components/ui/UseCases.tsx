export default function UseCases({ effects = [] }: any) {
  if (!effects?.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      {effects.slice(0, 8).map((effect: string, i: number) => (
        <div
          key={i}
          className="rounded-full border px-4 py-2 text-xs bg-neutral-50 hover:bg-neutral-100 transition"
        >
          {effect}
        </div>
      ))}
    </div>
  )
}
