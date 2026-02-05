'use client';

import { useSettingsStore } from '@/stores/settings-store';
import { useExchangeRateStore } from '@/stores/exchange-rate-store';
import { formatCurrency as formatCurrencyBase } from '@/lib/format';

// Hook to get currency formatter that uses the current settings
export function useCurrency() {
    const { settings } = useSettingsStore();
    const { rates, baseCurrency, lastUpdated, isLoading, error, refresh } = useExchangeRateStore();

    const convertFromBase = (amount: number, targetCurrency: string = settings.currency) => {
        if (targetCurrency === baseCurrency) return amount;
        const rate = rates[targetCurrency];
        if (!rate) return amount;
        return amount * rate;
    };

    const convertToBase = (amount: number, sourceCurrency: string = settings.currency) => {
        if (sourceCurrency === baseCurrency) return amount;
        const rate = rates[sourceCurrency];
        if (!rate) return amount;
        return amount / rate;
    };

    const formatCurrency = (
        amount: number,
        options?: { convert?: boolean; currency?: string }
    ) => {
        const currency = options?.currency ?? settings.currency;
        const shouldConvert = options?.convert ?? true;
        const value = shouldConvert ? convertFromBase(amount, currency) : amount;
        return formatCurrencyBase(value, currency);
    };

    const formatBaseCurrency = (amount: number) => formatCurrencyBase(amount, baseCurrency);

    return {
        formatCurrency,
        formatBaseCurrency,
        convertFromBase,
        convertToBase,
        currency: settings.currency,
        baseCurrency,
        ratesMeta: { lastUpdated, isLoading, error },
        refreshRates: refresh,
    };
}
