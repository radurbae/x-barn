import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DailySalesState {
    todayTotal: number;
    todayOrders: number;
    lastResetDate: string;
    addSale: (amount: number) => void;
    resetIfNewDay: () => void;
}

function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
}

export const useDailySalesStore = create<DailySalesState>()(
    persist(
        (set, get) => ({
            todayTotal: 0,
            todayOrders: 0,
            lastResetDate: getTodayDateString(),

            addSale: (amount: number) => {
                const state = get();
                // Check if we need to reset for a new day
                const today = getTodayDateString();
                if (state.lastResetDate !== today) {
                    set({
                        todayTotal: amount,
                        todayOrders: 1,
                        lastResetDate: today,
                    });
                } else {
                    set({
                        todayTotal: state.todayTotal + amount,
                        todayOrders: state.todayOrders + 1,
                    });
                }
            },

            resetIfNewDay: () => {
                const state = get();
                const today = getTodayDateString();
                if (state.lastResetDate !== today) {
                    set({
                        todayTotal: 0,
                        todayOrders: 0,
                        lastResetDate: today,
                    });
                }
            },
        }),
        {
            name: 'daily-sales',
        }
    )
);
