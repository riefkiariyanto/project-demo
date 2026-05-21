import { useState, useEffect } from 'react';

const EVENT = 'darkmode-change';

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

    // Sync all hook instances when any one toggles
    useEffect(() => {
        const handler = () => {
            const val = localStorage.getItem('darkMode') === 'true';
            setIsDark(val);
        };
        window.addEventListener(EVENT, handler);
        return () => window.removeEventListener(EVENT, handler);
    }, []);

    const toggle = () => {
        setIsDark(prev => {
            const next = !prev;
            localStorage.setItem('darkMode', next);
            window.dispatchEvent(new Event(EVENT));
            return next;
        });
    };

    return { isDark, toggle };
}
