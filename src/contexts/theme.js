import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState, useEffect, useCallback } from 'react';
export const ThemeContext = createContext({
    theme: 'light',
    setTheme: () => { },
    toggleTheme: () => { },
});
export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState('light');
    // Function to apply theme class
    const applyTheme = (theme) => {
        document.documentElement.classList.remove(theme === 'light' ? 'dark' : 'light');
        document.documentElement.classList.add(theme);
    };
    // Toggle function
    const toggleTheme = useCallback(() => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    }, [theme]);
    // Read theme from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('theme');
        if (stored === 'dark' || stored === 'light') {
            setThemeState(stored);
            applyTheme(stored);
        }
    }, []);
    // Update DOM and localStorage on theme change
    const setTheme = (newTheme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    };
    return (_jsx(ThemeContext.Provider, { value: { theme, setTheme, toggleTheme }, children: children }));
};
