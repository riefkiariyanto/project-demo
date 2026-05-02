import { useState, useEffect } from 'react';

export function useDarkMode() {
    const [isDark, setIsDark] = useState(() => {
        try { return localStorage.getItem('darkMode') === 'true'; }
        catch { return false; }
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) root.classList.add('dark');
        else root.classList.remove('dark');
        localStorage.setItem('darkMode', isDark);
    }, [isDark]);

    const toggle = () => setIsDark(prev => !prev);
    return { isDark, toggle };
}