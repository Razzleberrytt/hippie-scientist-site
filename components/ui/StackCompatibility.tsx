export default function StackCompatibility({ related = [] }: any) {
  if (!related?.length) return null

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {related.slice(0, 4).map((item: any, i: number) => (
        <div
          key={i}
          className="rounded-2xl border p-4 bg-white/70 backdrop-blur"
        >
          <div className="text-xs uppercase tracking-wide text-neutral-400 mb-2">
            Potential Stack Pairing
          </div>

          <div className="font-semibold text-sm">
            {item.name}
          </div>

          <div className="text-xs text-neutral-500 mt-2 leading-5">
            May complement related mechanisms, goals, or wellness contexts.
          </div>
        </div>
      ))}
    </div>
  )
}
