import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
const LoadingSpinner = () => {
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-space-dark via-cosmic-purple to-space-dark", children: _jsxs(motion.div, { className: "flex flex-col items-center space-y-4", initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5 }, children: [_jsxs("div", { className: "relative", children: [_jsx(motion.div, { className: "w-16 h-16 border-4 border-psychedelic-purple rounded-full border-t-transparent", animate: { rotate: 360 }, transition: { duration: 1, repeat: Infinity, ease: "linear" } }), _jsx(motion.div, { className: "absolute inset-0 w-16 h-16 border-4 border-psychedelic-pink rounded-full border-b-transparent", animate: { rotate: -360 }, transition: { duration: 1.5, repeat: Infinity, ease: "linear" } })] }), _jsx(motion.p, { className: "text-white text-lg font-medium", animate: { opacity: [0.5, 1, 0.5] }, transition: { duration: 2, repeat: Infinity }, children: "Loading..." })] }) }));
};
export default LoadingSpinner;
