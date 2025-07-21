import { FC } from 'react'
import { Tooltip } from 'react-tooltip'

const iconMap: Record<string, string> = {
  safe: '✅',
  caution: '⚠️',
  toxic: '☠️',
  avoid: '❌',
}

const SafetyIcon: FC<{ safety: string }> = ({ safety }) => {
  const icon = iconMap[safety] || ''
  return icon ? (
    <Tooltip content={`Safety: ${safety}`}>
      <span aria-label={`Safety rating: ${safety}`} role='img'>
        {icon}
      </span>
    </Tooltip>
  ) : null
}

export default SafetyIcon
