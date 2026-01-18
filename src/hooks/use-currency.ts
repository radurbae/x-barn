'use client';

import { useSettingsStore } from '@/stores/settings-store';
import { formatCurrency as formatCurrencyBase } from '@/lib/format';

// Hook to get currency formatter that uses the current settings
export function useCurrency() {
    const { settings } = useSettingsStore();

    const formatCurrency = (amount: number) => {
        return formatCurrencyBase(amount, settings.currency);
    };

    return { formatCurrency, currency: settings.currency };
}
