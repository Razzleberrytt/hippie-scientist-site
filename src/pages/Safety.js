import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Heart, Phone } from 'lucide-react';
const Safety = () => {
    return (_jsxs(_Fragment, { children: [_jsxs(Helmet, { children: [_jsx("title", { children: "Safety - The Hippie Scientist" }), _jsx("meta", { name: "description", content: "Essential harm reduction resources and safety information." })] }), _jsx("div", { className: "min-h-screen pt-20 px-4", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, className: "text-center mb-20", children: [_jsx("h1", { className: "text-5xl md:text-6xl font-bold mb-6 psychedelic-text", children: "Safety First" }), _jsx("p", { className: "text-xl text-gray-300 max-w-3xl mx-auto", children: "Comprehensive harm reduction resources and safety guidelines" })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.2 }, className: "glass-card p-6 mb-8 border-2 border-red-500 border-opacity-50", children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsx(Phone, { className: "h-6 w-6 text-red-400 mr-3" }), _jsx("h2", { className: "text-2xl font-bold text-white", children: "Emergency Resources" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-2", children: "Crisis Hotlines" }), _jsx("p", { className: "text-gray-300", children: "Emergency: 911" }), _jsx("p", { className: "text-gray-300", children: "Crisis Text Line: Text HOME to 741741" }), _jsx("p", { className: "text-gray-300", children: "National Suicide Prevention Lifeline: 988" })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-2", children: "Poison Control" }), _jsx("p", { className: "text-gray-300", children: "National Poison Control: 1-800-222-1222" }), _jsx("p", { className: "text-gray-300", children: "Online: poison.org" })] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [
                                {
                                    icon: Shield,
                                    title: 'Set & Setting',
                                    description: 'Understanding the importance of mindset and environment for safe experiences.',
                                },
                                {
                                    icon: Heart,
                                    title: 'Health Screening',
                                    description: 'Pre-experience health considerations and contraindications.',
                                },
                                {
                                    icon: AlertTriangle,
                                    title: 'Risk Assessment',
                                    description: 'Identifying and mitigating potential risks and interactions.',
                                },
                            ].map((item, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: index * 0.2 }, className: "glass-card p-6", children: [_jsx(item.icon, { className: "h-12 w-12 mx-auto mb-4 text-psychedelic-purple" }), _jsx("h3", { className: "text-xl font-bold mb-4 text-white text-center", children: item.title }), _jsx("p", { className: "text-gray-300 text-center", children: item.description })] }, item.title))) })] }) })] }));
};
export default Safety;
