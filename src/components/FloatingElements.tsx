
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const FloatingElements: React.FC = () => {
  const elements = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: Math.random() * 60 + 20,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    })), []);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute rounded-full"
          style={{
            width: element.size,
            height: element.size,
            left: `${element.x}%`,
            top: `${element.y}%`,
            background: `radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)`,
            willChange: 'transform, opacity',
          }}
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
  );
};

export default FloatingElements;
