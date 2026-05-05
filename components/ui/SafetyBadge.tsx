export default function SafetyBadge({ level = 'safe' }: any) {
  const map: any = {
    safe: 'bg-green-100 text-green-800',
    caution: 'bg-yellow-100 text-yellow-800',
    avoid: 'bg-red-100 text-red-800'
  }

  const label: any = {
    safe: 'Generally Safe',
    caution: 'Use With Caution',
    avoid: 'Avoid / Contraindicated'
  }

  return (
    <div className={`inline-block text-xs px-3 py-1 rounded-full font-semibold ${map[level]}`}>
      {label[level]}
    </div>
  )
}
