import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
export const LoadingScreen = () => {
    return (_jsx("div", { className: "fixed inset-0 bg-cosmic-gradient flex items-center justify-center z-50", role: "status", "aria-live": "polite", children: _jsxs("div", { className: "text-center", children: [_jsx(motion.div, { className: "w-24 h-24 mx-auto mb-4 bg-psychedelic-gradient rounded-full flex items-center justify-center", animate: {
                        rotate: 360,
                        boxShadow: [
                            '0 0 20px rgba(139, 92, 246, 0.5)',
                            '0 0 40px rgba(236, 72, 153, 0.8)',
                            '0 0 20px rgba(139, 92, 246, 0.5)',
                        ],
                    }, transition: {
                        rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                        boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                    }, children: _jsx("span", { className: "text-2xl font-bold text-white", children: "HS" }) }), _jsx(motion.h2, { className: "text-2xl font-display font-bold text-white", initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 1, repeat: Infinity, repeatType: 'reverse' }, children: "Loading..." }), _jsx("span", { className: "sr-only", children: "Loading content, please wait" })] }) }));
};
