import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Atom } from 'lucide-react';
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navItems = [
        { path: '/', label: 'Home' },
        { path: '/research', label: 'Research' },
        { path: '/database', label: 'Database' },
        { path: '/safety', label: 'Safety' },
        { path: '/community', label: 'Community' },
    ];
    const isActive = (path) => location.pathname.startsWith(path);
    return (_jsx("nav", { className: "fixed top-0 left-0 right-0 z-50 glass-card m-4 rounded-2xl", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "flex items-center justify-between h-16", children: [_jsxs(Link, { to: "/", className: "flex items-center space-x-2", children: [_jsx(Atom, { className: "h-8 w-8 text-psychedelic-purple", "aria-hidden": "true" }), _jsx("span", { className: "text-xl font-bold psychedelic-text", children: "Hippie Scientist" })] }), _jsx("div", { className: "md:hidden", children: _jsx("button", { onClick: () => setIsOpen(!isOpen), className: "p-2", "aria-label": "Toggle navigation menu", "aria-expanded": isOpen, children: isOpen ? _jsx(X, {}) : _jsx(Menu, {}) }) }), _jsx("div", { className: "hidden md:flex space-x-4", children: navItems.map(({ path, label }) => (_jsx(Link, { to: path, className: `px-3 py-2 rounded-md text-sm font-medium ${isActive(path) ? 'bg-psychedelic-purple text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`, children: label }, path))) })] }), isOpen && (_jsx(motion.div, { initial: { height: 0 }, animate: { height: 'auto' }, exit: { height: 0 }, className: "md:hidden flex flex-col space-y-2 mt-4 px-2 pb-4", children: navItems.map(({ path, label }) => (_jsx(Link, { to: path, onClick: () => setIsOpen(false), className: `block px-4 py-2 rounded-md text-base font-medium ${isActive(path) ? 'bg-psychedelic-purple text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`, children: label }, path))) }))] }) }));
};
export default Navbar;
