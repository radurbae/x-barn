'use client';

import { useSettingsStore } from '@/stores/settings-store';
import { translations, getLanguageFromCurrency, Language } from '@/lib/translations';

type TranslationKey = keyof typeof translations.id;

export function useTranslation() {
    const { settings } = useSettingsStore();
    const language: Language = getLanguageFromCurrency(settings.currency);

    const t = (key: TranslationKey): string => {
        return translations[language][key] || translations.en[key] || key;
    };

    return { t, language };
}
