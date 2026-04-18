import React from 'react'

type LoadingSpinnerSize = 'sm' | 'md' | 'lg'

const spinnerSizeMap: Record<LoadingSpinnerSize, number> = {
  sm: 16,
  md: 24,
  lg: 40,
}

const LoadingSpinner: React.FC<{ size?: LoadingSpinnerSize }> = ({ size = 'md' }) => {
  const spinnerSize = spinnerSizeMap[size]

  return (
    <svg
      className='animate-spin'
      width={spinnerSize}
      height={spinnerSize}
      viewBox='0 0 24 24'
      fill='none'
      role='status'
      aria-label='Loading'
    >
      <circle
        cx='12'
        cy='12'
        r='10'
        stroke='var(--accent-teal)'
        strokeWidth='2'
        strokeLinecap='round'
        strokeDasharray='56'
        strokeDashoffset='18'
      />
    </svg>
  )
}

export default LoadingSpinner
