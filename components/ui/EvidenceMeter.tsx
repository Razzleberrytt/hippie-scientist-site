export default function EvidenceMeter({ level='moderate' }: any) {
  const widths: any = {
    strong: 'w-full',
    moderate: 'w-2/3',
    limited: 'w-1/3'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>Evidence Strength</span>
        <span className="capitalize">{level}</span>
      </div>

      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
        <div className={`h-full bg-black rounded-full ${widths[level] || widths.moderate}`} />
      </div>
    </div>
  )
}
