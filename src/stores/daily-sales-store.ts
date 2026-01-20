import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

interface DailySalesState {
    todayTotal: number;
    todayOrders: number;
    lastResetDate: string;
    addSale: (amount: number) => void;
    resetIfNewDay: () => void;
    fetchTodaySales: () => Promise<void>;
    setTodaySales: (total: number, orders: number) => void;
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

            setTodaySales: (total: number, orders: number) => {
                set({
                    todayTotal: total,
                    todayOrders: orders,
                    lastResetDate: getTodayDateString(),
                });
            },

            fetchTodaySales: async () => {
                if (!supabase) return;

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                try {
                    const { data, error } = await supabase
                        .from('orders')
                        .select('total')
                        .gte('created_at', today.toISOString())
                        .eq('status', 'completed');

                    if (!error && data) {
                        const total = data.reduce((sum, order) => sum + order.total, 0);
                        set({
                            todayTotal: total,
                            todayOrders: data.length,
                            lastResetDate: getTodayDateString(),
                        });
                    }
                } catch (error) {
                    console.error('Error fetching today sales:', error);
                }
            },
        }),
        {
            name: 'daily-sales',
        }
    )
);

