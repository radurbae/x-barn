import { beforeEach, describe, expect, it } from "vitest";
import { useDailySalesStore } from "./daily-sales-store";

describe("daily-sales-store", () => {
  beforeEach(() => {
    useDailySalesStore.setState(
      {
        todayTotal: 0,
        todayOrders: 0,
        lastResetDate: new Date().toISOString().split("T")[0],
      }
    );
  });

  it("adds sales and increments order count", () => {
    useDailySalesStore.getState().addSale(10000);
    useDailySalesStore.getState().addSale(25000);
    const { todayTotal, todayOrders } = useDailySalesStore.getState();
    expect(todayTotal).toBe(35000);
    expect(todayOrders).toBe(2);
  });

  it("resets when day changes", () => {
    useDailySalesStore.setState(
      {
        todayTotal: 50000,
        todayOrders: 4,
        lastResetDate: "2000-01-01",
      }
    );
    useDailySalesStore.getState().resetIfNewDay();
    const { todayTotal, todayOrders } = useDailySalesStore.getState();
    expect(todayTotal).toBe(0);
    expect(todayOrders).toBe(0);
  });
});
