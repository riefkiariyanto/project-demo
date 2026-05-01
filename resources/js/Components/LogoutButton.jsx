import { router } from '@inertiajs/react';
import { useCallback } from 'react';

export default function LogoutButton({ 
    children, 
    className = "",
    ...props 
}) {
    const handleLogout = useCallback((e) => {
        e.preventDefault();
        router.post(route('logout'));
    }, []);

    return (
        <button
            onClick={handleLogout}
            className={className}
            {...props}
        >
            {children}
        </button>
    );
}