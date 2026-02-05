'use client';

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/stores/settings-store';
import { useExchangeRateStore } from '@/stores/exchange-rate-store';
import { AuthProvider } from '@/components/auth-provider';

export function ClientWrapper({ children }: { children: React.ReactNode }) {
    const { settings } = useSettingsStore();
    const { refresh, rates } = useExchangeRateStore();
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

    useEffect(() => {
        if (!mounted) return;
        refresh({ force: true });
        const interval = setInterval(() => refresh(), 6 * 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, [mounted, refresh]);

    useEffect(() => {
        if (!mounted) return;
        if (!rates[settings.currency] && settings.currency !== 'IDR') {
            refresh({ symbols: [settings.currency], force: true });
        }
    }, [mounted, rates, settings.currency, refresh]);

    return <AuthProvider>{children}</AuthProvider>;
}
