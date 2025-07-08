import React from 'react'
import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const innerSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const dotSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          className={`${sizeClasses[size]} border-4 border-psychedelic-purple/30 border-t-psychedelic-purple rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Middle ring */}
        <motion.div
          className={`absolute top-1 left-1 ${innerSizeClasses[size]} border-3 border-psychedelic-pink/30 border-t-psychedelic-pink rounded-full`}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Center dot */}
        <motion.div
          className={`absolute top-1/2 left-1/2 ${dotSizeClasses[size]} bg-psychedelic-cyan rounded-full transform -translate-x-1/2 -translate-y-1/2`}
          animate={{ 
            scale: [1, 1.3, 1], 
            opacity: [1, 0.6, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Orbital dots */}
        {[0, 120, 240].map((angle, index) => (
          <motion.div
            key={index}
            className="absolute w-1 h-1 bg-psychedelic-orange rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: `${sizeClasses[size].includes('16') ? '32px' : sizeClasses[size].includes('12') ? '24px' : '16px'} 0`,
            }}
            animate={{
              rotate: [angle, angle + 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
              delay: index * 0.2,
            }}
          />
        ))}
      </div>
      
      {text && (
        <motion.p
          className="mt-4 text-center font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="psychedelic-text">{text}</span>
        </motion.p>
      )}
    </div>
  )
}

export default LoadingSpinner
