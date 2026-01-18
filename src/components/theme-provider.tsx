'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settings-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { settings } = useSettingsStore();

    useEffect(() => {
        // Apply theme to document
        if (settings.darkMode) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        }
    }, [settings.darkMode]);

    return <>{children}</>;
}
