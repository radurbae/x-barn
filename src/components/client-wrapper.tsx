'use client';

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/stores/settings-store';
import { AuthProvider } from '@/components/auth-provider';

export function ClientWrapper({ children }: { children: React.ReactNode }) {
    const { settings } = useSettingsStore();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Apply theme to document
        if (settings.darkMode) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        }
    }, [settings.darkMode, mounted]);

    return <AuthProvider>{children}</AuthProvider>;
}
