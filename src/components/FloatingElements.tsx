import React, { useMemo, type CSSProperties } from "react";
import { motion } from "framer-motion";

const FloatingElements: React.FC = () => {
  const elements = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        size: Math.random() * 60 + 20,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5,
      })),
    []
  )

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute rounded-full [height:var(--floating-size)] [left:var(--floating-left)] [top:var(--floating-top)] [width:var(--floating-size)] bg-[radial-gradient(circle,rgba(34,197,94,0.15)_0%,transparent_70%)] [will-change:transform,opacity]"
          style={{
            "--floating-size": `${element.size}px`,
            "--floating-left": `${element.x}%`,
            "--floating-top": `${element.y}%`,
          } as CSSProperties}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            delay: element.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export default FloatingElements
