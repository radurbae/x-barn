// Formatting utilities for Indonesian localization

// Currency formatting with dynamic currency support
export function formatCurrency(amount: number, currency: string = 'IDR'): string {
    const localeMap: Record<string, string> = {
        IDR: 'id-ID',
        USD: 'en-US',
        EUR: 'de-DE',
        GBP: 'en-GB',
        JPY: 'ja-JP',
    };

    const fractionDigits: Record<string, { min: number; max: number }> = {
        IDR: { min: 0, max: 0 },
        USD: { min: 2, max: 2 },
        EUR: { min: 2, max: 2 },
        GBP: { min: 2, max: 2 },
        JPY: { min: 0, max: 0 },
    };

    const locale = localeMap[currency] || 'id-ID';
    const digits = fractionDigits[currency] || { min: 0, max: 0 };

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: digits.min,
        maximumFractionDigits: digits.max,
    }).format(amount);
}

export function formatNumber(num: number): string {
    return new Intl.NumberFormat('id-ID').format(num);
}

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
