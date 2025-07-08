import React from 'react';
import { motion } from 'framer-motion';

const FloatingElements: React.FC = () => {
  const shapes = [
    { size: 'w-32 h-32', delay: 0, duration: 20 },
    { size: 'w-24 h-24', delay: 5, duration: 25 },
    { size: 'w-40 h-40', delay: 10, duration: 30 },
    { size: 'w-20 h-20', delay: 15, duration: 22 },
    { size: 'w-28 h-28', delay: 8, duration: 28 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          className={`floating-shape ${shape.size}`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -100, 50, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingElements;
