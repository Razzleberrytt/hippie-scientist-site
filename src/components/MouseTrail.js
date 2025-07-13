import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
const MouseTrail = () => {
    const [isVisible, setIsVisible] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 25, stiffness: 700 };
    const x = useSpring(mouseX, springConfig);
    const y = useSpring(mouseY, springConfig);
    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            setIsVisible(true);
        };
        const handleMouseLeave = () => {
            setIsVisible(false);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [mouseX, mouseY]);
    return (_jsx(motion.div, { className: "fixed top-0 left-0 w-6 h-6 pointer-events-none z-50", style: {
            x,
            y,
            translateX: '-50%',
            translateY: '-50%',
        }, animate: { opacity: isVisible ? 1 : 0 }, transition: { duration: 0.3 }, children: _jsx("div", { className: "w-full h-full rounded-full bg-gradient-to-r from-psychedelic-purple to-psychedelic-pink opacity-50 blur-sm" }) }));
};
export default MouseTrail;
