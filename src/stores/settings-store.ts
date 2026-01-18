import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
    shopName: string;
    currency: string;
    taxRate: number;
    taxEnabled: boolean;
    receiptFooter: string;
    darkMode: boolean;
}

interface SettingsState {
    settings: Settings;
    updateSettings: (updates: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
    shopName: 'Barn Coffee',
    currency: 'IDR',
    taxRate: 0,
    taxEnabled: false,
    receiptFooter: 'Terima kasih atas kunjungan Anda!',
    darkMode: true,
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            settings: defaultSettings,
            updateSettings: (updates) =>
                set((state) => ({
                    settings: { ...state.settings, ...updates },
                })),
        }),
        {
            name: 'pos-settings',
        }
    )
);
