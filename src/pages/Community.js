import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Calendar, Book } from 'lucide-react';
const Community = () => {
    return (_jsxs(_Fragment, { children: [_jsxs(Helmet, { children: [_jsx("title", { children: "Community - The Hippie Scientist" }), _jsx("meta", { name: "description", content: "Connect with fellow consciousness explorers and researchers." })] }), _jsx("div", { className: "min-h-screen pt-20 px-4", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, className: "text-center mb-20", children: [_jsx("h1", { className: "text-5xl md:text-6xl font-bold mb-6 psychedelic-text", children: "Community" }), _jsx("p", { className: "text-xl text-gray-300 max-w-3xl mx-auto", children: "Connect with fellow consciousness explorers and researchers" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8 mb-12", children: [
                                {
                                    icon: MessageCircle,
                                    title: 'Discussion Forums',
                                    description: 'Join conversations about research, experiences, and insights.',
                                    action: 'Join Discussions',
                                },
                                {
                                    icon: Calendar,
                                    title: 'Events & Workshops',
                                    description: 'Attend virtual and in-person educational events.',
                                    action: 'View Events',
                                },
                                {
                                    icon: Book,
                                    title: 'Study Groups',
                                    description: 'Collaborate on research and share knowledge.',
                                    action: 'Find Groups',
                                },
                                {
                                    icon: Users,
                                    title: 'Mentorship',
                                    description: 'Connect with experienced researchers and practitioners.',
                                    action: 'Find Mentors',
                                },
                            ].map((feature, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: index * 0.2 }, className: "glass-card p-8", children: [_jsx(feature.icon, { className: "h-12 w-12 mb-4 text-psychedelic-purple" }), _jsx("h3", { className: "text-2xl font-bold mb-4 text-white", children: feature.title }), _jsx("p", { className: "text-gray-300 mb-6", children: feature.description }), _jsx("button", { className: "glass-button px-6 py-3 rounded-lg text-white font-medium hover:scale-105 transition-all", children: feature.action })] }, feature.title))) }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.6 }, className: "glass-card p-8", children: [_jsx("h2", { className: "text-3xl font-bold mb-6 text-white text-center", children: "Community Guidelines" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold mb-3 text-psychedelic-purple", children: "Respect & Safety" }), _jsxs("ul", { className: "text-gray-300 space-y-2", children: [_jsx("li", { children: "\u2022 Treat all members with respect and kindness" }), _jsx("li", { children: "\u2022 Prioritize harm reduction and safety" }), _jsx("li", { children: "\u2022 No medical advice - consult professionals" })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold mb-3 text-psychedelic-purple", children: "Quality Content" }), _jsxs("ul", { className: "text-gray-300 space-y-2", children: [_jsx("li", { children: "\u2022 Share evidence-based information" }), _jsx("li", { children: "\u2022 Cite sources when possible" }), _jsx("li", { children: "\u2022 Keep discussions constructive" })] })] })] })] })] }) })] }));
};
export default Community;
