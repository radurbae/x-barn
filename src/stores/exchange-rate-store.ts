"use client";

import { create } from "zustand";

const BASE_CURRENCY = "IDR";
const DEFAULT_SYMBOLS = ["USD", "EUR", "GBP", "JPY"];
const FETCH_COOLDOWN_MS = 30 * 60 * 1000;

interface ExchangeRateState {
  baseCurrency: string;
  rates: Record<string, number>;
  lastUpdated: string | null;
  lastFetchedAt: number | null;
  isLoading: boolean;
  error: string | null;
  refresh: (options?: { symbols?: string[]; force?: boolean }) => Promise<void>;
}

export const useExchangeRateStore = create<ExchangeRateState>((set, get) => ({
  baseCurrency: BASE_CURRENCY,
  rates: { [BASE_CURRENCY]: 1 },
  lastUpdated: null,
  lastFetchedAt: null,
  isLoading: false,
  error: null,
  refresh: async (options) => {
    const { lastFetchedAt, isLoading } = get();
    const force = options?.force ?? false;

    if (isLoading) return;
    if (!force && lastFetchedAt && Date.now() - lastFetchedAt < FETCH_COOLDOWN_MS) {
      return;
    }

    const symbols = (options?.symbols?.length ? options.symbols : DEFAULT_SYMBOLS)
      .map((symbol) => symbol.toUpperCase())
      .filter((symbol) => symbol && symbol !== BASE_CURRENCY);

    set({ isLoading: true, error: null });

    try {
      const params = new URLSearchParams();
      params.set("base", BASE_CURRENCY);
      if (symbols.length > 0) {
        params.set("symbols", symbols.join(","));
      }

      const response = await fetch(`/api/rates?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch exchange rates.");
      }

      const data = await response.json();
      set({
        rates: { ...(data.rates || {}), [BASE_CURRENCY]: 1 },
        lastUpdated: data.date || null,
        lastFetchedAt: Date.now(),
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch exchange rates.",
      });
    }
  },
}));
